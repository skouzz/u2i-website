// Verifies the French menu labels authored in the dashboard render in English
// on /en, and stay untouched in French.
import { readFileSync } from "node:fs";

const src = readFileSync("src/lib/i18n/catalog.ts", "utf8");
const tableStart = src.indexOf("const NAV_LABEL_KEYS");
const tableEnd = src.indexOf("};", tableStart);
const table = src.slice(tableStart, tableEnd);

const entries = new Map();
/*
 * Keys in this table may be quoted or bare. Prettier's default `quoteProps:
 * "as-needed"` drops the quotes from every key that is a valid identifier and
 * keeps them only where they are required — so `"accueil"`, `"équipements"`
 * and `"références"` all become bare, while `"a propos"` (it contains a space)
 * stays quoted. Matching only quoted keys made this script report false MISSes
 * as soon as `npm run format` had been run over the catalog, so accept both
 * forms and treat them as the same key. The bare form uses Unicode property
 * escapes because accented letters are perfectly good identifier characters.
 */
const KEY = '(?:"([^"]+)"|([\\p{L}_$][\\p{L}\\p{N}_$]*))';
for (const m of table.matchAll(new RegExp(`${KEY}\\s*:\\s*"([a-zA-Z0-9.]+)"`, "gu"))) {
  entries.set(m[1] ?? m[2], m[3]);
}

// The exact labels reported as showing up untranslated on /en.
const reported = [
  "Accueil",
  "À propos",
  "Secteurs",
  "Équipements",
  "Références",
  "Actualités",
  "Contact",
];

// Minimal evaluation of translate() using the EN catalog values.
const enBlock = src.slice(src.indexOf("const en: Partial<Record"), src.indexOf("\n};", src.indexOf("const en: Partial<Record")));
const enValues = new Map();
for (const m of enBlock.matchAll(/"([a-zA-Z0-9.]+)":\s*\n?\s*"((?:[^"\\]|\\.)*)"/g)) {
  enValues.set(m[1], m[2].replace(/\\'/g, "'").replace(/\\"/g, '"'));
}

let failed = 0;
for (const label of reported) {
  const key = entries.get(label.toLowerCase());
  if (!key) {
    console.log(`MISS  "${label}" has no mapping`);
    failed++;
    continue;
  }
  const en = enValues.get(key);
  if (!en) {
    console.log(`MISS  "${label}" -> ${key} has no EN value`);
    failed++;
    continue;
  }
  // A few labels are genuine cognates ("Contact" is "Contact"), so identical
  // text is not a failure. What matters is that the label resolves to the
  // right key and that key has a real English value.
  console.log(`PASS  "${label}" -> ${key} -> "${en}"`);
}

// Untranslated custom labels must pass through unchanged.
for (const custom of ["Atelier Privé", "Offre spéciale"]) {
  if (entries.has(custom.toLowerCase())) {
    console.log(`FAIL  custom label "${custom}" should not be in the table`);
    failed++;
  }
}

console.log(failed ? `\n${failed} problem(s)` : "\nAll reported labels translate.");
process.exit(failed ? 1 : 0);
