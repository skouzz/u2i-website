/**
 * i18n key validator.
 *
 * Catches the two mistakes TypeScript cannot see:
 *   1. a component calls t("key.that.does.not.exist") — the catalog's
 *      fallback returns the key itself, so the page renders the literal
 *      string "key.that.does.not.exist" with no error anywhere;
 *   2. a key exists in French but has no English value, so /en silently
 *      shows the French text.
 *
 * Also reports FR/EN pairs that are byte-identical, which usually means a
 * string was copied instead of translated (brand names and technical
 * terms excepted).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const CATALOG = "src/lib/i18n/catalog.ts";
const SRC = "src";

const catalogSrc = readFileSync(CATALOG, "utf8");

/** Extract one locale object's keys -> values from the catalog source. */
function extractBlock(startMarker, endMarker) {
  const start = catalogSrc.indexOf(startMarker);
  if (start === -1) throw new Error(`marker not found: ${startMarker}`);
  const end = catalogSrc.indexOf(endMarker, start);
  if (end === -1) throw new Error(`end marker not found after ${startMarker}`);
  return catalogSrc.slice(start, end);
}

function parseEntries(block) {
  const entries = new Map();
  // Matches  "some.key": followed by a string literal, handling the
  // multi-line "key":\n    "value" form as well as inline.
  const re = /"([a-zA-Z0-9._]+)":\s*(?:\n\s*)?"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    entries.set(m[1], m[2]);
  }
  return entries;
}

const fr = parseEntries(extractBlock("const fr = {", "} as const;"));
const en = parseEntries(extractBlock("const en: Partial<Record", "};"));

console.log(`FR keys: ${fr.size}`);
console.log(`EN keys: ${en.size}`);

let failed = false;

/** Every .ts/.tsx under dir, skipping tests and generated files. */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name) && !/\.gen\.ts$/.test(name) && p !== CATALOG) {
      out.push(p);
    }
  }
  return out;
}

const files = walk(SRC);
const missing = new Map();
const usedKeys = new Set();

for (const file of files) {
  const src = readFileSync(file, "utf8");
  // t("key") — the direct call form used throughout the app.
  for (const m of src.matchAll(/\bt\(\s*"([a-zA-Z0-9._]+)"/g)) {
    const key = m[1];
    usedKeys.add(key);
    if (!fr.has(key)) {
      if (!missing.has(key)) missing.set(key, []);
      missing.get(key).push(file);
    }
  }
}

if (missing.size) {
  failed = true;
  console.log(`\nFAIL  ${missing.size} t() key(s) missing from the FR catalog:`);
  for (const [key, where] of missing) {
    console.log(`  ${key}  ← ${[...new Set(where)].join(", ")}`);
  }
} else {
  console.log("\nAll t() keys used in components exist in the FR catalog.");
}

const noEnglish = [...fr.keys()].filter((k) => !en.has(k));
if (noEnglish.length) {
  failed = true;
  console.log(`\nFAIL  ${noEnglish.length} key(s) have no English value:`);
  for (const k of noEnglish) console.log(`  ${k}`);
} else {
  console.log("All FR keys have an EN value.");
}

// Copy-paste check: identical FR/EN is fine for brand + technical terms.
const ALLOWED_IDENTICAL =
  /(^nav\.(home|contact)$)|(AXXAIR|ISO|CEVA|U2I)|(^references\.(partners|clients))/;
const identical = [...fr.keys()].filter(
  (k) => en.has(k) && fr.get(k) === en.get(k) && !ALLOWED_IDENTICAL.test(k),
);
if (identical.length) {
  console.log(`\nWARN  ${identical.length} key(s) have identical FR/EN (may be untranslated):`);
  for (const k of identical) console.log(`  ${k}  "${fr.get(k)}"`);
}

const unused = [...fr.keys()].filter((k) => !usedKeys.has(k));
console.log(`\nDefined but unreferenced: ${unused.length}`);

process.exit(failed ? 1 : 0);
