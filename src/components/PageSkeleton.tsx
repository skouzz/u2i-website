import { RouteLoadingBar } from "./loading";
import "./loading.css";

/**
 * Route-transition placeholder.
 *
 * Shown while a new route's JS chunk loads. Without it the content wrapper
 * collapses to zero height and the footer slides up under the navbar, which
 * reads as "the page loaded but it's empty". This reserves roughly a viewport
 * of content-shaped space so the layout never jumps, and the shimmer matches
 * the per-page skeletons so the hand-off is seamless.
 */
export function PageSkeleton() {
  return (
    <div className="u2i-page-skeleton" role="status" aria-live="polite" aria-busy="true">
      {/* Thin progress strip on top of the skeleton, so the wait still reads
          as "working" rather than "stuck". */}
      <RouteLoadingBar />
      {/* Hero band */}
      <div className="u2i-page-skeleton__hero">
        <div className="u2i-page-skeleton__hero-inner">
          <div className="u2i-skel u2i-skel--eyebrow" />
          <div className="u2i-skel u2i-skel--h1" />
          <div className="u2i-skel u2i-skel--h2" />
          <div className="u2i-skel u2i-skel--lede" />
          <div className="u2i-skel u2i-skel--cta" />
        </div>
      </div>

      {/* Content band */}
      <div className="u2i-page-skeleton__body">
        <div className="u2i-skel u2i-skel--h3" />
        <div className="u2i-page-skeleton__cols">
          <div className="u2i-skel u2i-skel--media" />
          <div className="u2i-skel u2i-skel--text" />
        </div>
        <div className="u2i-page-skeleton__grid">
          <div className="u2i-skel u2i-skel--card" />
          <div className="u2i-skel u2i-skel--card" />
          <div className="u2i-skel u2i-skel--card" />
        </div>
      </div>
    </div>
  );
}
