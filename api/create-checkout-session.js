import {
  getAccessToken,
  getSupabaseSettings,
  getSupabaseUser,
  loadOrCreateProfile,
  readRequestBody,
  sendJson,
} from "./_pro.js";
import {
  attachStripeCustomerToProfile,
  getPlanLabel,
  getSiteUrl,
  getStripeClient,
  getStripePriceId,
} from "./_stripe.js";

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

    const body = await readRequestBody(request);
    const { plan, priceId } = getStripePriceId(body?.plan);
    if (!priceId) {
      return sendJson(response, 503, { ok: false, error: "stripe_price_not_configured", plan });
    }

    let profile = await loadOrCreateProfile(settings, user);
    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          supabase_user_id: user.id,
          batchcutout_plan: "pro",
        },
      });
      customerId = customer.id;
      profile = await attachStripeCustomerToProfile(settings, profile, customerId);
    }

    const siteUrl = getSiteUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${siteUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}#accountTitle`,
      cancel_url: `${siteUrl}/pricing/?checkout=cancelled`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          batchcutout_plan: "pro",
          batchcutout_price_plan: plan,
        },
      },
      metadata: {
        supabase_user_id: user.id,
        batchcutout_plan: "pro",
        batchcutout_price_plan: plan,
      },
      customer_update: {
        name: "auto",
        address: "auto",
      },
    });

    return sendJson(response, 200, {
      ok: true,
      url: session.url,
      plan,
      label: getPlanLabel(plan),
      customerId: profile.stripe_customer_id || customerId,
    });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: "checkout_session_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
