import { getSupabaseSettings } from "./_pro.js";
import { getStripeClient, updateProfileFromSubscription } from "./_stripe.js";
import { Resend } from "resend";

const attributionKeys = [
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
  "first_campaign",
  "first_landing_page",
  "last_source",
  "last_campaign",
  "last_landing_page",
  "page_path",
  "page_location",
  "language",
  "visitor_id",
  "session_id",
  "limit_variant",
  "free_limit",
];

function webhookJson(status, data) {
  return Response.json(data, { status });
}

function asText(value, maxLength = 1000) {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, maxLength);
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  const valid = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
  return valid ? email : "";
}

function fromEmail(value) {
  const match = String(value || "").match(/<([^<>]+)>/);
  return normalizeEmail(match?.[1] || value);
}

function emailDomain(value) {
  return normalizeEmail(value).split("@")[1] || "";
}

function htmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function firstSubscriptionPrice(subscription) {
  return subscription?.items?.data?.[0]?.price || null;
}

function subscriptionAmountCents(subscription) {
  return (subscription?.items?.data || []).reduce((total, item) => {
    const quantity = Number(item.quantity || 1) || 1;
    const unitAmount = Number(item.price?.unit_amount || 0) || 0;
    return total + unitAmount * quantity;
  }, 0);
}

function stripeObjectId(value) {
  if (!value) return "";
  if (typeof value === "string") return asText(value, 120);
  return asText(value.id, 120);
}

function stripeCustomerId(value) {
  return stripeObjectId(value);
}

function stripeCustomerEmail(value) {
  if (!value) return "";
  if (typeof value === "string") return "";
  return normalizeEmail(value.email || "");
}

function invoiceSubscriptionId(invoice) {
  return stripeObjectId(
    invoice?.subscription ||
      invoice?.parent?.subscription_details?.subscription ||
      invoice?.lines?.data?.[0]?.subscription ||
      "",
  );
}

function checkoutAmountCents(session, subscription) {
  const sessionAmount = Number(session?.amount_total || 0) || 0;
  return sessionAmount || subscriptionAmountCents(subscription);
}

function attributionFromMetadata(metadata = {}) {
  const attribution = {};
  for (const key of attributionKeys) {
    const value = metadata[key];
    if (value === null || value === undefined || value === "") continue;
    attribution[key] = asText(value, 1000);
  }
  return attribution;
}

async function paidEventAlreadyStored(settings, tableName, sessionId) {
  if (!sessionId) return false;

  const query = new URLSearchParams({
    event_name: "eq.pro_subscription_paid",
    event_label: `eq.${sessionId}`,
    select: "id",
    limit: "1",
  });

  const response = await fetch(`${settings.supabaseUrl}/rest/v1/${tableName}?${query}`, {
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
    },
  });

  if (!response.ok) return false;
  const rows = await response.json().catch(() => []);
  return rows.length > 0;
}

async function eventAlreadyStored(settings, tableName, eventName, eventLabel) {
  if (!eventName || !eventLabel) return false;

  const query = new URLSearchParams({
    event_name: `eq.${eventName}`,
    event_label: `eq.${eventLabel}`,
    select: "id",
    limit: "1",
  });

  const response = await fetch(`${settings.supabaseUrl}/rest/v1/${tableName}?${query}`, {
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
    },
  });

  if (!response.ok) return false;
  const rows = await response.json().catch(() => []);
  return rows.length > 0;
}

async function insertWebhookEvent(settings, tableName, row) {
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
    throw new Error(`webhook_event_insert_failed:${response.status}:${detailText.slice(0, 300)}`);
  }
}

