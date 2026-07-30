import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  deviceActivationSummary,
  internalValidationDiagnostics,
  paidDirectActivationSummary,
} from "../api/stats.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [index, script, styles, apiTrack, stats, admin] = await Promise.all([
  readFile(path.join(root, "index.html"), "utf8"),
  readFile(path.join(root, "script.js"), "utf8"),
  readFile(path.join(root, "styles.css"), "utf8"),
  readFile(path.join(root, "api", "track.js"), "utf8"),
  readFile(path.join(root, "api", "stats.js"), "utf8"),
  readFile(path.join(root, "admin.html"), "utf8"),
]);

function stringLiteralsInSet(source, marker) {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${marker} was not found`);
  const end = source.indexOf("]);", start);
  assert.notEqual(end, -1, `${marker} does not have a closing set`);
  return new Set(
    [...source.slice(start, end).matchAll(/"([a-z0-9_]+)"/g)].map((match) => match[1]),
  );
}

test("measures the activation steps before a visitor selects files", () => {
  assert.match(script, /"tool_file_picker_opened"/);
  assert.match(script, /trackEvent\("tool_file_picker_opened", \{ source: "dropzone_click" \}\)/);
  assert.match(script, /trackEvent\("tool_file_picker_opened", \{ source: "dropzone_keyboard" \}\)/);
  assert.match(apiTrack, /"tool_file_picker_opened"/);
  assert.match(stats, /case "tool_file_picker_opened":/);
  assert.match(stats, /filePickerOpens \+= 1/);
  assert.match(admin, /id="liveToolPageViews"/);
  assert.match(admin, /id="liveFilePickerOpens"/);
  assert.match(admin, /id="dailyPaidEntries"/);
  assert.match(admin, /id="dailyToolViews"/);
  assert.match(admin, /id="dailyFilePickerOpens"/);
  assert.match(admin, /paidEntries >= 3 && filePickerOpens === 0/);
  assert.match(admin, /toolViews >= 5 && filePickerOpens === 0/);
});

test("keeps browser events aligned with the tracking API", () => {
  const serverEvents = stringLiteralsInSet(script, "const serverEventNames");
  const apiEvents = stringLiteralsInSet(apiTrack, "const allowedEvents");
  const directTrackedEvents = new Set(
    [...script.matchAll(/trackEvent\("([a-z0-9_]+)"/g)].map((match) => match[1]),
  );

  for (const eventName of serverEvents) {
    assert.ok(apiEvents.has(eventName), `${eventName} is sent by the browser but rejected by the API`);
  }
  for (const eventName of directTrackedEvents) {
    if (!apiEvents.has(eventName)) continue;
    assert.ok(serverEvents.has(eventName), `${eventName} is accepted by the API but never sent by the browser`);
  }
});

test("summarizes activation by screen format using unique visitors", () => {
  const events = [
    { event_name: "tool_page_view", visitor_id: "mobile-1", detail: { device_type: "mobile" } },
    { event_name: "tool_page_view", visitor_id: "mobile-1", detail: { device_type: "mobile" } },
    { event_name: "tool_page_view", visitor_id: "mobile-2", detail: { device_type: "mobile" } },
    { event_name: "tool_file_picker_opened", visitor_id: "mobile-1", detail: { device_type: "mobile" } },
    { event_name: "tool_upload_added", visitor_id: "mobile-1", detail: { device_type: "mobile" } },
    { event_name: "free_test_completed", visitor_id: "mobile-1", detail: { device_type: "mobile" } },
    { event_name: "tool_download_png", visitor_id: "mobile-1", detail: { device_type: "mobile" } },
    { event_name: "tool_page_view", visitor_id: "desktop-1", detail: { device_type: "desktop" } },
    { event_name: "tool_upload_added", visitor_id: "desktop-1", detail: { device_type: "desktop" } },
    { event_name: "tool_page_view", visitor_id: "ignored", detail: {} },
  ];

  const summary = deviceActivationSummary(events);
  assert.deepEqual(summary.find((row) => row.deviceType === "mobile"), {
    deviceType: "mobile",
    toolVisitors: 2,
    filePickerVisitors: 1,
    uploadVisitors: 1,
    completedTestVisitors: 1,
    downloadVisitors: 1,
    filePickerRate: 0.5,
    uploadRate: 0.5,
    completedTestRate: 0.5,
    downloadRate: 0.5,
  });
  assert.deepEqual(summary.find((row) => row.deviceType === "desktop"), {
    deviceType: "desktop",
    toolVisitors: 1,
    filePickerVisitors: 0,
    uploadVisitors: 1,
    completedTestVisitors: 0,
    downloadVisitors: 0,
    filePickerRate: 0,
    uploadRate: 1,
    completedTestRate: 0,
    downloadRate: 0,
  });
  assert.equal(summary.some((row) => row.deviceType === "tablet"), false);
});

test("summarizes post-redirect activation for paid direct visitors", () => {
  const events = [
    { event_name: "paid_landing_tool_redirect", visitor_id: "paid-1", created_at: "2026-07-30T09:00:00Z" },
    { event_name: "tool_page_view", visitor_id: "paid-1", created_at: "2026-07-30T09:00:01Z" },
    { event_name: "tool_file_picker_opened", visitor_id: "paid-1", created_at: "2026-07-30T09:00:02Z" },
    { event_name: "tool_file_picker_opened", visitor_id: "paid-1", created_at: "2026-07-30T09:00:03Z" },
    { event_name: "tool_upload_added", visitor_id: "paid-1", created_at: "2026-07-30T09:00:04Z" },
    { event_name: "free_test_completed", visitor_id: "paid-1", created_at: "2026-07-30T09:00:05Z" },
    { event_name: "tool_download_zip", visitor_id: "paid-1", created_at: "2026-07-30T09:00:06Z" },
    {
      event_name: "pro_cta_clicked",
      visitor_id: "paid-1",
      created_at: "2026-07-30T09:00:07Z",
      detail: { checkout_plan: "pack100" },
    },
    { event_name: "pack_checkout_session_created", visitor_id: "paid-1", created_at: "2026-07-30T09:00:08Z" },
    { event_name: "pack_purchase_paid", visitor_id: "paid-1", created_at: "2026-07-30T09:00:09Z" },
    { event_name: "tool_upload_added", visitor_id: "paid-2", created_at: "2026-07-30T09:57:59Z" },
    { event_name: "paid_landing_tool_redirect", visitor_id: "paid-2", created_at: "2026-07-30T10:00:00Z" },
    { event_name: "tool_page_view", visitor_id: "paid-2", created_at: "2026-07-30T10:00:01Z" },
    { event_name: "tool_page_view", visitor_id: "organic", created_at: "2026-07-30T10:00:02Z" },
  ];

  assert.deepEqual(paidDirectActivationSummary(events), {
    directVisitors: 2,
    toolVisitors: 2,
    filePickerVisitors: 1,
    uploadVisitors: 1,
    completedTestVisitors: 1,
    downloadVisitors: 1,
    paidIntentVisitors: 1,
    checkoutVisitors: 1,
    purchaseVisitors: 1,
    filePickerRate: 0.5,
    uploadRate: 0.5,
    completedTestRate: 0.5,
    checkoutRate: 0.5,
    purchaseRate: 0.5,
  });
});

test("reports internal validation delivery without mixing it into commercial metrics", () => {
  const diagnostics = internalValidationDiagnostics([
    {
      event_name: "paid_landing_tool_redirect",
      source: "codex_validation",
      campaign: "paid_redirect_probe",
      occurred_at: "2026-07-30T15:10:47.000Z",
    },
    {
      event_name: "seo_landing_view",
      source: "codex_validation",
      detail: { utm_campaign: "paid_redirect_probe" },
      occurred_at: "2026-07-30T15:10:46.000Z",
    },
    {
      event_name: "tool_page_view",
      source: "google_ads",
      campaign: "bulk_background_remover",
      occurred_at: "2026-07-30T15:10:48.000Z",
    },
  ]);

  assert.deepEqual(diagnostics, {
    total: 2,
    latestAt: "2026-07-30T15:10:47.000Z",
    eventCounts: [
      { eventName: "paid_landing_tool_redirect", count: 1, latestAt: "2026-07-30T15:10:47.000Z" },
      { eventName: "seo_landing_view", count: 1, latestAt: "2026-07-30T15:10:46.000Z" },
    ],
    campaignCounts: [
      { campaign: "paid_redirect_probe", count: 2, latestAt: "2026-07-30T15:10:47.000Z" },
    ],
  });
  assert.match(admin, /id="internalValidationDiagnostics" hidden aria-hidden="true"/);
  assert.match(admin, /internalValidationDiagnostics\.textContent = JSON\.stringify\(data\.internalValidationDiagnostics \|\| \{\}\)/);
});

test("the upload action starts with a touch-friendly instruction in every commercial locale", () => {
  assert.match(index, /data-i18n="selectPhotos">Selecione ou arraste fotos</);
  assert.match(script, /selectPhotos: "Selecione ou arraste fotos"/);
  assert.match(script, /selectPhotos: "Choose or drag photos here"/);
  assert.match(script, /selectPhotos: "Selecciona o arrastra fotos"/);
});

test("keeps the first mobile upload action clear of inactive controls", () => {
  assert.match(index, /class="ghost-button hidden" id="clearButton"/);
  assert.match(script, /clearButton\.classList\.toggle\("hidden", !hasItems\)/);
  assert.match(styles, /min-height: 300px;\s+padding: 68px 16px 24px;/);
  assert.match(styles, /left: 50%;\s+transform: translateX\(-50%\);\s+white-space: nowrap;/);
});
