// Server-only: holds the Dodo Payments API key.
import DodoPayments from "dodopayments";
import { PLANS, type Plan, type PlanId } from "./plans";

/**
 * Dodo Payments setup. Each pass is a one-time product in the Dodo
 * dashboard; its id lives in the environment because test and live mode
 * products have different ids.
 *
 *   DODO_PAYMENTS_API_KEY        API key (test or live)
 *   DODO_PAYMENTS_WEBHOOK_KEY    Signing secret of the webhook endpoint
 *   DODO_PAYMENTS_ENVIRONMENT    "test_mode" (default) or "live_mode"
 *   DODO_PRODUCT_WEEK            Product id for the Week Pass (one-time)
 *   DODO_PRODUCT_YEAR            Product id for the Year Pass (one-time)
 */
const PRODUCT_ENV: Record<PlanId, string> = {
  week: "DODO_PRODUCT_WEEK",
  year: "DODO_PRODUCT_YEAR",
};

export const productIdFor = (plan: PlanId) => process.env[PRODUCT_ENV[plan]]?.trim() || null;

/** The pack a Dodo product id belongs to, or null for a product we don't sell. */
export function planForProduct(productId: string | null | undefined): Plan | null {
  if (!productId) return null;
  return PLANS.find((p) => productIdFor(p.id) === productId) ?? null;
}

export const paymentsConfigured = () => Boolean(process.env.DODO_PAYMENTS_API_KEY && PLANS.every((p) => productIdFor(p.id)));

let client: DodoPayments | null = null;

export function dodo() {
  if (!client) {
    client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY ?? null,
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
    });
  }
  return client;
}
