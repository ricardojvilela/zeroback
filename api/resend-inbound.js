import { Resend } from "resend";
import { readRawRequestBody, sendJson } from "./_pro.js";

function asList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeEmail(value) {
  const match = String(value || "")
    .toLowerCase()
    .match(/[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}/);
  return match?.[0] || "";
}

function requestHeader(request, name) {
  return request.headers?.[name] || request.headers?.[name.toLowerCase()] || "";
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
  }

  const resendApiKey = process.env.RESEND_API_KEY || "";
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || "";
  const forwardTo = asList(process.env.SUPPORT_FORWARD_TO);
  const forwardFrom = process.env.SUPPORT_FORWARD_FROM || "support@batchcutout.com";
  const acceptedRecipients = new Set(
    asList(process.env.SUPPORT_INBOUND_ADDRESSES || "support@batchcutout.com").map(normalizeEmail),
  );

  if (!resendApiKey || !webhookSecret || !forwardTo.length) {
    return sendJson(response, 503, { ok: false, error: "support_email_not_configured" });
  }

  const resend = new Resend(resendApiKey);
  const payload = await readRawRequestBody(request);

  let event;
  try {
    event = resend.webhooks.verify({
      payload,
      webhookSecret,
      headers: {
        id: requestHeader(request, "svix-id"),
        timestamp: requestHeader(request, "svix-timestamp"),
        signature: requestHeader(request, "svix-signature"),
      },
    });
  } catch {
    return sendJson(response, 400, { ok: false, error: "invalid_resend_signature" });
  }

  if (event.type !== "email.received") {
    return sendJson(response, 200, { ok: true, ignored: true, reason: "unsupported_event" });
  }

  const recipients = [...(event.data?.to || []), ...(event.data?.received_for || [])].map(normalizeEmail);
  const hasAcceptedRecipient = recipients.some((recipient) => acceptedRecipients.has(recipient));
  if (!hasAcceptedRecipient) {
    return sendJson(response, 200, { ok: true, ignored: true, reason: "recipient_not_supported" });
  }

  const forwarded = await resend.emails.receiving.forward({
    emailId: event.data.email_id,
    from: forwardFrom,
    to: forwardTo.length === 1 ? forwardTo[0] : forwardTo,
  });

  if (forwarded.error) {
    return sendJson(response, 502, {
      ok: false,
      error: "support_email_forward_failed",
      detail: forwarded.error.message,
    });
  }

  return sendJson(response, 200, { ok: true, forwarded: true });
}
