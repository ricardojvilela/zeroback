import {
  getAccessToken,
  getSupabaseSettings,
  getSupabaseUser,
  readRequestBody,
  sendJson,
} from "./_pro.js";
import { getStripeClient, updateProfileFromSubscription } from "./_stripe.js";

async function getSessionSubscription(stripe, sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (!session?.subscription) {
    return { session, subscription: null };
  }

  if (typeof session.subscription === "string") {
    return {
      session,
      subscription: await stripe.subscriptions.retrieve(session.subscription),
    };
  }

  return { session, subscription: session.subscription };
}

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
    const sessionId = String(body?.sessionId || "").trim();
    if (!sessionId.startsWith("cs_")) {
      return sendJson(response, 400, { ok: false, error: "invalid_session_id" });
    }

    const { session, subscription } = await getSessionSubscription(stripe, sessionId);
    if (session.client_reference_id !== user.id) {
      return sendJson(response, 403, { ok: false, error: "checkout_session_user_mismatch" });
    }

    if (!subscription) {
      return sendJson(response, 409, { ok: false, error: "checkout_subscription_missing" });
    }

    const profile = await updateProfileFromSubscription(settings, subscription, user.id);
    return sendJson(response, 200, {
      ok: true,
      synced: true,
      plan: profile.plan,
      planStatus: profile.plan_status,
      batchLimit: profile.batch_limit,
      monthlyLimit: profile.monthly_image_limit,
    });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: "checkout_session_sync_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