async function storePaidSubscriptionEvent(settings, event, session, subscription) {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const sessionId = asText(session?.id, 120);
  if (await paidEventAlreadyStored(settings, tableName, sessionId)) return;

  const metadata = {
    ...(session?.metadata || {}),
    ...(subscription?.metadata || {}),
  };
  const attribution = attributionFromMetadata(metadata);
  const amountCents = checkoutAmountCents(session, subscription);
  const currency = asText(session?.currency || firstSubscriptionPrice(subscription)?.currency || subscription?.currency || "eur", 20);
  const value = Math.round(amountCents) / 100;
  const detail = {
    ...attribution,
    stripe_event_id: asText(event?.id, 120),
    stripe_session_id: sessionId,
    stripe_customer_id: asText(typeof session?.customer === "string" ? session.customer : session?.customer?.id, 120),
    stripe_subscription_id: asText(subscription?.id, 120),
    stripe_price_id: asText(firstSubscriptionPrice(subscription)?.id, 120),
    plan: asText(metadata.batchcutout_price_plan || "monthly", 80),
    plan_label: asText(metadata.batchcutout_price_plan || "monthly", 80),
    subscription_status: asText(subscription?.status, 80),
    amount_cents: amountCents,
    amount: value,
    currency: currency.toUpperCase(),
  };
  const row = {
    event_name: "pro_subscription_paid",
    event_category: "revenue",
    event_label: sessionId,
    page_path: asText(attribution.page_path, 500),
    page_location: asText(attribution.page_location, 1000),
    language: asText(attribution.language, 20),
    session_id: asText(attribution.session_id, 80),
    visitor_id: asText(attribution.visitor_id, 80),
    source: asText(attribution.utm_source || attribution.source || attribution.last_source || attribution.first_source, 160),
    campaign: asText(attribution.utm_campaign || attribution.campaign || attribution.last_campaign || attribution.first_campaign, 160),
    free_limit: Number(attribution.free_limit || 0) || null,
    value,
    detail,
    occurred_at: new Date(Number(event?.created || Date.now() / 1000) * 1000).toISOString(),
  };

  await insertWebhookEvent(settings, tableName, row);
}

function proWelcomeCopy(language = "en") {
  if (String(language || "").toLowerCase().startsWith("pt")) {
    return {
      subject: "O seu BatchCutout Pro está ativo",
      heading: "BatchCutout Pro está ativo",
      intro: "O seu acesso Pro já está disponível.",
      usage: "Pode processar até 100 imagens por lote e até 2.000 imagens por mês.",
      next: "Comece com um lote real de produto para confirmar o fluxo de PNG transparente e ZIP.",
      toolCta: "Abrir BatchCutout",
      pricingCta: "Gerir plano",
      tips: ["Arraste um lote de fotos de produto.", "Remova fundos e descarregue PNGs transparentes.", "Use ZIP quando quiser entregar ou arquivar o lote completo."],
      footer: "NexaFlow Labs. Pode gerir o pagamento no painel da conta BatchCutout.",
      toolUrl: "https://batchcutout.com/?utm_source=email&utm_medium=onboarding&utm_campaign=pro_welcome#tool",
      pricingUrl: "https://batchcutout.com/pricing/?utm_source=email&utm_medium=onboarding&utm_campaign=pro_welcome#pricing-account-title",
    };
  }

  return {
    subject: "Your BatchCutout Pro is active",
    heading: "BatchCutout Pro is active",
    intro: "Your Pro access is now available.",
    usage: "You can process up to 100 images per batch and up to 2,000 images per month.",
    next: "Start with a real product batch to confirm your transparent PNG and ZIP workflow.",
    toolCta: "Open BatchCutout",
    pricingCta: "Manage plan",
    tips: ["Drag in a batch of product photos.", "Remove backgrounds and download transparent PNGs.", "Use ZIP when you want to deliver or archive the full batch."],
    footer: "NexaFlow Labs. You can manage billing from your BatchCutout account panel.",
    toolUrl: "https://batchcutout.com/?lang=en&utm_source=email&utm_medium=onboarding&utm_campaign=pro_welcome#tool",
    pricingUrl: "https://batchcutout.com/pricing/?lang=en&utm_source=email&utm_medium=onboarding&utm_campaign=pro_welcome#pricing-account-title",
  };
}

function proWelcomeText(copy) {
  return [
    copy.heading,
    "",
    copy.intro,
    copy.usage,
    "",
    copy.next,
    "",
    ...copy.tips.map((tip) => `- ${tip}`),
    "",
    `${copy.toolCta}:`,
    copy.toolUrl,
    "",
    `${copy.pricingCta}:`,
    copy.pricingUrl,
    "",
    copy.footer,
  ].join("\n");
}

