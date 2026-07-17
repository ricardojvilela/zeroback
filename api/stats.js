import crypto from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://batchcutout.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const defaultStatsTimeZone = "Europe/Lisbon";
const legacyPostDownloadPackClickedEvent = ["post", "download", "found" + "er", "clicked"].join("_");
const validationExperimentConfig = Object.freeze({
  id: "pack100_30d_20260714",
  startDate: "2026-07-14",
  endDate: "2026-08-13",
  targetCompletedTests: 50,
  targetPackPurchases: 3,
});
const validationFeedbackAnswers = Object.freeze([
  "no_more_photos",
  "needs_quality",
  "needs_catalog_finish",
  "price_not_worth_it",
]);

function sendJson(response, status, data) {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.setHeader(key, value);
  }
  response.setHeader("Content-Type", "application/json");
  response.status(status).json(data);
}
function toLocalDate(value, timeZone = defaultStatsTimeZone) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const partValue = (type) => parts.find((part) => part.type === type)?.value || "";
    const year = partValue("year");
    const month = partValue("month");
    const day = partValue("day");
    if (year && month && day) return `${year}-${month}-${day}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

function dateKeyOffset(dateKey, daysBack = 0) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ""));
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) - daysBack, 12, 0, 0));
  return date.toISOString().slice(0, 10);
}

function statsTimeZoneFrom(request) {
  const requested = asCleanText(request.query.timezone || request.query.tz || defaultStatsTimeZone, 80) || defaultStatsTimeZone;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: requested }).format(new Date());
    return requested;
  } catch {
    return defaultStatsTimeZone;
  }
}

function emptyDay(date) {
  return {
    date,
    visitors: 0,
    pageViews: 0,
    seoLandingViews: 0,
    seoLandingCtaClicks: 0,
    directoryLaunchPageViews: 0,
    directoryLaunchCtaClicks: 0,
    uploadsStarted: 0,
    imagesAccepted: 0,
    limitAttempts: 0,
    freeTestCompletions: 0,
    freeTestExhaustedAttempts: 0,
    processingCompleted: 0,
    engineLoadFailures: 0,
    zipGenerationFailures: 0,
    downloadReadyShown: 0,
    downloads: 0,
    pngDownloads: 0,
    zipDownloads: 0,
    postDownloadNextShown: 0,
    postDownloadPackClicks: 0,
    postDownloadSaveLinkClicks: 0,
    resultActionPackClicks: 0,
    resultReadyStickyShown: 0,
    resultReadyStickyPackClicks: 0,
    resultReadyStickySaveLinkClicks: 0,
    postDownloadFeedbacks: 0,
    postDownloadLargerBatchFeedbacks: 0,
    postDownloadNoMorePhotosFeedbacks: 0,
    postDownloadQualityFeedbacks: 0,
    postDownloadCatalogFinishFeedbacks: 0,
    postDownloadPriceFeedbacks: 0,
    upgradePromptViews: 0,
    proofPageViews: 0,
    proofCtaClicks: 0,
    proClicks: 0,
    pricingCtaClicks: 0,
    packCtaClicks: 0,
    subscriptionCtaClicks: 0,
    highVolumeContacts: 0,
    monthlyLimitReached: 0,
    checkoutLoginRequired: 0,
    packEmailRequired: 0,
    packEmailCheckoutStarts: 0,
    packEmailCheckoutSessions: 0,
    packEmailCheckoutFailures: 0,
    checkoutStarts: 0,
    checkoutCancelledReturns: 0,
    checkoutContinueErrors: 0,
    checkoutSessionsCreated: 0,
    checkoutSessionFailures: 0,
    checkoutLinkEmailsSent: 0,
    checkoutLinkEmailClicks: 0,
    checkoutLinkEmailFailures: 0,
    paidSubscriptions: 0,
    packCheckoutSessions: 0,
    packPurchases: 0,
    packRevenue: 0,
    revenue: 0,
    paymentFailures: 0,
    paymentFailureValue: 0,
    subscriptionCancelScheduled: 0,
    subscriptionCanceled: 0,
    accountCheckoutPanelViews: 0,
    accountFormInteractions: 0,
    accountValidationFailures: 0,
    accountSignupStarts: 0,
    accountSignupFailures: 0,
    accountSignups: 0,
    accountEmailConfirmations: 0,
    accountEmailConfirmationResends: 0,
    accountLogins: 0,
    accountLoginFailures: 0,
    leadCaptures: 0,
    resultReadyLeadCaptures: 0,
    limitPromptLeadCaptures: 0,
    checkoutPromptLeadCaptures: 0,
    leadAutorepliesSent: 0,
    leadAutorepliesFailed: 0,
    proWelcomeEmailsSent: 0,
    proWelcomeEmailsFailed: 0,
    partnerPageViews: 0,
    partnerCtaClicks: 0,
    partnerReferralCopies: 0,
    billingPortalOpens: 0,
  };
}

function asCleanText(value, maxLength = 120) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, maxLength);
}

function hostnameFrom(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function classifySource(event, detail) {
  const internalSources = new Set([
    "tool_inline",
    "tool_limit_prompt",
    "tool_empty_state",
    "post_download",
    "post_download_next",
    "post_download_inline",
    "result_ready",
    "result_ready_inline",
    "result_ready_checkout",
    "result_ready_sticky",
    "account_panel",
    "account_pack_renewal",
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
    "tool_upgrade_prompt",
    "tool_upgrade_compare_plans",
    "account_billing_actions",
    "email_pack",
    "seo",
    "landing",
    "use-cases",
    "admin",
    "customer_results",
    "partners_page",
  ]);
  const cleanSource = (value) => {
    const cleaned = asCleanText(value, 200);
    return internalSources.has(cleaned.toLowerCase()) ? "" : cleaned;
  };
  const source = cleanSource(detail.utm_source) ||
    cleanSource(detail.source) ||
    cleanSource(detail.last_source) ||
    cleanSource(detail.first_source) ||
    cleanSource(event.source);
  const medium = asCleanText(detail.utm_medium || detail.medium || detail.last_medium || detail.first_medium, 80).toLowerCase();
  const campaign = asCleanText(event.campaign || detail.utm_campaign || detail.campaign || detail.last_campaign || detail.first_campaign, 200);
  const referrer = asCleanText(detail.referrer || "", 500);
  const rawReferrerHost = hostnameFrom(referrer);
  const referrerHost = internalSources.has(rawReferrerHost) ? "" : rawReferrerHost;
  const raw = [source, campaign, referrerHost].filter(Boolean).join(" ").toLowerCase();
  const hasAdClickId = Boolean(
    detail.gclid || detail.gbraid || detail.wbraid ||
    detail.last_gclid || detail.last_gbraid || detail.last_wbraid ||
    detail.first_gclid || detail.first_gbraid || detail.first_wbraid
  );

  if (hasAdClickId || (raw.includes("google") && ["cpc", "paid", "ads"].some((term) => medium.includes(term)))) {
    return "Google Ads";
  }
  if (raw.includes("saashub")) return "SaaSHub";
  if (raw.includes("uneed")) return "Uneed";
  if (raw.includes("betalist") || raw.includes("beta list") || raw.includes("beta_list")) return "BetaList";
  if (raw.includes("indiehackers") || raw.includes("indie hackers") || raw.includes("indie_hackers")) return "Indie Hackers";
  if (raw.includes("smollaunch") || raw.includes("smol launch") || raw.includes("smol_launch")) return "Smol Launch";
  if (raw.includes("launchingnext") || raw.includes("launching next") || raw.includes("launching_next")) return "Launching Next";
  if (raw.includes("alternativeto") || raw.includes("alternative to") || raw.includes("alternative_to")) return "AlternativeTo";
  if (raw.includes("startupstash") || raw.includes("startup stash") || raw.includes("startup_stash")) return "Startup Stash";
  if (raw.includes("aitoolsdirectory") || raw.includes("ai tools directory") || raw.includes("ai_tools_directory")) return "AI Tools Directory";
  if (raw.includes("bestaibrands") || raw.includes("best ai brands") || raw.includes("best_ai_brands")) return "Best AI Brands";
  if (raw.includes("zearches")) return "Zearches";
  if (raw.includes("listai")) return "ListAI";
  if (raw.includes("thenextai") || raw.includes("the next ai")) return "The Next AI";
  if (raw.includes("future-pedia") || raw.includes("futurepedia")) return "Future-pedia";
  if (raw.includes("producthunt") || raw.includes("product hunt") || raw.includes("product_hunt")) return "Product Hunt";
  if (raw.includes("facebook") || raw.includes("fbclid")) return "Facebook";
  if (raw.includes("reddit")) return "Reddit";
  if (raw.includes("linkedin")) return "LinkedIn";
  if (raw.includes("google")) return "Google organic";
  if (raw.includes("bing")) return "Bing";
  if (raw.includes("yahoo")) return "Yahoo";
  if (raw.includes("duckduckgo")) return "DuckDuckGo";
  if (source && source !== "direct") return source.slice(0, 60);
  if (referrerHost) return referrerHost.slice(0, 60);
  return "Direto / sem origem";
}

function campaignAttribution(event, detail, source) {
  const medium = asCleanText(
    detail.utm_medium || detail.medium || detail.last_medium || detail.first_medium,
    80,
  ).toLowerCase();
  const campaign = asCleanText(
    event.campaign || detail.utm_campaign || detail.campaign || detail.last_campaign || detail.first_campaign,
    200,
  );
  const content = asCleanText(detail.utm_content || detail.last_content || detail.first_content, 160);
  const term = asCleanText(detail.utm_term || detail.last_term || detail.first_term, 200);
  const hasAdClickId = Boolean(
    detail.gclid || detail.gbraid || detail.wbraid ||
    detail.last_gclid || detail.last_gbraid || detail.last_wbraid ||
    detail.first_gclid || detail.first_gbraid || detail.first_wbraid
  );
  const isPaidTraffic = source === "Google Ads" || hasAdClickId || ["cpc", "ppc", "paid", "ads"].some((value) => medium.includes(value));

  if (!campaign && !isPaidTraffic) return null;

  const campaignName = campaign || "google_ads_auto_tagged";
  return {
    key: [source, campaignName, content, term].join("\u001f"),
    source,
    medium,
    campaign: campaignName,
    content,
    term,
  };
}

function emptySourceRow(source) {
  return {
    source,
    visitors: 0,
    pageViews: 0,
    seoLandingViews: 0,
    seoLandingCtaClicks: 0,
    directoryLaunchPageViews: 0,
    directoryLaunchCtaClicks: 0,
    uploadsStarted: 0,
    imagesAccepted: 0,
    limitAttempts: 0,
    freeTestCompletions: 0,
    freeTestExhaustedAttempts: 0,
    engineLoadFailures: 0,
    zipGenerationFailures: 0,
    downloads: 0,
    zipDownloads: 0,
    postDownloadNextShown: 0,
    postDownloadPackClicks: 0,
    postDownloadSaveLinkClicks: 0,
    resultActionPackClicks: 0,
    resultReadyStickyShown: 0,
    resultReadyStickyPackClicks: 0,
    resultReadyStickySaveLinkClicks: 0,
    postDownloadFeedbacks: 0,
    postDownloadLargerBatchFeedbacks: 0,
    postDownloadNoMorePhotosFeedbacks: 0,
    postDownloadQualityFeedbacks: 0,
    postDownloadCatalogFinishFeedbacks: 0,
    postDownloadPriceFeedbacks: 0,
    upgradePromptViews: 0,
    proofPageViews: 0,
    proofCtaClicks: 0,
    proClicks: 0,
    pricingCtaClicks: 0,
    packCtaClicks: 0,
    subscriptionCtaClicks: 0,
    highVolumeContacts: 0,
    monthlyLimitReached: 0,
    checkoutLoginRequired: 0,
    packEmailRequired: 0,
    packEmailCheckoutStarts: 0,
    packEmailCheckoutSessions: 0,
    packEmailCheckoutFailures: 0,
    checkoutStarts: 0,
    checkoutCancelledReturns: 0,
    checkoutContinueErrors: 0,
    checkoutSessionsCreated: 0,
    checkoutSessionFailures: 0,
    checkoutLinkEmailsSent: 0,
    checkoutLinkEmailClicks: 0,
    checkoutLinkEmailFailures: 0,
    paidSubscriptions: 0,
    packCheckoutSessions: 0,
    packPurchases: 0,
    packRevenue: 0,
    revenue: 0,
    paymentFailures: 0,
    paymentFailureValue: 0,
    subscriptionCancelScheduled: 0,
    subscriptionCanceled: 0,
    accountCheckoutPanelViews: 0,
    accountFormInteractions: 0,
    accountValidationFailures: 0,
    accountSignupStarts: 0,
    accountSignupFailures: 0,
    accountSignups: 0,
    accountEmailConfirmations: 0,
    accountEmailConfirmationResends: 0,
    accountLogins: 0,
    accountLoginFailures: 0,
    leadCaptures: 0,
    resultReadyLeadCaptures: 0,
    limitPromptLeadCaptures: 0,
    checkoutPromptLeadCaptures: 0,
    leadAutorepliesSent: 0,
    leadAutorepliesFailed: 0,
    proWelcomeEmailsSent: 0,
    proWelcomeEmailsFailed: 0,
    partnerPageViews: 0,
    partnerCtaClicks: 0,
    partnerReferralCopies: 0,
    billingPortalOpens: 0,
    events: 0,
  };
}

function emptyCampaignRow(attribution) {
  return {
    ...emptySourceRow(attribution.source),
    campaign: attribution.campaign,
    medium: attribution.medium,
    content: attribution.content,
    term: attribution.term,
    landingPage: "",
    uploadVisitors: 0,
    downloadVisitors: 0,
    paidIntentVisitors: 0,
    packClickVisitors: 0,
    accountVisitors: 0,
    stripeVisitors: 0,
    purchaseVisitors: 0,
    uploadRate: 0,
    downloadRate: 0,
    paidIntentRate: 0,
  };
}

function emptyCampaignVisitorStages() {
  return {
    upload: new Set(),
    download: new Set(),
    paidIntent: new Set(),
    packClick: new Set(),
    account: new Set(),
    stripe: new Set(),
    purchase: new Set(),
  };
}

function updateCampaignVisitorStages(stages, eventName, detail, visitorId) {
  if (!stages || !visitorId) return;
  if (eventName === "tool_upload_started") stages.upload.add(visitorId);
  if (["tool_download_png", "tool_download_zip"].includes(eventName)) stages.download.add(visitorId);
  if (
    (eventName === "tool_pro_clicked" && isCheckoutPlan(detail.checkout_plan || detail.plan || detail.price_plan)) ||
    eventName === "pro_cta_clicked" ||
    isPackIntentEvent(eventName, detail)
  ) {
    stages.paidIntent.add(visitorId);
  }
  if (isPackIntentEvent(eventName, detail)) stages.packClick.add(visitorId);
  if (eventName === "account_signup_succeeded") stages.account.add(visitorId);
  if (["pro_checkout_session_created", "pack_checkout_session_created"].includes(eventName)) stages.stripe.add(visitorId);
  if (["pro_subscription_paid", "pack_purchase_paid"].includes(eventName)) stages.purchase.add(visitorId);
}

function numericSnapshot(row) {
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => typeof value === "number"),
  );
}

function applyNumericDeltas(before, after, target, excludedKeys = new Set()) {
  if (!before || !target) return;
  for (const [key, value] of Object.entries(after)) {
    if (excludedKeys.has(key) || typeof value !== "number") continue;
    const delta = value - (Number(before[key]) || 0);
    if (delta) target[key] = (Number(target[key]) || 0) + delta;
  }
}

function landingPageFromEvent(event, detail) {
  const directPath = asCleanText(detail.page_path || event.page_path, 500);
  if (directPath) return directPath;

  const location = asCleanText(detail.page_location || event.page_location, 1000);
  if (!location) return "";

  try {
    const url = new URL(location);
    return `${url.pathname}${url.search}`.slice(0, 500);
  } catch {
    return "";
  }
}

function campaignLandingPage(event, detail) {
  const storedLanding = asCleanText(detail.first_landing_page || detail.last_landing_page, 1000);
  const raw = storedLanding || landingPageFromEvent(event, detail);
  if (!raw) return "";

  try {
    return new URL(raw, "https://batchcutout.com").pathname.slice(0, 500);
  } catch {
    return raw.split(/[?#]/)[0].slice(0, 500);
  }
}

function emptyLandingPageRow(pagePath) {
  return {
    pagePath,
    pageTitle: "",
    visitors: 0,
    views: 0,
    ctaClicks: 0,
    toolClicks: 0,
    pricingClicks: 0,
    internalClicks: 0,
    externalClicks: 0,
    checkoutPlanClicks: 0,
    intentClicks: 0,
    ctaRate: 0,
    pricingRate: 0,
  };
}

function isPackCheckoutPlan(plan) {
  return ["pack100", "pack250"].includes(String(plan || "").toLowerCase());
}

function isCheckoutPlan(plan) {
  return ["pack100", "pack250", "early", "monthly", "annual"].includes(String(plan || "").toLowerCase());
}

function isEmailOnlyPackCheckout(detail = {}) {
  const explicitMarker = detail.email_only_checkout === true ||
    String(detail.email_only_checkout || "").toLowerCase() === "true" ||
    String(detail.checkout_access || "").toLowerCase() === "email_only";
  const legacyMarker = !asCleanText(detail.supabase_user_id, 200) && Boolean(asCleanText(detail.email, 320));
  return explicitMarker || legacyMarker;
}

function isNewFreeFunnelEvent(detail = {}) {
  return String(detail.limit_variant || "").toLowerCase() === "free_total_2";
}

function isPackIntentEvent(eventName, detail = {}) {
  if (eventName === "post_download_pack_clicked" || eventName === legacyPostDownloadPackClickedEvent) return true;
  if (eventName !== "pro_cta_clicked") return false;
  return isPackCheckoutPlan(detail.checkout_plan || detail.plan || detail.price_plan);
}

function packVisitorState(stages, visitorId) {
  if (!stages.has(visitorId)) {
    stages.set(visitorId, {
      variantSeen: false,
      resultReady: false,
      freeTestCompleted: false,
      freeTestExhausted: false,
      packClicked: false,
      emailCheckoutStarted: false,
      stripeSession: false,
      paid: false,
      exhaustedAfterCompletion: false,
      packClickedAfterCompletion: false,
      emailStartedAfterCompletion: false,
      stripeAfterCompletion: false,
      paidAfterCompletion: false,
    });
  }
  return stages.get(visitorId);
}

function updatePackVisitorFunnel(stages, event, detail = {}) {
  const visitorId = asCleanText(event.visitor_id || detail.visitor_id, 80);
  if (!visitorId) return;

  const eventName = String(event.event_name || "");
  const variantEvent = isNewFreeFunnelEvent(detail) || eventName === "free_test_completed" || eventName === "free_test_exhausted";
  const existingState = stages.get(visitorId);
  if (!variantEvent && !existingState?.freeTestCompleted) return;

  const state = packVisitorState(stages, visitorId);
  state.variantSeen = state.variantSeen || variantEvent;

  if (eventName === "download_ready_shown" && variantEvent) state.resultReady = true;
  if (eventName === "free_test_completed") state.freeTestCompleted = true;

  if (eventName === "free_test_exhausted") {
    state.freeTestExhausted = true;
    if (state.freeTestCompleted) state.exhaustedAfterCompletion = true;
  }

  if (isPackIntentEvent(eventName, detail)) {
    state.packClicked = true;
    if (state.freeTestCompleted) state.packClickedAfterCompletion = true;
  }

  if (eventName === "pro_checkout_started" && isPackCheckoutPlan(detail.checkout_plan || detail.plan || detail.price_plan)) {
    state.emailCheckoutStarted = true;
    if (state.freeTestCompleted) state.emailStartedAfterCompletion = true;
  }

  if (eventName === "pack_checkout_session_created") {
    state.stripeSession = true;
    if (state.freeTestCompleted) state.stripeAfterCompletion = true;
  }

  if (eventName === "pack_purchase_paid") {
    state.paid = true;
    if (state.freeTestCompleted) state.paidAfterCompletion = true;
  }
}

function packVisitorFunnelSummary(stages) {
  const visitors = Array.from(stages.values());
  const cohort = visitors.filter((visitor) => visitor.freeTestCompleted);
  const count = (collection, key) => collection.filter((visitor) => visitor[key]).length;
  const rate = (numerator, denominator) => denominator > 0 ? numerator / denominator : 0;
  const completed = cohort.length;
  const exhausted = count(cohort, "exhaustedAfterCompletion");
  const packClicked = count(cohort, "packClickedAfterCompletion");
  const emailCheckoutStarted = count(cohort, "emailStartedAfterCompletion");
  const stripeSession = count(cohort, "stripeAfterCompletion");
  const paid = count(cohort, "paidAfterCompletion");

  return {
    variant: "free_total_2",
    trackingStartedAt: "2026-07-12",
    uniqueVariantVisitors: count(visitors, "variantSeen"),
    resultReady: count(visitors, "resultReady"),
    completed,
    exhausted,
    packClicked,
    emailCheckoutStarted,
    stripeSession,
    paid,
    completionToExhaustedRate: rate(exhausted, completed),
    completionToPackClickRate: rate(packClicked, completed),
    packClickToStripeRate: rate(stripeSession, packClicked),
    stripeToPaidRate: rate(paid, stripeSession),
  };
}

function dateKeyDistance(fromDateKey, toDateKey) {
  const from = Date.parse(`${fromDateKey}T12:00:00Z`);
  const to = Date.parse(`${toDateKey}T12:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

