import { Resend } from "resend";

const allowedEvents = new Set([
  "tool_page_view",
  "seo_landing_view",
  "seo_landing_cta_clicked",
  "tool_drag_upload_intent",
  "tool_upload_started",
  "tool_upload_added",
  "download_ready_shown",
  "batch_limit_exceeded",
  "tool_processing_started",
  "tool_processing_completed",
  "tool_download_png",
  "tool_download_zip",
  "post_download_next_shown",
  "post_download_founder_clicked",
  "post_download_save_link_clicked",
  "post_download_feedback_selected",
  "tool_pro_clicked",
  "monthly_limit_reached",
  "pro_prompt_shown",
  "pro_email_started",
  "pro_email_invalid",
  "pro_email_submitted",
  "pro_page_view",
  "pro_cta_clicked",
  "high_volume_contact_clicked",
  "pro_form_started",
  "pro_volume_selected",
  "pro_submit_attempt",
  "pro_checkout_interest_submitted",
  "account_checkout_panel_shown",
  "account_form_interacted",
  "pro_checkout_login_required",
  "pro_checkout_started",
  "pro_checkout_cancelled_return",
  "checkout_continue_error_shown",
  "pro_purchase_conversion_sent",
  "pro_subscription_paid",
  "lead_capture_shown",
  "lead_capture_submitted",
  "lead_capture_dismissed",
  "lead_capture_invalid",
  "billing_portal_opened",
  "account_signup_started",
  "account_signup_succeeded",
  "account_email_confirmation_required",
  "account_email_confirmation_resent",
  "account_form_validation_failed",
  "account_signup_failed",
  "account_login_succeeded",
  "account_login_failed",
  "partner_page_view",
  "partner_cta_clicked",
  "partner_referral_copy",
  "proof_page_view",
  "proof_cta_clicked",
  "directory_launch_page_view",
  "directory_launch_cta_clicked",
]);

const allowedEmailDomains = new Set(["batchcutout.com"]);
const leadAutoreplySources = new Set(["post_download", "post_download_inline", "result_ready", "result_ready_inline"]);
const leadAutoreplyDownloadTypes = new Set(["png", "zip", "png_available", "zip_available"]);
const leadAutoreplyWindowMs = 30 * 24 * 60 * 60 * 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://batchcutout.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function sendJson(response, status, data) {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.setHeader(key, value);
  }
  response.setHeader("Content-Type", "application/json");
  response.status(status).json(data);
}

function asString(value, maxLength = 500) {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, maxLength);
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

function htmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeDetail(detail) {
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) return {};

  const output = {};
  for (const [key, value] of Object.entries(detail)) {
    if (value === undefined || typeof value === "function") continue;
    if (typeof value === "string") {
      output[key] = value.slice(0, 1000);
    } else if (typeof value === "number" || typeof value === "boolean" || value === null) {
      output[key] = value;
    }
  }
  return output;
}

function leadMailSettings() {
  const from = process.env.LEAD_CAPTURE_REPLY_FROM || process.env.SUPPORT_REPLY_FROM || "BatchCutout <support@batchcutout.com>";
  const replyTo = process.env.LEAD_CAPTURE_REPLY_TO || process.env.SUPPORT_REPLY_TO || "support@batchcutout.com";
  const fromAddress = fromEmail(from);
  return {
    from,
    replyTo,
    fromDomain: emailDomain(fromAddress),
  };
}

function leadLanguage(detail) {
  const language = String(detail.language || "").toLowerCase();
  if (language.startsWith("pt")) return "pt";
  if (language.startsWith("es")) return "es";
  return "en";
}

