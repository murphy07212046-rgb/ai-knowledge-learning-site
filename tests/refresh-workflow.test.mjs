import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

test("每日知识刷新同时提交静态页面需要的浏览器数据", async () => {
  const workflow = await readFile(resolve(".github/workflows/refresh-knowledge.yml"), "utf8");

  assert.match(workflow, /node scripts\/refresh-knowledge\.mjs/);
  assert.match(workflow, /git add public\/data\/knowledge\.json public\/data\/knowledge\.js/);
});
