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
  getCheckoutOffering,
  getPlanLabel,
  getSiteUrl,
  getStripeClient,
} from "./_stripe.js";
import { Resend } from "resend";

const attributionMetadataKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "source",
  "medium",
  "campaign",
  "first_source",
  "first_medium",
  "first_campaign",
  "first_content",
  "first_term",
  "first_gclid",
  "first_gbraid",
  "first_wbraid",
  "first_landing_page",
  "first_seen_at",
  "last_source",
  "last_medium",
  "last_campaign",
  "last_content",
  "last_term",
  "last_gclid",
  "last_gbraid",
  "last_wbraid",
  "last_landing_page",
  "last_seen_at",
  "page_path",
  "page_location",
  "language",
  "visitor_id",
  "session_id",
  "limit_variant",
  "free_limit",
];
const allowedCheckoutEmailDomains = new Set(["batchcutout.com"]);
const checkoutLinkEmailWindowMs = 60 * 60 * 1000;
const checkoutLinkEmailDefaultTimeoutMs = 1500;

function checkoutValueForPlan(plan) {
  if (plan === "annual") return 190;
  if (plan === "early") return 15;
  if (plan === "pack100") return 5;
  if (plan === "pack250") return 9;
  return 19;
}

function metadataString(value, maxLength = 450) {
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

function sanitizeAttribution(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};

  const attribution = {};
  for (const key of attributionMetadataKeys) {
    const value = input[key];
    if (value === null || value === undefined || value === "") continue;
    if (!["string", "number", "boolean"].includes(typeof value)) continue;
    attribution[key] = metadataString(value);
  }

  return attribution;
}

function checkoutEmailEnabled() {
  return String(process.env.CHECKOUT_LINK_EMAIL_ENABLED || "true").toLowerCase() !== "false";
}

function checkoutEmailTimeoutMs() {
  const configured = Number(process.env.CHECKOUT_LINK_EMAIL_TIMEOUT_MS || 0) || 0;
  return Math.min(Math.max(configured || checkoutLinkEmailDefaultTimeoutMs, 500), 5000);
}

function checkoutMailSettings() {
  const from = process.env.CHECKOUT_LINK_EMAIL_FROM || process.env.SUPPORT_REPLY_FROM || "BatchCutout <support@batchcutout.com>";
  const replyTo = process.env.CHECKOUT_LINK_EMAIL_REPLY_TO || process.env.SUPPORT_REPLY_TO || "support@batchcutout.com";
  const fromAddress = fromEmail(from);
  return {
    from,
    replyTo,
    fromDomain: emailDomain(fromAddress),
  };
}

function checkoutLanguage(attribution) {
  const language = String(attribution.language || "").toLowerCase();
  if (language.startsWith("pt")) return "pt";
  if (language.startsWith("es")) return "es";
  if (language.startsWith("en")) return "en";
  return "pt";
}

function checkoutPlanText(plan, language) {
  if (language === "pt") {
    if (plan === "pack100") return "Pack 100 imagens - 5 EUR";
    if (plan === "pack250") return "Pack 250 imagens - 9 EUR";
    if (plan === "annual") return "Pro anual - 190 EUR/ano";
    if (plan === "early") return "Pro recorrente - 15 EUR/mes";
    return "Pro mensal - 19 EUR/mes";
  }
  if (language === "es") {
    if (plan === "pack100") return "Pack 100 imagenes - 5 EUR";
    if (plan === "pack250") return "Pack 250 imagenes - 9 EUR";
    if (plan === "annual") return "Pro anual - 190 EUR/año";
    if (plan === "early") return "Pro recurrente - 15 EUR/mes";
    return "Pro mensual - 19 EUR/mes";
  }
  if (plan === "pack100") return "100 image pack - EUR 5";
  if (plan === "pack250") return "250 image pack - EUR 9";
  if (plan === "annual") return "Annual Pro - EUR 190/year";
  if (plan === "early") return "Recurring Pro - EUR 15/month";
  return "Monthly Pro - EUR 19/month";
}

