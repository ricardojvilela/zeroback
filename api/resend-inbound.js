import { Resend } from "resend";
import { getSupabaseSettings, readRawRequestBody, sendJson } from "./_pro.js";

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

function asText(value, maxLength = 1000) {
  return String(value || "").trim().slice(0, maxLength);
}

function textPreview(value, maxLength = 1200) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

async function storeSupportEmail(settings, event, email) {
  if (!settings.supabaseUrl || !settings.serviceRoleKey) {
    throw new Error("supabase_not_configured");
  }

  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const data = event.data || {};
  const detail = {
    email_id: asText(data.email_id || email?.id, 120),
    from: asText(email?.from || data.from, 320),
    to: [...(email?.to || []), ...(data.to || [])].filter(Boolean).slice(0, 10),
    cc: [...(email?.cc || []), ...(data.cc || [])].filter(Boolean).slice(0, 10),
    bcc: [...(email?.bcc || []), ...(data.bcc || [])].filter(Boolean).slice(0, 10),
    reply_to: [...(email?.reply_to || [])].filter(Boolean).slice(0, 10),
    received_for: [...(email?.received_for || []), ...(data.received_for || [])].filter(Boolean).slice(0, 10),
    subject: asText(email?.subject || data.subject, 500),
    message_id: asText(email?.message_id || data.message_id, 320),
    text: textPreview(email?.text || "", 5000),
    html: textPreview(email?.html || "", 5000),
    attachments: (email?.attachments || data.attachments || []).slice(0, 20).map((attachment) => ({
      id: asText(attachment.id, 120),
      filename: asText(attachment.filename, 240),
      content_type: asText(attachment.content_type, 120),
      size: Number(attachment.size || 0) || null,
    })),
    source: "resend_inbound",
  };

  const row = {
    event_name: "support_email_received",
    event_category: "support",
    event_label: detail.email_id || detail.message_id || "support_email",
    source: "support_email",
    campaign: "support_inbound",
    value: 0,
    detail,
    occurred_at: data.created_at || email?.created_at || new Date().toISOString(),
  };

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
    const detailText = await response.text();
    throw new Error(`support_mailbox_insert_failed:${response.status}:${detailText.slice(0, 300)}`);
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
  }

  const resendApiKey = process.env.RESEND_API_KEY || "";
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || "";
  const forwardTo = asList(process.env.SUPPORT_FORWARD_TO);
  const forwardFrom = process.env.SUPPORT_FORWARD_FROM || "support@batchcutout.com";
  const forwardEnabled = String(process.env.SUPPORT_FORWARD_ENABLED || "").toLowerCase() === "true";
  const acceptedRecipients = new Set(
    asList(process.env.SUPPORT_INBOUND_ADDRESSES || "support@batchcutout.com").map(normalizeEmail),
  );

  if (!resendApiKey || !webhookSecret) {
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
        id: requestHeader(request, "webhook-id") || requestHeader(request, "svix-id"),
        timestamp: requestHeader(request, "webhook-timestamp") || requestHeader(request, "svix-timestamp"),
        signature: requestHeader(request, "webhook-signature") || requestHeader(request, "svix-signature"),
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

  const emailResponse = await resend.emails.receiving.get(event.data.email_id, { html_format: "cid" });
  const email = emailResponse.error ? null : emailResponse.data;
  const settings = getSupabaseSettings();

  try {
    await storeSupportEmail(settings, event, email);
  } catch (error) {
    return sendJson(response, 502, {
      ok: false,
      error: "support_mailbox_store_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }

  if (forwardEnabled && forwardTo.length) {
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
  }

  return sendJson(response, 200, { ok: true, stored: true, forwarded: forwardEnabled && Boolean(forwardTo.length) });
}
