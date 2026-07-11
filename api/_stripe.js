import Stripe from "stripe";
import {
  calendarPeriodFor,
  canUsePro,
  normalizeProfile,
  supabaseSelectSingleByColumn,
  supabaseUpdateByColumn,
  supabaseUpdateByUserId,
} from "./_pro.js";

export const stripeApiVersion = "2026-02-25.clover";
export const packAccessPeriodEnd = "2099-12-31T23:59:59.000Z";

const packOffers = {
  pack100: {
    plan: "pack100",
    label: "Pack 100 imagens",
    images: 100,
    amountCents: 500,
    currency: "eur",
    productName: "BatchCutout Pack 100 imagens",
    description: "100 créditos de imagem, compra única",
  },
  pack250: {
    plan: "pack250",
    label: "Pack 250 imagens",
    images: 250,
    amountCents: 900,
    currency: "eur",
    productName: "BatchCutout Pack 250 imagens",
    description: "250 créditos de imagem, compra única",
  },
};

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
  const selectedPlan = ["monthly", "annual", "early"].includes(normalized) ? normalized : "monthly";
  const priceIds = {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID || "",
    annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || "",
    early: process.env.STRIPE_PRO_EARLY_PRICE_ID || "",
  };

  return {
    plan: selectedPlan,
    priceId: priceIds[selectedPlan] || "",
  };
}

export function getPackOffer(plan) {
  return packOffers[String(plan || "").toLowerCase()] || null;
}

export function getCheckoutOffering(plan) {
  const pack = getPackOffer(plan);
  if (pack) {
    return {
      kind: "pack",
      plan: pack.plan,
      label: pack.label,
      images: pack.images,
      amountCents: pack.amountCents,
      amount: pack.amountCents / 100,
      currency: pack.currency,
      priceData: {
        currency: pack.currency,
        unit_amount: pack.amountCents,
        product_data: {
          name: pack.productName,
          description: pack.description,
          metadata: {
            batchcutout_purchase_type: "pack",
            batchcutout_price_plan: pack.plan,
            batchcutout_pack_images: String(pack.images),
          },
        },
      },
    };
  }

  const selectedPrice = getStripePriceId(plan);
  return {
    kind: "subscription",
    plan: selectedPrice.plan,
    label: getPlanLabel(selectedPrice.plan),
    priceId: selectedPrice.priceId,
    amount: selectedPrice.plan === "annual" ? 190 : selectedPrice.plan === "early" ? 15 : 19,
    currency: "eur",
  };
}

export function getPlanLabel(plan) {
  if (plan === "annual") return "Pro Annual";
  if (plan === "early") return "Pro Recurring Campaign";
  if (plan === "pack100") return "Pack 100 imagens";
  if (plan === "pack250") return "Pack 250 imagens";
  return "Pro Monthly";
}

export function profilePatchForSubscription(subscription, customerId = "", profile = null) {
  const status = String(subscription?.status || "incomplete");
  const hasPaidAccess = status === "active";
  const now = new Date();
  const period = calendarPeriodFor(now);
  const normalizedCustomerId = customerId || (typeof subscription?.customer === "string" ? subscription.customer : subscription?.customer?.id) || null;

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

  if (!hasPaidAccess) {
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

export async function findProfileForStripe(settings, { userId = "", customerId = "", subscriptionId = "", email = "" }) {
  if (userId) {
    const row = await supabaseSelectSingleByColumn({ ...settings, column: "user_id", value: userId });
    if (row) return normalizeProfile(row, { id: row.user_id, email: row.email });
  }

  if (email) {
    const row = await supabaseSelectSingleByColumn({
      ...settings,
      column: "email",
      value: email,
    });
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
    email: subscription?.customer_email || "",
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

function text(value, maxLength = 500) {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, maxLength);
}

async function commercialEventExists(settings, eventName, eventLabel) {
  if (!settings.supabaseUrl || !settings.serviceRoleKey || !eventName || !eventLabel) return false;
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const query = new URLSearchParams({
    event_name: `eq.${eventName}`,
    event_label: `eq.${eventLabel}`,
    select: "id",
    limit: "1",
  });

  const response = await fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}?${query}`, {
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
    },
  });

  if (!response.ok) return false;
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
}

async function insertCommercialEvent(settings, row) {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const response = await fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}`, {
    method: "POST",
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`commercial_event_insert_failed:${response.status}:${detail.slice(0, 300)}`);
  }
}

function packAttributionFromSession(session) {
  const metadata = session?.metadata || {};
  const keys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "gbraid",
    "wbraid",
    "source",
    "medium",
    "campaign",
    "first_source",
    "first_medium",
    "first_campaign",
    "first_content",
    "first_term",
    "first_gclid",
    "first_gbraid",
    "first_wbraid",
    "first_landing_page",
    "first_seen_at",
    "last_source",
    "last_medium",
    "last_campaign",
    "last_content",
    "last_term",
    "last_gclid",
    "last_gbraid",
    "last_wbraid",
    "last_landing_page",
    "last_seen_at",
    "page_path",
    "page_location",
    "language",
    "visitor_id",
    "session_id",
    "limit_variant",
    "free_limit",
  ];
  const attribution = {};
  for (const key of keys) {
    if (metadata[key]) attribution[key] = text(metadata[key], 1000);
  }
  return attribution;
}

function customerIdFromSession(session) {
  return typeof session?.customer === "string" ? session.customer : session?.customer?.id || "";
}

