import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { generateSupabaseMagicLink } from "../api/_pro.js";

const settings = {
  supabaseUrl: "https://project-ref.supabase.co",
  serviceRoleKey: "service-role-secret",
};

function jsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return payload;
    },
  };
}

test("generates a validated Supabase magic link for BatchCutout", async () => {
  let request;
  const actionLink = "https://project-ref.supabase.co/auth/v1/verify?token=one-time-secret&type=magiclink";
  const result = await generateSupabaseMagicLink(settings, {
    email: " Buyer@Example.com ",
    redirectTo: "https://batchcutout.com/?checkout=success&session_id=cs_test&auth=magiclink",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return jsonResponse(200, { action_link: actionLink });
    },
  });

  assert.equal(result, actionLink);
  assert.equal(request.url, "https://project-ref.supabase.co/auth/v1/admin/generate_link");
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers.apikey, settings.serviceRoleKey);
  assert.equal(request.options.headers.Authorization, `Bearer ${settings.serviceRoleKey}`);
  assert.deepEqual(JSON.parse(request.options.body), {
    type: "magiclink",
    email: "buyer@example.com",
    redirect_to: "https://batchcutout.com/?checkout=success&session_id=cs_test&auth=magiclink",
  });
});

test("rejects a redirect outside the BatchCutout origin", async () => {
  let called = false;
  await assert.rejects(
    generateSupabaseMagicLink(settings, {
      email: "buyer@example.com",
      redirectTo: "https://example.com/steal-session",
      fetchImpl: async () => {
        called = true;
        return jsonResponse(200, {});
      },
    }),
    /magic_link_invalid_redirect/,
  );
  assert.equal(called, false);
});

test("rejects a generated link outside the configured Supabase project", async () => {
  await assert.rejects(
    generateSupabaseMagicLink(settings, {
      email: "buyer@example.com",
      redirectTo: "https://batchcutout.com/",
      fetchImpl: async () => jsonResponse(200, {
        action_link: "https://attacker.example/auth/v1/verify?token=secret&type=magiclink",
      }),
    }),
    /magic_link_invalid_response/,
  );
});

test("returns a sanitized error when Supabase refuses link generation", async () => {
  await assert.rejects(
    generateSupabaseMagicLink(settings, {
      email: "buyer@example.com",
      redirectTo: "https://batchcutout.com/",
      fetchImpl: async () => jsonResponse(429, { message: "sensitive provider detail" }),
    }),
    (error) => error.message === "magic_link_generation_failed:429" && !error.message.includes("sensitive"),
  );
});

test("keeps passwordless Pack activation and password fallback wired in the frontend", async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const [html, script] = await Promise.all([
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "script.js"), "utf8"),
  ]);

  assert.match(html, /id="accountMagicLinkBlock"/);
  assert.match(html, /id="accountPasswordMode"/);
  assert.match(script, /signInWithOtp/);
  assert.match(script, /isCheckoutActivationReturn/);
  assert.match(script, /account_magic_link_authenticated/);
  assert.match(script, /usePasswordForActivation \? handleAccountLogin/);
});

test("keeps password recovery and authenticated password setup wired without tracking passwords", async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const [html, script] = await Promise.all([
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "script.js"), "utf8"),
  ]);

  assert.match(html, /id="accountPasswordResetRequest"/);
  assert.match(html, /id="accountPasswordSetup"/);
  assert.match(html, /id="accountPasswordSetupOpen"/);
  assert.match(script, /resetPasswordForEmail/);
  assert.match(script, /accountPasswordRecoveryRedirectUrl/);
  assert.match(script, /PASSWORD_RECOVERY/);
  assert.match(script, /updateUser\(\{ password \}\)/);
  assert.doesNotMatch(script, /trackEvent\([^)]*password\s*[,}:]/s);
});
