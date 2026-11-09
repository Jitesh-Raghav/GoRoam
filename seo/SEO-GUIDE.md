# GoRoam SEO + GEO playbook

**Goal:** about 10,000 visits a day, roughly 300k a month, from Google, Bing and AI answers (ChatGPT, Perplexity, Gemini, Google AI Overviews).

- **Site:** https://www.goroam.world
- **Sitemap:** https://www.goroam.world/sitemap.xml
- **Last updated:** 9 November 2026

Short bullets on purpose. Each section starts with what to do, then why.

---

## 0. The 12 things that matter most

1. Set up Search Console, Bing Webmaster Tools and IndexNow this week (§2).
2. Get all ~280 existing pages indexed: sitemap, internal links, and "Request indexing" for the Tier 1 URLs (§3).
3. Fix robots for `/trip/` and `/try/` so Google can see their `noindex` (§4).
4. Add month hubs for April to September and 20 more city hubs. These are the biggest Indian searches you don't cover yet (§6).
5. Deepen the top 60 trip pages. Only 16 of 160 have deep sections, which leaves room for Google to judge the rest as thin (§4, §6).
6. Start `/blog` on goroam.world: 3 posts a week, published there first and then copied to Medium with a canonical link (§7, §8).
7. Turn the Trip Cost Index into a monthly data story you pitch to journalists. That's your best route to backlinks (§9).
8. In month 1, list GoRoam on the main launch and AI-tool directories (§9).
9. GEO: add `llms.txt`, allow the AI crawlers, put the answer first on each page, and show up on Reddit, YouTube and Quora (§10).
10. Pinterest and Shorts for travel discovery (§11).
11. Check the numbers weekly, and double down on whatever already ranks in positions 8–20 (§12).
12. Be patient. For a new domain, 10k a day is a 12–24 month project (§1).

---

## 1. Reality check: the 10k/day math

- **Scale of the goal:** 10k a day is about 300k a month, or about 3.6M a year.
- **What one page earns** (rough ranges, for planning only):
  - Long-tail page in the top 3 ("jaisalmer 3 day itinerary"): **5–50 visits a day**.
  - Mid-tail page in the top 3 ("weekend getaways from bangalore"): **50–400 a day**.
  - Seasonal head term in the top 3 ("places to visit in december in india"): **500–3,000 a day** in season, close to 0 out of season.
- **One way to reach 10k a day:**
  - 700 long and mid-tail pages averaging 10 a day gives 7,000.
  - 12 month hubs plus 30 city hubs averaging 80 a day gives about 3,400.
- **What you need:**
  - **1,000 or more** genuinely useful indexed pages;
  - **300–500 referring domains**;
  - a strong brand presence (mentions, reviews, social);
  - **12–24 months** of steady work.
- **Seasonality:** Indian travel searches peak in October–January (winter trips) and April–June (summer holidays). Publish 6–8 weeks before each peak.

**Milestones (targets, not promises)**

| By | Indexed pages | Referring domains | Clicks/day |
|---|---|---|---|
| Month 1 | 280 | 30 | 50–150 |
| Month 3 | 450 | 80 | 300–800 |
| Month 6 | 700 | 150 | 1,500–3,000 |
| Month 12 | 1,000+ | 300+ | 4,000–7,000 |
| Month 18–24 | 1,200+ | 500+ | 10,000+ |

---

## 2. Week 1: setup (do first)

- **Google Search Console**
  - Add a **Domain property** for `goroam.world`, verified with a DNS TXT record.
  - Submit `https://www.goroam.world/sitemap.xml`.
  - Use URL Inspection's "Request indexing" for the Tier 1 URLs in §3. There's a small daily quota, so spread them over 5–7 days.
  - Check Pages, then "Why pages aren't indexed", every week.
- **Bing Webmaster Tools**
  - Import the site from Search Console and submit the sitemap.
  - This matters for GEO: ChatGPT search and Copilot draw heavily on Bing's index.
