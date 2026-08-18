import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, normalize, relative, resolve } from "node:path";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function isInsideRoot(root, file) {
  const pathFromRoot = relative(root, file);
  return pathFromRoot && !pathFromRoot.startsWith("..") && !pathFromRoot.includes("../");
}

export function createStaticServer(rootDirectory) {
  const root = resolve(rootDirectory);

  return createServer((request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const requestedPath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const file = resolve(root, normalize(requestedPath));

    if (!isInsideRoot(root, file) || !existsSync(file)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(file).pipe(response);
  });
}
