import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const publicDirectory = resolve("public");

test("案例演练使用脱敏后的真实 HR 数据查询案例", async () => {
  const [index, app, knowledgeFile] = await Promise.all([
    readFile(resolve(publicDirectory, "index.html"), "utf8"),
    readFile(resolve(publicDirectory, "app.js"), "utf8"),
    readFile(resolve(publicDirectory, "data/knowledge.json"), "utf8"),
  ]);
  const businessCase = JSON.parse(knowledgeFile).businessCase;
  const businessCaseText = JSON.stringify(businessCase);

  assert.match(index, /查询某业务部门人力数据/);
  assert.match(app, /真实业务案例（已脱敏）/);
  assert.equal(businessCase.id, "hr-data-query");
  assert.match(businessCaseText, /当前在职人数与不同年龄段的人数分布/);
  assert.match(businessCaseText, /组织树/);
  assert.match(businessCaseText, /k-匿名/);
  assert.doesNotMatch(businessCaseText, /企业应用部|ehr_employee|dept_id|\/org\/resolve/);
});
