import assert from "node:assert/strict";
import test from "node:test";
import {
  fulfillmentUpdateSql,
  retryDelayMs,
  shouldDeadLetter,
} from "../services/worker/src/policy.js";

void test("worker fulfillment update is idempotent", () => {
  assert.match(fulfillmentUpdateSql, /WHERE id = \$1 AND status = 'pending'/);
});

void test("worker retry uses capped exponential backoff", () => {
  assert.deepEqual([0, 1, 2, 3].map(retryDelayMs), [100, 200, 400, 800]);
  assert.equal(retryDelayMs(20), 5_000);
});

void test("worker dead-letters only at the configured bound", () => {
  assert.equal(shouldDeadLetter(4, 5), false);
  assert.equal(shouldDeadLetter(5, 5), true);
});
