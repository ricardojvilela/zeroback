import crypto from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://batchcutout.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function sendJson(response, status, data) {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.setHeader(key, value);
  }
  response.setHeader("Content-Type", "application/json");
  response.status(status).json(data);
}

function toIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
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
    processingCompleted: 0,
    downloadReadyShown: 0,
    downloads: 0,
    pngDownloads: 0,
    zipDownloads: 0,
    postDownloadNextShown: 0,
    postDownloadFounderClicks: 0,
    postDownloadSaveLinkClicks: 0,
    postDownloadFeedbacks: 0,
    postDownloadLargerBatchFeedbacks: 0,
    proofPageViews: 0,
    proofCtaClicks: 0,
    proClicks: 0,
    pricingCtaClicks: 0,
    highVolumeContacts: 0,
    monthlyLimitReached: 0,
    checkoutLoginRequired: 0,
    checkoutStarts: 0,
    checkoutCancelledReturns: 0,
    checkoutContinueErrors: 0,
    checkoutSessionsCreated: 0,
    checkoutSessionFailures: 0,
    checkoutLinkEmailsSent: 0,
    checkoutLinkEmailClicks: 0,
    checkoutLinkEmailFailures: 0,
    paidSubscriptions: 0,
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
  const referrerHost = hostnameFrom(referrer);
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
    downloads: 0,
    zipDownloads: 0,
    postDownloadNextShown: 0,
    postDownloadFounderClicks: 0,
    postDownloadSaveLinkClicks: 0,
    postDownloadFeedbacks: 0,
    postDownloadLargerBatchFeedbacks: 0,
    proofPageViews: 0,
    proofCtaClicks: 0,
    proClicks: 0,
    pricingCtaClicks: 0,
    highVolumeContacts: 0,
    monthlyLimitReached: 0,
    checkoutLoginRequired: 0,
    checkoutStarts: 0,
    checkoutCancelledReturns: 0,
    checkoutContinueErrors: 0,
    checkoutSessionsCreated: 0,
    checkoutSessionFailures: 0,
    checkoutLinkEmailsSent: 0,
    checkoutLinkEmailClicks: 0,
    checkoutLinkEmailFailures: 0,
    paidSubscriptions: 0,
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
  const since = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);
  const query = new URLSearchParams({
    select: "event_name,visitor_id,value,detail,source,campaign,page_path,page_location,occurred_at",
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
    const bySource = new Map();
    const visitorsBySource = new Map();
    const byLandingPage = new Map();
    const visitorsByLandingPage = new Map();

    for (const event of events) {
      const date = toIsoDate(event.occurred_at);
      if (!date) continue;

      if (!byDay.has(date)) byDay.set(date, emptyDay(date));
      if (!visitorsByDay.has(date)) visitorsByDay.set(date, new Set());

      const row = byDay.get(date);
      const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
      const value = Number(event.value || detail.count || detail.accepted || 0) || 0;
      const sourceName = classifySource(event, detail);

      if (!bySource.has(sourceName)) bySource.set(sourceName, emptySourceRow(sourceName));
      if (!visitorsBySource.has(sourceName)) visitorsBySource.set(sourceName, new Set());
      const sourceRow = bySource.get(sourceName);
      sourceRow.events += 1;
      if (event.visitor_id) visitorsBySource.get(sourceName).add(event.visitor_id);

      if (event.visitor_id) visitorsByDay.get(date).add(event.visitor_id);

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
          } else if (detail.target === "tool") {
            row.proClicks += 1;
            sourceRow.proClicks += 1;
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
          } else if (detail.target === "tool") {
            row.proClicks += 1;
            sourceRow.proClicks += 1;
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
          break;
        case "tool_processing_completed":
          row.processingCompleted += 1;
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
        case "post_download_founder_clicked":
          row.postDownloadFounderClicks += 1;
          sourceRow.postDownloadFounderClicks += 1;
          break;
        case "post_download_save_link_clicked":
          row.postDownloadSaveLinkClicks += 1;
          sourceRow.postDownloadSaveLinkClicks += 1;
          break;
        case "post_download_feedback_selected":
          row.postDownloadFeedbacks += 1;
          sourceRow.postDownloadFeedbacks += 1;
          if (detail.answer === "larger_batches") {
            row.postDownloadLargerBatchFeedbacks += 1;
            sourceRow.postDownloadLargerBatchFeedbacks += 1;
          }
          break;
        case "tool_pro_clicked":
          row.proClicks += 1;
          sourceRow.proClicks += 1;
          break;
        case "pro_cta_clicked":
          row.pricingCtaClicks += 1;
          sourceRow.pricingCtaClicks += 1;
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
          if (["result_ready", "result_ready_inline"].includes(detail.capture_source || detail.source)) {
            row.resultReadyLeadCaptures += 1;
            sourceRow.resultReadyLeadCaptures += 1;
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
    }

    for (const [date, visitors] of visitorsByDay) {
      byDay.get(date).visitors = visitors.size;
    }
    for (const [source, visitors] of visitorsBySource) {
      bySource.get(source).visitors = visitors.size;
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
    const sourceBreakdown = Array.from(bySource.values())
      .sort((a, b) =>
        b.revenue - a.revenue ||
        b.paidSubscriptions - a.paidSubscriptions ||
        b.visitors - a.visitors ||
        b.pageViews - a.pageViews ||
        b.events - a.events
      )
      .slice(0, 20);
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
      eventCount: events.length,
      rows,
      totals,
      sourceBreakdown,
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