function amountFromSession(session, pack) {
  const amountCents = Number(session?.amount_total || 0) || pack.amountCents;
  return {
    amountCents,
    amount: Math.round(amountCents) / 100,
    currency: text(session?.currency || pack.currency || "eur", 20).toUpperCase(),
  };
}

function patchForPackPurchase(profile, session, pack) {
  const now = new Date().toISOString();
  const stripeCustomerId = customerIdFromSession(session) || profile.stripe_customer_id || null;
  const currentLimit = Number(profile.monthly_image_limit || 0) || 0;
  const currentUsed = Math.max(Number(profile.monthly_images_used || 0) || 0, 0);

  if (profile.plan === "pro" && canUsePro(profile)) {
    return {
      plan: "pro",
      plan_status: profile.plan_status || "active",
      batch_limit: Math.max(Number(profile.batch_limit || 100) || 100, 100),
      monthly_image_limit: currentLimit + pack.images,
      monthly_images_used: currentUsed,
      current_period_start: profile.current_period_start || now,
      current_period_end: profile.current_period_end || packAccessPeriodEnd,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: profile.stripe_subscription_id || null,
    };
  }

  if (profile.plan === "pack" && profile.plan_status === "active") {
    return {
      plan: "pack",
      plan_status: "active",
      batch_limit: 100,
      monthly_image_limit: currentLimit + pack.images,
      monthly_images_used: currentUsed,
      current_period_start: profile.current_period_start || now,
      current_period_end: packAccessPeriodEnd,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: profile.stripe_subscription_id || null,
    };
  }

  return {
    plan: "pack",
    plan_status: "active",
    batch_limit: 100,
    monthly_image_limit: pack.images,
    monthly_images_used: 0,
    current_period_start: now,
    current_period_end: packAccessPeriodEnd,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: profile.stripe_subscription_id || null,
  };
}

async function recordPackPurchaseEvent(settings, { event = null, session, profile, pack, credited }) {
  const sessionId = text(session?.id, 120);
  if (!sessionId) return;
  const attribution = packAttributionFromSession(session);
  const amount = amountFromSession(session, pack);
  const detail = {
    ...attribution,
    stripe_event_id: text(event?.id, 120),
    stripe_session_id: sessionId,
    stripe_customer_id: text(customerIdFromSession(session), 120),
    supabase_user_id: text(profile?.user_id || session?.client_reference_id || session?.metadata?.supabase_user_id, 120),
    plan: pack.plan,
    price_plan: pack.plan,
    purchase_type: "pack",
    pack_images: pack.images,
    credits_added: credited ? pack.images : 0,
    amount_cents: amount.amountCents,
    amount: amount.amount,
    currency: amount.currency,
  };

  await insertCommercialEvent(settings, {
    event_name: "pack_purchase_paid",
    event_category: "revenue",
    event_label: sessionId,
    page_path: text(attribution.page_path, 500),
    page_location: text(attribution.page_location, 1000),
    language: text(attribution.language, 20),
    session_id: text(attribution.session_id, 80),
    visitor_id: text(attribution.visitor_id, 80),
    source: text(attribution.utm_source || attribution.source || attribution.last_source || attribution.first_source || "stripe", 160),
    campaign: text(attribution.utm_campaign || attribution.campaign || attribution.last_campaign || attribution.first_campaign || "one_time_pack", 160),
    free_limit: Number(attribution.free_limit || 0) || null,
    value: amount.amount,
    detail,
    occurred_at: new Date(Number(event?.created || Date.now() / 1000) * 1000).toISOString(),
  });
}

export async function applyPackPurchaseFromSession(settings, session, event = null) {
  const metadata = session?.metadata || {};
  const purchaseType = String(metadata.batchcutout_purchase_type || "").toLowerCase();
  const pack = purchaseType === "pack" ? getPackOffer(metadata.batchcutout_price_plan) : null;
  if (!pack) {
    throw new Error("stripe_pack_not_found");
  }

  const sessionId = text(session?.id, 120);
  if (await commercialEventExists(settings, "pack_purchase_paid", sessionId)) {
    const profile = await findProfileForStripe(settings, {
      userId: metadata.supabase_user_id || session?.client_reference_id || "",
      customerId: customerIdFromSession(session),
      email: text(metadata.batchcutout_pending_email || metadata.customer_email || session?.customer_details?.email, 320),
    });
    if (!profile?.user_id) {
      throw new Error("stripe_pack_profile_not_found");
    }
    return { profile, pack, credited: false, alreadyStored: true };
  }

  const profile = await findProfileForStripe(settings, {
    userId: metadata.supabase_user_id || session?.client_reference_id || "",
    customerId: customerIdFromSession(session),
    email: text(metadata.batchcutout_pending_email || metadata.customer_email || session?.customer_details?.email, 320),
  });

  if (!profile?.user_id) {
    throw new Error("stripe_pack_profile_not_found");
  }

  const updated = await supabaseUpdateByUserId({
    ...settings,
    userId: profile.user_id,
    patch: patchForPackPurchase(profile, session, pack),
  });
  const normalized = normalizeProfile(updated, { id: updated.user_id, email: updated.email });

  await recordPackPurchaseEvent(settings, {
    event,
    session,
    profile: normalized,
    pack,
    credited: true,
  });

  return { profile: normalized, pack, credited: true, alreadyStored: false };
}