function leadAutoreplyCopy(language) {
  if (language === "pt") {
    return {
      subject: "O seu link e checklist BatchCutout",
      greeting: "Ola,",
      toolUrl: "https://batchcutout.com/?utm_source=email&utm_medium=recovery&utm_campaign=lead_capture_autoreply#tool",
      pricingUrl: "https://batchcutout.com/pricing/?checkout_plan=early&utm_source=email&utm_medium=recovery&utm_campaign=lead_capture_autoreply#pricing-account-title",
      intro: "Aqui fica o link para voltar ao BatchCutout e tratar fotos de produto.",
      checklistLine: "Checklist rapido para preparar o proximo lote:",
      proLine: "Se precisar de repetir este fluxo em catálogo, variantes ou marketplace, o Pro desbloqueia:",
      cta: "Abrir BatchCutout",
      pricingCta: "Ver planos Pro",
      optOut: "Se isto não for útil, responda \"remover\" e não enviaremos acompanhamento.",
      thanks: "Obrigado,\nNexaFlow Labs",
      checklistBullets: [
        "Use fotos em que o produto aparece inteiro e sem cortes nas margens.",
        "Evite sombras muito fortes ou fundos com cores iguais ao produto.",
        "Depois do recorte, descarregue PNG para uma imagem ou ZIP para vários produtos.",
      ],
      bullets: ["100 imagens por lote", "2.000 imagens por mês", "PNG transparente e ZIP"],
    };
  }

  if (language === "es") {
    return {
      subject: "Tu enlace y checklist de BatchCutout",
      greeting: "Hola,",
      toolUrl: "https://batchcutout.com/?lang=es&utm_source=email&utm_medium=recovery&utm_campaign=lead_capture_autoreply#tool",
      pricingUrl: "https://batchcutout.com/pricing/?lang=es&checkout_plan=early&utm_source=email&utm_medium=recovery&utm_campaign=lead_capture_autoreply#pricing-account-title",
      intro: "Aqui tienes el enlace para volver a BatchCutout y preparar fotos de producto.",
      checklistLine: "Checklist rapido para tu proximo lote:",
      proLine: "Si necesitas repetir este flujo para catalogos, variantes o marketplaces, Pro desbloquea:",
      cta: "Abrir BatchCutout",
      pricingCta: "Ver planes Pro",
      optOut: "Si esto no te resulta util, responde \"remover\" y no enviaremos seguimiento de producto.",
      thanks: "Gracias,\nNexaFlow Labs",
      checklistBullets: [
        "Usa fotos donde el producto aparezca completo y sin cortes en los bordes.",
        "Evita sombras muy fuertes o fondos con colores demasiado parecidos al producto.",
        "Despues del recorte, descarga PNG para una imagen o ZIP para varios productos.",
      ],
      bullets: ["100 imagenes por lote", "2.000 imagenes al mes", "PNG transparente y ZIP"],
    };
  }

  return {
    subject: "Your BatchCutout link and checklist",
    greeting: "Hi,",
    toolUrl: "https://batchcutout.com/?lang=en&utm_source=email&utm_medium=recovery&utm_campaign=lead_capture_autoreply#tool",
    pricingUrl: "https://batchcutout.com/pricing/?lang=en&checkout_plan=early&utm_source=email&utm_medium=recovery&utm_campaign=lead_capture_autoreply#pricing-account-title",
    intro: "Here is the link to come back to BatchCutout and process product photos.",
    checklistLine: "Quick checklist for your next batch:",
    proLine: "If you need to repeat this workflow for catalogs, variants, or marketplace listings, Pro unlocks:",
    cta: "Open BatchCutout",
    pricingCta: "See Pro plans",
    optOut: "If this is not useful, reply \"unsubscribe\" and we will not send product follow-ups.",
    thanks: "Thanks,\nNexaFlow Labs",
    checklistBullets: [
      "Use photos where the full product is visible and not cropped at the edges.",
      "Avoid very strong shadows or backgrounds with colors too close to the product.",
      "After cutout, download PNG for one image or ZIP for multiple products.",
    ],
    bullets: ["100 images per batch", "2,000 images per month", "Transparent PNG and ZIP export"],
  };
}

function leadAutoreplyText(copy) {
  return [
    copy.greeting,
    "",
    copy.intro,
    copy.toolUrl,
    "",
    copy.checklistLine,
    "",
    ...copy.checklistBullets.map((bullet) => `- ${bullet}`),
    "",
    copy.proLine,
    "",
    ...copy.bullets.map((bullet) => `- ${bullet}`),
    "",
    copy.pricingCta + ":",
    copy.pricingUrl,
    "",
    copy.optOut,
    "",
    copy.thanks,
  ].join("\n");
}

