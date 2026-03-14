import { readdir, writeFile } from "node:fs/promises";

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // 1. API to get ONLY the list of HTML files (excluding index.html)
    if (url.pathname === "/api/list") {
      const allFiles = await readdir("./books");
      const htmlFiles = allFiles.filter(
        (f) => f.endsWith(".html") && f !== "index.html",
      );
      return Response.json(htmlFiles);
    }

    // 2. Serve the main index.html
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(Bun.file("./web/index.html"), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // 3. Serve the content of the other HTML files
    const file = Bun.file(`.${url.pathname}`);
    if (await file.exists()) {
      if (req.method === "GET") {
        return new Response(file);
      }
      if (req.method === "POST") {
        const text = await req.text();
        await writeFile(`.${url.pathname}`, text);
        return new Response();
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 Logic running at http://localhost:${server.port}`);
