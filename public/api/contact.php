<?php
/**
 * U2I Process — contact form backend.
 *
 * Runs on OVH shared hosting (Apache + PHP): receives the form as JSON from
 * the React contact page, stores the message in MySQL (best-effort; the CMS
 * dashboard shows it), sends the email to the U2I inbox using the Plunk
 * transactional email API when PLUNK_API_KEY is configured, and otherwise
 * falls back to PHP's built-in mail() (enabled by default on OVH).
 *
 * Expects POST { firstName, lastName, email, company?, subject, message }.
 * Responds with JSON { ok, message }.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

// ── Configuration ────────────────────────────────────────────────────────────

/** Optional Plunk (https://useplunk.com) API key; leave empty to use mail().
 * Overridable via PLUNK_API_KEY in public/api/config.local.php (local dev). */
define('PLUNK_API_KEY', U2I_PLUNK_API_KEY);
define('PLUNK_API_URL', 'https://api.useplunk.com/v1/send');

/** Simple time-based throttle per IP (seconds between two submissions). */
const THROTTLE_SECONDS = 60;
const THROTTLE_DIR = __DIR__ . '/cache';

const MAX_LENGTHS = [
    'firstName' => 100,
    'lastName' => 100,
    'email' => 254,
    'company' => 150,
    'subject' => 200,
    'message' => 5000,
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function respond(bool $ok, string $message, int $status = 200): void
{
    json_response(['ok' => $ok, 'message' => $message], $status);
}

function fail(string $message, int $status = 400): void
{
    respond(false, $message, $status);
}

/** Minimal header-safe encoding to avoid header injection via user input. */
function encode_mime_header_value(string $value): string
{
    return str_replace(["\r", "\n", "%0a", "%0d"], '', $value);
}

/** Very light spam guard: hidden input that humans never fill in. */
function honeypot_ok(array $data): bool
{
    return field($data, 'website') === '';
}

/** Time-based throttle: max one submission per IP per THROTTLE_SECONDS. */
function throttle_ok(): bool
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    if ($ip === '') {
        return true;
    }

    $dir = THROTTLE_DIR;
    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
        return true; // cannot persist state; don't block legit visitors
    }

    $file = $dir . '/contact-' . hash('sha256', $ip) . '.json';
    $now = time();

    if (is_file($file)) {
        $last = (int) @file_get_contents($file);
        if ($now - $last < THROTTLE_SECONDS) {
            return false;
        }
    }

    @file_put_contents($file, (string) $now);
    @touch($dir, $now);

    // Opportunistic cleanup of stale throttle files (once per hour at most).
    $lastSweep = $dir . '/.last-sweep';
    if (!is_file($lastSweep) || $now - (int) @file_get_contents($lastSweep) > 3600) {
        foreach (glob($dir . '/contact-*.json') ?: [] as $stale) {
            if ($now - (int) @filemtime($stale) > 86400) {
                @unlink($stale);
            }
        }
        @file_put_contents($lastSweep, (string) $now);
    }

    return true;
}

function store_message(array $data, string $firstName, string $lastName, string $email, string $company, string $subject, string $message): void
{
    try {
        if (!is_db_installed()) {
            return;
        }
        $stmt = db()->prepare(
            'INSERT INTO contact_messages (first_name, last_name, email, company, subject, message)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$firstName, $lastName, $email, $company !== '' ? $company : null, $subject, $message]);
    } catch (Throwable) {
        // Email sending must not depend on the database being reachable.
    }
}

function send_via_plunk(string $recipient, string $name, string $email, string $subject, string $body): bool
{
    if (PLUNK_API_KEY === '') {
        return false;
    }

    $ch = curl_init(PLUNK_API_URL);
    if ($ch === false) {
        return false;
    }

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'to' => $recipient,
            'subject' => $subject,
            'body' => $body,
            'reply_to' => $email,
        ]),
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . PLUNK_API_KEY,
        ],
    ]);

    $result = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return $result !== false && $status >= 200 && $status < 300;
}

function send_via_mail(string $recipient, string $name, string $email, string $subject, string $body): bool
{
    $fromEmail = 'noreply@u2iprocess.com';
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $safeName = encode_mime_header_value($name);
    $safeEmail = filter_var($email, FILTER_VALIDATE_EMAIL) ?: 'unknown@invalid';

    $headers = implode("\r\n", [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'From: U2I Process <' . $fromEmail . '>',
        'Reply-To: ' . $safeName . ' <' . $safeEmail . '>',
        'X-Mailer: PHP/' . PHP_VERSION,
    ]);

    return mail($recipient, $encodedSubject, $body, $headers);
}

// ── Request handling ─────────────────────────────────────────────────────────

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'POST') {
    header('Allow: POST');
    fail('Method not allowed. Use POST.', 405);
}

// Same-origin check (also accepts same-host requests without an Origin header,
// e.g. curl tests or older clients).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = strtolower($_SERVER['HTTP_HOST'] ?? '');
$originHost = strtolower(parse_url($origin, PHP_URL_HOST) ?: '');
if ($origin !== '' && $originHost !== '' && $originHost !== $host) {
    fail('Origin not allowed.', 403);
}

if (!throttle_ok()) {
    fail('Trop de demandes envoyées. Merci de réessayer dans une minute.', 429);
}

$data = read_json_body();

if (!honeypot_ok($data)) {
    // Pretend success so bots gain nothing.
    respond(true, 'Merci ! Votre message a bien été envoyé.');
}

$firstName = field($data, 'firstName');
$lastName = field($data, 'lastName');
$email = field($data, 'email');
$company = field($data, 'company');
$subject = field($data, 'subject');
$message = field($data, 'message');

if ($firstName === '' || $lastName === '' || $email === '' || $subject === '' || $message === '') {
    fail('Merci de remplir tous les champs obligatoires.');
}

foreach (MAX_LENGTHS as $key => $max) {
    if (mb_strlen(field($data, $key)) > $max) {
        fail('Certains champs sont trop longs.');
    }
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Adresse e-mail invalide.');
}

// Recipient: settings row when the DB is installed, constant fallback otherwise.
$recipient = 'u2i@u2iprocess.com';
try {
    if (is_db_installed()) {
        $stmt = db()->query('SELECT contact_email FROM settings WHERE id = 1 LIMIT 1');
        $row = $stmt ? $stmt->fetch() : false;
        if (is_array($row) && $row['contact_email'] !== '') {
            $recipient = (string) $row['contact_email'];
        }
    }
} catch (Throwable) {
}

store_message($data, $firstName, $lastName, $email, $company, $subject, $message);

$fullName = $firstName . ' ' . $lastName;
$emailSubject = '[Site U2I] ' . $subject;
$emailBody = "Nom : {$fullName}\n"
    . ($company !== '' ? "Société : {$company}\n" : '')
    . "E-mail : {$email}\n\n"
    . $message;

$sent = send_via_plunk($recipient, $fullName, $email, $emailSubject, $emailBody);
if (!$sent) {
    $sent = send_via_mail($recipient, $fullName, $email, $emailSubject, $emailBody);
}

if (!$sent) {
    fail("Impossible d'envoyer le message pour le moment. Merci de réessayer ou d'écrire directement à " . $recipient . '.', 500);
}

respond(true, 'Merci ! Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.');
