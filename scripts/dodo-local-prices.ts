/**
 * Puts each credit pack's fixed local prices (PRICES in src/lib/plans.ts) into
 * Dodo Payments as localized prices, so a visitor in India is charged ₹799
 * rather than a conversion of $9.99. Safe to re-run: existing rules are updated.
 *
 *   npx tsx --env-file=.env.local scripts/dodo-local-prices.ts           # show what would change
 *   npx tsx --env-file=.env.local scripts/dodo-local-prices.ts --apply   # make the changes
 *
 * Then set NEXT_PUBLIC_LOCAL_PRICES=1 in Vercel so the site shows those prices.
 * Adaptive pricing must be on in the Dodo dashboard for checkout to bill in INR/EUR/GBP.
 */
import { dodo, productIdFor } from "../src/lib/dodo";
import { PLANS, PRICES, type PackCurrency } from "../src/lib/plans";

const apply = process.argv.includes("--apply");

async function main() {
  const client = dodo();
  for (const plan of PLANS) {
    const id = productIdFor(plan.id);
    if (!id) throw new Error(`No Dodo product id for ${plan.id} (set DODO_PRODUCT_${plan.id.toUpperCase()})`);
    const product = await client.products.retrieve(id);
    if (product.pricing_mode !== "by_currency") {
      console.log(`${plan.name}: pricing mode ${product.pricing_mode ?? "base only"} → by_currency`);
      if (apply) await client.products.update(id, { pricing_mode: "by_currency" });
    }
    const existing = apply || product.pricing_mode === "by_currency" ? (await client.products.localizedPrices.list(id)).items : [];
    for (const [currency, amount] of Object.entries(PRICES[plan.id]) as [PackCurrency, number][]) {
      const minor = Math.round(amount * 100);
      const rule = existing.find((r) => r.currency === currency);
      if (rule?.amount === minor) {
        console.log(`${plan.name} ${currency} ${amount}: up to date`);
      } else if (rule) {
        console.log(`${plan.name} ${currency}: ${rule.amount / 100} → ${amount}`);
        if (apply) await client.products.localizedPrices.update(rule.id, { product_id: id, amount: minor });
      } else {
        console.log(`${plan.name} ${currency}: add ${amount}`);
        if (apply) await client.products.localizedPrices.create(id, { currency, amount: minor });
      }
    }
  }
  if (!apply) console.log("\nNothing changed. Run again with --apply to make these changes.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
