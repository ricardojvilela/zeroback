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
    proClicks: 0,
    proPrompts: 0,
    proEmailStarts: 0,
    proEmailInvalid: 0,
    proEmailSubmits: 0,
    proPageViews: 0,
    proSubmitAttempts: 0,
  };
}

function emptyTrialStats() {
  return {
    visitors: 0,
    pageViews: 0,
    uploadsStarted: 0,
    imagesAccepted: 0,
    processingCompleted: 0,
    downloadReadyShown: 0,
    downloads: 0,
    pngDownloads: 0,
    zipDownloads: 0,
    proPrompts: 0,
    proEmailStarts: 0,
    proEmailSubmits: 0,
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
  const rawEventSource = asCleanText(event.source || detail.source, 200);
  const internalSources = new Set([
    "tool_inline",
    "tool_limit_prompt",
    "tool_empty_state",
    "post_download",
    "hero",
    "pricing",
    "admin",
  ]);
  const eventSource = internalSources.has(rawEventSource.toLowerCase()) ? "" : rawEventSource;
  const source = asCleanText(detail.utm_source || detail.last_source || detail.first_source || eventSource, 200);
  const medium = asCleanText(detail.utm_medium || detail.medium, 80).toLowerCase();
  const campaign = asCleanText(event.campaign || detail.utm_campaign || detail.campaign || detail.last_campaign || detail.first_campaign, 200);
  const referrer = asCleanText(detail.referrer || "", 500);
  const referrerHost = hostnameFrom(referrer);
  const raw = [source, campaign, referrerHost].filter(Boolean).join(" ").toLowerCase();

  if (detail.gclid || detail.gbraid || detail.wbraid || (raw.includes("google") && ["cpc", "paid", "ads"].some((term) => medium.includes(term)))) {
    return "Google Ads";
  }
  if (raw.includes("saashub")) return "SaaSHub";
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
    proClicks: 0,
    proEmailSubmits: 0,
    events: 0,
  };
}

function isTrialEvent(event, detail) {
  return (
    event.event_name === "trial_page_view" ||
    Number(detail.free_limit || 0) === 100 ||
    detail.limit_variant === "limit_100"
  );
}

function addTrialEvent(row, event, detail, value) {
  if (!isTrialEvent(event, detail)) return;
  if (!row.trial) row.trial = emptyTrialStats();

  switch (event.event_name) {
    case "trial_page_view":
    case "tool_page_view":
      row.trial.pageViews += 1;
      break;
    case "tool_upload_started":
      row.trial.uploadsStarted += 1;
      break;
    case "tool_upload_added":
      row.trial.imagesAccepted += Number(detail.count || value || 0) || 0;
      break;
    case "tool_processing_completed":
      row.trial.processingCompleted += 1;
      break;
    case "download_ready_shown":
      row.trial.downloadReadyShown += 1;
      break;
    case "tool_download_png":
      row.trial.pngDownloads += 1;
      row.trial.downloads += 1;
      break;
    case "tool_download_zip":
      row.trial.zipDownloads += 1;
      row.trial.downloads += 1;
      break;
    case "pro_prompt_shown":
      row.trial.proPrompts += 1;
      break;
    case "pro_email_started":
      row.trial.proEmailStarts += 1;
      break;
    case "pro_email_submitted":
      row.trial.proEmailSubmits += 1;
      break;
    default:
      break;
  }
}

function getRecentProLeads(events) {
  return events
    .filter((event) => event.event_name === "pro_email_submitted")
    .map((event) => {
      const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
      return {
        date: toIsoDate(event.occurred_at),
        occurredAt: event.occurred_at,
        email: typeof detail.email === "string" ? detail.email : "",
        company: typeof detail.company === "string" ? detail.company : "",
        reason: typeof detail.reason === "string" ? detail.reason : "",
        source: typeof detail.source === "string" ? detail.source : "",
        freeLimit: Number(detail.free_limit || 0) || null,
        processedImages: Number(detail.processed_images || 0) || null,
        offer: typeof detail.offer === "string" ? detail.offer : "",
        trialDays: Number(detail.trial_days || 0) || null,
        trialLimit: Number(detail.trial_limit || 0) || null,
        pageLocation: typeof detail.page_location === "string" ? detail.page_location : "",
      };
    })
    .sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)))
    .slice(0, 20);
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
      events.push(...pageEvents);
      if (pageEvents.length < pageSize) break;
    }

    const byDay = new Map();
    const visitorsByDay = new Map();
    const trialVisitorsByDay = new Map();
    const bySource = new Map();
    const visitorsBySource = new Map();

    for (const event of events) {
      const date = toIsoDate(event.occurred_at);
      if (!date) continue;

      if (!byDay.has(date)) byDay.set(date, emptyDay(date));
      if (!visitorsByDay.has(date)) visitorsByDay.set(date, new Set());
      if (!trialVisitorsByDay.has(date)) trialVisitorsByDay.set(date, new Set());

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
      if (event.visitor_id && isTrialEvent(event, detail)) trialVisitorsByDay.get(date).add(event.visitor_id);
      addTrialEvent(row, event, detail, value);

      switch (event.event_name) {
        case "trial_page_view":
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
        case "tool_pro_clicked":
          row.proClicks += 1;
          sourceRow.proClicks += 1;
          break;
        case "pro_prompt_shown":
          row.proPrompts += 1;
          break;
        case "pro_email_started":
          row.proEmailStarts += 1;
          break;
        case "pro_email_invalid":
          row.proEmailInvalid += 1;
          break;
        case "pro_email_submitted":
          row.proEmailSubmits += 1;
          sourceRow.proEmailSubmits += 1;
          break;
        case "pro_page_view":
          row.proPageViews += 1;
          break;
        case "pro_submit_attempt":
          row.proSubmitAttempts += 1;
          break;
        default:
          break;
      }
    }

    for (const [date, visitors] of visitorsByDay) {
      byDay.get(date).visitors = visitors.size;
    }
    for (const [date, visitors] of trialVisitorsByDay) {
      if (byDay.get(date)?.trial) byDay.get(date).trial.visitors = visitors.size;
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
    const trialTotals = rows.reduce((acc, row) => {
      for (const [key, value] of Object.entries(row.trial || {})) {
        acc[key] = (acc[key] || 0) + Number(value || 0);
      }
      return acc;
    }, emptyTrialStats());
    const sourceBreakdown = Array.from(bySource.values())
      .sort((a, b) => b.visitors - a.visitors || b.pageViews - a.pageViews || b.events - a.events)
      .slice(0, 20);

    return sendJson(response, 200, {
      ok: true,
      days,
      eventCount: events.length,
      rows,
      totals,
      trialTotals,
      sourceBreakdown,
      recentProLeads: getRecentProLeads(events),
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
