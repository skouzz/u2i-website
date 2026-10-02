/**
 * Hero headline formatting.
 *
 * Split out of `shared.tsx` on purpose: that file exports only React
 * components, and mixing a plain helper into it trips the react-refresh lint
 * rule (a file that exports both components and non-components cannot
 * fast-refresh). Keeping the helper here leaves shared.tsx component-only.
 */

/**
 * Render a headline whose "\n" marks a deliberate line break.
 *
 * IA headlines are authored as one string with embedded newlines so the copy
 * stays one editable value in `ia.ts`; this turns them into real `<br>`
 * elements without letting a `\n` inside a translated string depend on
 * `white-space: pre-line`, which the hero styles do not set.
 */
export function splitLines(title: string, className?: string) {
  return title.split("\n").map((line, index) => (
    <span key={index} className={className}>
      {index > 0 ? <br /> : null}
      {line}
    </span>
  ));
}
