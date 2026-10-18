#!/usr/bin/env node
/**
 * Tell Bing, Yandex, Seznam and Naver (and so ChatGPT search and Copilot) about
 * every page in the sitemap at once, through IndexNow. Run after each deploy:
 *
 *   npm run indexnow                       every URL in the live sitemap
 *   npm run indexnow -- /trips /trips/goa  just these paths
 *
 * The key is public by design: it lives at /<key>.txt so the engines can check
 * the request came from the site's owner. Google doesn't use IndexNow; it reads
 * the sitemap submitted in Search Console instead.
 */
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.goroam.world").replace(/\/+$/, "");
const KEY = "106a0691b20eab2aa79c3f680965f76e";

async function sitemapUrls() {
  const res = await fetch(`${SITE}/sitemap.xml`);
  if (!res.ok) throw new Error(`Couldn't read ${SITE}/sitemap.xml (${res.status})`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const paths = process.argv.slice(2);
const urls = paths.length ? paths.map((p) => (p.startsWith("http") ? p : `${SITE}${p.startsWith("/") ? p : `/${p}`}`)) : await sitemapUrls();
if (!urls.length) throw new Error("No URLs to submit.");

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls.slice(0, 10000) }),
});
// 200 and 202 both mean accepted; 403 means the key file isn't live yet (deploy first).
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urls.length} URLs`);
if (res.status >= 300) {
  console.log(await res.text());
  process.exit(1);
}
