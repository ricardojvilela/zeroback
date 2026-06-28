import {
  getAccessToken,
  getSupabaseSettings,
  getSupabaseUser,
  loadOrCreateProfile,
  sendJson,
} from "./_pro.js";
import { getSiteUrl, getStripeClient } from "./_stripe.js";

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return sendJson(response, 200, { ok: true });
  }

  if (request.method !== "POST") {
    return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return sendJson(response, 503, { ok: false, error: "stripe_not_configured" });
  }

  const settings = getSupabaseSettings();
  if (!settings.supabaseUrl || !settings.serviceRoleKey) {
    return sendJson(response, 503, { ok: false, error: "supabase_not_configured" });
  }

  const accessToken = getAccessToken(request);
  if (!accessToken) {
    return sendJson(response, 401, { ok: false, error: "missing_access_token" });
  }

  try {
    const user = await getSupabaseUser(settings, accessToken);
    if (!user?.id) {
      return sendJson(response, 401, { ok: false, error: "invalid_access_token" });
    }

    const profile = await loadOrCreateProfile(settings, user);
    if (!profile.stripe_customer_id) {
      return sendJson(response, 404, { ok: false, error: "stripe_customer_missing" });
    }

    const siteUrl = getSiteUrl();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteUrl}/#accountTitle`,
    });

    return sendJson(response, 200, {
      ok: true,
      url: session.url,
    });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: "billing_portal_session_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