- **IndexNow** (Bing, Yandex, Naver and Seznam; not Google)
  - Host a key file and ping changed URLs on every deploy. It's a small script or a Vercel deploy hook.
- **Analytics** (GA4 or Vercel Web Analytics)
  - Make one segment per traffic source: Organic Search, AI assistants and Social.
  - AI referrers to track: `chatgpt.com` (it also adds `utm_source=chatgpt.com`), `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com` and `claude.ai`.
- **Validation**
  - Run one URL of each page type through the Rich Results Test (https://search.google.com/test/rich-results) and the Schema Markup Validator: a trip, an adventure, a guide, an itinerary and a hub.
- **Speed** (PageSpeed Insights, mobile): test `/`, `/trips`, `/trips/jaisalmer` and `/adventures/ha-giang-loop`. Keep:
  - **LCP under 2.5 s**
  - **INP under 200 ms**
  - **CLS under 0.1**
- **SEO log:** a sheet with date, change, URLs, expected effect and result after 4 weeks.

---

## 3. Pages to index (and pages not to)

### Index these (all already in the sitemap)

| Section | URL pattern | Pages | Example | Queries it targets |
|---|---|---|---|---|
| Home | `/` | 1 | https://www.goroam.world/ | ai trip planner, free ai itinerary generator |
| Where to go | `/trips`, `/trips/{slug}` | 1 + 160 | https://www.goroam.world/trips/jaisalmer | jaisalmer trip plan, jaisalmer 3 days itinerary, jaisalmer trip cost |
| Adventures | `/adventures`, `/adventures/{slug}` | 1 + 50 | https://www.goroam.world/adventures/hitchhike-kyrgyzstan | hitchhiking kyrgyzstan, ha giang loop cost, annapurna circuit guide |
| Destination guides | `/destinations`, `/destinations/{slug}` | 1 + 9 | https://www.goroam.world/destinations/goa | goa travel guide, best time to visit goa, where to stay in goa |
| Ready-made itineraries | `/itineraries`, `/itineraries/{slug}` | 1 + 17 | https://www.goroam.world/itineraries/kerala-5-days | kerala 5 day itinerary, goa 3 day plan |
| Trip types | `/plan`, `/plan/{slug}` | 1 + 8 | https://www.goroam.world/plan/couples | couple trip planner, honeymoon planner, family trip planner |
| By month | `/places-to-visit`, `/places-to-visit/{month}` | 1 + 6 | https://www.goroam.world/places-to-visit/december | places to visit in december in india |
| From your city | `/weekend-getaways`, `/weekend-getaways/{city}` | 1 + 8 | https://www.goroam.world/weekend-getaways/bangalore | weekend getaways from bangalore |
| Data | `/trip-cost-index` | 1 | https://www.goroam.world/trip-cost-index | cheapest countries to visit from india, trip cost per day |
| Product and trust | `/squad`, `/about`, `/contact` | 3 | https://www.goroam.world/squad | group trip planner |
| Legal | `/terms`, `/privacy`, `/refunds` | 3 | — | (trust only) |

That's about **280 pages** today.

### Tier 1: request indexing first (about 60 URLs)

- **Index pages:** `/`, `/trips`, `/adventures`, `/destinations`, `/itineraries`, `/plan`, `/places-to-visit`, `/weekend-getaways`, `/trip-cost-index`
- **Months:**
  - `/places-to-visit/october`
  - `/places-to-visit/november`
  - `/places-to-visit/december`
  - `/places-to-visit/january`
  - `/places-to-visit/february`
  - `/places-to-visit/march`
- **Cities:**
  - `/weekend-getaways/delhi`
  - `/weekend-getaways/mumbai`
  - `/weekend-getaways/bangalore`
  - `/weekend-getaways/pune`
  - `/weekend-getaways/hyderabad`
  - `/weekend-getaways/chennai`
  - `/weekend-getaways/kolkata`
  - `/weekend-getaways/ahmedabad`
- **Guides:**
  - `/destinations/goa`
  - `/destinations/kerala`
  - `/destinations/ladakh`
  - `/destinations/manali`
  - `/destinations/jaipur`
  - `/destinations/udaipur`
  - `/destinations/rishikesh`
  - `/destinations/varanasi`
  - `/destinations/hampi`
- **Itineraries:**
  - `/itineraries/goa-3-days`
  - `/itineraries/kerala-5-days`
  - `/itineraries/manali-4-days-friends`
  - `/itineraries/ladakh-5-days`
  - `/itineraries/thailand-3-days`
  - `/itineraries/bali-4-days`
  - `/itineraries/dubai-4-days`
  - `/itineraries/japan-5-days`
- **Trip types:**
  - `/plan/couples`
  - `/plan/family`
  - `/plan/friends`
  - `/plan/solo`
  - `/plan/road-trip`
  - `/plan/weekend-getaway`
  - `/plan/multi-city`
  - `/plan/budget`
- **Trips:**
  - `/trips/jaisalmer`
  - `/trips/andaman`
  - `/trips/gokarna`
  - `/trips/varkala`
  - `/trips/coorg`
  - `/trips/meghalaya`
  - `/trips/darjeeling`
  - `/trips/sri-lanka`
  - `/trips/phuket`
  - `/trips/bhutan`
  - `/trips/nepal`
  - `/trips/maldives`
- **Adventures:**
  - `/adventures/ha-giang-loop`
  - `/adventures/hitchhike-kyrgyzstan`
  - `/adventures/annapurna-circuit`
  - `/adventures/everest-base-camp`
  - `/adventures/uyuni-salt-flats`
  - `/adventures/salkantay-trek`

### Keep out of the index (already set up; don't change)

- `/dashboard/*`, `/auth`, `/api/*`, `/go`: private or app-only. Blocked in robots.
- `/trip/{id}` (shared trips), `/try/{id}` (guest previews), `/squad/{code}`: these are personal. They already send `noindex`; see the robots fix in §4.
- `/{section}/{slug}/photo`: image routes. They're fine as images, but never link them as pages.

---

## 4. Technical fixes (with file paths)

- **Robots** (`src/app/robots.ts`)
  - Remove `/trip/` and `/try/` from `disallow`. Those pages send `noindex`, but robots.txt stops Google from reading it. Shared links can then still show up as "Indexed, though blocked by robots.txt".
  - Keep `/dashboard`, `/api/`, `/auth` and `/go` blocked.
- **AI crawlers** (`src/app/robots.ts` and Vercel)
  - `userAgent: "*"` already allows them. Check that Vercel Firewall's **bot protection or "AI bots" rule isn't blocking** them.
  - Optionally list them by name: `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Claude-SearchBot`, `Google-Extended`, `Applebot-Extended`, `bingbot`. Check each vendor's docs for current names. Appendix B has a draft.
- **`public/llms.txt`**: a plain-Markdown map of the site for AI tools. Low effort, so do it. Appendix A has a draft.
- **Year in titles**
  - Titles say "(2026)". Change them on **1 January 2027**, or derive the year from the build date.
  - Where the year appears:
    - `YEAR` in `src/app/trips/[slug]/page.tsx`
    - `YEAR` in `src/app/adventures/[slug]/page.tsx`
    - the metadata of `src/app/trips/page.tsx`, `src/app/adventures/page.tsx`, `src/app/destinations/page.tsx`, `src/app/places-to-visit/page.tsx`, `src/app/places-to-visit/[month]/page.tsx`, `src/app/weekend-getaways/page.tsx` and `src/app/weekend-getaways/[city]/page.tsx`
  - Only bump the `UPDATED` dates (trip, adventure and guide pages) when the content really changes. Never fake freshness.
- **E-E-A-T** (experience, expertise, authority, trust)
  - Add a **real founder photo** (the `founder` photo field in `src/lib/company.ts`).
  - Expand `/about`: real trips taken, why GoRoam exists, how the prices are checked.
  - Fill in the **LinkedIn and YouTube** links in `src/lib/company.ts`. They feed the Organization schema's `sameAs`, which helps Google and AI tools connect the brand.
- **Thin-content risk**
  - Google's spam policy on "scaled content abuse" targets pages mass-produced mainly to rank.
  - 144 of the 160 trip pages have no deep sections (prices table, insider tips, mistakes, day trips), which live in `src/lib/trip-deep.ts`. Add them to the **top 60** trips by demand first.
- **Photos**
  - Set `UNSPLASH_ACCESS_KEY` (and the Google Places key) in production, so every photo route returns a real image.
  - Real photos raise click-through, image search traffic and trust.
- **Internal links**
  - Add "Adventures nearby" on trip pages in the same country, e.g. `/trips/nepal` linking to `/adventures/annapurna-circuit`.
  - Link each new blog post from at least 2 older pages.
- **Core Web Vitals:** turn on Vercel Speed Insights and look at the 75th percentile on mobile each month.
- **Errors:** check Search Console weekly for 404s and soft 404s. Fix or 301-redirect them; never redirect everything to the homepage.

---

## 5. Keyword map: query → page

| Query (examples) | URL |
|---|---|
| ai trip planner, free ai itinerary generator | `/` and `/plan` |
| couple trip planner, honeymoon itinerary planner | `/plan/couples` |
| family trip planner india | `/plan/family` |
| places to visit in december in india | `/places-to-visit/december` |
| weekend getaways from bangalore / delhi / mumbai | `/weekend-getaways/bangalore` |
| goa travel guide, best time to visit goa | `/destinations/goa` |
| goa trip plan for 3 days | `/itineraries/goa-3-days` |
| kerala 5 days itinerary | `/itineraries/kerala-5-days` |
| jaisalmer trip plan, jaisalmer 3 days | `/trips/jaisalmer` |
| andaman trip cost, andaman itinerary | `/trips/andaman` |
| cheapest countries to visit from india | `/trip-cost-index` |
| ha giang loop, ha giang loop cost | `/adventures/ha-giang-loop` |
| hitchhiking in kyrgyzstan | `/adventures/hitchhike-kyrgyzstan` |
| annapurna circuit cost / permits | `/adventures/annapurna-circuit` |

**How to find more**
- In Search Console, Performance, filter to **positions 8–20**. Those are quick wins: improve the title and intro, add FAQs, add internal links.
- Use Google autocomplete and "People also ask", AlsoAsked, AnswerThePublic and Google Keyword Planner.
- Run gap checks on Holidify, Tripoto, Wanderlog and Lonely Planet: what do they rank for that you have data for?
- One page per intent: don't build two pages for "goa 3 days" and "3 day goa itinerary".

---

## 6. New pages to build (in ROI order)

`(new)` marks a URL that doesn't exist yet.

1. **Month hubs for April to September** (new: `/places-to-visit/april` to `/places-to-visit/september`).
   - Huge Indian summer and monsoon demand, e.g. "places to visit in may in india" and "monsoon getaways".
   - Extend `MONTH_HUBS` in `src/lib/trip-hubs.ts`.
2. **20 more city hubs** (new: e.g. `/weekend-getaways/jaipur`).
   - Jaipur, Lucknow, Chandigarh, Kochi, Indore, Nagpur, Bhubaneswar, Surat, Coimbatore, Mysuru, Vizag, Bhopal, Guwahati, Dehradun, Nashik, Vadodara, Madurai, Mangaluru, Trivandrum, Noida/Gurgaon.
3. **Visa guides for Indian passports** (new: `/visa/{country}-for-indians`, starting with 30 countries).
   - Very high demand, e.g. "thailand visa for indians" and "vietnam e-visa for indians".
   - Check them every month and show "last checked".
4. **Comparison pages** (new: `/compare/{a}-vs-{b}`).
   - Goa vs Kerala, Bali vs Thailand, Manali vs Shimla, Maldives vs Mauritius for a honeymoon. About 40 pages.
5. **Routes from a city to a place** (new: `/routes/{city}-to-{place}`).
   - Delhi to Manali, Bangalore to Coorg, Mumbai to Goa: how to get there, cost and a 3-day plan. Start with 100.
6. **"{place} in {month}"** (new: `/trips/{slug}/{month}`), only for the top 30 places' peak months, about 90 pages.
   - Real weather, events and prices for that month, or don't publish.
7. **Itineraries:** from 17 to 100.
   - Lengths people search: 2, 3, 4, 5 and 7 days.
   - Who's going: couples, family, friends, solo.
8. **Adventures:** from 50 to 200, aimed at the US, EU, UK and Australia.
   - The Balkans (hitchhiking Albania), Africa (Malawi, Namibia), Latin America (Patagonia on a budget), Europe on a shoestring.

**Rule for every new page:** it must add unique facts, such as prices, routes, timings, photos or an opinion. Swapping the city name into a template isn't enough.

---

## 7. Blog plan (on goroam.world)

- **Where:** `goroam.world/blog` (new). Keep your own domain first, so the authority builds on the site.
- **Cadence:** 3 posts a week, about 150 a year. Each post links to 3–5 GoRoam pages.
- **Topic clusters** (one pillar page plus 10–20 posts each):
  - **Budget travel from India:**
    - Cheapest countries for Indians in 2027
    - Thailand under ₹50,000
    - Vietnam e-visa step by step
  - **Honeymoons:** Maldives vs Mauritius; 7-day Bali honeymoon; budget honeymoons in India.
  - **Himalaya:** Spiti vs Ladakh; first Himalayan trek; acute mountain sickness explained.
  - **Weekend trips:** 25 weekend trips from Bangalore under ₹10k; monsoon drives from Mumbai.
  - **Adventure travel (for Western readers):**
    - Hitchhiking Central Asia
    - Southeast Asia motorbike loops ranked
    - Cheapest treks in the world
  - **Planning skills:** packing lists, travel insurance explained, how to use an AI trip planner well.
- **20 starter titles:**
  1. Places to visit in India in every month of 2027
  2. Cheapest countries to visit from India (with real daily costs)
  3. Goa vs Kerala: which is better for you?
  4. 3 days in Jaipur: the itinerary locals would plan
  5. Thailand trip from India: costs, visa and a 7-day plan
  6. Bali honeymoon: 7 days, ₹1.2 lakh for two
  7. Spiti or Ladakh: an honest comparison
  8. 25 weekend getaways from Bangalore
  9. Monsoon getaways near Mumbai
  10. Best time to visit Kashmir, month by month
  11. How to plan a group trip without fights (Squad Match)
  12. Vietnam e-visa for Indians: a step-by-step guide
  13. Is the Ha Giang Loop safe? Easy rider vs self-drive
  14. Hitchhiking Kyrgyzstan: what nobody tells you
  15. Annapurna Circuit cost breakdown
  16. 10 cheapest adventures in Asia under $30 a day
  17. Japan on a budget from India
  18. Dubai 4 days: what it really costs
  19. Andaman in 5 days: islands, ferries, budget
  20. How we price trips: the GoRoam Trip Cost Index method
- **Post template:** see Appendix C.

---

## 8. Medium and syndication (without hurting SEO)

- **Order:**
  1. Publish on goroam.world.
  2. Wait **3–7 days**, until Google has indexed the original.
  3. Bring it to Medium with **"Import a story"**, which sets the canonical link to your original. Or set the canonical by hand in the story settings.
- **On Medium:**
  - A sharper title, 5 tags (e.g. Travel, India, Travel Tips, Backpacking, Artificial Intelligence) and 2–3 contextual links back.
  - End with a call to action: "Plan this trip free on GoRoam" linking to the matching page.
  - Submit stories to **Medium publications** about travel or startups, for far more reach than your own profile.
  - Expect reach, readers and brand mentions. Don't expect much ranking value from the links themselves.
- **Other places to syndicate or adapt:**
  - **LinkedIn articles** (founder voice: data, lessons, launches).
  - **Substack** newsletter, e.g. a monthly "Where to go next month", which builds an owned audience.
  - **Dev.to / Hashnode:** "How I built an AI trip planner with Next.js". Tech communities link generously and it builds founder credibility.
  - **Quora:** answer travel questions in full, then link the one page that goes deeper (not the homepage).
  - **Reddit:** answer genuinely, follow each subreddit's rules, keep self-links rare (roughly 1 in 10 contributions), and add value first.
- **Don't:**
  - copy articles anywhere without a canonical link;
  - spin articles with AI;
  - post the same link across many communities on the same day.

---

## 9. Backlinks: getting to 300+ referring domains

### Month 1: quick listings (about 30–50 links)

- **Product Hunt** launch
  - Launch Tuesday to Thursday, 12:01 am Pacific.
  - Prepare a gallery, a short demo video and a maker comment.
- **Startup and indie listings:** Indie Hackers, BetaList, Hacker News "Show HN" (be technical and honest), Crunchbase profile, and the Startup India profile (if registered).
- **AI-tool directories:** There's An AI For That, Futurepedia, Toolify, TopAI.tools.
- **Software directories:** SaaSHub; AlternativeTo (list GoRoam as an alternative to the trip planners people search for).
- **Your own profiles:** X, Instagram, LinkedIn page, YouTube, Pinterest. Also add them to `src/lib/company.ts`.

### Ongoing: earned links (they compound)

- **Data PR with the Trip Cost Index**
  - Each month, pitch one story, e.g. "The 10 cheapest countries for Indians to visit in March", with a chart and a methodology note.
  - Indian targets:
    - travel desks of national papers and magazines (Condé Nast Traveller India, Outlook Traveller);
    - business and personal-finance desks (Mint, Economic Times, Moneycontrol);
    - startup media for the founder story (YourStory, Inc42).
  - International targets for the adventures data: budget-travel blogs and adventure-travel publications.
- **Journalist-request platforms:** answer queries daily on Qwoted, Featured and SourceBottle, and follow #journorequest on X. Quick, specific expert quotes win links.
- **Travel bloggers and creators**
  - Offer a free pass, plus custom itineraries for their readers, in exchange for an honest review.
  - Require disclosure. If you pay, the link must be marked `sponsored`.
- **Embeddable widgets:** a "Best time to visit {place}" heatmap and "Cost per day" cards, with an attribution link. Bloggers embed them and link back.
- **Guest posts** on real travel blogs that have an audience, offering data, maps or itineraries they can't make themselves.
- **Broken-link building**
  - Find dead links on travel resource pages (Ahrefs free tools or the Check My Links extension).
  - Email the owner the dead URL and your matching page.
- **Unlinked mentions:** set a Google Alert for "GoRoam" and ask anyone who mentions it without a link to add one.
- **Podcasts and interviews:** indie-founder and travel podcasts, and university entrepreneurship clubs.
- **Communities:** trekking clubs and college travel societies. Give them free group planning and get listed on their resources page.
- **Avoid:**
  - paid link packages, private blog networks, mass link swaps;
  - comment or forum spam;
  - adding your links to Wikipedia or Wikivoyage, which their policies forbid.
  - These risk a manual action that undoes everything.

---

## 10. GEO: getting cited by ChatGPT, Perplexity, Gemini and AI Overviews

- **How AI tools choose sources:**
  - a search index (ChatGPT search and Copilot lean on Bing; AI Overviews and Gemini use Google; Perplexity uses its own crawler plus others);
  - plus reputation: how often the brand is mentioned and recommended on Reddit, YouTube, the news and review sites.
- **Be crawlable:** allow the AI crawlers (§4), check Vercel bot protection, and keep pages server-rendered. They already are, which is good.
- **Be in Bing:** Bing Webmaster Tools, the sitemap and IndexNow (§2). This is the easiest GEO win.
- **`llms.txt`:** a short Markdown map of your best pages (Appendix A).
- **Be easy to quote:**
  - Put a 40–60 word answer first; trip pages already have "The short answer".
  - Then facts with numbers, units and the year ("$30–$100 a day in 2026").
  - Use tables for costs and dates, and FAQs with direct answers.
- **Own the data:** keep the Trip Cost Index fresh each month with a visible method. AI answers and journalists cite original numbers.
- **Consistent entity:**
  - The same name ("GoRoam"), one-line description, founder and links everywhere: site, LinkedIn, Crunchbase, Product Hunt, X, Instagram, YouTube.
  - All of them in the Organization `sameAs` (§4).
- **Be talked about where AI tools read:**
  - Reddit threads (real answers);
  - YouTube videos and Shorts, whose transcripts get indexed;
  - Quora answers;
  - review sites (Product Hunt reviews; G2 or Capterra if relevant).
- **Prompt tests, monthly**
  - Ask ChatGPT, Perplexity, Gemini, Copilot and Google AI Mode the same 20 prompts.
  - Log whether GoRoam is **cited**, **mentioned** or **absent**. Examples:
    - "best free AI trip planner for India"
    - "3 day Jaisalmer itinerary with budget"
    - "weekend getaways from Bangalore in December"
    - "how to hitchhike in Kyrgyzstan"
    - "cheapest countries to visit from India"
    - "Ha Giang Loop cost"
- **Measure:** track AI referrals in analytics (§2) and set a monthly target.

---

## 11. Other traffic engines (feed search too)

- **Pinterest** (travel is one of its biggest categories)
  - 3–5 pins a day, tall 2:3 images, one board per region and month.
  - Pin every trip, adventure, itinerary and blog post.
- **YouTube Shorts and Instagram Reels:** a 30–60 second "3 days in {place}" for each itinerary, with the link in the description and bio.
- **WhatsApp:** shared trip plans already bring new visitors. Prompt users to share after they save.
- **Email:** collect addresses on hub pages ("Get where-to-go ideas every month") and send the monthly Substack issue.

---

## 12. What to check, and when

- **Weekly:**
  - Search Console clicks, impressions and average position, by section (filter pages containing `/trips/`, `/adventures/`, `/places-to-visit/` and so on).
  - Indexed pages: the Pages report, plus the reasons pages aren't indexed.
  - Queries in positions 8–20 to improve.
  - Pages with high impressions but low click-through: rewrite their title and description.
  - AI referrals and organic sign-ups.
- **Monthly:**
  - Referring domains (Search Console's Links report, or Ahrefs Webmaster Tools free).
  - Posts published, links earned, prompt-test results.
  - Core Web Vitals.
- **Quarterly:** prune or merge pages with no impressions after 6 months, and refresh the best performers with new prices and a new year.

---

## 13. 90-day plan, then 12 months

| Week | Do |
|---|---|
| 1 | §2 setup; request indexing for Tier 1 (spread over days) |
| 2 | §4 fixes: robots, `llms.txt`, founder photo, `sameAs`, check AI crawlers |
| 3–4 | Month hubs for April–September; 20 city hubs; Product Hunt and directory listings |
| 5–6 | Deep sections for the top 30 trips; `/blog` live with 6 posts; first Medium imports |
| 7–8 | First Trip Cost Index data story pitched; 10 Qwoted/Featured answers a week |
| 9–10 | Visa guides (top 15 countries); 6 more posts; Pinterest started |
| 11–12 | Comparison pages (top 15); deep sections for 30 more trips; first prompt-test report |

| Months | Focus |
|---|---|
| 4–6 | Routes from cities (100); itineraries to 50; 3 posts a week; 1 data story a month; target 150 referring domains |
| 7–9 | "{place} in {month}" (top 30); adventures to 120; YouTube Shorts weekly; target 220 referring domains |
| 10–12 | Itineraries to 100; adventures to 200; refresh everything for 2027 by December; target 300 referring domains |
| 13–24 | Scale what works (by section in Search Console); go international (adventures and visas for Western readers) |

---

## Appendix A: `public/llms.txt` (draft)

```markdown
# GoRoam

> GoRoam is a free AI trip planner (www.goroam.world). It builds day-by-day itineraries with places, timings, maps, stays and honest budgets, and publishes free travel guides.

## Where to go
- [Trips in season](https://www.goroam.world/trips): 160 trips in India and abroad, each with a day plan, costs and stays.
- [By month](https://www.goroam.world/places-to-visit): where to travel each month.
- [From your city](https://www.goroam.world/weekend-getaways): short trips from Indian cities.
- [Trip Cost Index](https://www.goroam.world/trip-cost-index): what a day of travel costs, by destination.

## Guides and itineraries
- [Destination guides](https://www.goroam.world/destinations): best time, getting there, where to stay, sights, food, budgets.
- [Ready-made itineraries](https://www.goroam.world/itineraries): day-by-day plans with timings and maps.
- [Adventures](https://www.goroam.world/adventures): 50 how-to guides for cheap adventure trips (hitchhiking, treks, motorbike loops), with costs in US dollars and visa notes.

## Plan a trip
- [AI trip planner](https://www.goroam.world/plan): for couples, families, friends, solo travellers, road trips and budget trips.
```

## Appendix B: AI crawlers in `src/app/robots.ts` (draft)

```ts
// Search and AI assistants may read every public page; private areas stay closed.
const PRIVATE = ["/dashboard", "/api/", "/auth", "/go"];
const AI_BOTS = ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot", "ClaudeBot", "Claude-SearchBot", "Google-Extended", "Applebot-Extended"];
rules: [
  { userAgent: "*", allow: "/", disallow: PRIVATE },
  { userAgent: AI_BOTS, allow: "/", disallow: PRIVATE },
],
// "/trip/" and "/try/" are deliberately NOT disallowed: their pages send noindex, which Google must be able to read.
```

## Appendix C: post and page template

- **Title:** `{Primary keyword}: {benefit} ({year})`, under about 60 characters. Example: "Goa vs Kerala: Which Is Better for You? (2027)".
- **URL:** short, keyword first, no dates. Example: `/blog/goa-vs-kerala`.
- **Meta description:** 140–160 characters with a number and a promise.
- **Opening:** the answer in 40–60 words, so readers (and AI tools) get it immediately.
- **Facts table:** best time, days needed, cost a day, how to get there.
- **Body:** H2s phrased the way people search ("How many days do you need?").
- **Specifics:** prices with currency and year; named places; one opinion per section.
- **Images:** 2–5 real photos with descriptive alt text; a comparison table or map where useful.
- **FAQs:** 5 real questions from "People also ask", answered in 2–3 sentences each.
- **Links:** 3–5 internal links (trip, itinerary, hub, adventure) and 1–2 official sources (tourism board, visa portal).
- **Trust:** author box (photo, real experience) and an "Updated {date}" line.
- **Call to action:** "Plan this trip free on GoRoam", pre-filled with the destination.
- **Length:** whatever the query needs, usually 1,200–2,500 words. Never pad.

## Appendix D: outreach templates

**Data story to a journalist**

> Subject: Data: the 10 cheapest countries for Indians to visit in {month}
>
> Hi {name}, we track daily travel costs for {N} destinations in the GoRoam Trip Cost Index. This month, {country} is the cheapest at about ₹{x} a day, and {country 2} dropped {y}% since {month}. The full ranking, chart and method are at https://www.goroam.world/trip-cost-index. Happy to send the raw table or a quote.
> — Jitesh Raghav, founder, GoRoam

**Travel blogger**

> Subject: A free day-by-day plan for your readers' next {place} trip
>
> Hi {name}, I loved your post on {post}. We built GoRoam, a free AI trip planner, and I'd like to give your readers a ready-made {place} itinerary plus a free pass for you to try it. If it's useful, a mention would mean a lot, with no obligation and nothing paid. Here's the itinerary: {URL}.
> — Jitesh
