import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { resolve } from "node:path";

import { createStaticServer } from "../src/static-server.mjs";

test("静态服务只提供 public 目录内的文件", async () => {
  const server = createStaticServer(resolve("public"));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();

  try {
    const page = await fetch(`http://127.0.0.1:${port}/`);
    const traversal = await fetch(`http://127.0.0.1:${port}/../package.json`);

    assert.equal(page.status, 200);
    assert.match(page.headers.get("content-type"), /text\/html/);
    assert.equal(traversal.status, 404);
  } finally {
    server.close();
  }
});
