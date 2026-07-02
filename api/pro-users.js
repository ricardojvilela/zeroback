import crypto from "node:crypto";
import { Resend } from "resend";
import { getSupabaseSettings, sendJson, readRequestBody, supabaseUpdateByUserId } from "./_pro.js";
import { getStripeClient } from "./_stripe.js";

const defaultOutreachFrom = "BatchCutout <support@batchcutout.com>";
const defaultOutreachReplyTo = "support@batchcutout.com";
const defaultSupportFrom = "BatchCutout Support <support@batchcutout.com>";
const allowedOutreachDomains = new Set(["batchcutout.com"]);

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

function mapUser(row) {
  const monthlyLimit = Number(row.monthly_image_limit || 0) || 0;
  const monthlyUsed = Number(row.monthly_images_used || 0) || 0;
  return {
    userId: row.user_id,
    email: row.email || "",
    plan: row.plan || "free",
    planStatus: row.plan_status || "active",
    batchLimit: Number(row.batch_limit || 0) || 0,
    monthlyLimit,
    monthlyUsed,
    monthlyRemaining: Math.max(monthlyLimit - monthlyUsed, 0),
    periodStart: row.current_period_start || "",
    periodEnd: row.current_period_end || "",
    stripeCustomerId: row.stripe_customer_id || "",
    stripeSubscriptionId: row.stripe_subscription_id || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || row.created_at || "",
  };
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

function outreachSettings() {
  const from = process.env.OUTREACH_FROM || defaultOutreachFrom;
  const replyTo = process.env.OUTREACH_REPLY_TO || defaultOutreachReplyTo;
  const fromAddress = fromEmail(from);
  return {
    from,
    replyTo,
    fromAddress,
    fromDomain: emailDomain(fromAddress),
  };
}

function supportSettings() {
  const from = process.env.SUPPORT_REPLY_FROM || defaultSupportFrom;
  const replyTo = process.env.SUPPORT_REPLY_TO || "support@batchcutout.com";
  const fromAddress = fromEmail(from);
  return {
    from,
    replyTo,
    fromAddress,
    fromDomain: emailDomain(fromAddress),
  };
}

function stripeDate(seconds) {
  return seconds ? new Date(seconds * 1000).toISOString() : "";
}

function getCustomer(subscription) {
  if (typeof subscription.customer === "string") {
    return { id: subscription.customer, email: "" };
  }

  return {
    id: subscription.customer?.id || "",
    email: subscription.customer?.email || "",
  };
}

function productName(price) {
  if (!price?.product) return price?.nickname || price?.id || "Plano Stripe";
  if (typeof price.product === "string") return price.nickname || price.product;
  return price.product.name || price.nickname || price.id || "Plano Stripe";
}

function intervalLabel(interval, intervalCount) {
  const count = Number(intervalCount || 1) || 1;
  const labels = {
    day: count === 1 ? "dia" : `${count} dias`,
    week: count === 1 ? "semana" : `${count} semanas`,
    month: count === 1 ? "mes" : `${count} meses`,
    year: count === 1 ? "ano" : `${count} anos`,
  };
  return labels[interval] || interval || "";
}

function monthlyEquivalent(amount, interval, intervalCount) {
  const count = Number(intervalCount || 1) || 1;
  if (interval === "day") return Math.round((amount * 365) / 12 / count);
  if (interval === "week") return Math.round((amount * 52) / 12 / count);
  if (interval === "year") return Math.round(amount / 12 / count);
  return Math.round(amount / count);
}

function subscriptionPricing(subscription) {
  const items = subscription.items?.data || [];
  const firstPrice = items[0]?.price || null;
  const currency = firstPrice?.currency || subscription.currency || "eur";
  let amount = 0;
  let monthlyAmount = 0;

  for (const item of items) {
    const price = item.price || {};
    const quantity = Number(item.quantity || 1) || 1;
    const unitAmount = Number(price.unit_amount || 0) || 0;
    const lineAmount = unitAmount * quantity;
    amount += lineAmount;
    monthlyAmount += monthlyEquivalent(lineAmount, price.recurring?.interval, price.recurring?.interval_count);
  }

  return {
    amount,
    monthlyAmount,
    currency,
    interval: intervalLabel(firstPrice?.recurring?.interval, firstPrice?.recurring?.interval_count),
    planName: productName(firstPrice),
    priceId: firstPrice?.id || "",
  };
}

function hasProAccessProfile(profile = null) {
  return profile?.plan === "pro" && ["active", "manual"].includes(profile?.planStatus);
}

function subscriptionBusinessType(subscription, profile = null) {
  const status = String(subscription?.status || "");
  const manualAccess = profile?.plan === "pro" && profile?.planStatus === "manual";
  const linked = Boolean(profile?.userId);

  if (status === "canceled") {
    return {
      key: "canceled",
      label: "Cancelada",
      tone: "muted",
      note: "Historico Stripe, nao conta para MRR.",
    };
  }

  if (subscription?.cancel_at_period_end) {
    return {
      key: "canceling",
      label: "Fim de periodo",
      tone: "warning",
      note: "Cliente ativo ate ao fim do periodo; nao deve ser tratado como renovacao futura.",
    };
  }

  if (manualAccess) {
    return {
      key: "manual_pro",
      label: "Pro manual/gratis",
      tone: "warning",
      note: "Acesso interno ou cortesia; nao conta para MRR.",
    };
  }

  if (["incomplete", "incomplete_expired", "past_due", "unpaid", "paused"].includes(status)) {
    return {
      key: "payment_issue",
      label: "Pagamento pendente",
      tone: "danger",
      note: "Rever pagamento, estado Stripe ou tentativa incompleta.",
    };
  }

  if (!linked) {
    return {
      key: "unlinked",
      label: "Sem ligacao",
      tone: "warning",
      note: "Existe no Stripe mas ainda nao esta ligada a uma conta BatchCutout.",
    };
  }

  if (status === "active" && !hasProAccessProfile(profile)) {
    return {
      key: "paid_no_access",
      label: "Pagamento sem acesso",
      tone: "danger",
      note: "Existe pagamento ativo, mas a conta BatchCutout nao tem Pro ativo.",
    };
  }

  if (status === "active") {
    return {
      key: "paid_customer",
      label: "Cliente pagante",
      tone: "success",
      note: "Conta paga recorrente; conta para MRR.",
    };
  }

  return {
    key: "review",
    label: "Rever",
    tone: "warning",
    note: "Estado Stripe pouco comum; confirmar manualmente.",
  };
}

function mapSubscription(subscription, profile = null) {
  const customer = getCustomer(subscription);
  const pricing = subscriptionPricing(subscription);
  const manualAccess = profile?.plan === "pro" && profile?.planStatus === "manual";
  const businessType = subscriptionBusinessType(subscription, profile);

  return {
    id: subscription.id,
    status: subscription.status || "",
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    currentPeriodStart: stripeDate(subscription.current_period_start),
    currentPeriodEnd: stripeDate(subscription.current_period_end),
    canceledAt: stripeDate(subscription.canceled_at),
    createdAt: stripeDate(subscription.created),
    customerId: customer.id,
    customerEmail: customer.email || profile?.email || "",
    profileEmail: profile?.email || "",
    linkedToSupabase: Boolean(profile?.userId),
    linkSource: profile?.linkSource || "",
    accessPlan: profile?.plan || "",
    accessStatus: profile?.planStatus || "",
    businessType,
    revenueExcluded: Boolean(manualAccess),
    revenueExclusionReason: manualAccess ? "manual_pro_access" : "",
    monthlyUsed: profile?.monthlyUsed || 0,
    monthlyLimit: profile?.monthlyLimit || 0,
    monthlyRemaining: profile?.monthlyRemaining || 0,
    batchLimit: profile?.batchLimit || 0,
    stripeDashboardUrl: `https://dashboard.stripe.com/subscriptions/${subscription.id}`,
    customerDashboardUrl: customer.id ? `https://dashboard.stripe.com/customers/${customer.id}` : "",
    ...pricing,
  };
}

function summarizeSubscriptions(subscriptions) {
  const summary = {
    total: subscriptions.length,
    active: 0,
    renewing: 0,
    stripeRenewing: 0,
    nonRevenueRenewing: 0,
    canceled: 0,
    attention: 0,
    cancelAtPeriodEnd: 0,
    unlinked: 0,
    mrrAmount: 0,
    excludedMrrAmount: 0,
    currency: "eur",
    businessTypes: {
      paid_customer: 0,
      manual_pro: 0,
      paid_no_access: 0,
      canceling: 0,
      canceled: 0,
      payment_issue: 0,
      unlinked: 0,
      review: 0,
    },
  };

  for (const subscription of subscriptions) {
    const typeKey = subscription.businessType?.key || "review";
    summary.businessTypes[typeKey] = (summary.businessTypes[typeKey] || 0) + 1;
    if (subscription.currency) summary.currency = subscription.currency;
    if (subscription.status === "active") {
      summary.active += 1;
      if (!subscription.cancelAtPeriodEnd) {
        summary.stripeRenewing += 1;
        if (subscription.revenueExcluded) {
          summary.nonRevenueRenewing += 1;
          summary.excludedMrrAmount += Number(subscription.monthlyAmount || 0) || 0;
        } else {
          summary.renewing += 1;
          summary.mrrAmount += Number(subscription.monthlyAmount || 0) || 0;
        }
      }
    }
    if (subscription.status === "canceled") summary.canceled += 1;
    if (subscription.cancelAtPeriodEnd) summary.cancelAtPeriodEnd += 1;
    if (!subscription.linkedToSupabase) summary.unlinked += 1;
    if (
      subscription.cancelAtPeriodEnd ||
      ["incomplete", "incomplete_expired", "past_due", "unpaid", "paused"].includes(subscription.status) ||
      ["paid_no_access", "unlinked"].includes(typeKey)
    ) {
      summary.attention += 1;
    }
    if (subscription.status === "active" && !subscription.cancelAtPeriodEnd && subscription.revenueExcluded) {
      summary.attention += 1;
    }
  }

  return summary;
}

function monthPeriod() {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function listUsers(settings) {
  const query = new URLSearchParams({
    select: "user_id,email,plan,plan_status,batch_limit,monthly_image_limit,monthly_images_used,current_period_start,current_period_end,stripe_customer_id,stripe_subscription_id,updated_at,created_at",
    order: "updated_at.desc.nullslast,created_at.desc.nullslast",
    limit: "100",
  });
  const response = await fetch(`${settings.supabaseUrl}/rest/v1/${settings.usersTable}?${query}`, {
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`list_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  const rows = await response.json();
  return rows.map(mapUser);
}

async function listSubscriptions(settings) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("stripe_not_configured");
  }

  const [profiles, stripeList] = await Promise.all([
    listUsers(settings),
    stripe.subscriptions.list({
      status: "all",
      limit: 100,
      expand: ["data.customer"],
    }),
  ]);

  const profilesBySubscription = new Map();
  const profilesByCustomer = new Map();
  const profilesByEmail = new Map();
  for (const profile of profiles) {
    if (profile.stripeSubscriptionId) profilesBySubscription.set(profile.stripeSubscriptionId, profile);
    if (profile.stripeCustomerId) profilesByCustomer.set(profile.stripeCustomerId, profile);
    if (profile.email) profilesByEmail.set(normalizeEmail(profile.email), profile);
  }

  const subscriptions = stripeList.data
    .map((subscription) => {
      const customer = getCustomer(subscription);
      const profileBySubscription = profilesBySubscription.get(subscription.id);
      const profileByCustomer = profilesByCustomer.get(customer.id);
      const profileByEmail = profilesByEmail.get(normalizeEmail(customer.email));
      const profile = profileBySubscription || profileByCustomer || profileByEmail || null;
      if (profile) {
        profile.linkSource = profileBySubscription
          ? "stripe_subscription_id"
          : profileByCustomer
            ? "stripe_customer_id"
            : "email";
      }
      return mapSubscription(subscription, profile);
    })
    .sort((a, b) => {
      const aTime = new Date(a.currentPeriodEnd || a.createdAt || 0).getTime();
      const bTime = new Date(b.currentPeriodEnd || b.createdAt || 0).getTime();
      return bTime - aTime;
    });

  return {
    generatedAt: new Date().toISOString(),
    summary: summarizeSubscriptions(subscriptions),
    subscriptions,
  };
}

async function cancelSubscriptionRenewal(subscriptionId) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("stripe_not_configured");
  }

  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
    expand: ["customer"],
  });

  return mapSubscription(subscription);
}

async function insertSupportEvent(settings, eventName, detail, eventLabel = "") {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const response = await fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}`, {
    method: "POST",
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      event_name: eventName,
      event_category: "support",
      event_label: cleanText(eventLabel || detail.email_id || detail.message_id || "support_email", 160),
      source: "support_email",
      campaign: eventName,
      value: 0,
      detail,
      occurred_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const detailText = await response.text();
    throw new Error(`support_event_insert_failed:${response.status}:${detailText.slice(0, 300)}`);
  }
}

async function insertCommercialEvent(settings, eventName, detail, eventLabel = "") {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const response = await fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}`, {
    method: "POST",
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      event_name: eventName,
      event_category: "commercial_recovery",
      event_label: cleanText(eventLabel || detail.email || detail.stripe_session_id || eventName, 160),
      source: "email",
      campaign: cleanText(detail.segment || eventName, 160),
      value: 0,
      detail,
      occurred_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const detailText = await response.text();
    throw new Error(`commercial_event_insert_failed:${response.status}:${detailText.slice(0, 300)}`);
  }
}

function supportMessageFromEvent(event, replyIds, resolvedIds) {
  const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
  const emailId = cleanText(detail.email_id || event.event_label || "", 120);
  const text = cleanText(detail.text || "", 5000);
  const html = cleanText(detail.html || "", 5000);
  const replied = replyIds.has(emailId);
  const resolved = resolvedIds.has(emailId);
  return {
    id: event.id,
    emailId,
    messageId: cleanText(detail.message_id || "", 320),
    from: cleanText(detail.from || "", 320),
    to: Array.isArray(detail.to) ? detail.to.slice(0, 10) : [],
    subject: cleanText(detail.subject || "(sem assunto)", 500),
    preview: cleanText(text || html.replace(/<[^>]+>/g, " "), 700),
    receivedAt: event.occurred_at,
    hasAttachments: Array.isArray(detail.attachments) && detail.attachments.length > 0,
    attachmentCount: Array.isArray(detail.attachments) ? detail.attachments.length : 0,
    replied,
    resolved,
    closed: replied || resolved,
  };
}

async function listSupportMailbox(settings) {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const query = new URLSearchParams({
    select: "id,event_name,event_label,detail,occurred_at",
    event_name: "in.(support_email_received,support_email_replied,support_email_resolved)",
    order: "occurred_at.desc",
    limit: "200",
  });
  const response = await fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}?${query}`, {
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`support_mailbox_read_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  const events = await response.json();
  const replyIds = new Set(
    events
      .filter((event) => event.event_name === "support_email_replied")
      .map((event) => cleanText(event.detail?.in_reply_to_email_id || "", 120))
      .filter(Boolean),
  );
  const resolvedIds = new Set(
    events
      .filter((event) => event.event_name === "support_email_resolved")
      .map((event) => cleanText(event.detail?.in_reply_to_email_id || "", 120))
      .filter(Boolean),
  );
  const messages = events
    .filter((event) => event.event_name === "support_email_received")
    .map((event) => supportMessageFromEvent(event, replyIds, resolvedIds));

  return {
    generatedAt: new Date().toISOString(),
    messages,
    summary: {
      total: messages.length,
      unreplied: messages.filter((message) => !message.closed).length,
      replied: messages.filter((message) => message.replied).length,
      resolved: messages.filter((message) => message.resolved && !message.replied).length,
      closed: messages.filter((message) => message.closed).length,
    },
  };
}

async function resolveSupportEmail(settings, body) {
  const inboundEmailId = cleanText(body.inboundEmailId, 120);
  if (!inboundEmailId) {
    return { status: 400, body: { ok: false, error: "invalid_support_resolve_payload" } };
  }

  await insertSupportEvent(settings, "support_email_resolved", {
    in_reply_to_email_id: inboundEmailId,
    resolved_by: "admin",
  }, inboundEmailId);

  return {
    status: 200,
    body: {
      ok: true,
      inboundEmailId,
    },
  };
}

async function listLeadCaptures(settings) {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const leadQuery = new URLSearchParams({
    select: "id,event_name,event_label,detail,source,campaign,occurred_at",
    event_name: "eq.lead_capture_submitted",
    order: "occurred_at.desc",
    limit: "250",
  });
  const replyQuery = new URLSearchParams({
    select: "id,event_name,event_label,detail,occurred_at",
    event_name: "in.(lead_capture_autoreply_sent,lead_capture_autoreply_failed)",
    order: "occurred_at.desc",
    limit: "500",
  });

  const [response, replyResponse] = await Promise.all([
    fetch(`${settings.supabaseUrl}/rest/v1/${tableName}?${leadQuery}`, {
      headers: {
        apikey: settings.serviceRoleKey,
        Authorization: `Bearer ${settings.serviceRoleKey}`,
      },
    }),
    fetch(`${settings.supabaseUrl}/rest/v1/${tableName}?${replyQuery}`, {
      headers: {
        apikey: settings.serviceRoleKey,
        Authorization: `Bearer ${settings.serviceRoleKey}`,
      },
    }),
  ]);

  if (!response.ok) {
    const detailText = await response.text();
    throw new Error(`lead_capture_read_failed:${response.status}:${detailText.slice(0, 300)}`);
  }
  if (!replyResponse.ok) {
    const detailText = await replyResponse.text();
    throw new Error(`lead_capture_reply_read_failed:${replyResponse.status}:${detailText.slice(0, 300)}`);
  }

  const repliesByEmail = new Map();
  const replyEvents = await replyResponse.json();
  for (const event of replyEvents) {
    const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
    const email = normalizeEmail(event.event_label || detail.email);
    if (!email || repliesByEmail.has(email)) continue;
    repliesByEmail.set(email, {
      eventName: event.event_name || "",
      occurredAt: event.occurred_at || "",
      reason: cleanText(detail.reason, 200),
      resendId: cleanText(detail.resend_id, 120),
    });
  }

  const seen = new Set();
  const leads = [];
  const events = await response.json();
  for (const event of events) {
    const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
    const email = normalizeEmail(detail.email);
    if (!email || seen.has(email)) continue;
    seen.add(email);
    const reply = repliesByEmail.get(email) || null;
    leads.push({
      email,
      language: cleanText(detail.language, 20) || "en",
      source: cleanText(detail.source || event.source || detail.utm_source || detail.last_source || detail.first_source, 160),
      campaign: cleanText(event.campaign || detail.utm_campaign || detail.last_campaign || detail.first_campaign, 160),
      downloadType: cleanText(detail.downloadType, 80),
      count: Number(detail.count || 0) || 0,
      capturedAt: event.occurred_at || "",
      pageLocation: cleanText(detail.page_location, 1000),
      autoReplySentAt: reply?.eventName === "lead_capture_autoreply_sent" ? reply.occurredAt : "",
      autoReplyFailedAt: reply?.eventName === "lead_capture_autoreply_failed" ? reply.occurredAt : "",
      autoReplyFailureReason: reply?.eventName === "lead_capture_autoreply_failed" ? reply.reason : "",
      autoReplyResendId: reply?.resendId || "",
    });
  }

  return {
    leads,
    summary: {
      total: leads.length,
      autoReplySent: leads.filter((lead) => lead.autoReplySentAt).length,
      autoReplyFailed: leads.filter((lead) => lead.autoReplyFailedAt).length,
      manualPending: leads.filter((lead) => !lead.autoReplySentAt).length,
    },
    generatedAt: new Date().toISOString(),
  };
}

function recoveryEmailFromEvent(event) {
  const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
  return {
    id: event.id,
    email: normalizeEmail(detail.email),
    segment: cleanText(detail.segment, 80),
    stripeSessionId: cleanText(detail.stripe_session_id, 160),
    plan: cleanText(detail.plan, 80),
    subject: cleanText(detail.subject, 160),
    sentAt: event.occurred_at || "",
    resendId: cleanText(detail.resend_id, 120),
  };
}

async function listRecoveryEmails(settings) {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const query = new URLSearchParams({
    select: "id,event_name,event_label,detail,occurred_at",
    event_name: "eq.recovery_email_sent",
    order: "occurred_at.desc",
    limit: "1000",
  });
  const response = await fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}?${query}`, {
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`recovery_emails_read_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  const emails = (await response.json())
    .map(recoveryEmailFromEvent)
    .filter((email) => email.email && email.segment);

  return {
    emails,
    summary: {
      total: emails.length,
      checkoutNotPaid: emails.filter((email) => email.segment === "checkout_not_paid").length,
      accountNoCheckout: emails.filter((email) => email.segment === "account_no_checkout").length,
      leads: emails.filter((email) => email.segment === "lead_capture" || email.segment === "lead_capture_pt").length,
      proof: emails.filter((email) => email.segment === "proof").length,
    },
    generatedAt: new Date().toISOString(),
  };
}

function profileHasProAccess(profile = null) {
  return profile?.plan === "pro" || Number(profile?.monthlyLimit || 0) > 0;
}

function checkoutRecoveryFromEvent(event, profile, recoveryEvent = null) {
  const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
  const recoveryDetail = recoveryEvent?.detail && typeof recoveryEvent.detail === "object" ? recoveryEvent.detail : {};
  const createdAt = event.occurred_at || "";
  const hoursSinceCreated = createdAt
    ? Math.max((Date.now() - new Date(createdAt).getTime()) / 36e5, 0)
    : 0;
  const plan = cleanText(detail.plan || detail.price_plan || event.event_label || "monthly", 80);

  return {
    email: profile?.email || "",
    userId: cleanText(detail.supabase_user_id || profile?.userId || "", 120),
    plan,
    stripeSessionId: cleanText(detail.stripe_session_id || "", 160),
    stripeCustomerId: cleanText(detail.stripe_customer_id || profile?.stripeCustomerId || "", 160),
    source: cleanText(detail.utm_source || detail.source || event.source || detail.last_source || detail.first_source, 160),
    campaign: cleanText(event.campaign || detail.utm_campaign || detail.campaign || detail.last_campaign || detail.first_campaign, 160),
    pageLocation: cleanText(detail.page_location, 1000),
    createdAt,
    hoursSinceCreated: Math.round(hoursSinceCreated * 10) / 10,
    recoverable: hoursSinceCreated >= 2 && !recoveryEvent,
    tooFresh: hoursSinceCreated < 2,
    recoverySentAt: recoveryEvent?.occurred_at || "",
    recoveryResendId: cleanText(recoveryDetail.resend_id, 120),
  };
}

async function listCheckoutRecoveries(settings) {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const eventQuery = new URLSearchParams({
    select: "id,event_name,event_label,detail,source,campaign,occurred_at",
    event_name: "in.(pro_checkout_session_created,pro_subscription_paid,recovery_email_sent)",
    order: "occurred_at.desc",
    limit: "750",
  });

  const [eventsResponse, profiles] = await Promise.all([
    fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}?${eventQuery}`, {
      headers: {
        apikey: settings.serviceRoleKey,
        Authorization: `Bearer ${settings.serviceRoleKey}`,
      },
    }),
    listUsers(settings),
  ]);

  if (!eventsResponse.ok) {
    const detail = await eventsResponse.text();
    throw new Error(`checkout_recoveries_read_failed:${eventsResponse.status}:${detail.slice(0, 300)}`);
  }

  const profilesByUser = new Map();
  const profilesByCustomer = new Map();
  for (const profile of profiles) {
    if (profile.userId) profilesByUser.set(profile.userId, profile);
    if (profile.stripeCustomerId) profilesByCustomer.set(profile.stripeCustomerId, profile);
  }

  const events = await eventsResponse.json();
  const paidSessionIds = new Set();
  const recoveryBySession = new Map();
  const recoveryByEmail = new Map();
  const checkoutEvents = [];

  for (const event of events) {
    const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
    const stripeSessionId = cleanText(detail.stripe_session_id || event.event_label || "", 160);
    const email = normalizeEmail(detail.email || event.event_label);

    if (event.event_name === "pro_subscription_paid") {
      if (stripeSessionId) paidSessionIds.add(stripeSessionId);
      continue;
    }

    if (event.event_name === "recovery_email_sent") {
      if (detail.segment === "checkout_not_paid" && stripeSessionId && !recoveryBySession.has(stripeSessionId)) {
        recoveryBySession.set(stripeSessionId, event);
      }
      if (detail.segment === "checkout_not_paid" && email && !recoveryByEmail.has(email)) {
        recoveryByEmail.set(email, event);
      }
      continue;
    }

    if (event.event_name === "pro_checkout_session_created") {
      checkoutEvents.push(event);
    }
  }

  const seenKeys = new Set();
  const recoveries = [];
  for (const event of checkoutEvents) {
    const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
    const stripeSessionId = cleanText(detail.stripe_session_id || "", 160);
    if (!stripeSessionId || paidSessionIds.has(stripeSessionId)) continue;

    const profile = profilesByUser.get(cleanText(detail.supabase_user_id, 120)) ||
      profilesByCustomer.get(cleanText(detail.stripe_customer_id, 160)) ||
      null;
    if (!profile?.email || profileHasProAccess(profile)) continue;

    const key = normalizeEmail(profile.email) || stripeSessionId;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    const recoveryEvent = recoveryBySession.get(stripeSessionId) || recoveryByEmail.get(normalizeEmail(profile.email)) || null;
    recoveries.push(checkoutRecoveryFromEvent(event, profile, recoveryEvent));
  }

  return {
    recoveries,
    summary: {
      total: recoveries.length,
      ready: recoveries.filter((recovery) => recovery.recoverable).length,
      tooFresh: recoveries.filter((recovery) => recovery.tooFresh).length,
      alreadySent: recoveries.filter((recovery) => recovery.recoverySentAt).length,
    },
    generatedAt: new Date().toISOString(),
  };
}

async function sendSupportReply(settings, body) {
  const mailSettings = supportSettings();
  if (!allowedOutreachDomains.has(mailSettings.fromDomain)) {
    return { status: 503, body: { ok: false, error: "support_from_domain_not_allowed" } };
  }

  const resendApiKey = process.env.RESEND_API_KEY || "";
  if (!resendApiKey) {
    return { status: 503, body: { ok: false, error: "resend_not_configured" } };
  }

  const to = normalizeEmail(body.to);
  const subject = cleanText(body.subject, 160);
  const text = cleanText(body.text, 5000);
  const inboundEmailId = cleanText(body.inboundEmailId, 120);

  if (!to || !subject || !text || !inboundEmailId) {
    return { status: 400, body: { ok: false, error: "invalid_support_reply_payload" } };
  }

  const payload = {
    from: mailSettings.from,
    to,
    replyTo: mailSettings.replyTo,
    subject,
    text,
    tags: [
      { name: "source", value: "support_reply" },
      { name: "product", value: "batchcutout" },
    ],
  };
  const resend = new Resend(resendApiKey);
  const sent = await resend.emails.send(payload);
  if (sent.error) {
    return {
      status: 502,
      body: { ok: false, error: "support_reply_failed", detail: sent.error.message },
    };
  }

  await insertSupportEvent(settings, "support_email_replied", {
    in_reply_to_email_id: inboundEmailId,
    to,
    from: mailSettings.from,
    reply_to: mailSettings.replyTo,
    subject,
    text,
    resend_id: sent.data?.id || "",
  }, inboundEmailId);

  return {
    status: 200,
    body: {
      ok: true,
      id: sent.data?.id || "",
      from: payload.from,
      replyTo: payload.replyTo,
      to: payload.to,
      subject: payload.subject,
    },
  };
}

async function sendOutreach(supabaseSettings, body) {
  const mailSettings = outreachSettings();
  if (!allowedOutreachDomains.has(mailSettings.fromDomain)) {
    return { status: 503, body: { ok: false, error: "outreach_from_domain_not_allowed" } };
  }

  const resendApiKey = process.env.RESEND_API_KEY || "";
  if (!resendApiKey) {
    return { status: 503, body: { ok: false, error: "resend_not_configured" } };
  }

  const to = normalizeEmail(body.to);
  const subject = cleanText(body.subject, 160);
  const text = cleanText(body.text, 5000);
  const dryRun = Boolean(body.dryRun);
  const recoverySegment = cleanText(body.recoverySegment, 80);
  const stripeSessionId = cleanText(body.stripeSessionId, 160);
  const recoveryPlan = cleanText(body.recoveryPlan, 80);

  if (!to || !subject || !text) {
    return { status: 400, body: { ok: false, error: "invalid_email_payload" } };
  }

  const payload = {
    from: mailSettings.from,
    to,
    replyTo: mailSettings.replyTo,
    subject,
    text,
    tags: [
      { name: "source", value: "manual_outreach" },
      { name: "product", value: "batchcutout" },
    ],
  };

  if (dryRun) {
    return {
      status: 200,
      body: {
        ok: true,
        dryRun: true,
        from: payload.from,
        replyTo: payload.replyTo,
        to: payload.to,
        subject: payload.subject,
      },
    };
  }

  const resend = new Resend(resendApiKey);
  const sent = await resend.emails.send(payload);
  if (sent.error) {
    return {
      status: 502,
      body: {
        ok: false,
        error: "outreach_send_failed",
        detail: sent.error.message,
      },
    };
  }

  if (recoverySegment) {
    await insertCommercialEvent(supabaseSettings, "recovery_email_sent", {
      email: to,
      segment: recoverySegment,
      stripe_session_id: stripeSessionId,
      plan: recoveryPlan,
      from: payload.from,
      reply_to: payload.replyTo,
      subject: payload.subject,
      resend_id: sent.data?.id || "",
    }, stripeSessionId || to);
  }

  return {
    status: 200,
    body: {
      ok: true,
      id: sent.data?.id || "",
      from: payload.from,
      replyTo: payload.replyTo,
      to: payload.to,
      subject: payload.subject,
    },
  };
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return sendJson(response, 200, { ok: true });
  }

  if (!verifyAdminToken(request)) {
    return sendJson(response, 401, { ok: false, error: "unauthorized" });
  }

  const settings = getSupabaseSettings();
  if (!settings.supabaseUrl || !settings.serviceRoleKey) {
    return sendJson(response, 503, { ok: false, error: "supabase_not_configured" });
  }

  try {
    if (request.method === "GET") {
      const url = new URL(request.url || "/api/pro-users", "https://batchcutout.com");
      if (url.searchParams.get("view") === "subscriptions") {
        const subscriptionData = await listSubscriptions(settings);
        return sendJson(response, 200, { ok: true, ...subscriptionData });
      }
      if (url.searchParams.get("view") === "support-mailbox") {
        const mailboxData = await listSupportMailbox(settings);
        return sendJson(response, 200, { ok: true, ...mailboxData });
      }
      if (url.searchParams.get("view") === "lead-captures") {
        const leadData = await listLeadCaptures(settings);
        return sendJson(response, 200, { ok: true, ...leadData });
      }
      if (url.searchParams.get("view") === "recovery-emails") {
        const recoveryEmails = await listRecoveryEmails(settings);
        return sendJson(response, 200, { ok: true, ...recoveryEmails });
      }
      if (url.searchParams.get("view") === "checkout-recoveries") {
        const recoveryData = await listCheckoutRecoveries(settings);
        return sendJson(response, 200, { ok: true, ...recoveryData });
      }

      const users = await listUsers(settings);
      return sendJson(response, 200, { ok: true, users });
    }

    if (request.method !== "POST") {
      return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
    }

    const body = await readRequestBody(request);
    const userId = String(body?.userId || "").trim();
    const mode = String(body?.mode || "").trim();

    if (mode === "send-outreach") {
      const result = await sendOutreach(settings, body);
      return sendJson(response, result.status, result.body);
    }

    if (mode === "support-reply") {
      const result = await sendSupportReply(settings, body);
      return sendJson(response, result.status, result.body);
    }

    if (mode === "support-resolve") {
      const result = await resolveSupportEmail(settings, body);
      return sendJson(response, result.status, result.body);
    }

    if (mode === "cancel-subscription") {
      const subscriptionId = String(body?.subscriptionId || "").trim();
      if (!subscriptionId.startsWith("sub_")) {
        return sendJson(response, 400, { ok: false, error: "invalid_subscription_id" });
      }

      const subscription = await cancelSubscriptionRenewal(subscriptionId);
      return sendJson(response, 200, { ok: true, subscription });
    }

    if (!userId || !["free", "pro", "reset-usage"].includes(mode)) {
      return sendJson(response, 400, { ok: false, error: "invalid_request" });
    }

    let patch;
    if (mode === "free") {
      patch = {
        plan: "free",
        plan_status: "active",
        batch_limit: 2,
        monthly_image_limit: 0,
        monthly_images_used: 0,
        current_period_start: null,
        current_period_end: null,
      };
    } else if (mode === "reset-usage") {
      const period = monthPeriod();
      patch = {
        monthly_images_used: 0,
        current_period_start: period.start,
        current_period_end: period.end,
      };
    } else {
      const period = monthPeriod();
      patch = {
        plan: "pro",
        plan_status: "manual",
        batch_limit: 100,
        monthly_image_limit: 2000,
        monthly_images_used: 0,
        current_period_start: period.start,
        current_period_end: period.end,
      };
    }

    const updated = await supabaseUpdateByUserId({
      ...settings,
      userId,
      patch,
    });

    return sendJson(response, 200, { ok: true, user: mapUser(updated) });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: "pro_users_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
