import crypto from "node:crypto";
import { getSupabaseSettings, sendJson, readRequestBody, supabaseUpdateByUserId } from "./_pro.js";
import { getStripeClient } from "./_stripe.js";

function verifyAdminToken(request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const header = request.headers.authorization || request.headers.Authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  const expected = crypto.createHmac("sha256", adminPassword).update(body).digest("base64url");
  if (signature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return payload.role === "admin" && Number(payload.expiresAt || 0) > Date.now();
  } catch {
    return false;
  }
}

function mapUser(row) {
  const monthlyLimit = Number(row.monthly_image_limit || 0) || 0;
  const monthlyUsed = Number(row.monthly_images_used || 0) || 0;
  return {
    userId: row.user_id,
    email: row.email || "",
    plan: row.plan || "free",
    planStatus: row.plan_status || "active",
    batchLimit: Number(row.batch_limit || 0) || 0,
    monthlyLimit,
    monthlyUsed,
    monthlyRemaining: Math.max(monthlyLimit - monthlyUsed, 0),
    periodStart: row.current_period_start || "",
    periodEnd: row.current_period_end || "",
    stripeCustomerId: row.stripe_customer_id || "",
    stripeSubscriptionId: row.stripe_subscription_id || "",
    updatedAt: row.updated_at || row.created_at || "",
  };
}

function stripeDate(seconds) {
  return seconds ? new Date(seconds * 1000).toISOString() : "";
}

function getCustomer(subscription) {
  if (typeof subscription.customer === "string") {
    return { id: subscription.customer, email: "" };
  }

  return {
    id: subscription.customer?.id || "",
    email: subscription.customer?.email || "",
  };
}

function productName(price) {
  if (!price?.product) return price?.nickname || price?.id || "Plano Stripe";
  if (typeof price.product === "string") return price.nickname || price.product;
  return price.product.name || price.nickname || price.id || "Plano Stripe";
}

function intervalLabel(interval, intervalCount) {
  const count = Number(intervalCount || 1) || 1;
  const labels = {
    day: count === 1 ? "dia" : `${count} dias`,
    week: count === 1 ? "semana" : `${count} semanas`,
    month: count === 1 ? "mes" : `${count} meses`,
    year: count === 1 ? "ano" : `${count} anos`,
  };
  return labels[interval] || interval || "";
}

function monthlyEquivalent(amount, interval, intervalCount) {
  const count = Number(intervalCount || 1) || 1;
  if (interval === "day") return Math.round((amount * 365) / 12 / count);
  if (interval === "week") return Math.round((amount * 52) / 12 / count);
  if (interval === "year") return Math.round(amount / 12 / count);
  return Math.round(amount / count);
}

function subscriptionPricing(subscription) {
  const items = subscription.items?.data || [];
  const firstPrice = items[0]?.price || null;
  const currency = firstPrice?.currency || subscription.currency || "eur";
  let amount = 0;
  let monthlyAmount = 0;

  for (const item of items) {
    const price = item.price || {};
    const quantity = Number(item.quantity || 1) || 1;
    const unitAmount = Number(price.unit_amount || 0) || 0;
    const lineAmount = unitAmount * quantity;
    amount += lineAmount;
    monthlyAmount += monthlyEquivalent(lineAmount, price.recurring?.interval, price.recurring?.interval_count);
  }

  return {
    amount,
    monthlyAmount,
    currency,
    interval: intervalLabel(firstPrice?.recurring?.interval, firstPrice?.recurring?.interval_count),
    planName: productName(firstPrice),
    priceId: firstPrice?.id || "",
  };
}

function mapSubscription(subscription, profile = null) {
  const customer = getCustomer(subscription);
  const pricing = subscriptionPricing(subscription);

  return {
    id: subscription.id,
    status: subscription.status || "",
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    currentPeriodStart: stripeDate(subscription.current_period_start),
    currentPeriodEnd: stripeDate(subscription.current_period_end),
    canceledAt: stripeDate(subscription.canceled_at),
    createdAt: stripeDate(subscription.created),
    customerId: customer.id,
    customerEmail: customer.email || profile?.email || "",
    profileEmail: profile?.email || "",
    linkedToSupabase: Boolean(profile?.userId),
    accessPlan: profile?.plan || "",
    accessStatus: profile?.planStatus || "",
    monthlyUsed: profile?.monthlyUsed || 0,
    monthlyLimit: profile?.monthlyLimit || 0,
    monthlyRemaining: profile?.monthlyRemaining || 0,
    batchLimit: profile?.batchLimit || 0,
    stripeDashboardUrl: `https://dashboard.stripe.com/subscriptions/${subscription.id}`,
    customerDashboardUrl: customer.id ? `https://dashboard.stripe.com/customers/${customer.id}` : "",
    ...pricing,
  };
}

