import {
  getAccessToken,
  getSupabaseSettings,
  getSupabaseUser,
  loadOrCreateProfile,
  rollMonthlyWindowIfNeeded,
  sendJson,
  serializeAccount,
} from "./_pro.js";

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return sendJson(response, 200, { ok: true });
  }

  if (request.method !== "GET") {
    return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
  }

  const settings = getSupabaseSettings();
  if (!settings.supabaseUrl || !settings.serviceRoleKey) {
    return sendJson(response, 503, { ok: false, error: "supabase_not_configured" });
  }

  const accessToken = getAccessToken(request);
  if (!accessToken) {
    return sendJson(response, 401, { ok: false, error: "missing_access_token" });
  }

  try {
    const user = await getSupabaseUser(settings, accessToken);
    if (!user?.id) {
      return sendJson(response, 401, { ok: false, error: "invalid_access_token" });
    }

    let profile = await loadOrCreateProfile(settings, user);
    profile = await rollMonthlyWindowIfNeeded(settings, profile, user);
    const account = serializeAccount(profile, user);

    return sendJson(response, 200, {
      ok: true,
      account,
    });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: "account_lookup_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
