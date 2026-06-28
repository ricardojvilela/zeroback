import { getSupabaseSettings, readRawRequestBody } from "./_pro.js";
import { getStripeClient, updateProfileFromSubscription } from "./_stripe.js";

function sendWebhookJson(response, status, data) {
  response.setHeader("Content-Type", "application/json");
  response.status(status).json(data);
}

async function getSubscriptionFromCheckout(stripe, session) {
  if (!session?.subscription) return null;
  if (typeof session.subscription === "string") {
    return stripe.subscriptions.retrieve(session.subscription);
  }
  return session.subscription;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return sendWebhookJson(response, 405, { ok: false, error: "method_not_allowed" });
  }

  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!stripe || !webhookSecret) {
    return sendWebhookJson(response, 503, { ok: false, error: "stripe_webhook_not_configured" });
  }

  const signature = request.headers["stripe-signature"] || request.headers["Stripe-Signature"];
  if (!signature) {
    return sendWebhookJson(response, 400, { ok: false, error: "missing_stripe_signature" });
  }

  let event;
  try {
    const rawBody = await readRawRequestBody(request);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return sendWebhookJson(response, 400, {
      ok: false,
      error: "invalid_stripe_signature",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }

  const settings = getSupabaseSettings();
  if (!settings.supabaseUrl || !settings.serviceRoleKey) {
    return sendWebhookJson(response, 503, { ok: false, error: "supabase_not_configured" });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const subscription = await getSubscriptionFromCheckout(stripe, session);
      if (subscription) {
        await updateProfileFromSubscription(settings, subscription, session.client_reference_id);
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await updateProfileFromSubscription(settings, event.data.object);
    }

    return sendWebhookJson(response, 200, { ok: true, received: true });
  } catch (error) {
    return sendWebhookJson(response, 500, {
      ok: false,
      error: "stripe_webhook_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
