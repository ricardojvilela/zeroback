import { getSupabaseSettings } from "./_pro.js";
import { getStripeClient, updateProfileFromSubscription } from "./_stripe.js";

function webhookJson(status, data) {
  return Response.json(data, { status });
}

async function getSubscriptionFromCheckout(stripe, session) {
  if (!session?.subscription) return null;
  if (typeof session.subscription === "string") {
    return stripe.subscriptions.retrieve(session.subscription);
  }
  return session.subscription;
}

async function handleStripeEvent(event) {
  const settings = getSupabaseSettings();
  if (!settings.supabaseUrl || !settings.serviceRoleKey) {
    return webhookJson(503, { ok: false, error: "supabase_not_configured" });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return webhookJson(503, { ok: false, error: "stripe_not_configured" });
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

    return webhookJson(200, { ok: true, received: true });
  } catch (error) {
    return webhookJson(500, {
      ok: false,
      error: "stripe_webhook_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}

export async function POST(request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!stripe || !webhookSecret) {
    return webhookJson(503, { ok: false, error: "stripe_webhook_not_configured" });
  }

  const signature = request.headers.get("stripe-signature") || "";
  if (!signature) {
    return webhookJson(400, { ok: false, error: "missing_stripe_signature" });
  }

  let event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return webhookJson(400, {
      ok: false,
      error: "invalid_stripe_signature",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }

  return handleStripeEvent(event);
}

export function GET() {
  return webhookJson(405, { ok: false, error: "method_not_allowed" });
}
