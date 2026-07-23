import Stripe from "stripe";

import { getSiteUrl, stripeApiVersion } from "../api/_stripe.js";

const requiredEvents = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
];

const secretKey = process.env.STRIPE_SECRET_KEY || "";
const applyChanges = process.argv.includes("--apply");
const targetUrl = `${getSiteUrl()}/api/stripe-webhook`;

if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY is not available");
}

const stripe = new Stripe(secretKey, { apiVersion: stripeApiVersion });
const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
const endpoint = endpoints.data.find((candidate) => candidate.url?.replace(/\/$/, "") === targetUrl);

if (!endpoint) {
  console.log(JSON.stringify({
    ok: false,
    targetUrl,
    error: "stripe_webhook_endpoint_not_found",
  }, null, 2));
  process.exitCode = 1;
} else {
  const enabledEvents = Array.isArray(endpoint.enabled_events) ? endpoint.enabled_events : [];
  const receivesAllEvents = enabledEvents.includes("*");
  const missingEvents = receivesAllEvents
    ? []
    : requiredEvents.filter((eventName) => !enabledEvents.includes(eventName));
  let updated = false;

  if (applyChanges && missingEvents.length > 0) {
    await stripe.webhookEndpoints.update(endpoint.id, {
      enabled_events: [...new Set([...enabledEvents, ...missingEvents])].sort(),
    });
    updated = true;
  }

  console.log(JSON.stringify({
    ok: true,
    endpointId: endpoint.id,
    targetUrl,
    status: endpoint.status,
    receivesAllEvents,
    requiredEvents,
    missingEvents,
    updated,
  }, null, 2));
}
