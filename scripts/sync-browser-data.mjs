import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { serializeBrowserKnowledgeData } from "../src/browser-data.mjs";

const jsonPath = resolve("public/data/knowledge.json");
const browserDataPath = resolve("public/data/knowledge.js");

const data = JSON.parse(await readFile(jsonPath, "utf8"));
await writeFile(browserDataPath, serializeBrowserKnowledgeData(data), "utf8");
