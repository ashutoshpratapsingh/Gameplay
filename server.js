/**
 * SYMBIOTE: APEX PREDATOR (VENOM)
 * Zero-dependency local game server.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8110;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg"
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split("?")[0]);
  if (reqPath === "/" || reqPath === "") reqPath = "/index.html";

  const filePath = path.join(PUBLIC_DIR, reqPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(`404 Not Found: ${reqPath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*"
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function listenOnPort(port) {
  server.listen(port, "127.0.0.1", () => {
    console.log("==================================================");
    console.log(" 🕷️ SYMBIOTE: APEX PREDATOR (VENOM PROTOCOL)");
    console.log(" 🔫 Living Particle Slime • Prop Mimic • AK-47 AI");
    console.log(` 🌐 Server running at: http://localhost:${port}`);
    console.log(" 🎮 Open this URL in your web browser to play!");
    console.log("==================================================");
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`⚠️ Port ${port} busy, trying port ${port + 1}...`);
      listenOnPort(port + 1);
    } else {
      console.error("Server error:", err);
    }
  });
}

listenOnPort(DEFAULT_PORT);
