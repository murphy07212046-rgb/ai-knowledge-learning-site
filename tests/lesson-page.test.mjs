import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const publicDirectory = resolve("public");

test("知识点在独立二级页呈现，并可跳转到对应案例巩固", async () => {
  const [index, app] = await Promise.all([
    readFile(resolve(publicDirectory, "index.html"), "utf8"),
    readFile(resolve(publicDirectory, "app.js"), "utf8"),
  ]);
  const lessonPagePath = resolve(publicDirectory, "lesson.html");

  assert.equal(existsSync(lessonPagePath), true);
  const [lessonPage, lessonScript] = await Promise.all([
    readFile(lessonPagePath, "utf8"),
    readFile(resolve(publicDirectory, "lesson.js"), "utf8"),
  ]);

  assert.doesNotMatch(index, /id="detail-panel"/);
  assert.match(app, /\.\/lesson\.html#lesson=/);
  assert.match(lessonPage, /id="lesson-content"/);
  assert.match(lessonPage, /\.\/data\/knowledge\.js/);
  assert.match(lessonScript, /lessonCase\.id = "lesson-case"/);
  assert.match(lessonScript, /去案例巩固/);
  assert.match(lessonScript, /lesson\.caseStudy/);
});
