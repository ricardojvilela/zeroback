import crypto from "node:crypto";
import { Resend } from "resend";
import { getSupabaseSettings, sendJson, readRequestBody, supabaseUpdateByUserId } from "./_pro.js";
import { applyPackPurchaseFromSession, getStripeClient } from "./_stripe.js";

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

function hoursSince(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max((Date.now() - date.getTime()) / 36e5, 0);
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

function isInternalValidationEvent(event) {
  const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
  return (
    detail.event_category === "validation" ||
    detail.source === "codex_validation" ||
    event.source === "codex_validation" ||
    event.visitor_id === "codex-validation-visitor" ||
    event.visitor_id === "validation-probe" ||
    String(event.session_id || "").startsWith("validation-")
  );
}

const internalAttributionSources = new Set([
  "tool_inline",
  "tool_limit_prompt",
  "tool_empty_state",
  "post_download",
  "post_download_next",
  "post_download_inline",
  "result_ready",
  "result_ready_inline",
  "result_ready_sticky",
  "account_panel",
  "checkout_account_prompt",
  "checkout_plan",
  "pro_trial",
  "batchcutout.com",
  "www.batchcutout.com",
  "resend_inbound",
  "support_email",
  "hero",
  "pricing",
  "pricing_page",
  "pricing_page_checkout_panel",
  "pricing-page",
  "seo",
  "landing",
  "use-cases",
  "admin",
  "customer_results",
  "partners_page",
]);

const internalAttributionCampaigns = new Set([
  "pro_pricing",
  "try_before_pro",
  "founder_plan",
  "pro_annual",
  "founder_value",
  "try_value",
  "founder_roi",
]);

function attributionSourceFrom(...values) {
  for (const value of values) {
    const source = cleanText(value, 160);
    if (!source) continue;
    if (internalAttributionSources.has(source.toLowerCase())) continue;
    return source;
  }
  return "";
}

function attributionCampaignFrom(...values) {
  for (const value of values) {
    const campaign = cleanText(value, 160);
    if (!campaign) continue;
    if (internalAttributionCampaigns.has(campaign.toLowerCase())) continue;
    return campaign;
  }
  return "";
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

function subscriptionAttribution(subscription) {
  const customer = typeof subscription.customer === "object" && subscription.customer ? subscription.customer : {};
  const metadata = {
    ...(customer.metadata || {}),
    ...(subscription.metadata || {}),
  };
  const source = attributionSourceFrom(metadata.utm_source, metadata.source, metadata.last_source, metadata.first_source);
  const medium = cleanText(metadata.utm_medium || metadata.medium || metadata.last_medium || metadata.first_medium, 120);
  const campaign = attributionCampaignFrom(metadata.utm_campaign, metadata.campaign, metadata.last_campaign, metadata.first_campaign);
  const content = cleanText(metadata.utm_content || metadata.content || metadata.last_content || metadata.first_content, 160);
  const term = cleanText(metadata.utm_term || metadata.term || metadata.last_term || metadata.first_term, 160);
  return {
    source,
    medium,
    campaign,
    content,
    term,
    language: cleanText(metadata.language, 20),
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
  const attribution = subscriptionAttribution(subscription);
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
    attribution,
    attributionSource: attribution.source,
    attributionMedium: attribution.medium,
    attributionCampaign: attribution.campaign,
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
    mrrBySource: [],
  };
  const mrrBySource = new Map();

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
          const sourceKey = subscription.attributionSource || "sem origem";
          const sourceRow = mrrBySource.get(sourceKey) || {
            source: sourceKey,
            campaign: subscription.attributionCampaign || "",
            amount: 0,
            count: 0,
          };
          sourceRow.amount += Number(subscription.monthlyAmount || 0) || 0;
          sourceRow.count += 1;
          if (!sourceRow.campaign && subscription.attributionCampaign) sourceRow.campaign = subscription.attributionCampaign;
          mrrBySource.set(sourceKey, sourceRow);
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

  summary.mrrBySource = Array.from(mrrBySource.values()).sort((a, b) => b.amount - a.amount || b.count - a.count);

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

function authUsersFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  return [];
}

async function listUnconfirmedAuthUsers(settings) {
  const query = new URLSearchParams({
    page: "1",
    per_page: "100",
  });
  const response = await fetch(`${settings.supabaseUrl}/auth/v1/admin/users?${query}`, {
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`auth_users_read_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  return authUsersFromPayload(await response.json())
    .filter((user) => normalizeEmail(user.email))
    .filter((user) => !(user.email_confirmed_at || user.confirmed_at));
}

async function listEmailConfirmationRecoveries(settings) {
  const [authUsers, profiles, recoveryEmails] = await Promise.all([
    listUnconfirmedAuthUsers(settings),
    listUsers(settings),
    listRecoveryEmails(settings),
  ]);
  const profilesByUserId = new Map(profiles.map((profile) => [profile.userId, profile]));
  const profilesByEmail = new Map(profiles.map((profile) => [normalizeEmail(profile.email), profile]).filter(([email]) => email));
  const recoveryByEmail = new Map();
  for (const email of recoveryEmails.emails || []) {
    if (String(email.segment || "").startsWith("confirm_email") && email.email && !recoveryByEmail.has(email.email)) {
      recoveryByEmail.set(email.email, email);
    }
  }

  const recoveries = authUsers.map((user) => {
    const email = normalizeEmail(user.email);
    const profile = profilesByUserId.get(user.id) || profilesByEmail.get(email) || null;
    const recovery = recoveryByEmail.get(email) || null;
    const createdAt = user.created_at || user.createdAt || "";
    const ageHours = hoursSince(createdAt);
    return {
      userId: cleanText(user.id, 160),
      email,
      createdAt,
      lastSignInAt: user.last_sign_in_at || "",
      hoursSinceCreated: Math.round(ageHours * 10) / 10,
      profilePlan: profile?.plan || "none",
      stripeCustomerId: profile?.stripeCustomerId || "",
      stripeSubscriptionId: profile?.stripeSubscriptionId || "",
      recoverable: ageHours >= 2 && !recovery && !profileHasProAccess(profile),
      tooFresh: ageHours < 2,
      recoverySentAt: recovery?.sentAt || "",
      recoveryResendId: recovery?.resendId || "",
    };
  });

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

async function listRecordedPackPaymentIds(settings) {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const query = new URLSearchParams({
    select: "event_label",
    event_name: "eq.pack_purchase_paid",
    order: "occurred_at.desc",
    limit: "200",
  });
  const response = await fetch(`${settings.supabaseUrl}/rest/v1/${tableName}?${query}`, {
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`pack_payment_events_read_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  const rows = await response.json();
  return new Set(rows.map((row) => cleanText(row.event_label, 160)).filter(Boolean));
}

function checkoutCustomer(session) {
  return session?.customer && typeof session.customer === "object" && !session.customer.deleted
    ? session.customer
    : null;
}

function packPaymentEmail(session) {
  const metadata = session?.metadata || {};
  return normalizeEmail(
    session?.customer_details?.email ||
    session?.customer_email ||
    metadata.batchcutout_pending_email ||
    metadata.customer_email ||
    checkoutCustomer(session)?.email ||
    "",
  );
}

function packPaymentPlan(session) {
  const plan = cleanText(session?.metadata?.batchcutout_price_plan, 80);
  return plan === "pack250" ? "pack250" : "pack100";
}

function mapPackPayment(session, profile, recorded) {
  const customer = checkoutCustomer(session);
  const paymentIntentId = typeof session?.payment_intent === "string"
    ? session.payment_intent
    : session?.payment_intent?.id || "";
  const paid = session?.payment_status === "paid";
  const accessActive = Boolean(
    profile?.userId &&
    ["pack", "pro"].includes(profile.plan) &&
    profile.planStatus === "active",
  );
  const needsAction = paid && (!recorded || !profile?.userId || !accessActive);

  return {
    id: session.id,
    paymentIntentId,
    paymentStatus: session.payment_status || "",
    checkoutStatus: session.status || "",
    paid,
    recorded,
    needsAction,
    createdAt: stripeDate(session.created),
    amount: Number(session.amount_total || 0) || 0,
    currency: String(session.currency || "eur").toLowerCase(),
    plan: packPaymentPlan(session),
    packImages: Number(session?.metadata?.batchcutout_pack_images || 0) || (packPaymentPlan(session) === "pack250" ? 250 : 100),
    customerId: customer?.id || (typeof session.customer === "string" ? session.customer : ""),
    customerEmail: packPaymentEmail(session),
    linkedToSupabase: Boolean(profile?.userId),
    accessPlan: profile?.plan || "",
    accessStatus: profile?.planStatus || "",
    monthlyRemaining: profile?.monthlyRemaining || 0,
    attributionSource: cleanText(session?.metadata?.utm_source || session?.metadata?.source, 160),
    attributionCampaign: cleanText(session?.metadata?.utm_campaign || session?.metadata?.campaign, 160),
    stripeDashboardUrl: paymentIntentId ? `https://dashboard.stripe.com/payments/${paymentIntentId}` : "",
  };
}

async function listPackPayments(settings) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("stripe_not_configured");
  }

  const [profiles, stripeList, recordedIds] = await Promise.all([
    listUsers(settings),
    stripe.checkout.sessions.list({
      limit: 100,
      expand: ["data.customer", "data.payment_intent"],
    }),
    listRecordedPackPaymentIds(settings),
  ]);
  const profilesByUserId = new Map(profiles.map((profile) => [profile.userId, profile]).filter(([id]) => id));
  const profilesByCustomer = new Map(profiles.map((profile) => [profile.stripeCustomerId, profile]).filter(([id]) => id));
  const profilesByEmail = new Map(profiles.map((profile) => [normalizeEmail(profile.email), profile]).filter(([email]) => email));

  const payments = stripeList.data
    .filter((session) => session?.mode === "payment" && session?.metadata?.batchcutout_purchase_type === "pack")
    .map((session) => {
      const customer = checkoutCustomer(session);
      const userId = cleanText(session?.metadata?.supabase_user_id || session?.client_reference_id, 160);
      const customerId = customer?.id || (typeof session.customer === "string" ? session.customer : "");
      const email = packPaymentEmail(session);
      const profile = profilesByUserId.get(userId) || profilesByCustomer.get(customerId) || profilesByEmail.get(email) || null;
      return mapPackPayment(session, profile, recordedIds.has(session.id));
    })
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const paidPayments = payments.filter((payment) => payment.paid);
  const currency = paidPayments.find((payment) => payment.currency)?.currency || "eur";

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      total: payments.length,
      paid: paidPayments.length,
      paidAmount: paidPayments.reduce((sum, payment) => sum + payment.amount, 0),
      currency,
      recorded: paidPayments.filter((payment) => payment.recorded).length,
      needsAction: paidPayments.filter((payment) => payment.needsAction).length,
      paidWithoutRecord: paidPayments.filter((payment) => !payment.recorded).length,
      paidWithoutAccount: paidPayments.filter((payment) => !payment.linkedToSupabase).length,
      paidWithoutAccess: paidPayments.filter((payment) => payment.linkedToSupabase && payment.accessStatus !== "active").length,
    },
    payments,
  };
}

