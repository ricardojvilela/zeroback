import { getSiteUrl, getStripeClient } from "./_stripe.js";
import { getSupabaseSettings, sendJson } from "./_pro.js";

function cleanText(value, maxLength = 450) {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, maxLength);
}

function redirect(response, location) {
  response.writeHead(302, { Location: location });
  response.end();
}

function checkoutValueForPlan(plan) {
  if (plan === "annual") return 190;
  if (plan === "early") return 15;
  return 19;
}

function sessionPlan(session) {
  const metadata = session?.metadata || {};
  const plan = String(metadata.batchcutout_price_plan || metadata.price_plan || "monthly").toLowerCase();
  return ["early", "monthly", "annual"].includes(plan) ? plan : "monthly";
}

async function insertCheckoutClickEvent(settings, session) {
  if (!settings.supabaseUrl || !settings.serviceRoleKey) return;

  const metadata = session?.metadata || {};
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const plan = sessionPlan(session);
  const detail = {
    stripe_session_id: session.id || "",
    stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id || "",
    supabase_user_id: session.client_reference_id || metadata.supabase_user_id || "",
    plan,
    price_plan: plan,
    checkout_status: cleanText(session.status, 80),
    payment_status: cleanText(session.payment_status, 80),
    source: "email",
    campaign: "checkout_link_email",
  };

  const row = {
    event_name: "checkout_link_email_clicked",
    event_category: "email_click",
    event_label: cleanText(session.id, 160),
    page_path: "/api/continue-checkout-session",
    page_location: `${getSiteUrl()}/api/continue-checkout-session`,
    language: cleanText(metadata.language, 20),
    session_id: cleanText(metadata.session_id, 80),
    visitor_id: cleanText(metadata.visitor_id, 80),
    source: "email",
    campaign: "checkout_link_email",
    value: checkoutValueForPlan(plan),
    detail,
    occurred_at: new Date().toISOString(),
  };

  await fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}`, {
    method: "POST",
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
  }

  const siteUrl = getSiteUrl();
  const pricingUrl = `${siteUrl}/pricing/?checkout=continue_error#pricing-account-title`;
  const sessionId = cleanText(request.query?.session_id || request.query?.session || "", 200);

  if (!/^cs_(test|live)_[a-zA-Z0-9]+$/.test(sessionId)) {
    return redirect(response, pricingUrl);
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return redirect(response, pricingUrl);
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    try {
      await insertCheckoutClickEvent(getSupabaseSettings(), session);
    } catch {
      // A click should still reach Stripe if internal analytics fail.
    }

    if (session.status === "complete") {
      return redirect(response, `${siteUrl}/?checkout=success&session_id=${encodeURIComponent(session.id)}#accountTitle`);
    }

    if (session.url) {
      return redirect(response, session.url);
    }

    return redirect(response, pricingUrl);
  } catch {
    return redirect(response, pricingUrl);
  }
}
