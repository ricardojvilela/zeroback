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
    select: "event_name,visitor_id,value,detail,occurred_at",
    occurred_at: `gte.${since.toISOString()}`,
    order: "occurred_at.asc",
    limit: "10000",
  });

  try {
    const supabaseResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}?${query}`, {
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

    const events = await supabaseResponse.json();
    const byDay = new Map();
    const visitorsByDay = new Map();

    for (const event of events) {
      const date = toIsoDate(event.occurred_at);
      if (!date) continue;

      if (!byDay.has(date)) byDay.set(date, emptyDay(date));
      if (!visitorsByDay.has(date)) visitorsByDay.set(date, new Set());

      const row = byDay.get(date);
      const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
      const value = Number(event.value || detail.count || detail.accepted || 0) || 0;

      if (event.visitor_id) visitorsByDay.get(date).add(event.visitor_id);

      switch (event.event_name) {
        case "tool_page_view":
          row.pageViews += 1;
          break;
        case "tool_upload_started":
          row.uploadsStarted += 1;
          break;
        case "tool_upload_added":
          row.imagesAccepted += Number(detail.count || value || 0) || 0;
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
          break;
        case "tool_download_zip":
          row.zipDownloads += 1;
          row.downloads += 1;
          break;
        case "tool_pro_clicked":
          row.proClicks += 1;
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

    const rows = Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date));
    const totals = rows.reduce((acc, row) => {
      for (const [key, value] of Object.entries(row)) {
        if (key === "date") continue;
        acc[key] = (acc[key] || 0) + value;
      }
      return acc;
    }, {});

    return sendJson(response, 200, {
      ok: true,
      days,
      eventCount: events.length,
      rows,
      totals,
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