async function reconcilePackPayments(settings) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("stripe_not_configured");
  }

  const stripeList = await stripe.checkout.sessions.list({
    limit: 100,
    expand: ["data.customer", "data.payment_intent"],
  });
  const sessions = stripeList.data.filter((session) =>
    session?.mode === "payment" &&
    session?.payment_status === "paid" &&
    session?.metadata?.batchcutout_purchase_type === "pack"
  );
  const results = [];

  for (const session of sessions) {
    try {
      const result = await applyPackPurchaseFromSession(settings, session, {
        id: `admin_reconcile_${session.id}`,
        created: session.created,
      });
      results.push({
        sessionId: session.id,
        status: result.credited ? "credited" : "already_credited",
        credited: Boolean(result.credited),
      });
    } catch (error) {
      results.push({
        sessionId: session.id,
        status: error instanceof Error ? error.message : "reconcile_failed",
        credited: false,
      });
    }
  }

  return {
    processed: results.length,
    credited: results.filter((result) => result.credited).length,
    pendingAccount: results.filter((result) => result.status === "stripe_pack_profile_not_found").length,
    failed: results.filter((result) => !["credited", "already_credited", "stripe_pack_profile_not_found"].includes(result.status)).length,
    results,
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

function searchableText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function firstReplyText(value) {
  const cleaned = String(value || "").replace(/\r\n/g, "\n");
  const firstPart = cleaned.split(/\n\s*(on .+wrote:|em .+escreveu:|from:|de:|--+\s*original message\s*--+)/i)[0] || cleaned;
  return firstPart
    .split("\n")
    .filter((line) => !line.trim().startsWith(">"))
    .slice(0, 12)
    .join("\n")
    .trim()
    .slice(0, 1200);
}

function optOutReasonFromText(value) {
  const text = searchableText(firstReplyText(value));
  if (!text) return "";
  const patterns = [
    ["unsubscribe", /\bunsubscribe\b/],
    ["no_thanks", /\bno\s+thanks\b|\bno\s+thank\s+you\b/],
    ["not_interested", /\bnot\s+interested\b|\bno\s+interest\b/],
    ["remove_me", /\bremove\s+me\b|\bopt\s*out\b/],
    ["do_not_contact", /\bdo\s+not\s+contact\b|\bdon'?t\s+contact\b|\bstop\s+contacting\b/],
    ["pt_remove", /\bremova-me\b|\bremover-me\b|\bnao\s+contactar\b|\bnao\s+contatar\b|\bsem\s+interesse\b/],
    ["es_remove", /\bno\s+contactar\b|\bsin\s+interes\b/],
  ];
  const match = patterns.find(([, pattern]) => pattern.test(text));
  return match ? match[0] : "";
}

async function findSupportOptOut(settings, email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const query = new URLSearchParams({
    select: "id,event_name,event_label,detail,occurred_at",
    event_name: "eq.support_email_received",
    order: "occurred_at.desc",
    limit: "500",
  });
  const response = await fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}?${query}`, {
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`support_opt_out_read_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  for (const event of await response.json()) {
    const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
    const from = fromEmail(detail.from || "");
    if (from !== normalizedEmail) continue;

    const reason = optOutReasonFromText(detail.text || detail.html || "");
    if (reason) {
      return {
        reason,
        email: normalizedEmail,
        supportEmailId: cleanText(detail.email_id || event.event_label || "", 120),
        receivedAt: event.occurred_at || "",
      };
    }
  }

  return null;
}

async function findDuplicateCommercialEmail(settings, email, { recoverySegment = "", subject = "" } = {}) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const query = new URLSearchParams({
    select: "id,event_name,event_label,detail,occurred_at",
    event_name: "in.(recovery_email_sent,manual_outreach_email_sent)",
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
    throw new Error(`commercial_duplicate_read_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  for (const event of await response.json()) {
    const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
    if (normalizeEmail(detail.email) !== normalizedEmail) continue;

    const sameRecoverySegment = recoverySegment && cleanText(detail.segment, 80) === recoverySegment;
    if (sameRecoverySegment && (event.event_name === "recovery_email_sent" || cleanText(detail.purpose, 80) === "recovery")) {
      return { type: "recovery", sentAt: event.occurred_at || "", resendId: cleanText(detail.resend_id, 120) };
    }

    if (!recoverySegment && event.event_name === "manual_outreach_email_sent" && cleanText(detail.subject, 160) === subject) {
      return { type: "manual_subject", sentAt: event.occurred_at || "", resendId: cleanText(detail.resend_id, 120) };
    }
  }

  return null;
}

async function findEventByNameAndLabel(settings, eventName, eventLabel) {
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";
  const query = new URLSearchParams({
    select: "id,detail,occurred_at",
    event_name: `eq.${cleanText(eventName, 120)}`,
    event_label: `eq.${cleanText(eventLabel, 160)}`,
    order: "occurred_at.desc",
    limit: "1",
  });
  const response = await fetch(`${settings.supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}?${query}`, {
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`event_lookup_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  const rows = await response.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function guardCommercialEmailSend(settings, { to, recoverySegment = "", subject = "", dryRun = false } = {}) {
  if (dryRun) return null;

  const optOut = await findSupportOptOut(settings, to);
  if (optOut) {
    return {
      status: 409,
      body: {
        ok: false,
        error: "outreach_blocked_opt_out",
        reason: optOut.reason,
        supportEmailId: optOut.supportEmailId,
        receivedAt: optOut.receivedAt,
      },
    };
  }

  const duplicate = await findDuplicateCommercialEmail(settings, to, { recoverySegment, subject });
  if (duplicate) {
    return {
      status: 409,
      body: {
        ok: false,
        error: duplicate.type === "recovery" ? "outreach_duplicate_recovery" : "outreach_duplicate_subject",
        sentAt: duplicate.sentAt,
        resendId: duplicate.resendId,
      },
    };
  }

  return null;
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
    select: "id,event_name,event_label,detail,source,campaign,visitor_id,session_id,occurred_at",
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
    if (isInternalValidationEvent(event)) continue;
    const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
    const email = normalizeEmail(detail.email);
    if (!email || seen.has(email)) continue;
    seen.add(email);
    const reply = repliesByEmail.get(email) || null;
    leads.push({
      email,
      language: cleanText(detail.language, 20) || "en",
      source: attributionSourceFrom(detail.utm_source, detail.last_source, detail.first_source, event.source, detail.source),
      captureSource: cleanText(detail.capture_source || detail.source, 80),
      campaign: attributionCampaignFrom(event.campaign, detail.utm_campaign, detail.last_campaign, detail.first_campaign),
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
      checkoutNotPaid: emails.filter((email) => String(email.segment || "").startsWith("checkout_not_paid")).length,
      accountNoCheckout: emails.filter((email) => String(email.segment || "").startsWith("account_no_checkout")).length,
      leads: emails.filter((email) => email.segment === "lead_capture" || email.segment === "lead_capture_pt" || email.segment === "lead_capture_es").length,
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
    source: attributionSourceFrom(detail.utm_source, detail.source, event.source, detail.last_source, detail.first_source),
    campaign: attributionCampaignFrom(event.campaign, detail.utm_campaign, detail.campaign, detail.last_campaign, detail.first_campaign),
    language: cleanText(detail.language, 20) || "en",
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
      if (String(detail.segment || "").startsWith("checkout_not_paid") && stripeSessionId && !recoveryBySession.has(stripeSessionId)) {
        recoveryBySession.set(stripeSessionId, event);
      }
      if (String(detail.segment || "").startsWith("checkout_not_paid") && email && !recoveryByEmail.has(email)) {
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

  const guardResult = await guardCommercialEmailSend(supabaseSettings, {
    to,
    recoverySegment,
    subject,
    dryRun,
  });
  if (guardResult) return guardResult;

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

  await insertCommercialEvent(supabaseSettings, "manual_outreach_email_sent", {
    email: to,
    segment: recoverySegment,
    stripe_session_id: stripeSessionId,
    plan: recoveryPlan,
    from: payload.from,
    reply_to: payload.replyTo,
    subject: payload.subject,
    resend_id: sent.data?.id || "",
    purpose: recoverySegment ? "recovery" : "prospecting",
  }, to);

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

export async function sendPackActivationEmail(settings, body) {
  const mailSettings = supportSettings();
  if (!allowedOutreachDomains.has(mailSettings.fromDomain)) {
    return { status: 503, body: { ok: false, error: "support_from_domain_not_allowed" } };
  }

  const resendApiKey = process.env.RESEND_API_KEY || "";
  const stripe = getStripeClient();
  const sessionId = cleanText(body?.sessionId, 160);
  if (!resendApiKey) return { status: 503, body: { ok: false, error: "resend_not_configured" } };
  if (!stripe) return { status: 503, body: { ok: false, error: "stripe_not_configured" } };
  if (!sessionId.startsWith("cs_")) return { status: 400, body: { ok: false, error: "invalid_session_id" } };

  const duplicate = await findEventByNameAndLabel(settings, "pack_activation_email_sent", sessionId);
  if (duplicate) {
    return {
      status: 409,
      body: {
        ok: false,
        error: "pack_activation_already_sent",
        sentAt: duplicate.occurred_at || "",
        resendId: cleanText(duplicate.detail?.resend_id, 120),
      },
    };
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["customer", "payment_intent"],
  });
  if (
    session?.mode !== "payment" ||
    session?.payment_status !== "paid" ||
    session?.metadata?.batchcutout_purchase_type !== "pack"
  ) {
    return { status: 409, body: { ok: false, error: "pack_checkout_not_paid" } };
  }

  const to = packPaymentEmail(session);
  if (!to) return { status: 409, body: { ok: false, error: "pack_customer_email_missing" } };
  const plan = packPaymentPlan(session);
  const credits = Number(session?.metadata?.batchcutout_pack_images || 0) || (plan === "pack250" ? 250 : 100);
  const amount = Number(session.amount_total || 0) || 0;
  const amountLabel = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: String(session.currency || "eur").toUpperCase(),
  }).format(amount / 100);
  const activationUrl = `https://batchcutout.com/?checkout=success&session_id=${encodeURIComponent(session.id)}#accountTitle`;
  const subject = `Activate your BatchCutout Pack ${credits}`;
  const text = `Hi,

Your ${amountLabel} payment for BatchCutout Pack ${credits} has been confirmed.

To activate your ${credits} image credits:
1. Open the secure link below.
2. Create an account or sign in using the same email address used for payment.
3. Your credits will be linked automatically. No additional payment is required.

Activate your credits: ${activationUrl}

If you need help, reply to this email.

BatchCutout Support
NexaFlow Labs`;
  const html = `<p>Hi,</p><p>Your <strong>${amountLabel}</strong> payment for <strong>BatchCutout Pack ${credits}</strong> has been confirmed.</p><p>To activate your ${credits} image credits:</p><ol><li>Open the secure link below.</li><li>Create an account or sign in using the same email address used for payment.</li><li>Your credits will be linked automatically. No additional payment is required.</li></ol><p><a href="${activationUrl}" style="display:inline-block;padding:12px 18px;background:#0877d1;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:700">Activate ${credits} credits</a></p><p>If you need help, reply to this email.</p><p>BatchCutout Support<br>NexaFlow Labs</p>`;
  const payload = {
    from: mailSettings.from,
    to,
    replyTo: mailSettings.replyTo,
    subject,
    text,
    html,
    tags: [
      { name: "source", value: "pack_activation" },
      { name: "product", value: "batchcutout" },
    ],
  };
  const resend = new Resend(resendApiKey);
  const sent = await resend.emails.send(payload);
  if (sent.error) {
    return { status: 502, body: { ok: false, error: "pack_activation_send_failed", detail: sent.error.message } };
  }

  await insertSupportEvent(settings, "pack_activation_email_sent", {
    stripe_session_id: session.id,
    email: to,
    plan,
    credits,
    amount_cents: amount,
    currency: String(session.currency || "eur").toUpperCase(),
    from: payload.from,
    reply_to: payload.replyTo,
    subject,
    resend_id: sent.data?.id || "",
    purpose: "paid_pack_activation",
  }, session.id);

  return {
    status: 200,
    body: {
      ok: true,
      id: sent.data?.id || "",
      from: payload.from,
      replyTo: payload.replyTo,
      to: payload.to,
      subject: payload.subject,
      sessionId: session.id,
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
      if (url.searchParams.get("view") === "pack-payments") {
        const paymentData = await listPackPayments(settings);
        return sendJson(response, 200, { ok: true, ...paymentData });
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
      if (url.searchParams.get("view") === "email-confirmation-recoveries") {
        const recoveryData = await listEmailConfirmationRecoveries(settings);
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

    if (mode === "send-pack-activation") {
      const result = await sendPackActivationEmail(settings, body);
      return sendJson(response, result.status, result.body);
    }

    if (mode === "reconcile-pack-payments") {
      const reconciliation = await reconcilePackPayments(settings);
      return sendJson(response, 200, { ok: true, reconciliation });
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
