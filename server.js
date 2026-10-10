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
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  // Prevent path traversal attacks (Section 1.4 security)
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Serve branded 404 page (Section 4.3)
      const notFoundPath = path.join(__dirname, '404.html');
      fs.readFile(notFoundPath, 'utf8', (readErr, content) => {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
        if (!readErr) {
          res.end(content);
        } else {
          res.end('<h1>404 Not Found</h1><p>The requested luxury garment could not be found.</p>');
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`PoshPrint Atelier secure server running live on http://localhost:${PORT}`);
});