function leadAutoreplyHtml(copy) {
  const bullets = copy.bullets.map((bullet) => `<li>${htmlEscape(bullet)}</li>`).join("");
  const checklistBullets = copy.checklistBullets.map((bullet) => `<li>${htmlEscape(bullet)}</li>`).join("");
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f3f7fa;color:#17202a;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7fa;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #dbe3ee;border-radius:8px;overflow:hidden;">
            <tr><td style="padding:24px 26px;background:#17202a;color:#ffffff;"><strong style="font-size:18px;">BatchCutout</strong><span style="margin-left:10px;color:#9fb4c6;font-size:12px;text-transform:uppercase;">NexaFlow Labs</span></td></tr>
            <tr>
              <td style="padding:28px 26px;">
                <h1 style="margin:0 0 14px;font-size:28px;line-height:1.1;">${htmlEscape(copy.subject)}</h1>
                <p style="margin:0 0 16px;line-height:1.55;color:#52606d;">${htmlEscape(copy.intro)}</p>
                <p style="margin:0 0 18px;"><a href="${htmlEscape(copy.toolUrl)}" style="display:inline-block;background:#2646d8;color:#ffffff;text-decoration:none;font-weight:700;border-radius:8px;padding:13px 18px;">${htmlEscape(copy.cta)}</a></p>
                <p style="margin:0 0 12px;line-height:1.55;color:#52606d;">${htmlEscape(copy.checklistLine)}</p>
                <ul style="margin:0 0 22px;padding-left:20px;color:#52606d;line-height:1.55;">${checklistBullets}</ul>
                <p style="margin:0 0 12px;line-height:1.55;color:#52606d;">${htmlEscape(copy.proLine)}</p>
                <ul style="margin:0 0 22px;padding-left:20px;color:#52606d;line-height:1.55;">${bullets}</ul>
                <a href="${htmlEscape(copy.pricingUrl)}" style="display:inline-block;background:#14958b;color:#ffffff;text-decoration:none;font-weight:700;border-radius:8px;padding:13px 18px;">${htmlEscape(copy.pricingCta)}</a>
              </td>
            </tr>
            <tr><td style="padding:18px 26px;border-top:1px solid #dbe3ee;color:#697483;font-size:12px;line-height:1.45;">NexaFlow Labs. ${htmlEscape(copy.optOut)}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function insertEvent(settings, tableName, row) {
  const supabaseResponse = await fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}`, {
    method: "POST",
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!supabaseResponse.ok) {
    const errorText = await supabaseResponse.text();
    const error = new Error(`supabase_insert_failed:${supabaseResponse.status}:${errorText.slice(0, 500)}`);
    error.status = supabaseResponse.status;
    error.detail = errorText.slice(0, 500);
    throw error;
  }
}

async function hasRecentLeadAutoreply(settings, tableName, email) {
  const since = new Date(Date.now() - leadAutoreplyWindowMs).toISOString();
  const query = new URLSearchParams({
    select: "id",
    event_name: "eq.lead_capture_autoreply_sent",
    event_label: `eq.${email}`,
    occurred_at: `gte.${since}`,
    limit: "1",
  });

  const response = await fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}?${query}`, {
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    return true;
  }

  const rows = await response.json();
  return Array.isArray(rows) && rows.length > 0;
}

