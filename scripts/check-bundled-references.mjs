#!/usr/bin/env node
/**
 * Fails when public/api/config.php's reference_kind_map() drifts from the
 * bundled logos in src/lib/references-bundled.ts.
 *
 * The PHP list is what repairs a mis-filed database row, and the TypeScript
 * list is what the page renders. If they disagree, a logo gets re-filed to the
 * wrong register (or not re-filed at all) and the page shows partners where
 * clients were expected — the exact bug this repair exists to prevent. Two
 * copies of one fact, so this script is what keeps them equal.
 *
 * Only the FILENAME is compared: Vite hashes asset URLs at build time, so the
 * directory and hash change per build while the filename does not.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const ts = readFileSync(join(root, "src/lib/references-bundled.ts"), "utf8");
const php = readFileSync(join(root, "public/api/config.php"), "utf8");

const failures = [];

/** Slice the TS source between two declarations. */
const section = (startMarker, endMarker) => {
  const from = ts.indexOf(startMarker);
  if (from === -1) {
    return "";
  }
  const to = endMarker ? ts.indexOf(endMarker, from) : ts.length;
  return ts.slice(from, to === -1 ? ts.length : to);
};

/** Identifiers used as `image:` inside one list block, in source order. */
const imageIdentifiers = (block) => [
  ...new Set([...block.matchAll(/image:\s*([A-Za-z0-9_]+)/g)].map((m) => m[1])),
];

/** Resolve each identifier to the asset filename its import points at. */
const resolveImages = (identifiers) => {
  const out = [];
  for (const id of identifiers) {
    // "import sanofiLogoImage from '@/assets/partners/Sanofi.png';"
    const m = ts.match(new RegExp(`import\\s+${id}\\s+from\\s+"@/assets/[^"]+/([^"]+)"`));
    if (!m) {
      failures.push(`could not resolve the import for '${id}'`);
      continue;
    }
    out.push(m[1]);
  }
  return out;
};

/** Read one `kind => [ ... ]` block out of the PHP function. */
const phpBlock = (kind) => {
  const m = php.match(new RegExp(`'${kind}'\\s*=>\\s*\\[([^\\]]*)\\]`));
  if (!m) {
    return null;
  }
  return m[1]
    .split(",")
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
};

/**
 * Reduce a filename to the stem both sides can agree on.
 *
 * Three differences have to be levelled out: URL-encoding (Vite emits encoded
 * asset URLs, PHP stores them verbatim, so a space is "%20" on one side and " "
 * on the other) and the file EXTENSION, which reference_kind_map() omits
 * because a build can re-encode an asset. What is left is the stable part of
 * the name, which is what identifies the logo.
 */
const key = (name) => {
  let decoded = name;
  try {
    decoded = decodeURIComponent(name);
  } catch {
    // A malformed escape is compared as-is rather than dropping the entry.
  }
  return decoded.replace(/\.[a-z0-9]+$/i, "").trim();
};
const norm = (list) => new Set(list.map(key));

const clients = resolveImages(
  imageIdentifiers(section("export const BUNDLED_CLIENTS:", "export const BUNDLED_CLIENTS_FLAT")),
);
const partners = resolveImages(
  imageIdentifiers(
    section("export const BUNDLED_PARTNERS:", "export const BUNDLED_CERTIFICATIONS"),
  ),
);

const phpClients = phpBlock("client");
const phpPartners = phpBlock("partner");

if (!phpClients || !phpPartners) {
  console.error("FAIL  could not find reference_kind_map() in public/api/config.php");
  process.exit(1);
}

for (const [label, tsList, phpList] of [
  ["client", clients, phpClients],
  ["partner", partners, phpPartners],
]) {
  const tsSet = norm(tsList);
  const phpSet = norm(phpList);

  const missing = [...tsSet].filter((f) => !phpSet.has(f));
  const extra = [...phpSet].filter((f) => !tsSet.has(f));

  if (missing.length || extra.length) {
    if (missing.length) {
      failures.push(
        `${label}: bundled in references-bundled.ts but MISSING from config.php → ${missing.join(", ")}`,
      );
    }
    if (extra.length) {
      failures.push(
        `${label}: listed in config.php but MISSING from references-bundled.ts → ${extra.join(", ")}`,
      );
    }
    continue;
  }

  console.log(`PASS  ${label}: ${tsList.length} logo(s) match on both sides`);
}

if (failures.length) {
  console.error("");
  for (const f of failures) {
    console.error(`FAIL  ${f}`);
  }
  console.error(
    "\nThe bundled logos and the PHP repair list must stay identical.\n" +
      "Update reference_kind_map() in public/api/config.php to match, then re-run.",
  );
  process.exit(1);
}

console.log("\nBundled reference logos and the PHP repair list are in sync.");