function proWelcomeHtml(copy) {
  const tips = copy.tips.map((tip) => `<li>${htmlEscape(tip)}</li>`).join("");
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
                <h1 style="margin:0 0 14px;font-size:28px;line-height:1.1;">${htmlEscape(copy.heading)}</h1>
                <p style="margin:0 0 16px;line-height:1.55;color:#52606d;">${htmlEscape(copy.intro)}</p>
                <p style="margin:0 0 18px;line-height:1.55;color:#52606d;">${htmlEscape(copy.usage)}</p>
                <p style="margin:0 0 18px;line-height:1.55;color:#52606d;">${htmlEscape(copy.next)}</p>
                <ul style="margin:0 0 22px;padding-left:20px;color:#52606d;line-height:1.55;">${tips}</ul>
                <p style="margin:0 0 12px;"><a href="${htmlEscape(copy.toolUrl)}" style="display:inline-block;background:#2646d8;color:#ffffff;text-decoration:none;font-weight:700;border-radius:8px;padding:13px 18px;">${htmlEscape(copy.toolCta)}</a></p>
                <a href="${htmlEscape(copy.pricingUrl)}" style="display:inline-block;background:#eef8f5;color:#0f766e;text-decoration:none;font-weight:700;border-radius:8px;padding:12px 16px;">${htmlEscape(copy.pricingCta)}</a>
              </td>
            </tr>
            <tr><td style="padding:18px 26px;border-top:1px solid #dbe3ee;color:#697483;font-size:12px;line-height:1.45;">${htmlEscape(copy.footer)}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function recordProWelcomeEvent(settings, tableName, eventName, session, detail = {}) {
  const sessionId = asText(session?.id, 120);
  await insertWebhookEvent(settings, tableName, {
    event_name: eventName,
    event_category: "email",
    event_label: sessionId,
    page_path: "",
    page_location: "",
    language: asText(detail.language, 20),
    session_id: asText(detail.session_id, 80),
    visitor_id: asText(detail.visitor_id, 80),
    source: "email",
    campaign: "pro_welcome",
    free_limit: null,
    value: 0,
    detail,
    occurred_at: new Date().toISOString(),
  });
}

async function recordRevenueRiskEvent(settings, event, eventName, eventLabel, detail = {}, value = 0) {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const label = asText(eventLabel, 120);
  if (!label) return { stored: false, skipped: true, reason: "missing_event_label" };
  if (await eventAlreadyStored(settings, tableName, eventName, label)) {
    return { stored: false, skipped: true, reason: "already_stored" };
  }

  await insertWebhookEvent(settings, tableName, {
    event_name: eventName,
    event_category: "revenue",
    event_label: label,
    page_path: "",
    page_location: "",
    language: asText(detail.language, 20),
    session_id: asText(detail.session_id, 80),
    visitor_id: asText(detail.visitor_id, 80),
    source: "stripe",
    campaign: "subscription_lifecycle",
    free_limit: null,
    value: Number(value || 0) || 0,
    detail,
    occurred_at: new Date(Number(event?.created || Date.now() / 1000) * 1000).toISOString(),
  });

  return { stored: true, skipped: false };
}

async function recordInvoicePaymentFailure(settings, event) {
  const invoice = event.data.object;
  const amountCents = Number(invoice?.amount_remaining || invoice?.amount_due || 0) || 0;
  const currency = asText(invoice?.currency || "eur", 20);
  const detail = {
    stripe_event_id: asText(event?.id, 120),
    stripe_invoice_id: asText(invoice?.id, 120),
    stripe_subscription_id: invoiceSubscriptionId(invoice),
    stripe_customer_id: stripeCustomerId(invoice?.customer),
    customer_email: normalizeEmail(invoice?.customer_email || stripeCustomerEmail(invoice?.customer) || ""),
    amount_cents: amountCents,
    currency: currency.toUpperCase(),
    attempt_count: Number(invoice?.attempt_count || 0) || 0,
    next_payment_attempt: invoice?.next_payment_attempt ? new Date(Number(invoice.next_payment_attempt) * 1000).toISOString() : "",
    hosted_invoice_url: asText(invoice?.hosted_invoice_url, 500),
  };

  return recordRevenueRiskEvent(settings, event, "pro_payment_failed", detail.stripe_invoice_id || event?.id, detail, amountCents / 100);
}

async function recordSubscriptionRiskEvent(settings, event, subscription) {
  const subscriptionId = asText(subscription?.id, 120);
  const status = asText(subscription?.status, 80);
  const metadata = subscription?.metadata || {};
  const detail = {
    stripe_event_id: asText(event?.id, 120),
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: stripeCustomerId(subscription?.customer),
    customer_email: stripeCustomerEmail(subscription?.customer),
    plan: asText(metadata.batchcutout_price_plan || "", 80),
    status,
    cancel_at_period_end: Boolean(subscription?.cancel_at_period_end),
    current_period_end: subscription?.current_period_end ? new Date(Number(subscription.current_period_end) * 1000).toISOString() : "",
    canceled_at: subscription?.canceled_at ? new Date(Number(subscription.canceled_at) * 1000).toISOString() : "",
    ended_at: subscription?.ended_at ? new Date(Number(subscription.ended_at) * 1000).toISOString() : "",
    language: asText(metadata.language, 20),
    session_id: asText(metadata.session_id, 80),
    visitor_id: asText(metadata.visitor_id, 80),
  };

  if (event.type === "customer.subscription.deleted" || status === "canceled") {
    return recordRevenueRiskEvent(settings, event, "pro_subscription_canceled", subscriptionId, detail, 0);
  }

  if (subscription?.cancel_at_period_end) {
    return recordRevenueRiskEvent(settings, event, "pro_subscription_cancel_scheduled", subscriptionId, detail, 0);
  }

  return { stored: false, skipped: true, reason: "not_revenue_risk" };
}

async function sendProWelcomeEmail(settings, event, session, subscription, profile = null) {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const sessionId = asText(session?.id, 120);
  if (!sessionId) return { sent: false, skipped: true, reason: "missing_session_id" };
  if (await eventAlreadyStored(settings, tableName, "pro_welcome_email_sent", sessionId)) {
    return { sent: false, skipped: true, reason: "already_sent" };
  }

  const metadata = {
    ...(session?.metadata || {}),
    ...(subscription?.metadata || {}),
  };
  const to = normalizeEmail(session?.customer_details?.email || session?.customer_email || profile?.email || "");
  const baseDetail = {
    stripe_event_id: asText(event?.id, 120),
    stripe_session_id: sessionId,
    stripe_subscription_id: asText(subscription?.id, 120),
    plan: asText(metadata.batchcutout_price_plan || "monthly", 80),
    email: to,
    language: asText(metadata.language || profile?.language || "", 20),
    session_id: asText(metadata.session_id, 80),
    visitor_id: asText(metadata.visitor_id, 80),
  };

  if (!to) {
    await recordProWelcomeEvent(settings, tableName, "pro_welcome_email_failed", session, {
      ...baseDetail,
      reason: "missing_customer_email",
    });
    return { sent: false, skipped: false, reason: "missing_customer_email" };
  }

  const resendApiKey = process.env.RESEND_API_KEY || "";
  if (!resendApiKey) {
    await recordProWelcomeEvent(settings, tableName, "pro_welcome_email_failed", session, {
      ...baseDetail,
      reason: "resend_not_configured",
    });
    return { sent: false, skipped: false, reason: "resend_not_configured" };
  }

  const from = process.env.PRO_WELCOME_FROM || process.env.SUPPORT_REPLY_FROM || "BatchCutout <support@batchcutout.com>";
  const replyTo = process.env.PRO_WELCOME_REPLY_TO || process.env.SUPPORT_REPLY_TO || "support@batchcutout.com";
  const fromAddress = fromEmail(from);
  const copy = proWelcomeCopy(baseDetail.language);
  const resend = new Resend(resendApiKey);
  const payload = {
    from,
    to,
    replyTo,
    subject: copy.subject,
    text: proWelcomeText(copy),
    html: proWelcomeHtml(copy),
    tags: [
      { name: "product", value: "batchcutout" },
      { name: "type", value: "pro_welcome" },
    ],
  };

  try {
    const sent = await resend.emails.send(payload);
    if (sent.error) {
      await recordProWelcomeEvent(settings, tableName, "pro_welcome_email_failed", session, {
        ...baseDetail,
        fromDomain: emailDomain(fromAddress),
        reason: sent.error.message || "resend_error",
      });
      return { sent: false, skipped: false, reason: "resend_error" };
    }

    await recordProWelcomeEvent(settings, tableName, "pro_welcome_email_sent", session, {
      ...baseDetail,
      fromDomain: emailDomain(fromAddress),
      resend_id: sent.data?.id || "",
    });
    return { sent: true, skipped: false };
  } catch (error) {
    await recordProWelcomeEvent(settings, tableName, "pro_welcome_email_failed", session, {
      ...baseDetail,
      fromDomain: emailDomain(fromAddress),
      reason: error instanceof Error ? error.message.slice(0, 300) : "resend_exception",
    });
    return { sent: false, skipped: false, reason: "resend_exception" };
  }
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
        const profile = await updateProfileFromSubscription(settings, subscription, session.client_reference_id);
        try {
          await storePaidSubscriptionEvent(settings, event, session, subscription);
        } catch (error) {
          console.error("BatchCutout paid subscription event failed", error);
        }
        try {
          await sendProWelcomeEmail(settings, event, session, subscription, profile);
        } catch (error) {
          console.error("BatchCutout pro welcome email failed", error);
        }
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object;
      await updateProfileFromSubscription(settings, subscription);
      try {
        await recordSubscriptionRiskEvent(settings, event, subscription);
      } catch (error) {
        console.error("BatchCutout subscription risk event failed", error);
      }
    }

    if (event.type === "invoice.payment_failed") {
      try {
        await recordInvoicePaymentFailure(settings, event);
      } catch (error) {
        console.error("BatchCutout payment failure event failed", error);
      }
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
