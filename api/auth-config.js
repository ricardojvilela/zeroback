import { getSupabaseSettings, sendJson } from "./_pro.js";

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return sendJson(response, 200, { ok: true });
  }

  if (request.method !== "GET") {
    return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
  }

  const { supabaseUrl, anonKey } = getSupabaseSettings();
  const configured = Boolean(supabaseUrl && anonKey);

  return sendJson(response, 200, {
    ok: true,
    configured,
    url: configured ? supabaseUrl : null,
    anonKey: configured ? anonKey : null,
  });
}