export function validationExperimentSummary(events, timeZone, today) {
  const stages = new Map();
  const latestFeedbackByVisitor = new Map();
  const stripeSessionIds = new Set();
  const paidPackSessionIds = new Set();

  for (const event of events) {
    const date = toLocalDate(event.occurred_at, timeZone);
    if (!date || date < validationExperimentConfig.startDate || date > validationExperimentConfig.endDate) continue;

    const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
    updatePackVisitorFunnel(stages, event, detail);

    const stripeSessionId = asCleanText(
      detail.stripe_session_id || (event.event_name === "pack_purchase_paid" ? event.event_label : ""),
      160,
    );
    if (event.event_name === "pack_checkout_session_created") {
      stripeSessionIds.add(stripeSessionId || `created:${event.visitor_id || "unknown"}:${event.occurred_at}`);
    }
    if (event.event_name === "pack_purchase_paid") {
      paidPackSessionIds.add(stripeSessionId || `paid:${event.visitor_id || "unknown"}:${event.occurred_at}`);
    }

    const visitorId = asCleanText(event.visitor_id || detail.visitor_id, 80);
    const answer = asCleanText(detail.answer, 80).toLowerCase();
    if (event.event_name === "post_download_feedback_selected" && visitorId && validationFeedbackAnswers.includes(answer)) {
      latestFeedbackByVisitor.set(visitorId, answer);
    }
  }

  const funnel = packVisitorFunnelSummary(stages);
  for (const visitorId of latestFeedbackByVisitor.keys()) {
    if (!stages.get(visitorId)?.freeTestCompleted) latestFeedbackByVisitor.delete(visitorId);
  }
  const feedback = Object.fromEntries(validationFeedbackAnswers.map((answer) => [answer, 0]));
  for (const answer of latestFeedbackByVisitor.values()) feedback[answer] += 1;

  const leadingFeedback = Object.entries(feedback)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] || ["", 0];
  const stripeSessions = stripeSessionIds.size;
  const packPurchases = paidPackSessionIds.size;
  const deadlinePassed = today > validationExperimentConfig.endDate;
  const sampleReached = funnel.completed >= validationExperimentConfig.targetCompletedTests;
  const purchaseTargetReached = packPurchases >= validationExperimentConfig.targetPackPurchases;
  let status = "collecting";

  if (purchaseTargetReached) {
    status = "validated";
  } else if ((deadlinePassed || sampleReached) && packPurchases === 0 && stripeSessions < 3) {
    status = "stop_candidate";
  } else if (deadlinePassed || sampleReached) {
    status = "review";
  }

  return {
    ...validationExperimentConfig,
    status,
    deadlinePassed,
    sampleReached,
    purchaseTargetReached,
    daysRemaining: Math.max(dateKeyDistance(today, validationExperimentConfig.endDate), 0),
    uniqueVariantVisitors: funnel.uniqueVariantVisitors,
    resultReady: funnel.resultReady,
    completedTests: funnel.completed,
    exhaustedAfterTest: funnel.exhausted,
    packClicks: funnel.packClicked,
    stripeSessions,
    packPurchases,
    completedTestProgress: Math.min(funnel.completed / validationExperimentConfig.targetCompletedTests, 1),
    purchaseProgress: Math.min(packPurchases / validationExperimentConfig.targetPackPurchases, 1),
    feedbackResponses: latestFeedbackByVisitor.size,
    feedback,
    leadingFeedback: leadingFeedback[1] > 0 ? leadingFeedback[0] : "",
  };
}

