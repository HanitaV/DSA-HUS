import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.png': 'image/png' };
http.createServer((request, response) => {
    try {
        const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const file = resolve(root, '.' + path, path.endsWith('/') ? 'index.html' : '');
        if (!file.startsWith(root + sep) || path.split('/').some(p => p.startsWith('.') || p === 'node_modules')) { response.writeHead(403).end(); return; }
        const stat = statSync(file);
        if (!stat.isFile()) { response.writeHead(404).end(); return; }
        response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
        const stream = createReadStream(file); stream.on('error', () => response.destroy()); stream.pipe(response);
    } catch { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Không tìm thấy tài liệu.'); }
}).listen(port, '127.0.0.1', () => console.log(`HUS: http://127.0.0.1:${port}`));
