import {
  canUsePro,
  getAccessToken,
  getSupabaseSettings,
  getSupabaseUser,
  loadOrCreateProfile,
  readRequestBody,
  rollMonthlyWindowIfNeeded,
  sendJson,
  serializeAccount,
  supabaseUpdateByUserId,
} from "./_pro.js";

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return sendJson(response, 200, { ok: true });
  }

  if (request.method !== "POST") {
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

    const body = await readRequestBody(request);
    const count = Math.max(Number(body?.count || 0) || 0, 0);
    if (!count) {
      return sendJson(response, 400, { ok: false, error: "invalid_count" });
    }

    let profile = await loadOrCreateProfile(settings, user);
    profile = await rollMonthlyWindowIfNeeded(settings, profile, user);

    if (!canUsePro(profile)) {
      return sendJson(response, 403, { ok: false, error: "pro_inactive" });
    }

    const batchLimit = Number(profile.batch_limit || 0) || 0;
    if (count > batchLimit) {
      return sendJson(response, 400, { ok: false, error: "batch_limit_exceeded", batchLimit });
    }

    const monthlyLimit = Number(profile.monthly_image_limit || 0) || 0;
    const monthlyUsed = Number(profile.monthly_images_used || 0) || 0;
    if (monthlyUsed + count > monthlyLimit) {
      return sendJson(response, 409, {
        ok: false,
        error: "monthly_limit_reached",
        monthlyLimit,
        monthlyUsed,
      });
    }

    profile = await supabaseUpdateByUserId({
      ...settings,
      userId: user.id,
      patch: {
        monthly_images_used: monthlyUsed + count,
      },
    });

    return sendJson(response, 200, {
      ok: true,
      account: serializeAccount(profile, user),
    });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: "usage_reserve_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
