import { chromium } from 'playwright';
import fs from 'fs';

const browser = await chromium.launch();
const page = await browser.newPage();
const html = fs.readFileSync('C:/Users/KillerGrowth/.openclaw/workspace/dons-august-2026-report-v2.html', 'utf8');
await page.setContent(html, { waitUntil: 'networkidle' });
await page.pdf({
  path: 'C:/Users/KillerGrowth/.openclaw/workspace/dons-august-2026-report-v2.pdf',
  format: 'Letter',
  printBackground: true,
  margin: { top: '0', bottom: '0', left: '0', right: '0' }
});
await browser.close();
console.log('PDF done');
