// Zero-dependency native Node.js static file server for PoshPrint
// Strictly adheres to MASTER_PROMPT.md Section 1.7 (Security Headers) & Section 4.3 (Branded 404 Page)

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // --- Mandatory Security Headers (Section 1.7 & OWASP) ---
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com; connect-src 'self';"
  );

  let reqPath = decodeURI(req.url.split('?')[0]);

  // Strip repeated slashes
  reqPath = reqPath.replace(/\/+/g, '/');

  // Support accessing via project folder name (e.g. /e-commerce or /e-commerce/...)
  if (reqPath.startsWith('/e-commerce')) {
    reqPath = reqPath.replace(/^\/e-commerce/, '') || '/';
  }

  if (reqPath === '/' || reqPath === '' || reqPath === '/index') {
    reqPath = '/index.html';
  }

  // SPA virtual sections fallback to index.html
  const SPA_SECTIONS = ['/catalog', '/shop', '/customizer', '/admin', '/checkout', '/cart', '/tracking', '/orders', '/home'];
  if (SPA_SECTIONS.includes(reqPath.toLowerCase())) {
    reqPath = '/index.html';
  }

  // Prevent path traversal attacks (Section 1.4 security)
  let safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(__dirname, safePath);

  const serve404 = () => {
    const notFoundPath = path.join(__dirname, '404.html');
    fs.readFile(notFoundPath, 'utf8', (readErr, content) => {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      if (!readErr) {
        res.end(content);
      } else {
        res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>404 Not Found | POSHPRINT Atelier</title>
  <style>
    body { background: #111; color: #FFF; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: #C4A265; font-family: Georgia, serif; }
    p { color: #888; margin-bottom: 2rem; }
    a { display: inline-block; background: #C4A265; color: #111; padding: 12px 24px; text-decoration: none; font-weight: 600; border-radius: 4px; }
  </style>
</head>
<body>
  <div>
    <h1>404 Not Found</h1>
    <p>The requested luxury garment could not be found.</p>
    <a href="/">Return to Storefront</a>
  </div>
</body>
</html>`);
      }
    });
  };

  const tryServeFile = (targetFile) => {
    fs.stat(targetFile, (err, stats) => {
      if (!err && stats.isFile()) {
        const ext = path.extname(targetFile).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(targetFile).pipe(res);
      } else if (!path.extname(targetFile)) {
        // Try appending .html for clean URLs (e.g. /404 -> /404.html)
        const htmlTarget = targetFile + '.html';
        fs.stat(htmlTarget, (htmlErr, htmlStats) => {
          if (!htmlErr && htmlStats.isFile()) {
            res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
            fs.createReadStream(htmlTarget).pipe(res);
          } else {
            serve404();
          }
        });
      } else {
        serve404();
      }
    });
  };

  tryServeFile(filePath);
});

server.listen(PORT, () => {
  console.log(`PoshPrint Atelier secure server running live on http://localhost:${PORT}`);
});
