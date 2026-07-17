const corsHeaders = {
  "Access-Control-Allow-Origin": "https://batchcutout.com",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function sendJson(response, status, data) {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.setHeader(key, value);
  }
  response.setHeader("Content-Type", "application/json");
  response.status(status).json(data);
}

export async function readRequestBody(request) {
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

export async function readRawRequestBody(request) {
  if (Buffer.isBuffer(request.body)) return request.body.toString("utf8");
  if (typeof request.body === "string") return request.body;
  if (request.body && typeof request.body === "object") return JSON.stringify(request.body);

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

export function getSupabaseSettings() {
  return {
    supabaseUrl: process.env.SUPABASE_URL?.replace(/\/$/, "") || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    usersTable: process.env.SUPABASE_USERS_TABLE || "batchcutout_users",
  };
}

export async function generateSupabaseMagicLink(settings, { email, redirectTo, fetchImpl = fetch } = {}) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(normalizedEmail)) {
    throw new Error("magic_link_invalid_email");
  }

  let supabaseUrl;
  let redirectUrl;
  try {
    supabaseUrl = new URL(String(settings?.supabaseUrl || ""));
    redirectUrl = new URL(String(redirectTo || ""));
  } catch {
    throw new Error("magic_link_invalid_url");
  }

  if (supabaseUrl.protocol !== "https:" || !settings?.serviceRoleKey) {
    throw new Error("magic_link_supabase_not_configured");
  }
  if (
    redirectUrl.origin !== "https://batchcutout.com" ||
    redirectUrl.username ||
    redirectUrl.password
  ) {
    throw new Error("magic_link_invalid_redirect");
  }

  const response = await fetchImpl(new URL("/auth/v1/admin/generate_link", supabaseUrl).toString(), {
    method: "POST",
    headers: {
      apikey: settings.serviceRoleKey,
      Authorization: `Bearer ${settings.serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "magiclink",
      email: normalizedEmail,
      redirect_to: redirectUrl.toString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`magic_link_generation_failed:${response.status}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("magic_link_invalid_response");
  }

  let actionUrl;
  try {
    actionUrl = new URL(String(payload?.action_link || ""));
  } catch {
    throw new Error("magic_link_invalid_response");
  }

  const verifyPath = actionUrl.pathname.replace(/\/+$/, "");
  const hasToken = actionUrl.searchParams.has("token") || actionUrl.searchParams.has("token_hash");
  if (
    actionUrl.protocol !== "https:" ||
    actionUrl.origin !== supabaseUrl.origin ||
    verifyPath !== "/auth/v1/verify" ||
    actionUrl.searchParams.get("type") !== "magiclink" ||
    !hasToken
  ) {
    throw new Error("magic_link_invalid_response");
  }

  return actionUrl.toString();
}

export function getAccessToken(request) {
  const header = request.headers?.authorization || request.headers?.Authorization || "";
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

export async function getSupabaseUser({ supabaseUrl, serviceRoleKey }, accessToken) {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

function escapeValue(value) {
  return encodeURIComponent(String(value ?? ""));
}

async function supabaseSelectSingle({ supabaseUrl, serviceRoleKey, usersTable, userId }) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${usersTable}?user_id=eq.${escapeValue(userId)}&select=*`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`select_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  const rows = await response.json();
  return rows?.[0] || null;
}

export async function supabaseSelectSingleByColumn({ supabaseUrl, serviceRoleKey, usersTable, column, value }) {
  const allowedColumns = new Set(["user_id", "email", "stripe_customer_id", "stripe_subscription_id"]);
  if (!allowedColumns.has(column)) {
    throw new Error(`invalid_column:${column}`);
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/${usersTable}?${column}=eq.${escapeValue(value)}&select=*&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`select_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  const rows = await response.json();
  return rows?.[0] || null;
}

async function supabaseInsert({ supabaseUrl, serviceRoleKey, usersTable, row }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${usersTable}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`insert_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  const rows = await response.json();
  return rows?.[0] || null;
}

export async function supabaseUpdateByUserId({ supabaseUrl, serviceRoleKey, usersTable, userId, patch }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${usersTable}?user_id=eq.${escapeValue(userId)}`, {
    method: "PATCH",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      ...patch,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`update_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  const rows = await response.json();
  return rows?.[0] || null;
}

export async function supabaseUpdateByColumn({ supabaseUrl, serviceRoleKey, usersTable, column, value, patch }) {
  const allowedColumns = new Set(["user_id", "email", "stripe_customer_id", "stripe_subscription_id"]);
  if (!allowedColumns.has(column)) {
    throw new Error(`invalid_column:${column}`);
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${usersTable}?${column}=eq.${escapeValue(value)}`, {
    method: "PATCH",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      ...patch,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`update_failed:${response.status}:${detail.slice(0, 300)}`);
  }

  const rows = await response.json();
  return rows?.[0] || null;
}

export function calendarPeriodFor(referenceDate = new Date()) {
  const start = new Date(referenceDate);
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export function normalizeProfile(row, user) {
  const plan = String(row?.plan || "free");
  const planStatus = String(row?.plan_status || "active");
  const monthlyLimit = Number(row?.monthly_image_limit || 0) || 0;
  const monthlyUsed = Number(row?.monthly_images_used || 0) || 0;
  const batchLimit = Number(row?.batch_limit || (plan === "pro" || plan === "pack" ? 100 : 2)) || 2;
  const period = calendarPeriodFor(new Date());

  return {
    id: row?.id || null,
    user_id: user.id,
    email: row?.email || user.email || "",
    plan,
    plan_status: planStatus,
    batch_limit: batchLimit,
    monthly_image_limit: monthlyLimit,
    monthly_images_used: monthlyUsed,
    current_period_start: row?.current_period_start || period.start,
    current_period_end: row?.current_period_end || period.end,
    stripe_customer_id: row?.stripe_customer_id || null,
    stripe_subscription_id: row?.stripe_subscription_id || null,
    created_at: row?.created_at || null,
    updated_at: row?.updated_at || null,
  };
}

export function canUsePro(profile) {
  if (profile.plan === "pro" && ["active", "manual"].includes(profile.plan_status)) return true;
  return profile.plan === "pack" && profile.plan_status === "active";
}

export async function loadOrCreateProfile(settings, user) {
  const existing = await supabaseSelectSingle({ ...settings, userId: user.id });
  if (existing) {
    return normalizeProfile(existing, user);
  }

  const period = calendarPeriodFor(new Date());
  const inserted = await supabaseInsert({
    ...settings,
    row: {
      user_id: user.id,
      email: user.email || "",
      plan: "free",
      plan_status: "active",
      batch_limit: 2,
      monthly_image_limit: 0,
      monthly_images_used: 0,
      current_period_start: period.start,
      current_period_end: period.end,
    },
  });

  return normalizeProfile(inserted, user);
}

export async function rollMonthlyWindowIfNeeded(settings, profile, user) {
  if (profile.plan === "pack") {
    return profile;
  }

  const currentEnd = profile.current_period_end ? new Date(profile.current_period_end) : null;
  const now = new Date();

  if (currentEnd && currentEnd > now) {
    return profile;
  }

  const period = calendarPeriodFor(now);
  const updated = await supabaseUpdateByUserId({
    ...settings,
    userId: user.id,
    patch: {
      current_period_start: period.start,
      current_period_end: period.end,
      monthly_images_used: 0,
    },
  });

  return normalizeProfile(updated, user);
}

export function serializeAccount(profile, user) {
  const paidAccess = canUsePro(profile);
  const packAccess = profile.plan === "pack" && profile.plan_status === "active";
  const accessType = profile.plan === "pro" && ["active", "manual"].includes(profile.plan_status)
    ? "pro"
    : packAccess
      ? "pack"
      : "free";
  const monthlyLimit = Number(profile.monthly_image_limit || 0) || 0;
  const monthlyUsed = Number(profile.monthly_images_used || 0) || 0;
  const monthlyRemaining = Math.max(monthlyLimit - monthlyUsed, 0);

  return {
    email: user.email || profile.email || "",
    userId: user.id,
    access: {
      plan: profile.plan,
      planStatus: profile.plan_status,
      accessType,
      isCreditPack: accessType === "pack",
      canUsePro: paidAccess,
      batchLimit: paidAccess ? Number(profile.batch_limit || 100) || 100 : 2,
      monthlyLimit,
      monthlyUsed,
      monthlyRemaining,
      creditsRemaining: accessType === "pack" ? monthlyRemaining : 0,
      periodStart: profile.current_period_start || null,
      periodEnd: profile.current_period_end || null,
    },
    billing: {
      hasStripeCustomer: Boolean(profile.stripe_customer_id),
      hasStripeSubscription: Boolean(profile.stripe_subscription_id),
    },
  };
}