async function sendLeadAutoreply(settings, tableName, detail, row) {
  if (eventAutoreplyDisabled()) return { sent: false, skipped: true, reason: "disabled" };
  if (
    detail.event_category === "validation" ||
    detail.source === "codex_validation" ||
    row.visitor_id === "codex-validation-visitor" ||
    String(row.session_id || "").startsWith("validation-")
  ) {
    return { sent: false, skipped: true, reason: "validation_event" };
  }
  if (detail.consent !== true) return { sent: false, skipped: true, reason: "no_consent" };
  if (!leadAutoreplySources.has(String(detail.source || ""))) return { sent: false, skipped: true, reason: "not_post_download" };
  if ((Number(detail.count || 0) || 0) <= 0) return { sent: false, skipped: true, reason: "missing_download_count" };
  if (!leadAutoreplyDownloadTypes.has(String(detail.downloadType || ""))) {
    return { sent: false, skipped: true, reason: "unknown_download_type" };
  }

  const to = normalizeEmail(detail.email);
  if (!to) return { sent: false, skipped: true, reason: "invalid_email" };

  const mailSettings = leadMailSettings();
  if (!allowedEmailDomains.has(mailSettings.fromDomain)) {
    return { sent: false, skipped: true, reason: "from_domain_not_allowed" };
  }

  const resendApiKey = process.env.RESEND_API_KEY || "";
  if (!resendApiKey) return { sent: false, skipped: true, reason: "resend_not_configured" };

  const alreadySent = await hasRecentLeadAutoreply(settings, tableName, to);
  if (alreadySent) return { sent: false, skipped: true, reason: "already_sent_recently" };

  const language = leadLanguage(detail);
  const copy = leadAutoreplyCopy(language);
  const payload = {
    from: mailSettings.from,
    to,
    replyTo: mailSettings.replyTo,
    subject: copy.subject,
    text: leadAutoreplyText(copy),
    html: leadAutoreplyHtml(copy),
    tags: [
      { name: "source", value: "lead_capture_autoreply" },
      { name: "product", value: "batchcutout" },
    ],
  };

  const resend = new Resend(resendApiKey);
  let sent;
  try {
    sent = await resend.emails.send(payload);
  } catch (error) {
    await insertEvent(settings, tableName, {
      event_name: "lead_capture_autoreply_failed",
      event_category: "email",
      event_label: to,
      page_path: row.page_path,
      page_location: row.page_location,
      language,
      session_id: row.session_id,
      visitor_id: row.visitor_id,
      source: "email",
      campaign: "lead_capture_autoreply",
      value: 0,
      detail: {
        email: to,
        reason: error instanceof Error ? error.message.slice(0, 300) : "resend_exception",
      },
      occurred_at: new Date().toISOString(),
    });
    return { sent: false, skipped: false, reason: "resend_exception" };
  }

  if (sent.error) {
    await insertEvent(settings, tableName, {
      event_name: "lead_capture_autoreply_failed",
      event_category: "email",
      event_label: to,
      page_path: row.page_path,
      page_location: row.page_location,
      language,
      session_id: row.session_id,
      visitor_id: row.visitor_id,
      source: "email",
      campaign: "lead_capture_autoreply",
      value: 0,
      detail: {
        email: to,
        reason: sent.error.message || "resend_error",
      },
      occurred_at: new Date().toISOString(),
    });
    return { sent: false, skipped: false, reason: "resend_error" };
  }

  await insertEvent(settings, tableName, {
    event_name: "lead_capture_autoreply_sent",
    event_category: "email",
    event_label: to,
    page_path: row.page_path,
    page_location: row.page_location,
    language,
    session_id: row.session_id,
    visitor_id: row.visitor_id,
    source: "email",
    campaign: "lead_capture_autoreply",
    value: 0,
    detail: {
      email: to,
      from: payload.from,
      reply_to: payload.replyTo,
      subject: payload.subject,
      resend_id: sent.data?.id || "",
      original_source: detail.source || "",
      original_download_type: detail.downloadType || "",
      original_count: Number(detail.count || 0) || 0,
    },
    occurred_at: new Date().toISOString(),
  });

  return { sent: true, skipped: false, id: sent.data?.id || "" };
}

function eventAutoreplyDisabled() {
  return String(process.env.LEAD_CAPTURE_AUTOREPLY_ENABLED || "true").toLowerCase() === "false";
}

async function readRequestBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return sendJson(response, 200, { ok: true });
  }

  if (request.method !== "POST") {
    return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
  }

  const body = await readRequestBody(request);
  const eventName = asString(body?.name, 80);
  if (!allowedEvents.has(eventName)) {
    return sendJson(response, 400, { ok: false, error: "event_not_allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";

  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(response, 202, { ok: true, stored: false, reason: "supabase_not_configured" });
  }

  const detail = sanitizeDetail(body?.detail);
  const row = {
    event_name: eventName,
    event_category: asString(detail.event_category, 80),
    event_label: asString(detail.event_label, 160),
    page_path: asString(detail.page_path, 500),
    page_location: asString(detail.page_location, 1000),
    language: asString(detail.language, 20),
    session_id: asString(body?.sessionId, 80),
    visitor_id: asString(body?.visitorId, 80),
    source: asString(detail.utm_source || detail.last_source || detail.first_source || detail.source, 160),
    campaign: asString(detail.utm_campaign || detail.last_campaign || detail.first_campaign, 160),
    free_limit: Number(detail.free_limit || 0) || null,
    value: Number(detail.value || 0) || 0,
    detail,
    occurred_at: new Date().toISOString(),
  };

  try {
    const settings = { supabaseUrl, serviceRoleKey };
    await insertEvent(settings, tableName, row);

    let leadAutoreply = null;
    if (eventName === "lead_capture_submitted") {
      try {
        leadAutoreply = await sendLeadAutoreply(settings, tableName, detail, row);
      } catch (error) {
        leadAutoreply = {
          sent: false,
          skipped: false,
          reason: error instanceof Error ? error.message.slice(0, 160) : "lead_autoreply_failed",
        };
      }
    }

    return sendJson(response, 202, { ok: true, stored: true, leadAutoreply });
  } catch (error) {
    if (String(error?.message || "").startsWith("supabase_insert_failed")) {
      return sendJson(response, 502, {
        ok: false,
        error: "supabase_insert_failed",
        status: error.status || 502,
        detail: error.detail || "",
      });
    }

    return sendJson(response, 500, {
      ok: false,
      error: "track_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
