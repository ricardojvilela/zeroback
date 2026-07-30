import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("distinguishes the post-test Pack cohort from operational click events", async () => {
  const admin = await readFile(path.join(root, "admin.html"), "utf8");

  assert.match(admin, /Cliques Pack após teste/);
  assert.match(admin, /Pessoas que clicaram Pack após teste/);
  assert.match(admin, /Teste concluído → clique/);
  assert.match(admin, /Cliques Pack \(eventos\)/);
  assert.match(admin, /incluindo cliques anteriores ao teste ou repetidos/);
});
