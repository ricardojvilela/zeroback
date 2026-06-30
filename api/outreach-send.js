import crypto from "node:crypto";
import { Resend } from "resend";
import { readRequestBody, sendJson } from "./_pro.js";

const defaultFrom = "Ricardo at BatchCutout <ricardo@batchcutout.com>";
const defaultReplyTo = "support@batchcutout.com";
const allowedFromDomains = new Set(["batchcutout.com"]);

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

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  const valid = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
  return valid ? email : "";
}

function emailDomain(value) {
  return normalizeEmail(value).split("@")[1] || "";
}

function fromEmail(value) {
  const match = String(value || "").match(/<([^<>]+)>/);
  return normalizeEmail(match?.[1] || value);
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function outboundSettings() {
  const from = process.env.OUTREACH_FROM || defaultFrom;
  const replyTo = process.env.OUTREACH_REPLY_TO || process.env.SUPPORT_FORWARD_FROM || defaultReplyTo;
  const fromAddress = fromEmail(from);
  return {
    from,
    replyTo,
    fromAddress,
    fromDomain: emailDomain(fromAddress),
  };
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return sendJson(response, 200, { ok: true });
  }

  if (request.method !== "POST") {
    return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
  }

  if (!verifyAdminToken(request)) {
    return sendJson(response, 401, { ok: false, error: "unauthorized" });
  }

  const settings = outboundSettings();
  if (!allowedFromDomains.has(settings.fromDomain)) {
    return sendJson(response, 503, { ok: false, error: "outreach_from_domain_not_allowed" });
  }

  const resendApiKey = process.env.RESEND_API_KEY || "";
  if (!resendApiKey) {
    return sendJson(response, 503, { ok: false, error: "resend_not_configured" });
  }

  const body = await readRequestBody(request);
  const to = normalizeEmail(body.to);
  const subject = cleanText(body.subject, 160);
  const text = cleanText(body.text, 5000);
  const dryRun = Boolean(body.dryRun);

  if (!to || !subject || !text) {
    return sendJson(response, 400, { ok: false, error: "invalid_email_payload" });
  }

  const payload = {
    from: settings.from,
    to,
    replyTo: settings.replyTo,
    subject,
    text,
    tags: [
      { name: "source", value: "manual_outreach" },
      { name: "product", value: "batchcutout" },
    ],
  };

  if (dryRun) {
    return sendJson(response, 200, {
      ok: true,
      dryRun: true,
      from: payload.from,
      replyTo: payload.replyTo,
      to: payload.to,
      subject: payload.subject,
    });
  }

  const resend = new Resend(resendApiKey);
  const sent = await resend.emails.send(payload);

  if (sent.error) {
    return sendJson(response, 502, {
      ok: false,
      error: "outreach_send_failed",
      detail: sent.error.message,
    });
  }

  return sendJson(response, 200, {
    ok: true,
    id: sent.data?.id || "",
    from: payload.from,
    replyTo: payload.replyTo,
    to: payload.to,
    subject: payload.subject,
  });
}
