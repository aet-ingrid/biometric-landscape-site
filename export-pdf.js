#!/usr/bin/env node
/**
 * export-pdf.js
 * Generates a print-quality PDF of report.html using headless Chrome via Puppeteer.
 *
 * Usage:
 *   node export-pdf.js
 *   node export-pdf.js --out biometric-landscape-2026-04.pdf
 *
 * The script serves report.html from a local file server so that relative
 * CSS/asset paths resolve correctly, then uses Chrome's print pipeline.
 */

import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────

const PORT      = 9371;
const OUT_ARG   = process.argv.indexOf('--out');
const OUT_FILE  = OUT_ARG !== -1 ? process.argv[OUT_ARG + 1]
                                 : `biometric-anchoring-landscape-${today()}.pdf`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

function mime(ext) {
  return { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' }[ext]
    ?? 'application/octet-stream';
}

// Minimal static file server — only needed so CSS @import and relative hrefs resolve.
function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = req.url === '/' ? '/report.html' : req.url.split('?')[0];
      const filePath = path.join(__dirname, urlPath);
      if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end(); return; }
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'Content-Type': mime(path.extname(filePath)) });
        res.end(data);
      });
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  const server = await startServer();
  console.log(`  Serving site on http://127.0.0.1:${PORT}`);

  const browser = await puppeteer.launch({ headless: true });
  const page    = await browser.newPage();

  // Load the report page and wait for all network activity to settle
  await page.goto(`http://127.0.0.1:${PORT}/report.html`, { waitUntil: 'networkidle0' });

  // Hide the screen-only action bar (print button / instructions strip)
  await page.addStyleTag({ content: '.report-actions, .global-nav { display: none !important; }' });

  // Small settle pause for any late-resolving CSS custom properties
  await new Promise(r => setTimeout(r, 400));

  await page.pdf({
    path:              OUT_FILE,
    format:            'A4',
    printBackground:   true,          // preserves badge colors and surface backgrounds
    margin:            { top: '18mm', right: '16mm', bottom: '18mm', left: '16mm' },
    displayHeaderFooter: true,
    headerTemplate:    '<span></span>',
    footerTemplate:    `<div style="width:100%;text-align:center;font-size:8px;
                          color:#9ca3af;font-family:monospace;">
                          Biometric Anchoring Landscape — April 2026 &nbsp;·&nbsp;
                          <span class="pageNumber"></span> / <span class="totalPages"></span>
                        </div>`,
  });

  await browser.close();
  server.close();

  const size = (fs.statSync(OUT_FILE).size / 1024).toFixed(0);
  console.log(`  ✓ PDF written: ${OUT_FILE} (${size} KB)`);
})().catch(err => {
  console.error('Export failed:', err.message);
  process.exit(1);
});
