// Verifies that every key in the French catalog has an English counterpart.
import { readFileSync } from "node:fs";

const src = readFileSync("src/lib/i18n/catalog.ts", "utf8");

const frStart = src.indexOf("const fr = {");
const enStart = src.indexOf("const en: Partial<Record<keyof typeof fr, string>> = {");

const frBlock = src.slice(frStart, enStart);
const enBlock = src.slice(enStart, src.indexOf("\n};", enStart));

const keyRe = /"([a-zA-Z][a-zA-Z0-9.]*)":/g;
const frList = [...frBlock.matchAll(keyRe)].map((m) => m[1]);
const enList = [...enBlock.matchAll(keyRe)].map((m) => m[1]);
const frKeys = new Set(frList);
const enKeys = new Set(enList);

const missing = [...frKeys].filter((k) => !enKeys.has(k));
const orphan = [...enKeys].filter((k) => !frKeys.has(k));
// A key repeated inside one object literal is a silent override (last wins).
const dupeFr = [...frKeys].filter((k) => frList.filter((x) => x === k).length > 1);
const dupeEn = [...enKeys].filter((k) => enList.filter((x) => x === k).length > 1);

console.log(`FR keys: ${frKeys.size}`);
console.log(`EN keys: ${enKeys.size}`);
if (missing.length) {
  console.log(`\nMISSING EN (${missing.length}):`);
  for (const k of missing) console.log("  " + k);
} else {
  console.log("\nAll FR keys have an EN value.");
}
if (orphan.length) {
  console.log(`\nORPHAN EN keys not in FR (${orphan.length}):`);
  for (const k of orphan) console.log("  " + k);
}
if (dupeFr.length) {
  console.log(`\nDUPLICATE keys in FR (${dupeFr.length}):`);
  for (const k of dupeFr) console.log("  " + k);
}
if (dupeEn.length) {
  console.log(`\nDUPLICATE keys in EN (${dupeEn.length}):`);
  for (const k of dupeEn) console.log("  " + k);
}
process.exit(missing.length || orphan.length || dupeFr.length || dupeEn.length ? 1 : 0);
