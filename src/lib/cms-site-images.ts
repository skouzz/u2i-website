import { useQuery } from "@tanstack/react-query";
import { type CmsSiteImage } from "./cms";

/**
 * Fetch managed site images for a given section.
 * Falls back to empty array if CMS is not available.
 */
export function useSiteImages(section: string) {
  return useQuery({
    queryKey: ["siteImages", section],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin.php?a=site_images&section=" + encodeURIComponent(section));
        const data = await res.json();
        return data as { ok: true; items: CmsSiteImage[] };
      } catch {
        return { ok: true, items: [] };
      }
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

/**
 * Get image URL for a specific key within a section.
 * Returns the imageUrl or undefined if not found.
 */
export function getImageByKey(
  items: CmsSiteImage[] | undefined,
  key: string
): string | undefined {
  if (!items) return undefined;
  const item = items.find((i) => i.keyName === key);
  return item?.imageUrl ?? undefined;
}

/**
 * Get visible images for a section, sorted by sortOrder.
 */
export function getVisibleImages(
  items: CmsSiteImage[] | undefined
): CmsSiteImage[] {
  if (!items) return [];
  return items
    .filter((i) => i.isVisible !== false && i.imageUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
