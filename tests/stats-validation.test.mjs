import test from "node:test";
import assert from "node:assert/strict";

import { validationExperimentSummary } from "../api/stats.js";

const timeZone = "Europe/Lisbon";

function completedTestEvents(count, date = "2026-07-12") {
  return Array.from({ length: count }, (_, index) => ({
    event_name: "free_test_completed",
    visitor_id: `visitor-${date}-${index}`,
    occurred_at: `${date}T12:00:00.000Z`,
    detail: {
      limit_variant: "free_total_2",
      free_limit: 2,
    },
  }));
}

test("offer gate counts completed tests from the 12 July rollout", () => {
  const summary = validationExperimentSummary(completedTestEvents(30), timeZone, "2026-07-19");

  assert.equal(summary.offerChangeGate.completedTests, 30);
  assert.equal(summary.offerChangeGate.fullDaysElapsed, 7);
  assert.equal(summary.offerChangeGate.reached, true);
  assert.equal(summary.completedTests, 0, "the separate 30-day sprint starts on 14 July");
});

test("offer gate remains blocked until seven full days have elapsed", () => {
  const summary = validationExperimentSummary(completedTestEvents(30), timeZone, "2026-07-18");

  assert.equal(summary.offerChangeGate.sampleReached, true);
  assert.equal(summary.offerChangeGate.timeReached, false);
  assert.equal(summary.offerChangeGate.remainingDays, 1);
  assert.equal(summary.offerChangeGate.reached, false);
});

test("offer gate remains blocked when the time requirement is met but the sample is short", () => {
  const summary = validationExperimentSummary(completedTestEvents(29), timeZone, "2026-07-20");

  assert.equal(summary.offerChangeGate.timeReached, true);
  assert.equal(summary.offerChangeGate.sampleReached, false);
  assert.equal(summary.offerChangeGate.remainingTests, 1);
  assert.equal(summary.offerChangeGate.reached, false);
});
