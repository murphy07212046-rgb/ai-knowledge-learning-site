import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const publicDirectory = resolve("public");

test("首页资源可部署在任意站点子路径下", async () => {
  const [index, app] = await Promise.all([
    readFile(resolve(publicDirectory, "index.html"), "utf8"),
    readFile(resolve(publicDirectory, "app.js"), "utf8"),
  ]);

  assert.match(index, /href="\.\/styles\.css"/);
  assert.match(index, /src="\.\/data\/knowledge\.js"/);
  assert.match(index, /src="\.\/app\.js"/);
  assert.match(app, /window\.AI_KNOWLEDGE_DATA/);
});
