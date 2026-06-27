import crypto from "node:crypto";
import { getSupabaseSettings, sendJson, readRequestBody, supabaseUpdateByUserId } from "./_pro.js";

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
    updatedAt: row.updated_at || row.created_at || "",
  };
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
    select: "user_id,email,plan,plan_status,batch_limit,monthly_image_limit,monthly_images_used,current_period_start,current_period_end,updated_at,created_at",
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
      const users = await listUsers(settings);
      return sendJson(response, 200, { ok: true, users });
    }

    if (request.method !== "POST") {
      return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
    }

    const body = await readRequestBody(request);
    const userId = String(body?.userId || "").trim();
    const mode = String(body?.mode || "").trim();
    if (!userId || !["free", "trial", "pro", "reset-usage"].includes(mode)) {
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
    } else if (mode === "trial") {
      const now = new Date();
      const end = new Date(now);
      end.setUTCDate(end.getUTCDate() + 15);
      patch = {
        plan: "pro",
        plan_status: "trialing",
        batch_limit: 100,
        monthly_image_limit: 2000,
        monthly_images_used: 0,
        current_period_start: now.toISOString(),
        current_period_end: end.toISOString(),
      };
    } else {
      const period = monthPeriod();
      patch = {
        plan: "pro",
        plan_status: "active",
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