function verifyAdminToken(request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const header = request.headers.authorization || "";
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

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return sendJson(response, 200, { ok: true });
  }

  if (request.method !== "GET") {
    return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
  }

  if (!verifyAdminToken(request)) {
    return sendJson(response, 401, { ok: false, error: "unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "batchcutout_events";

  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(response, 503, { ok: false, error: "supabase_not_configured" });
  }

  const days = Math.min(Math.max(Number(request.query.days || 14), 1), 60);
  const timeZone = statsTimeZoneFrom(request);
  const today = toLocalDate(new Date(), timeZone);
  const startDate = dateKeyOffset(today, days - 1) || today;
  const rollingSince = new Date(Date.now() - (days + 1) * 24 * 60 * 60 * 1000);
  rollingSince.setUTCHours(0, 0, 0, 0);
  const validationSince = new Date(`${validationExperimentConfig.startDate}T00:00:00Z`);
  const keepValidationWindow = today <= dateKeyOffset(validationExperimentConfig.endDate, -14);
  const since = keepValidationWindow && validationSince < rollingSince ? validationSince : rollingSince;
  const query = new URLSearchParams({
    select: "event_name,event_label,visitor_id,value,detail,source,campaign,page_path,page_location,occurred_at",
    occurred_at: `gte.${since.toISOString()}`,
    order: "occurred_at.asc",
  });

  try {
    const events = [];
    const pageSize = 1000;
    const maxEvents = 20000;

    for (let offset = 0; offset < maxEvents; offset += pageSize) {
      const pageQuery = new URLSearchParams(query);
      pageQuery.set("limit", String(pageSize));
      pageQuery.set("offset", String(offset));

      const supabaseResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}?${pageQuery}`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });

      if (!supabaseResponse.ok) {
        return sendJson(response, 502, {
          ok: false,
          error: "supabase_read_failed",
          status: supabaseResponse.status,
        });
      }

      const pageEvents = await supabaseResponse.json();
      events.push(...pageEvents.filter((event) => !isInternalValidationEvent(event)));
      if (pageEvents.length < pageSize) break;
    }

    const byDay = new Map();
    const visitorsByDay = new Map();
    const visitorsInWindow = new Set();
    const bySource = new Map();
    const visitorsBySource = new Map();
    const byCampaign = new Map();
    const visitorsByCampaign = new Map();
    const visitorStagesByCampaign = new Map();
    const byLandingPage = new Map();
    const visitorsByLandingPage = new Map();
    const packVisitorStages = new Map();
    let eventCount = 0;

    for (const event of events) {
      const date = toLocalDate(event.occurred_at, timeZone);
      if (!date) continue;
      if (date < startDate || date > today) continue;
      eventCount += 1;

      if (!byDay.has(date)) byDay.set(date, emptyDay(date));
      if (!visitorsByDay.has(date)) visitorsByDay.set(date, new Set());

      const row = byDay.get(date);
      const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
      const value = Number(event.value || detail.count || detail.accepted || 0) || 0;
      const sourceName = classifySource(event, detail);
      updatePackVisitorFunnel(packVisitorStages, event, detail);

      if (!bySource.has(sourceName)) bySource.set(sourceName, emptySourceRow(sourceName));
      if (!visitorsBySource.has(sourceName)) visitorsBySource.set(sourceName, new Set());
      const sourceRow = bySource.get(sourceName);
      sourceRow.events += 1;
      if (event.visitor_id) visitorsBySource.get(sourceName).add(event.visitor_id);

      const attribution = campaignAttribution(event, detail, sourceName);
      let campaignRow = null;
      let sourceMetricsBefore = null;
      if (attribution) {
        if (!byCampaign.has(attribution.key)) byCampaign.set(attribution.key, emptyCampaignRow(attribution));
        if (!visitorsByCampaign.has(attribution.key)) visitorsByCampaign.set(attribution.key, new Set());
        if (!visitorStagesByCampaign.has(attribution.key)) visitorStagesByCampaign.set(attribution.key, emptyCampaignVisitorStages());
        campaignRow = byCampaign.get(attribution.key);
        campaignRow.events += 1;
        if (!campaignRow.landingPage) campaignRow.landingPage = campaignLandingPage(event, detail);
        if (event.visitor_id) visitorsByCampaign.get(attribution.key).add(event.visitor_id);
        updateCampaignVisitorStages(visitorStagesByCampaign.get(attribution.key), event.event_name, detail, event.visitor_id);
        sourceMetricsBefore = numericSnapshot(sourceRow);
      }

      if (event.visitor_id) visitorsByDay.get(date).add(event.visitor_id);
      if (event.visitor_id) visitorsInWindow.add(event.visitor_id);

      if ([
        "seo_landing_view",
        "seo_landing_cta_clicked",
        "directory_launch_page_view",
        "directory_launch_cta_clicked",
      ].includes(event.event_name)) {
        const landingPath = landingPageFromEvent(event, detail);
        if (landingPath) {
          if (!byLandingPage.has(landingPath)) byLandingPage.set(landingPath, emptyLandingPageRow(landingPath));
          if (!visitorsByLandingPage.has(landingPath)) visitorsByLandingPage.set(landingPath, new Set());

          const landingRow = byLandingPage.get(landingPath);
          const title = asCleanText(detail.page_title, 160);
          if (title && !landingRow.pageTitle) landingRow.pageTitle = title;
          if (event.visitor_id) visitorsByLandingPage.get(landingPath).add(event.visitor_id);

          if (event.event_name === "seo_landing_view" || event.event_name === "directory_launch_page_view") {
            landingRow.views += 1;
          } else {
            landingRow.ctaClicks += 1;
            if (detail.target === "tool") {
              landingRow.toolClicks += 1;
            } else if (detail.target === "pricing") {
              landingRow.pricingClicks += 1;
              if (detail.checkout_plan) landingRow.checkoutPlanClicks += 1;
            } else if (detail.target === "external") {
              landingRow.externalClicks += 1;
            } else {
              landingRow.internalClicks += 1;
            }
          }
        }
      }

      switch (event.event_name) {
        case "seo_landing_view":
          row.pageViews += 1;
          row.seoLandingViews += 1;
          sourceRow.pageViews += 1;
          sourceRow.seoLandingViews += 1;
          break;
        case "seo_landing_cta_clicked":
          row.seoLandingCtaClicks += 1;
          sourceRow.seoLandingCtaClicks += 1;
          if (detail.target === "pricing") {
            row.pricingCtaClicks += 1;
            sourceRow.pricingCtaClicks += 1;
            if (isPackCheckoutPlan(detail.checkout_plan || detail.plan || detail.price_plan)) {
              row.packCtaClicks += 1;
              sourceRow.packCtaClicks += 1;
            } else {
              row.subscriptionCtaClicks += 1;
              sourceRow.subscriptionCtaClicks += 1;
            }
          }
          break;
        case "directory_launch_page_view":
          row.pageViews += 1;
          row.directoryLaunchPageViews += 1;
          sourceRow.pageViews += 1;
          sourceRow.directoryLaunchPageViews += 1;
          break;
        case "directory_launch_cta_clicked":
          row.directoryLaunchCtaClicks += 1;
          sourceRow.directoryLaunchCtaClicks += 1;
          if (detail.target === "pricing") {
            row.pricingCtaClicks += 1;
            sourceRow.pricingCtaClicks += 1;
            if (isPackCheckoutPlan(detail.checkout_plan || detail.plan || detail.price_plan)) {
              row.packCtaClicks += 1;
              sourceRow.packCtaClicks += 1;
            } else {
              row.subscriptionCtaClicks += 1;
              sourceRow.subscriptionCtaClicks += 1;
            }
          }
          break;
        case "proof_page_view":
          row.pageViews += 1;
          row.proofPageViews += 1;
          sourceRow.pageViews += 1;
          sourceRow.proofPageViews += 1;
          break;
        case "proof_cta_clicked":
          row.proofCtaClicks += 1;
          sourceRow.proofCtaClicks += 1;
          if (detail.target === "pricing") {
            row.pricingCtaClicks += 1;
            sourceRow.pricingCtaClicks += 1;
            if (isPackCheckoutPlan(detail.checkout_plan || detail.plan || detail.price_plan)) {
              row.packCtaClicks += 1;
              sourceRow.packCtaClicks += 1;
            } else {
              row.subscriptionCtaClicks += 1;
              sourceRow.subscriptionCtaClicks += 1;
            }
          }
          break;
        case "pro_page_view":
        case "tool_page_view":
          row.pageViews += 1;
          sourceRow.pageViews += 1;
          break;
        case "tool_upload_started":
          row.uploadsStarted += 1;
          sourceRow.uploadsStarted += 1;
          break;
        case "tool_upload_added":
          row.imagesAccepted += Number(detail.count || value || 0) || 0;
          sourceRow.imagesAccepted += Number(detail.count || value || 0) || 0;
          break;
        case "batch_limit_exceeded":
          row.limitAttempts += 1;
          sourceRow.limitAttempts += 1;
          break;
        case "free_test_completed":
          row.freeTestCompletions += 1;
          sourceRow.freeTestCompletions += 1;
          break;
        case "free_test_exhausted":
          row.freeTestExhaustedAttempts += 1;
          sourceRow.freeTestExhaustedAttempts += 1;
          break;
        case "tool_processing_completed":
          row.processingCompleted += 1;
          break;
        case "tool_engine_load_failed":
          row.engineLoadFailures += 1;
          sourceRow.engineLoadFailures += 1;
          break;
        case "tool_zip_generation_failed":
          row.zipGenerationFailures += 1;
          sourceRow.zipGenerationFailures += 1;
          break;
        case "download_ready_shown":
          row.downloadReadyShown += 1;
          break;
        case "tool_download_png":
          row.pngDownloads += 1;
          row.downloads += 1;
          sourceRow.downloads += 1;
          break;
        case "tool_download_zip":
          row.zipDownloads += 1;
          row.downloads += 1;
          sourceRow.zipDownloads += 1;
          sourceRow.downloads += 1;
          break;
        case "post_download_next_shown":
          row.postDownloadNextShown += 1;
          sourceRow.postDownloadNextShown += 1;
          break;
        case "post_download_pack_clicked":
        case legacyPostDownloadPackClickedEvent:
          row.postDownloadPackClicks += 1;
          sourceRow.postDownloadPackClicks += 1;
          if (detail.reason === "result_ready_sticky") {
            row.resultReadyStickyPackClicks += 1;
            sourceRow.resultReadyStickyPackClicks += 1;
          }
          if (detail.reason === "actions_result_ready" || detail.reason === "actions_result_ready_pack") {
            row.resultActionPackClicks += 1;
            sourceRow.resultActionPackClicks += 1;
          }
          break;
        case "post_download_save_link_clicked":
          row.postDownloadSaveLinkClicks += 1;
          sourceRow.postDownloadSaveLinkClicks += 1;
          if (detail.source === "result_ready_sticky") {
            row.resultReadyStickySaveLinkClicks += 1;
            sourceRow.resultReadyStickySaveLinkClicks += 1;
          }
          break;
        case "post_download_feedback_selected":
          row.postDownloadFeedbacks += 1;
          sourceRow.postDownloadFeedbacks += 1;
          if (detail.answer === "larger_batches") {
            row.postDownloadLargerBatchFeedbacks += 1;
            sourceRow.postDownloadLargerBatchFeedbacks += 1;
          }
          if (detail.answer === "no_more_photos") {
            row.postDownloadNoMorePhotosFeedbacks += 1;
            sourceRow.postDownloadNoMorePhotosFeedbacks += 1;
          }
          if (detail.answer === "needs_quality") {
            row.postDownloadQualityFeedbacks += 1;
            sourceRow.postDownloadQualityFeedbacks += 1;
          }
          if (detail.answer === "needs_catalog_finish") {
            row.postDownloadCatalogFinishFeedbacks += 1;
            sourceRow.postDownloadCatalogFinishFeedbacks += 1;
          }
          if (detail.answer === "price_not_worth_it") {
            row.postDownloadPriceFeedbacks += 1;
            sourceRow.postDownloadPriceFeedbacks += 1;
          }
          break;
        case "tool_pro_clicked":
          if (isCheckoutPlan(detail.checkout_plan || detail.plan || detail.price_plan)) {
            row.proClicks += 1;
            sourceRow.proClicks += 1;
          }
          break;
        case "pro_prompt_shown":
          row.upgradePromptViews += 1;
          sourceRow.upgradePromptViews += 1;
          if (detail.reason === "result_ready_sticky") {
            row.resultReadyStickyShown += 1;
            sourceRow.resultReadyStickyShown += 1;
          }
          break;
        case "pro_cta_clicked":
          row.pricingCtaClicks += 1;
          sourceRow.pricingCtaClicks += 1;
          if (isPackCheckoutPlan(detail.checkout_plan || detail.plan || detail.price_plan)) {
            row.packCtaClicks += 1;
            sourceRow.packCtaClicks += 1;
          } else {
            row.subscriptionCtaClicks += 1;
            sourceRow.subscriptionCtaClicks += 1;
          }
          break;
        case "high_volume_contact_clicked":
          row.highVolumeContacts += 1;
          sourceRow.highVolumeContacts += 1;
          break;
        case "monthly_limit_reached":
          row.monthlyLimitReached += 1;
          sourceRow.monthlyLimitReached += 1;
          break;
        case "pro_checkout_login_required":
          row.checkoutLoginRequired += 1;
          sourceRow.checkoutLoginRequired += 1;
          break;
        case "pro_checkout_email_required":
          row.packEmailRequired += 1;
          sourceRow.packEmailRequired += 1;
          break;
        case "account_checkout_panel_shown":
          row.accountCheckoutPanelViews += 1;
          sourceRow.accountCheckoutPanelViews += 1;
          break;
        case "account_form_interacted":
          row.accountFormInteractions += 1;
          sourceRow.accountFormInteractions += 1;
          break;
        case "pro_checkout_started":
          row.checkoutStarts += 1;
          sourceRow.checkoutStarts += 1;
          if (detail.email_only_checkout || detail.source === "email_pack") {
            row.packEmailCheckoutStarts += 1;
            sourceRow.packEmailCheckoutStarts += 1;
          }
          break;
        case "pro_checkout_email_failed":
          row.packEmailCheckoutFailures += 1;
          sourceRow.packEmailCheckoutFailures += 1;
          break;
        case "pro_checkout_cancelled_return":
          row.checkoutCancelledReturns += 1;
          sourceRow.checkoutCancelledReturns += 1;
          break;
        case "checkout_continue_error_shown":
          row.checkoutContinueErrors += 1;
          sourceRow.checkoutContinueErrors += 1;
          break;
        case "pro_checkout_session_created":
          row.checkoutSessionsCreated += 1;
          sourceRow.checkoutSessionsCreated += 1;
          break;
        case "pack_checkout_session_created":
          row.checkoutSessionsCreated += 1;
          row.packCheckoutSessions += 1;
          sourceRow.checkoutSessionsCreated += 1;
          sourceRow.packCheckoutSessions += 1;
          if (isEmailOnlyPackCheckout(detail)) {
            row.packEmailCheckoutSessions += 1;
            sourceRow.packEmailCheckoutSessions += 1;
          }
          break;
        case "pro_checkout_session_failed":
          row.checkoutSessionFailures += 1;
          sourceRow.checkoutSessionFailures += 1;
          break;
        case "checkout_link_email_sent":
          row.checkoutLinkEmailsSent += 1;
          sourceRow.checkoutLinkEmailsSent += 1;
          break;
        case "checkout_link_email_clicked":
          row.checkoutLinkEmailClicks += 1;
          sourceRow.checkoutLinkEmailClicks += 1;
          break;
        case "checkout_link_email_failed":
          row.checkoutLinkEmailFailures += 1;
          sourceRow.checkoutLinkEmailFailures += 1;
          break;
        case "pro_subscription_paid":
          row.paidSubscriptions += 1;
          sourceRow.paidSubscriptions += 1;
          row.revenue += Number(event.value || 0) || 0;
          sourceRow.revenue += Number(event.value || 0) || 0;
          break;
        case "pack_purchase_paid":
          row.packPurchases += 1;
          sourceRow.packPurchases += 1;
          row.packRevenue += Number(event.value || 0) || 0;
          sourceRow.packRevenue += Number(event.value || 0) || 0;
          row.revenue += Number(event.value || 0) || 0;
          sourceRow.revenue += Number(event.value || 0) || 0;
          break;
        case "pro_payment_failed":
          row.paymentFailures += 1;
          sourceRow.paymentFailures += 1;
          row.paymentFailureValue += Number(event.value || 0) || 0;
          sourceRow.paymentFailureValue += Number(event.value || 0) || 0;
          break;
        case "pro_subscription_cancel_scheduled":
          row.subscriptionCancelScheduled += 1;
          sourceRow.subscriptionCancelScheduled += 1;
          break;
        case "pro_subscription_canceled":
          row.subscriptionCanceled += 1;
          sourceRow.subscriptionCanceled += 1;
          break;
        case "account_signup_started":
          row.accountSignupStarts += 1;
          sourceRow.accountSignupStarts += 1;
          break;
        case "account_form_validation_failed":
          row.accountValidationFailures += 1;
          sourceRow.accountValidationFailures += 1;
          break;
        case "account_signup_failed":
          row.accountSignupFailures += 1;
          sourceRow.accountSignupFailures += 1;
          break;
        case "account_signup_succeeded":
          row.accountSignups += 1;
          sourceRow.accountSignups += 1;
          break;
        case "account_email_confirmation_required":
          row.accountEmailConfirmations += 1;
          sourceRow.accountEmailConfirmations += 1;
          break;
        case "account_email_confirmation_resent":
          row.accountEmailConfirmationResends += 1;
          sourceRow.accountEmailConfirmationResends += 1;
          break;
        case "account_login_succeeded":
          row.accountLogins += 1;
          sourceRow.accountLogins += 1;
          break;
        case "account_login_failed":
          row.accountLoginFailures += 1;
          sourceRow.accountLoginFailures += 1;
          break;
        case "lead_capture_submitted":
          row.leadCaptures += 1;
          sourceRow.leadCaptures += 1;
          if (["result_ready", "result_ready_inline", "result_ready_sticky"].includes(detail.capture_source || detail.source)) {
            row.resultReadyLeadCaptures += 1;
            sourceRow.resultReadyLeadCaptures += 1;
          }
          if ((detail.capture_source || detail.source) === "tool_limit_prompt") {
            row.limitPromptLeadCaptures += 1;
            sourceRow.limitPromptLeadCaptures += 1;
          }
          if ((detail.capture_source || detail.source) === "checkout_account_prompt") {
            row.checkoutPromptLeadCaptures += 1;
            sourceRow.checkoutPromptLeadCaptures += 1;
          }
          break;
        case "lead_capture_autoreply_sent":
          row.leadAutorepliesSent += 1;
          sourceRow.leadAutorepliesSent += 1;
          break;
        case "lead_capture_autoreply_failed":
          row.leadAutorepliesFailed += 1;
          sourceRow.leadAutorepliesFailed += 1;
          break;
        case "pro_welcome_email_sent":
          row.proWelcomeEmailsSent += 1;
          sourceRow.proWelcomeEmailsSent += 1;
          break;
        case "pro_welcome_email_failed":
          row.proWelcomeEmailsFailed += 1;
          sourceRow.proWelcomeEmailsFailed += 1;
          break;
        case "partner_page_view":
          row.pageViews += 1;
          row.partnerPageViews += 1;
          sourceRow.pageViews += 1;
          sourceRow.partnerPageViews += 1;
          break;
        case "partner_cta_clicked":
          row.partnerCtaClicks += 1;
          sourceRow.partnerCtaClicks += 1;
          break;
        case "partner_referral_copy":
          row.partnerReferralCopies += 1;
          sourceRow.partnerReferralCopies += 1;
          break;
        case "billing_portal_opened":
          row.billingPortalOpens += 1;
          sourceRow.billingPortalOpens += 1;
          break;
        default:
          break;
      }

      applyNumericDeltas(sourceMetricsBefore, sourceRow, campaignRow, new Set(["events", "visitors"]));
    }

    for (const [date, visitors] of visitorsByDay) {
      byDay.get(date).visitors = visitors.size;
    }
    for (const [source, visitors] of visitorsBySource) {
      bySource.get(source).visitors = visitors.size;
    }
    for (const [campaignKey, visitors] of visitorsByCampaign) {
      const campaignRow = byCampaign.get(campaignKey);
      const stages = visitorStagesByCampaign.get(campaignKey) || emptyCampaignVisitorStages();
      campaignRow.visitors = visitors.size;
      campaignRow.uploadVisitors = stages.upload.size;
      campaignRow.downloadVisitors = stages.download.size;
      campaignRow.paidIntentVisitors = stages.paidIntent.size;
      campaignRow.packClickVisitors = stages.packClick.size;
      campaignRow.accountVisitors = stages.account.size;
      campaignRow.stripeVisitors = stages.stripe.size;
      campaignRow.purchaseVisitors = stages.purchase.size;
      campaignRow.uploadRate = campaignRow.visitors ? campaignRow.uploadVisitors / campaignRow.visitors : 0;
      campaignRow.downloadRate = campaignRow.visitors ? campaignRow.downloadVisitors / campaignRow.visitors : 0;
      campaignRow.paidIntentRate = campaignRow.visitors ? campaignRow.paidIntentVisitors / campaignRow.visitors : 0;
    }
    for (const [pagePath, visitors] of visitorsByLandingPage) {
      const landingRow = byLandingPage.get(pagePath);
      landingRow.visitors = visitors.size;
      landingRow.intentClicks = landingRow.toolClicks + landingRow.pricingClicks;
      landingRow.ctaRate = landingRow.views ? landingRow.ctaClicks / landingRow.views : 0;
      landingRow.pricingRate = landingRow.views ? landingRow.pricingClicks / landingRow.views : 0;
    }

    const rows = Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date));
    const totals = rows.reduce((acc, row) => {
      for (const [key, value] of Object.entries(row)) {
        if (key === "date") continue;
        if (typeof value !== "number") continue;
        acc[key] = (acc[key] || 0) + value;
      }
      return acc;
    }, {});
    totals.visitorDays = totals.visitors || 0;
    totals.visitors = visitorsInWindow.size;
    const sourceBreakdown = Array.from(bySource.values())
      .sort((a, b) =>
        b.revenue - a.revenue ||
        ((b.paidSubscriptions || 0) + (b.packPurchases || 0)) - ((a.paidSubscriptions || 0) + (a.packPurchases || 0)) ||
        b.visitors - a.visitors ||
        b.pageViews - a.pageViews ||
        b.events - a.events
      )
      .slice(0, 20);
    const packSourceBreakdown = Array.from(bySource.values())
      .filter((row) =>
        (row.freeTestCompletions || 0) +
        (row.freeTestExhaustedAttempts || 0) +
        (row.postDownloadPackClicks || 0) +
        (row.packCtaClicks || 0) +
        (row.packEmailRequired || 0) +
        (row.packEmailCheckoutStarts || 0) +
        (row.packEmailCheckoutSessions || 0) +
        (row.packCheckoutSessions || 0) +
        (row.packPurchases || 0) > 0
      )
      .sort((a, b) =>
        b.packRevenue - a.packRevenue ||
        b.packPurchases - a.packPurchases ||
        b.packEmailCheckoutSessions - a.packEmailCheckoutSessions ||
        b.packCheckoutSessions - a.packCheckoutSessions ||
        b.packEmailCheckoutStarts - a.packEmailCheckoutStarts ||
        b.freeTestExhaustedAttempts - a.freeTestExhaustedAttempts ||
        b.freeTestCompletions - a.freeTestCompletions ||
        ((b.postDownloadPackClicks || 0) + (b.packCtaClicks || 0)) -
          ((a.postDownloadPackClicks || 0) + (a.packCtaClicks || 0))
      )
      .slice(0, 12);
    const campaignBreakdown = Array.from(byCampaign.values())
      .sort((a, b) =>
        b.revenue - a.revenue ||
        ((b.paidSubscriptions || 0) + (b.packPurchases || 0)) - ((a.paidSubscriptions || 0) + (a.packPurchases || 0)) ||
        b.checkoutSessionsCreated - a.checkoutSessionsCreated ||
        ((b.proClicks || 0) + (b.pricingCtaClicks || 0)) - ((a.proClicks || 0) + (a.pricingCtaClicks || 0)) ||
        b.downloads - a.downloads ||
        b.visitors - a.visitors ||
        b.events - a.events
      )
      .slice(0, 40);
    const landingBreakdown = Array.from(byLandingPage.values())
      .sort((a, b) =>
        b.pricingClicks - a.pricingClicks ||
        b.toolClicks - a.toolClicks ||
        b.ctaClicks - a.ctaClicks ||
        b.views - a.views ||
        b.visitors - a.visitors ||
        a.pagePath.localeCompare(b.pagePath)
      )
      .slice(0, 20);

    return sendJson(response, 200, {
      ok: true,
      days,
      timeZone,
      today,
      startDate,
      eventCount,
      fetchedEventCount: events.length,
      rows,
      totals,
      packVisitorFunnel: packVisitorFunnelSummary(packVisitorStages),
      validationExperiment: validationExperimentSummary(events, timeZone, today),
      sourceBreakdown,
      packSourceBreakdown,
      campaignBreakdown,
      landingBreakdown,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: "stats_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
