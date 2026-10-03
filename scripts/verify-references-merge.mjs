/**
 * Behavioural check for the references merge.
 *
 * The reported bug — `/references` counting 21 client references that the page
 * never rendered — shipped twice, both times because this logic lived inside a
 * React hook that no check could reach. These pin the two ways it can go wrong
 * again: a database row being dropped, and a bundled logo being hidden.
 *
 * Run with `npm run check:references`.
 */

class AssertionError extends Error {}

function equal(actual, expected, message = "") {
  if (actual !== expected) {
    throw new AssertionError(
      `${message || "values differ"}\n  actual:   ${JSON.stringify(actual)}\n  expected: ${JSON.stringify(expected)}`,
    );
  }
}

function deepEqual(actual, expected, message = "") {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b)
    throw new AssertionError(`${message || "values differ"}\n  actual:   ${a}\n  expected: ${b}`);
}

function ok(value, message) {
  if (!value) throw new AssertionError(message);
}

import { mergeReferences, visibleRows } from "../src/lib/references-merge.ts";
import { BUNDLED_PARTNERS } from "../src/lib/references-bundled.ts";

let passed = 0;
const check = (name, fn) => {
  fn();
  passed += 1;
  console.log(`  ok  ${name}`);
};

check("a row with no picture is rendered, not dropped", () => {
  // The reported bug: 21 clients counted on the overview, none on the page.
  const managed = Array.from({ length: 21 }, (_, i) => ({
    kind: "client",
    title: `Client ${i + 1}`,
    imageUrl: null,
  }));
  const merged = mergeReferences(managed, []);
  equal(merged.length, 21, "all 21 picture-less clients are rendered");
  equal(merged[0].image, "", "with an empty image, so the grid shows the name");
});

check("the count and the rendered grid agree", () => {
  // What ReferencesOverview counts vs what the page draws.
  const items = [
    { kind: "client", title: "A", imageUrl: null },
    { kind: "client", title: "B", imageUrl: "/b.png" },
    { kind: "partner", title: "C", imageUrl: null },
    { kind: "partner", title: "D", imageUrl: "/d.png" },
    { kind: "client", title: "E", imageUrl: "/e.png", isVisible: false },
  ];
  const counted = (kind) =>
    items.filter((row) => row.kind === kind && row.isVisible !== false).length;
  equal(
    counted("client"),
    mergeReferences(visibleRows(items, "client"), []).length,
    "clients: counted === rendered",
  );
  equal(
    counted("partner"),
    mergeReferences(visibleRows(items, "partner"), []).length,
    "partners: counted === rendered",
  );
});

check("hidden rows are excluded from both", () => {
  const merged = mergeReferences(
    [{ kind: "client", title: "Caché", imageUrl: null, isVisible: false }],
    [],
  );
  equal(merged.length, 0);
  equal(visibleRows([{ kind: "client", title: "x", isVisible: false }], "client").length, 0);
});

check("a picture-less row does NOT hide the bundled logo of the same name", () => {
  const bundled = [{ title: "Sanofi", image: "/sanofi.png" }];
  const merged = mergeReferences([{ kind: "client", title: "Sanofi", imageUrl: null }], bundled, {
    matchTitle: true,
  });
  equal(merged.length, 2, "the managed row shows as text and the logo survives");
  ok(
    merged.some((r) => r.image === "/sanofi.png"),
    "the bundled logo is still there",
  );
});

check("a row carrying a bundled image replaces exactly that logo", () => {
  // The URL must be the real bundled one: shadowing matches on the image path,
  // so an invented path would match nothing and prove nothing.
  const target = BUNDLED_PARTNERS[0];
  const merged = mergeReferences(
    [{ kind: "partner", title: "Renamed", imageUrl: target.image }],
    BUNDLED_PARTNERS,
  );
  equal(merged.length, BUNDLED_PARTNERS.length, "no duplicate is added");
  equal(
    merged.filter((r) => r.image === target.image).length,
    1,
    "the bundled copy is replaced, not doubled",
  );
});

check("with nothing in the database, every bundled logo still shows", () => {
  equal(mergeReferences([], BUNDLED_PARTNERS).length, BUNDLED_PARTNERS.length);
});

check("managed rows are added, not swapped for the whole grid", () => {
  const merged = mergeReferences(
    [{ kind: "partner", title: "Nouveau", imageUrl: "/assets/uploads/nouveau.png" }],
    BUNDLED_PARTNERS,
  );
  equal(merged.length, BUNDLED_PARTNERS.length + 1);
});

console.log(`\n${passed} checks passed.`);
