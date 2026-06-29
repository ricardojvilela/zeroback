import Stripe from "stripe";
import {
  calendarPeriodFor,
  normalizeProfile,
  supabaseSelectSingleByColumn,
  supabaseUpdateByColumn,
  supabaseUpdateByUserId,
} from "./_pro.js";

export const stripeApiVersion = "2026-02-25.clover";

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  if (!secretKey) return null;
  return new Stripe(secretKey, { apiVersion: stripeApiVersion });
}

export function getSiteUrl() {
  return (
    process.env.BATCHCUTOUT_SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "https://batchcutout.com"
  ).replace(/\/$/, "");
}

export function getStripePriceId(plan) {
  const normalized = String(plan || "monthly").toLowerCase();
  const priceIds = {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID || "",
    annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || "",
    early: process.env.STRIPE_PRO_EARLY_PRICE_ID || "",
  };

  return {
    plan: ["monthly", "annual", "early"].includes(normalized) ? normalized : "monthly",
    priceId: priceIds[normalized] || "",
  };
}

export function getPlanLabel(plan) {
  if (plan === "annual") return "Pro Annual";
  if (plan === "early") return "Pro Early Adopter";
  return "Pro Monthly";
}

export function profilePatchForSubscription(subscription, customerId = "", profile = null) {
  const status = String(subscription?.status || "incomplete");
  const hasPaidAccess = status === "active";
  const now = new Date();
  const period = calendarPeriodFor(now);
  const normalizedCustomerId = customerId || (typeof subscription?.customer === "string" ? subscription.customer : subscription?.customer?.id) || null;

  if (!hasPaidAccess) {
    if (profile?.plan === "pro" && profile?.plan_status === "manual") {
      return {
        plan: "pro",
        plan_status: "manual",
        batch_limit: 100,
        monthly_image_limit: 2000,
        stripe_customer_id: normalizedCustomerId,
        stripe_subscription_id: subscription?.id || null,
      };
    }

    return {
      plan: "free",
      plan_status: status,
      batch_limit: 2,
      monthly_image_limit: 0,
      monthly_images_used: 0,
      current_period_start: null,
      current_period_end: null,
      stripe_customer_id: normalizedCustomerId,
      stripe_subscription_id: subscription?.id || null,
    };
  }

  const currentEnd = profile?.current_period_end ? new Date(profile.current_period_end) : null;
  const usagePeriodPatch = !currentEnd || currentEnd <= now
    ? {
        current_period_start: period.start,
        current_period_end: period.end,
        monthly_images_used: 0,
      }
    : {};

  return {
    plan: "pro",
    plan_status: "active",
    batch_limit: 100,
    monthly_image_limit: 2000,
    ...usagePeriodPatch,
    stripe_customer_id: normalizedCustomerId,
    stripe_subscription_id: subscription?.id || null,
  };
}

export async function findProfileForStripe(settings, { userId = "", customerId = "", subscriptionId = "" }) {
  if (userId) {
    const row = await supabaseSelectSingleByColumn({ ...settings, column: "user_id", value: userId });
    if (row) return normalizeProfile(row, { id: row.user_id, email: row.email });
  }

  if (subscriptionId) {
    const row = await supabaseSelectSingleByColumn({
      ...settings,
      column: "stripe_subscription_id",
      value: subscriptionId,
    });
    if (row) return normalizeProfile(row, { id: row.user_id, email: row.email });
  }

  if (customerId) {
    const row = await supabaseSelectSingleByColumn({
      ...settings,
      column: "stripe_customer_id",
      value: customerId,
    });
    if (row) return normalizeProfile(row, { id: row.user_id, email: row.email });
  }

  return null;
}

export async function updateProfileFromSubscription(settings, subscription, fallbackUserId = "") {
  const customerId = typeof subscription?.customer === "string" ? subscription.customer : subscription?.customer?.id || "";
  const userId = subscription?.metadata?.supabase_user_id || fallbackUserId || "";
  const profile = await findProfileForStripe(settings, {
    userId,
    customerId,
    subscriptionId: subscription?.id || "",
  });

  if (!profile?.user_id) {
    throw new Error("stripe_profile_not_found");
  }

  const patch = profilePatchForSubscription(subscription, customerId, profile);
  return supabaseUpdateByUserId({
    ...settings,
    userId: profile.user_id,
    patch,
  });
}

export async function attachStripeCustomerToProfile(settings, profile, stripeCustomerId) {
  if (!profile?.user_id || !stripeCustomerId) return profile;

  const updated = await supabaseUpdateByColumn({
    ...settings,
    column: "user_id",
    value: profile.user_id,
    patch: {
      stripe_customer_id: stripeCustomerId,
    },
  });

  return normalizeProfile(updated, { id: updated.user_id, email: updated.email });
}
