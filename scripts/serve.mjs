import { resolve } from "node:path";

import { createStaticServer } from "../src/static-server.mjs";

const root = resolve("public");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

createStaticServer(root).listen(port, host, () => {
  console.info(`AI 知识地图运行于 http://${host}:${port}`);
});
