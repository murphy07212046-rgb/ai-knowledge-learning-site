import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const publicDirectory = resolve("public");

test("案例演练只有一个主要入口，并在入口下方独立展开", async () => {
  const [index, app] = await Promise.all([
    readFile(resolve(publicDirectory, "index.html"), "utf8"),
    readFile(resolve(publicDirectory, "app.js"), "utf8"),
  ]);

  assert.equal([...index.matchAll(/data-learning-mode="case"/g)].length, 1);
  assert.match(index, /id="learning-mode-panel"/);
  assert.match(index, /id="learning-mode-content"/);
  assert.match(app, /learningModePanel\.hidden = false/);
  assert.match(app, /learningModePanel\.scrollIntoView/);
  assert.match(app, /\[data-learning-mode\]/);
});

test("首页按学习路径优先、案例演练随后呈现", async () => {
  const index = await readFile(resolve(publicDirectory, "index.html"), "utf8");

  assert.match(index, /id="quick-start"/);
  assert.match(index, /id="journey"/);
  assert.match(index, /id="case-preview"/);
  assert.ok(index.indexOf('id="journey"') < index.indexOf('id="case-preview"'));
  assert.match(index, /href="#journey"/);
  assert.doesNotMatch(index, /id="module-filters"/);
  assert.doesNotMatch(index, /class="learning-modes"/);
  assert.match(index, /真实业务案例\s*[·｜|]\s*HR 数据查询助手/);
  assert.match(index, /业务问题：查询某业务部门当前在职人数，以及不同年龄段的人数分布/);
  assert.match(index, /权限校验/);
  assert.match(index, /统一口径/);
  assert.match(index, /安全呈现/);
  assert.match(index, /查看完整案例演练/);
});

test("首页提供一个月的 AI 产品经理训练路径、周产出与递进实战案例", async () => {
  const index = await readFile(resolve(publicDirectory, "index.html"), "utf8");

  assert.match(index, /id="one-month-path"/);
  assert.match(index, /30 天 AI 产品经理训练路径/);
  assert.equal([...index.matchAll(/class="training-week"/g)].length, 4);
  assert.match(index, /WEEK 01/);
  assert.match(index, /WEEK 04/);
  assert.match(index, /每周产出/);
  assert.match(index, /政策知识问答助手/);
  assert.match(index, /HR 数据查询助手/);
  assert.match(index, /去完成综合案例/);
});

test("故障提示融入案例的每个环节，不再作为独立入口", async () => {
  const [index, app] = await Promise.all([
    readFile(resolve(publicDirectory, "index.html"), "utf8"),
    readFile(resolve(publicDirectory, "app.js"), "utf8"),
  ]);

  assert.doesNotMatch(index, /查看故障地图/);
  assert.match(app, /case-failure-map/);
  assert.match(app, /本环节可能出现的问题/);
  assert.match(app, /用户会看到的症状/);
  assert.match(app, /优先检查什么/);
});

test("学习路径不依赖筛选控件，始终完整呈现", async () => {
  const app = await readFile(resolve(publicDirectory, "app.js"), "utf8");

  assert.doesNotMatch(app, /module-filters/);
  assert.doesNotMatch(app, /renderFilters/);
});

test("每个模块均提供可展开的实战验收与通过标准", async () => {
  const app = await readFile(resolve(publicDirectory, "app.js"), "utf8");

  assert.match(app, /MODULE_PRACTICAL_ACCEPTANCE/);
  assert.match(app, /module-practice/);
  assert.match(app, /实战验收/);
  assert.match(app, /需要提交/);
  assert.match(app, /通过标准/);
  assert.match(app, /组织调整影响分析助手/);
});
