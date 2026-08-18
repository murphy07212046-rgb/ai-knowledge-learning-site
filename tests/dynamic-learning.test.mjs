import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectDirectory = resolve(".");
const publicDirectory = resolve("public");

test("每日刷新可更新既有模块，并将稳定的新 AI 能力补充为新模块", async () => {
  const [refreshScript, lessonPage, app] = await Promise.all([
    readFile(resolve(projectDirectory, "scripts/refresh-knowledge.mjs"), "utf8"),
    readFile(resolve(publicDirectory, "lesson.js"), "utf8"),
    readFile(resolve(publicDirectory, "app.js"), "utf8"),
  ]);

  assert.match(refreshScript, /mergeFrameworkExtensions/);
  assert.match(refreshScript, /frameworkExtension/);
  assert.match(refreshScript, /moduleId/);
  assert.match(refreshScript, /lessonId/);
  assert.match(refreshScript, /learningConnection/);
  assert.match(lessonPage, /本模块的新更新/);
  assert.match(app, /关联知识/);
  assert.match(app, /learningConnection/);
  assert.match(app, /框架外的新能力/);
});
