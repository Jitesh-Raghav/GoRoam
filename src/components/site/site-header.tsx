import { EXPLORE_LINKS, ExplorePanel } from "./explore-panel";
import { SiteHeaderClient } from "./site-header-client";

/** The site's top bar, with the Explore panel rendered here on the server so no trip data ships with the bar. */
export function SiteHeader() {
  return <SiteHeaderClient explore={<ExplorePanel />} exploreLinks={EXPLORE_LINKS} />;
}
