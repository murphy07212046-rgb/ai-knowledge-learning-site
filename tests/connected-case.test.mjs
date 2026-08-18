import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const publicDirectory = resolve("public");

test("真实 HR 案例将六个模块与其知识点关联起来", async () => {
  const [knowledgeFile, app, lessonPage] = await Promise.all([
    readFile(resolve(publicDirectory, "data/knowledge.json"), "utf8"),
    readFile(resolve(publicDirectory, "app.js"), "utf8"),
    readFile(resolve(publicDirectory, "lesson.js"), "utf8"),
  ]);
  const knowledge = JSON.parse(knowledgeFile);

  assert.equal(knowledge.businessCase?.id, "hr-data-query");
  assert.equal(knowledge.businessCase?.stages?.length, 6);
  knowledge.businessCase.stages.forEach((stage) => {
    const module = knowledge.modules.find((item) => item.id === stage.moduleId);
    assert.equal(stage.lessonIds.length, 3, `${stage.moduleId} 应关联 3 个知识点`);
    assert.deepEqual(stage.lessonIds, module.lessons.map((lesson) => lesson.id));
  });
  assert.match(app, /state\.data\.businessCase\.stages/);
  assert.match(app, /case-lesson-link/);
  assert.match(lessonPage, /businessCase\.stages/);
  assert.match(lessonPage, /查看完整 HR 业务案例/);
});
