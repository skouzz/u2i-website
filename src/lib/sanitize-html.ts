/**
 * Shared HTML sanitizer for admin-authored rich text (article bodies, CMS
 * text blocks). Removes script/style/iframe/object/embed/link/meta elements
 * and on* / javascript: attributes before the HTML is injected into the page.
 * The `html` block type renders as-is by design (trusted admins, see renderer).
 */
export function sanitizeArticleHtml(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;

  const forbiddenTags = new Set(["script", "style", "iframe", "object", "embed", "link", "meta"]);
  template.content.querySelectorAll("*").forEach((el) => {
    if (forbiddenTags.has(el.tagName.toLowerCase())) {
      el.remove();
      return;
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || (name === "href" && value.startsWith("javascript:"))) {
        el.removeAttribute(attr.name);
      }
    }
  });

  return template.innerHTML;
}