function summarizeSubscriptions(subscriptions) {
  const summary = {
    total: subscriptions.length,
    active: 0,
    canceled: 0,
    attention: 0,
    cancelAtPeriodEnd: 0,
    unlinked: 0,
    mrrAmount: 0,
    currency: "eur",
  };

  for (const subscription of subscriptions) {
    if (subscription.currency) summary.currency = subscription.currency;
    if (subscription.status === "active") {
      summary.active += 1;
      summary.mrrAmount += Number(subscription.monthlyAmount || 0) || 0;
    }
    if (subscription.status === "canceled") summary.canceled += 1;
    if (subscription.cancelAtPeriodEnd) summary.cancelAtPeriodEnd += 1;
    if (!subscription.linkedToSupabase) summary.unlinked += 1;
    if (
      subscription.cancelAtPeriodEnd ||
      ["incomplete", "incomplete_expired", "past_due", "unpaid", "paused"].includes(subscription.status)
    ) {
      summary.attention += 1;
    }
  }

  return summary;
}

function monthPeriod() {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function listUsers(settings) {
  const query = new URLSearchParams({
    select: "user_id,email,plan,plan_status,batch_limit,monthly_image_limit,monthly_images_used,current_period_start,current_period_end,stripe_customer_id,stripe_subscription_id,updated_at,created_at",
    order: "updated_at.desc.nullslast,created_at.desc.nullslast",
    limit: "100",
  });
  const response = await fetch(`${settings.supabaseUrl}/rest/v1/${settings.usersTable}?${query}`, {
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`list_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  const rows = await response.json();
  return rows.map(mapUser);
}

async function listSubscriptions(settings) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("stripe_not_configured");
  }

  const [profiles, stripeList] = await Promise.all([
    listUsers(settings),
    stripe.subscriptions.list({
      status: "all",
      limit: 100,
      expand: ["data.customer", "data.items.data.price.product"],
    }),
  ]);

  const profilesBySubscription = new Map();
  const profilesByCustomer = new Map();
  for (const profile of profiles) {
    if (profile.stripeSubscriptionId) profilesBySubscription.set(profile.stripeSubscriptionId, profile);
    if (profile.stripeCustomerId) profilesByCustomer.set(profile.stripeCustomerId, profile);
  }

  const subscriptions = stripeList.data
    .map((subscription) => {
      const customer = getCustomer(subscription);
      const profile = profilesBySubscription.get(subscription.id) || profilesByCustomer.get(customer.id) || null;
      return mapSubscription(subscription, profile);
    })
    .sort((a, b) => {
      const aTime = new Date(a.currentPeriodEnd || a.createdAt || 0).getTime();
      const bTime = new Date(b.currentPeriodEnd || b.createdAt || 0).getTime();
      return bTime - aTime;
    });

  return {
    generatedAt: new Date().toISOString(),
    summary: summarizeSubscriptions(subscriptions),
    subscriptions,
  };
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return sendJson(response, 200, { ok: true });
  }

  if (!verifyAdminToken(request)) {
    return sendJson(response, 401, { ok: false, error: "unauthorized" });
  }

  const settings = getSupabaseSettings();
  if (!settings.supabaseUrl || !settings.serviceRoleKey) {
    return sendJson(response, 503, { ok: false, error: "supabase_not_configured" });
  }

  try {
    if (request.method === "GET") {
      const url = new URL(request.url || "/api/pro-users", "https://batchcutout.com");
      if (url.searchParams.get("view") === "subscriptions") {
        const subscriptionData = await listSubscriptions(settings);
        return sendJson(response, 200, { ok: true, ...subscriptionData });
      }

      const users = await listUsers(settings);
      return sendJson(response, 200, { ok: true, users });
    }

    if (request.method !== "POST") {
      return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
    }

    const body = await readRequestBody(request);
    const userId = String(body?.userId || "").trim();
    const mode = String(body?.mode || "").trim();
    if (!userId || !["free", "pro", "reset-usage"].includes(mode)) {
      return sendJson(response, 400, { ok: false, error: "invalid_request" });
    }

    let patch;
    if (mode === "free") {
      patch = {
        plan: "free",
        plan_status: "active",
        batch_limit: 2,
        monthly_image_limit: 0,
        monthly_images_used: 0,
        current_period_start: null,
        current_period_end: null,
      };
    } else if (mode === "reset-usage") {
      const period = monthPeriod();
      patch = {
        monthly_images_used: 0,
        current_period_start: period.start,
        current_period_end: period.end,
      };
    } else {
      const period = monthPeriod();
      patch = {
        plan: "pro",
        plan_status: "active",
        batch_limit: 100,
        monthly_image_limit: 2000,
        monthly_images_used: 0,
        current_period_start: period.start,
        current_period_end: period.end,
      };
    }

    const updated = await supabaseUpdateByUserId({
      ...settings,
      userId,
      patch,
    });

    return sendJson(response, 200, { ok: true, user: mapUser(updated) });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: "pro_users_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
