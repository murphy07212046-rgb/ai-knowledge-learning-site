import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { serializeBrowserKnowledgeData } from "../src/browser-data.mjs";

const publicDirectory = resolve("public");

test("浏览器数据脚本将知识数据安全暴露给静态页面", () => {
  const data = { site: { name: "AI 知识地图" }, updates: [{ title: "<script>" }] };
  const context = { window: {} };

  vm.runInNewContext(serializeBrowserKnowledgeData(data), context);

  assert.equal(JSON.stringify(context.window.AI_KNOWLEDGE_DATA), JSON.stringify(data));
});

test("本地直接打开页面不依赖 fetch JSON", async () => {
  const [index, app] = await Promise.all([
    readFile(resolve(publicDirectory, "index.html"), "utf8"),
    readFile(resolve(publicDirectory, "app.js"), "utf8"),
  ]);

  assert.match(index, /src="\.\/data\/knowledge\.js"/);
  assert.match(index, /<script defer src="\.\/app\.js"><\/script>/);
  assert.match(app, /window\.AI_KNOWLEDGE_DATA/);
  assert.doesNotMatch(app, /fetch\(new URL\("\.\/data\/knowledge\.json"/);
});
