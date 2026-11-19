import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { adaptProjects, productionProjectsUrl } from "../chart-data-adapter.js";

test("production JSON adapts without a second content file", async () => {
  const source = JSON.parse(await readFile(productionProjectsUrl, "utf8"));
  const adapted = adaptProjects(source);
  assert.equal(adapted.length, source.length);
  assert.equal(adapted[0].title, source[0].heading.title);
  assert.ok(adapted.every((p) => Number.isFinite(p.yPos)));
  const changed = structuredClone(source);
  changed[0].heading.title = "Temporary chart acceptance value";
  assert.equal(adaptProjects(changed)[0].title, "Temporary chart acceptance value");
  assert.equal(source[0].heading.title, adapted[0].title);
});

test("required fields are checked", () => {
  assert.throws(() => adaptProjects([{ id: "a", year: 2026, complexity: 6, title: "A" }]));
  assert.throws(() => adaptProjects([{ id: "a", year: 2026, complexity: 2, title: "A" }, { id: "a", year: 2025, complexity: 2, title: "B" }]));
});