function checkoutContinueUrl(session) {
  return `${getSiteUrl()}/api/create-checkout-session?continue_session=${encodeURIComponent(session.id || "")}`;
}

function checkoutLinkCopy({ language, plan, sessionUrl }) {
  const planText = checkoutPlanText(plan, language);
  const isPack = plan === "pack100" || plan === "pack250";
  const packImages = plan === "pack250" ? "250" : "100";
  if (language === "pt") {
    return {
      subject: isPack ? "Link seguro para concluir o pack BatchCutout" : "Link seguro para concluir o BatchCutout Pro",
      title: isPack ? "Concluir pack BatchCutout" : "Concluir BatchCutout Pro",
      intro: isPack
        ? "Abriu o pagamento de um pack BatchCutout. Se a aba do Stripe fechar ou quiser continuar noutro dispositivo, use este link seguro:"
        : "Abriu o pagamento do BatchCutout Pro. Se a aba do Stripe fechar ou quiser continuar noutro dispositivo, use este link seguro:",
      cta: "Concluir pagamento",
      planLine: `Plano: ${planText}`,
      benefits: isPack
        ? [
            `${packImages} creditos de imagem`,
            "Compra unica, sem subscricao",
            "Ate 100 imagens por lote",
          ]
        : [
            "Ate 100 imagens por lote",
            "Ate 2.000 imagens por mes",
            "PNG transparente e ZIP organizado para produto",
          ],
      note: "O botao retoma a mesma sessao segura do Stripe. Se ja concluiu o pagamento, pode ignorar este email.",
      support: "Se alguma coisa bloquear a ativacao, responda a este email.",
      thanks: "Obrigado,\nNexaFlow Labs",
      sessionUrl,
    };
  }
  if (language === "es") {
    return {
      subject: isPack ? "Tu enlace seguro para completar el pack BatchCutout" : "Tu enlace seguro para completar BatchCutout Pro",
      title: isPack ? "Completar pack BatchCutout" : "Completar BatchCutout Pro",
      intro: isPack
        ? "Abriste el checkout de un pack BatchCutout. Si la pestaña de Stripe se cierra o quieres continuar en otro dispositivo, usa este enlace seguro:"
        : "Abriste el checkout de BatchCutout Pro. Si la pestaña de Stripe se cierra o quieres continuar en otro dispositivo, usa este enlace seguro:",
      cta: "Completar pago",
      planLine: `Plan: ${planText}`,
      benefits: isPack
        ? [
            `${packImages} creditos de imagen`,
            "Compra unica, sin suscripcion",
            "Hasta 100 imagenes por lote",
          ]
        : [
            "Hasta 100 imagenes por lote",
            "Hasta 2.000 imagenes al mes",
            "PNG transparente y ZIP organizado para trabajo de producto",
          ],
      note: "El boton retoma la misma sesion segura de Stripe. Si ya completaste el pago, puedes ignorar este email.",
      support: "Si algo bloquea la activacion, responde a este email.",
      thanks: "Gracias,\nNexaFlow Labs",
      sessionUrl,
    };
  }
  return {
    subject: isPack ? "Your secure BatchCutout pack checkout link" : "Your secure BatchCutout Pro checkout link",
    title: isPack ? "Complete BatchCutout pack" : "Complete BatchCutout Pro",
    intro: isPack
      ? "You opened BatchCutout pack checkout. If the Stripe tab closes or you want to continue on another device, use this secure link:"
      : "You opened BatchCutout Pro checkout. If the Stripe tab closes or you want to continue on another device, use this secure link:",
    cta: "Complete payment",
    planLine: `Plan: ${planText}`,
    benefits: isPack
      ? [
          `${packImages} image credits`,
          "One-time purchase, no subscription",
          "Up to 100 images per batch",
        ]
      : [
          "Up to 100 images per batch",
          "Up to 2,000 images per month",
          "Transparent PNG and organized ZIP export for product work",
        ],
    note: "The button resumes the same secure Stripe session. If you already completed payment, you can ignore this email.",
    support: "If anything blocks activation, reply to this email.",
    thanks: "Thanks,\nNexaFlow Labs",
    sessionUrl,
  };
}

