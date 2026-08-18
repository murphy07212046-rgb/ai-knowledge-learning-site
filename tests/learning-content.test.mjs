import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const publicDirectory = resolve("public");

test("每个知识点都提供可学习的完整案例和实践要点", async () => {
  const knowledge = JSON.parse(await readFile(resolve(publicDirectory, "data/knowledge.json"), "utf8"));
  const lessons = knowledge.modules.flatMap((module) => module.lessons);

  assert.equal(knowledge.modules.length, 7);
  assert.equal(lessons.length, 24);
  lessons.forEach((lesson) => {
    assert.ok(lesson.beginnerSummary?.length >= 24, `${lesson.name} 缺少小白版一句话解释`);
    assert.ok(lesson.whyItMatters?.length >= 24, `${lesson.name} 缺少“为什么需要它”的说明`);
    assert.ok(lesson.caseStudy?.scenario?.length >= 40, `${lesson.name} 缺少具体案例背景`);
    assert.equal(lesson.caseStudy?.steps?.length, 3, `${lesson.name} 应有 3 个案例步骤`);
    assert.ok(lesson.caseStudy?.takeaway?.length >= 20, `${lesson.name} 缺少案例结论`);
    assert.equal(lesson.practice?.length, 3, `${lesson.name} 应有 3 条实践要点`);
  });
});

test("学习路径补充 AI 产品设计与交付模块，覆盖从机会判断到 HR 治理", async () => {
  const knowledge = JSON.parse(await readFile(resolve(publicDirectory, "data/knowledge.json"), "utf8"));
  const module = knowledge.modules.find((item) => item.id === "product-delivery");

  assert.equal(module?.name, "AI 产品设计与交付");
  assert.deepEqual(module?.lessons.map((lesson) => lesson.id), [
    "ai-opportunity",
    "ai-ux",
    "knowledge-governance",
    "ai-prd",
    "evaluation-pilot",
    "hr-ai-governance",
  ]);
});

test("知识详情页渲染案例巩固与实践要点", async () => {
  const [index, lessonScript] = await Promise.all([
    readFile(resolve(publicDirectory, "index.html"), "utf8"),
    readFile(resolve(publicDirectory, "lesson.js"), "utf8"),
  ]);

  assert.match(index, /小白先看/);
  assert.match(lessonScript, /先用一句话理解/);
  assert.match(lessonScript, /它解决什么问题/);
  assert.match(lessonScript, /案例巩固/);
  assert.match(lessonScript, /实践要点/);
});
