import type { ReactNode } from "react";

import "./loading.css";

/**
 * U2I branded loading components.
 * The route bar shows during router navigations, skeletons preview the real
 * layouts while CMS content loads, and the boot screen covers the dashboard.
 */

/** Thin red progress strip fixed under the top edge during navigation. */
export function RouteLoadingBar() {
  return (
    <div className="u2i-route-bar" role="progressbar" aria-label="Chargement">
      <div className="u2i-route-bar__track" />
    </div>
  );
}

/** Red-on-black brand mark: orbit ring + pulsing weld core. */
export function BrandMark({ size = 64 }: { size?: number }) {
  return (
    <span
      className="u2i-mark"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="u2i-mark__ring" />
      <span className="u2i-mark__core" />
    </span>
  );
}

/** Full-screen black loader with the brand mark — dashboard boot. */
export function BootLoader({ label = "Chargement" }: { label?: string }) {
  return (
    <div className="u2i-boot" role="status" aria-live="polite">
      <div className="u2i-boot__inner">
        <BrandMark />
        <div className="u2i-boot__word">U2I Process</div>
        <div className="u2i-boot__hint">{label}…</div>
      </div>
    </div>
  );
}

/** Neutral gray shimmer block used by the skeletons below. */
export function Skeleton({
  variant,
}: {
  variant:
    | "title"
    | "meta"
    | "cover"
    | "media"
    | "line"
    | "lineShort"
    | "heading"
    | "image";
}) {
  const cls = {
    title: "u2i-skel u2i-skel--title",
    meta: "u2i-skel u2i-skel--meta",
    cover: "u2i-skel u2i-skel--cover",
    media: "u2i-skel u2i-skel--media",
    line: "u2i-skel u2i-skel--line",
    lineShort: "u2i-skel u2i-skel--line u2i-skel--line--short",
    heading: "u2i-skel u2i-skel--heading",
    image: "u2i-skel u2i-skel--image",
  }[variant];

  return <div className={cls} />;
}

/** Skeleton matching the /actualites card grid. */
export function NewsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="u2i-skel-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="u2i-skel-card">
          <div className="u2i-skel-card__media">
            <Skeleton variant="media" />
          </div>
          <div className="u2i-skel-card__body">
            <Skeleton variant="meta" />
            <Skeleton variant="line" />
            <Skeleton variant="lineShort" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton matching an article detail page. */
export function ArticleSkeleton() {
  return (
    <div className="u2i-skel-article" aria-hidden="true">
      <Skeleton variant="meta" />
      <Skeleton variant="title" />
      <Skeleton variant="cover" />
      <Skeleton variant="line" />
      <Skeleton variant="line" />
      <Skeleton variant="lineShort" />
    </div>
  );
}

/** Skeleton matching CMS page blocks. */
export function PageBlocksSkeleton() {
  return (
    <div className="u2i-skel-blocks" aria-hidden="true">
      <Skeleton variant="heading" />
      <Skeleton variant="image" />
      <Skeleton variant="line" />
      <Skeleton variant="lineShort" />
      <Skeleton variant="heading" />
      <Skeleton variant="line" />
    </div>
  );
}