function checkoutLinkEmailText(copy) {
  return [
    copy.intro,
    copy.sessionUrl,
    "",
    copy.planLine,
    "",
    ...(copy.benefits || []).map((benefit) => `- ${benefit}`),
    "",
    copy.note,
    copy.support,
    "",
    copy.thanks,
  ].join("\n");
}

function checkoutBenefitsHtml(benefits = []) {
  if (!benefits.length) return "";
  const items = benefits
    .map((benefit) => `<li>${htmlEscape(benefit)}</li>`)
    .join("");
  return `<ul style="margin:0 0 20px;padding-left:20px;color:#52606d;line-height:1.55;">${items}</ul>`;
}

function checkoutLinkEmailHtml(copy) {
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
                <h1 style="margin:0 0 14px;font-size:28px;line-height:1.1;">${htmlEscape(copy.title)}</h1>
                <p style="margin:0 0 16px;line-height:1.55;color:#52606d;">${htmlEscape(copy.intro)}</p>
                <p style="margin:0 0 10px;color:#17202a;font-weight:700;">${htmlEscape(copy.planLine)}</p>
                ${checkoutBenefitsHtml(copy.benefits)}
                <p style="margin:0 0 20px;"><a href="${htmlEscape(copy.sessionUrl)}" style="display:inline-block;background:#14958b;color:#ffffff;text-decoration:none;font-weight:700;border-radius:8px;padding:13px 18px;">${htmlEscape(copy.cta)}</a></p>
                <p style="margin:0 0 8px;line-height:1.55;color:#52606d;">${htmlEscape(copy.note)}</p>
                <p style="margin:0;line-height:1.55;color:#52606d;">${htmlEscape(copy.support)}</p>
              </td>
            </tr>
            <tr><td style="padding:18px 26px;border-top:1px solid #dbe3ee;color:#697483;font-size:12px;line-height:1.45;">NexaFlow Labs</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function insertCheckoutEvent(settings, row) {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  await fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}`, {
    method: "POST",
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
}

function redirect(response, location) {
  response.writeHead(302, { Location: location });
  response.end();
}

function checkoutSessionPlan(session) {
  const metadata = session?.metadata || {};
  const plan = String(metadata.batchcutout_price_plan || metadata.price_plan || "monthly").toLowerCase();
  return ["early", "monthly", "annual", "pack100", "pack250"].includes(plan) ? plan : "monthly";
}

async function recordCheckoutLinkClick(settings, session) {
  if (!settings.supabaseUrl || !settings.serviceRoleKey) return;

  const metadata = session?.metadata || {};
  const plan = checkoutSessionPlan(session);
  await insertCheckoutEvent(settings, {
    event_name: "checkout_link_email_clicked",
    event_category: "email_click",
    event_label: metadataString(session.id, 160),
    page_path: "/api/create-checkout-session",
    page_location: `${getSiteUrl()}/api/create-checkout-session`,
    language: metadataString(metadata.language, 20),
    session_id: metadataString(metadata.session_id, 80),
    visitor_id: metadataString(metadata.visitor_id, 80),
    source: "email",
    campaign: "checkout_link_email",
    value: checkoutValueForPlan(plan),
    detail: {
      stripe_session_id: session.id || "",
      stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id || "",
      supabase_user_id: session.client_reference_id || metadata.supabase_user_id || "",
      plan,
      price_plan: plan,
      checkout_status: metadataString(session.status, 80),
      payment_status: metadataString(session.payment_status, 80),
      source: "email",
      campaign: "checkout_link_email",
    },
    occurred_at: new Date().toISOString(),
  });
}

async function continueCheckoutSession(request, response) {
  const siteUrl = getSiteUrl();
  const pricingUrl = `${siteUrl}/pricing/?checkout=continue_error#pricing-account-title`;
  const sessionId = metadataString(request.query?.continue_session || request.query?.session_id || "", 200);

  if (!/^cs_(test|live)_[a-zA-Z0-9]+$/.test(sessionId)) {
    return redirect(response, pricingUrl);
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return redirect(response, pricingUrl);
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    try {
      await recordCheckoutLinkClick(getSupabaseSettings(), session);
    } catch {
      // A click should still reach Stripe if internal analytics fail.
    }

    if (session.status === "complete") {
      return redirect(response, `${siteUrl}/?checkout=success&session_id=${encodeURIComponent(session.id)}#accountTitle`);
    }

    if (session.url) {
      return redirect(response, session.url);
    }

    return redirect(response, pricingUrl);
  } catch {
    return redirect(response, pricingUrl);
  }
}

