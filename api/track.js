const allowedEvents = new Set([
  "tool_page_view",
  "tool_drag_upload_intent",
  "tool_upload_started",
  "tool_upload_added",
  "batch_limit_exceeded",
  "tool_processing_started",
  "tool_processing_completed",
  "tool_download_png",
  "tool_download_zip",
  "tool_pro_clicked",
  "pro_page_view",
  "pro_cta_clicked",
  "pro_form_started",
  "pro_volume_selected",
  "pro_submit_attempt",
  "pro_waitlist_submitted",
]);

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
    source: asString(detail.source || detail.utm_source || detail.last_source || detail.first_source, 160),
    campaign: asString(detail.utm_campaign || detail.last_campaign || detail.first_campaign, 160),
    free_limit: Number(detail.free_limit || 0) || null,
    value: Number(detail.value || 0) || 0,
    detail,
    occurred_at: new Date().toISOString(),
  };

  try {
    const supabaseResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();
      return sendJson(response, 502, {
        ok: false,
        error: "supabase_insert_failed",
        status: supabaseResponse.status,
        detail: errorText.slice(0, 500),
      });
    }

    return sendJson(response, 202, { ok: true, stored: true });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: "track_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
