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
    proClicks: 0,
    pricingCtaClicks: 0,
    checkoutLoginRequired: 0,
    checkoutStarts: 0,
    checkoutSessionsCreated: 0,
    paidSubscriptions: 0,
    revenue: 0,
    accountSignupStarts: 0,
    accountSignups: 0,
    accountLogins: 0,
    leadCaptures: 0,
    leadAutorepliesSent: 0,
    leadAutorepliesFailed: 0,
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
    "hero",
    "pricing",
    "pricing-page",
    "seo",
    "landing",
    "use-cases",
    "admin",
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
  const medium = asCleanText(detail.utm_medium || detail.medium, 80).toLowerCase();
  const campaign = asCleanText(event.campaign || detail.utm_campaign || detail.campaign || detail.last_campaign || detail.first_campaign, 200);
  const referrer = asCleanText(detail.referrer || "", 500);
  const referrerHost = hostnameFrom(referrer);
  const raw = [source, campaign, referrerHost].filter(Boolean).join(" ").toLowerCase();

  if (detail.gclid || detail.gbraid || detail.wbraid || (raw.includes("google") && ["cpc", "paid", "ads"].some((term) => medium.includes(term)))) {
    return "Google Ads";
  }
  if (raw.includes("saashub")) return "SaaSHub";
  if (raw.includes("uneed")) return "Uneed";
  if (raw.includes("betalist") || raw.includes("beta list")) return "BetaList";
  if (raw.includes("indiehackers") || raw.includes("indie hackers")) return "Indie Hackers";
  if (raw.includes("zearches")) return "Zearches";
  if (raw.includes("listai")) return "ListAI";
  if (raw.includes("thenextai") || raw.includes("the next ai")) return "The Next AI";
  if (raw.includes("future-pedia") || raw.includes("futurepedia")) return "Future-pedia";
  if (raw.includes("producthunt") || raw.includes("product hunt")) return "Product Hunt";
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
    uploadsStarted: 0,
    imagesAccepted: 0,
    downloads: 0,
    zipDownloads: 0,
    postDownloadNextShown: 0,
    postDownloadFounderClicks: 0,
    postDownloadSaveLinkClicks: 0,
    proClicks: 0,
    pricingCtaClicks: 0,
    checkoutLoginRequired: 0,
    checkoutStarts: 0,
    checkoutSessionsCreated: 0,
    paidSubscriptions: 0,
    revenue: 0,
    accountSignupStarts: 0,
    accountSignups: 0,
    accountLogins: 0,
    leadCaptures: 0,
    leadAutorepliesSent: 0,
    leadAutorepliesFailed: 0,
    billingPortalOpens: 0,
    events: 0,
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
    event.visitor_id === "codex-validation-visitor"
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
    select: "event_name,visitor_id,value,detail,source,campaign,occurred_at",
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

      switch (event.event_name) {
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
        case "tool_pro_clicked":
          row.proClicks += 1;
          sourceRow.proClicks += 1;
          break;
        case "pro_cta_clicked":
          row.pricingCtaClicks += 1;
          sourceRow.pricingCtaClicks += 1;
          break;
        case "pro_checkout_login_required":
          row.checkoutLoginRequired += 1;
          sourceRow.checkoutLoginRequired += 1;
          break;
        case "pro_checkout_started":
          row.checkoutStarts += 1;
          sourceRow.checkoutStarts += 1;
          break;
        case "pro_checkout_session_created":
          row.checkoutSessionsCreated += 1;
          sourceRow.checkoutSessionsCreated += 1;
          break;
        case "pro_subscription_paid":
          row.paidSubscriptions += 1;
          sourceRow.paidSubscriptions += 1;
          row.revenue += Number(event.value || 0) || 0;
          sourceRow.revenue += Number(event.value || 0) || 0;
          break;
        case "account_signup_started":
          row.accountSignupStarts += 1;
          sourceRow.accountSignupStarts += 1;
          break;
        case "account_signup_succeeded":
          row.accountSignups += 1;
          sourceRow.accountSignups += 1;
          break;
        case "account_login_succeeded":
          row.accountLogins += 1;
          sourceRow.accountLogins += 1;
          break;
        case "lead_capture_submitted":
          row.leadCaptures += 1;
          sourceRow.leadCaptures += 1;
          break;
        case "lead_capture_autoreply_sent":
          row.leadAutorepliesSent += 1;
          sourceRow.leadAutorepliesSent += 1;
          break;
        case "lead_capture_autoreply_failed":
          row.leadAutorepliesFailed += 1;
          sourceRow.leadAutorepliesFailed += 1;
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

    return sendJson(response, 200, {
      ok: true,
      days,
      eventCount: events.length,
      rows,
      totals,
      sourceBreakdown,
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