async function hasRecentCheckoutLinkEmail(settings, email) {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const since = new Date(Date.now() - checkoutLinkEmailWindowMs).toISOString();
  const query = new URLSearchParams({
    select: "id",
    event_name: "eq.checkout_link_email_sent",
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

  if (!response.ok) return true;
  const rows = await response.json();
  return Array.isArray(rows) && rows.length > 0;
}

async function recordCheckoutSessionCreated(settings, { user, profile, session, plan, attribution, offerKind = "subscription" }) {
  const detail = {
    ...attribution,
    stripe_session_id: session.id || "",
    stripe_customer_id: profile.stripe_customer_id || session.customer || "",
    supabase_user_id: user.id || "",
    plan,
    price_plan: plan,
    purchase_type: offerKind,
  };
  const row = {
    event_name: offerKind === "pack" ? "pack_checkout_session_created" : "pro_checkout_session_created",
    event_category: "commercial_intent",
    event_label: plan,
    page_path: metadataString(attribution.page_path, 500),
    page_location: metadataString(attribution.page_location, 1000),
    language: metadataString(attribution.language, 20),
    session_id: metadataString(attribution.session_id, 80),
    visitor_id: metadataString(attribution.visitor_id, 80),
    source: metadataString(attribution.utm_source || attribution.source || attribution.last_source || attribution.first_source, 160),
    campaign: metadataString(attribution.utm_campaign || attribution.campaign || attribution.last_campaign || attribution.first_campaign, 160),
    value: checkoutValueForPlan(plan),
    detail,
    occurred_at: new Date().toISOString(),
  };

  await insertCheckoutEvent(settings, row);
}

async function recordCheckoutSessionFailed(settings, { user = null, profile = null, plan = "unknown", attribution = {}, reason = "", stage = "checkout_session" }) {
  if (!settings.supabaseUrl || !settings.serviceRoleKey) return;

  const detail = {
    ...attribution,
    stripe_customer_id: profile?.stripe_customer_id || "",
    supabase_user_id: user?.id || "",
    email: normalizeEmail(user?.email || profile?.email || ""),
    plan,
    price_plan: plan,
    reason: metadataString(reason, 300),
    stage,
  };

  await insertCheckoutEvent(settings, {
    event_name: "pro_checkout_session_failed",
    event_category: "commercial_intent",
    event_label: metadataString(plan || stage, 120),
    page_path: metadataString(attribution.page_path, 500),
    page_location: metadataString(attribution.page_location, 1000),
    language: metadataString(attribution.language, 20),
    session_id: metadataString(attribution.session_id, 80),
    visitor_id: metadataString(attribution.visitor_id, 80),
    source: metadataString(attribution.utm_source || attribution.source || attribution.last_source || attribution.first_source, 160),
    campaign: metadataString(attribution.utm_campaign || attribution.campaign || attribution.last_campaign || attribution.first_campaign, 160),
    value: 0,
    detail,
    occurred_at: new Date().toISOString(),
  });
}

async function recordCheckoutLinkEmail(settings, { eventName, user, profile, session, plan, attribution, to, reason = "", resendId = "" }) {
  const detail = {
    ...attribution,
    email: to,
    reason,
    resend_id: resendId,
    stripe_session_id: session.id || "",
    stripe_customer_id: profile.stripe_customer_id || session.customer || "",
    supabase_user_id: user.id || "",
    plan,
    price_plan: plan,
  };

  await insertCheckoutEvent(settings, {
    event_name: eventName,
    event_category: "email",
    event_label: to,
    page_path: metadataString(attribution.page_path, 500),
    page_location: metadataString(attribution.page_location, 1000),
    language: metadataString(attribution.language, 20),
    session_id: metadataString(attribution.session_id, 80),
    visitor_id: metadataString(attribution.visitor_id, 80),
    source: "email",
    campaign: "checkout_link_email",
    value: 0,
    detail,
    occurred_at: new Date().toISOString(),
  });
}

async function sendCheckoutLinkEmail(settings, { user, profile, session, plan, attribution }) {
  if (!checkoutEmailEnabled()) return { sent: false, skipped: true, reason: "disabled" };
  if (!session.url) return { sent: false, skipped: true, reason: "missing_session_url" };

  const to = normalizeEmail(user.email);
  if (!to) return { sent: false, skipped: true, reason: "missing_user_email" };

  const mailSettings = checkoutMailSettings();
  if (!allowedCheckoutEmailDomains.has(mailSettings.fromDomain)) {
    return { sent: false, skipped: true, reason: "from_domain_not_allowed" };
  }

  const resendApiKey = process.env.RESEND_API_KEY || "";
  if (!resendApiKey) return { sent: false, skipped: true, reason: "resend_not_configured" };

  const alreadySent = await hasRecentCheckoutLinkEmail(settings, to);
  if (alreadySent) return { sent: false, skipped: true, reason: "already_sent_recently" };

  const language = checkoutLanguage(attribution);
  const copy = checkoutLinkCopy({ language, plan, sessionUrl: checkoutContinueUrl(session) });
  const payload = {
    from: mailSettings.from,
    to,
    replyTo: mailSettings.replyTo,
    subject: copy.subject,
    text: checkoutLinkEmailText(copy),
    html: checkoutLinkEmailHtml(copy),
    tags: [
      { name: "source", value: "checkout_link_email" },
      { name: "product", value: "batchcutout" },
    ],
  };

  const resend = new Resend(resendApiKey);
  let sent;
  try {
    sent = await resend.emails.send(payload);
  } catch (error) {
    const reason = error instanceof Error ? error.message.slice(0, 300) : "resend_exception";
    await recordCheckoutLinkEmail(settings, { eventName: "checkout_link_email_failed", user, profile, session, plan, attribution, to, reason });
    return { sent: false, skipped: false, reason: "resend_exception" };
  }

  if (sent.error) {
    await recordCheckoutLinkEmail(settings, {
      eventName: "checkout_link_email_failed",
      user,
      profile,
      session,
      plan,
      attribution,
      to,
      reason: sent.error.message || "resend_error",
    });
    return { sent: false, skipped: false, reason: "resend_error" };
  }

  await recordCheckoutLinkEmail(settings, {
    eventName: "checkout_link_email_sent",
    user,
    profile,
    session,
    plan,
    attribution,
    to,
    resendId: sent.data?.id || "",
  });

  return { sent: true, skipped: false, id: sent.data?.id || "" };
}

function checkoutEmailTimeout() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ sent: false, skipped: true, reason: "timeout" }), checkoutEmailTimeoutMs());
  });
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return sendJson(response, 200, { ok: true });
  }

  if (request.method === "GET") {
    return continueCheckoutSession(request, response);
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

  let user = null;
  let profile = null;
  let plan = "monthly";
  let attribution = {};
  let offering = null;

  try {
    user = await getSupabaseUser(settings, accessToken);
    if (!user?.id) {
      return sendJson(response, 401, { ok: false, error: "invalid_access_token" });
    }

    const body = await readRequestBody(request);
    offering = getCheckoutOffering(body?.plan);
    plan = offering.plan;
    attribution = sanitizeAttribution(body?.attribution);
    if (offering.kind === "subscription" && !offering.priceId) {
      try {
        await recordCheckoutSessionFailed(settings, {
          user,
          plan,
          attribution,
          reason: "stripe_price_not_configured",
          stage: "price_lookup",
        });
      } catch {
        // Checkout response should still report the configuration failure.
      }
      return sendJson(response, 503, { ok: false, error: "stripe_price_not_configured", plan });
    }

    profile = await loadOrCreateProfile(settings, user);
    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          supabase_user_id: user.id,
          batchcutout_plan: offering.kind === "pack" ? "pack" : "pro",
        },
      });
      customerId = customer.id;
      profile = await attachStripeCustomerToProfile(settings, profile, customerId);
    }

    const siteUrl = getSiteUrl();
    const checkoutReturnLanguage = checkoutLanguage(attribution);
    const checkoutReturnLangParam = checkoutReturnLanguage === "pt" ? "" : `lang=${encodeURIComponent(checkoutReturnLanguage)}&`;
    const metadata = {
      supabase_user_id: user.id,
      batchcutout_plan: offering.kind === "pack" ? "pack" : "pro",
      batchcutout_purchase_type: offering.kind,
      batchcutout_price_plan: plan,
      batchcutout_pack_images: offering.kind === "pack" ? String(offering.images) : "",
      ...attribution,
    };
    const commonSession = {
      customer: customerId,
      client_reference_id: user.id,
      allow_promotion_codes: true,
      success_url: `${siteUrl}/?${checkoutReturnLangParam}checkout=success&session_id={CHECKOUT_SESSION_ID}#accountTitle`,
      cancel_url: `${siteUrl}/pricing/?${checkoutReturnLangParam}checkout=cancelled&checkout_plan=${encodeURIComponent(plan)}#pricing-account-title`,
      metadata,
      customer_update: {
        name: "auto",
        address: "auto",
      },
    };
    const session = await stripe.checkout.sessions.create(
      offering.kind === "pack"
        ? {
            ...commonSession,
            mode: "payment",
            line_items: [{ price_data: offering.priceData, quantity: 1 }],
            payment_intent_data: {
              metadata,
            },
          }
        : {
            ...commonSession,
            mode: "subscription",
            line_items: [{ price: offering.priceId, quantity: 1 }],
            subscription_data: {
              metadata,
            },
          },
    );

    try {
      await recordCheckoutSessionCreated(settings, { user, profile, session, plan, attribution, offerKind: offering.kind });
    } catch {
      // Checkout must not fail because analytics storage failed.
    }
    try {
      await Promise.race([
        sendCheckoutLinkEmail(settings, { user, profile, session, plan, attribution }),
        checkoutEmailTimeout(),
      ]);
    } catch {
      // Checkout must not fail because email recovery failed.
    }

    return sendJson(response, 200, {
      ok: true,
      url: session.url,
      plan,
      kind: offering.kind,
      images: offering.kind === "pack" ? offering.images : 0,
      label: getPlanLabel(plan),
      customerId: profile.stripe_customer_id || customerId,
    });
  } catch (error) {
    try {
      await recordCheckoutSessionFailed(settings, {
        user,
        profile,
        plan,
        attribution,
        reason: error instanceof Error ? error.message : "unknown_error",
      });
    } catch {
      // Preserve the checkout error response even if analytics storage fails.
    }
    return sendJson(response, 500, {
      ok: false,
      error: "checkout_session_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
