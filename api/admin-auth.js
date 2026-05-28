import crypto from "node:crypto";

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

function signToken(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return sendJson(response, 200, { ok: true });
  }

  if (request.method !== "POST") {
    return sendJson(response, 405, { ok: false, error: "method_not_allowed" });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return sendJson(response, 503, { ok: false, error: "admin_password_not_configured" });
  }

  const body = await readRequestBody(request);
  const password = String(body?.password || "");

  if (password !== adminPassword) {
    return sendJson(response, 401, { ok: false, error: "invalid_password" });
  }

  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  const token = signToken({ role: "admin", expiresAt }, adminPassword);

  return sendJson(response, 200, { ok: true, token, expiresAt });
}
