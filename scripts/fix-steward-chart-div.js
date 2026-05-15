/**
 * fix-steward-chart-div.js
 * Injects the PSI trend chart HTML into stewardright.html
 * (the div was missed because the anchor pattern didn't match its structure)
 */
const fs = require('fs');

const CHART_HTML = [
  '',
  '                <!-- PSI TREND CHART -->',
  '                <div class="row g-3 mb-3 mt-2">',
  '                    <div class="col-12">',
  '                        <div class="kg-card">',
  '                            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">',
  '                                <div style="font-size:14px;font-weight:700;color:#f8fafc;">Score Trends</div>',
  '                                <div style="display:flex;gap:6px;">',
  '                                    <button id="psi-toggle-mobile"  onclick="setPsiView(\'mobile\')"  style="font-size:12px;font-weight:600;padding:5px 14px;border-radius:6px;border:1px solid #b8e600;background:#b8e600;color:#111;cursor:pointer;">Mobile</button>',
  '                                    <button id="psi-toggle-desktop" onclick="setPsiView(\'desktop\')" style="font-size:12px;font-weight:600;padding:5px 14px;border-radius:6px;border:1px solid #2a2a2a;background:transparent;color:#9ca3af;cursor:pointer;">Desktop</button>',
  '                                </div>',
  '                            </div>',
  '                            <div id="chart-psi-trend"></div>',
  '                        </div>',
  '                    </div>',
  '                </div>',
  ''
].join('\n');

var f = 'stewardright.html';
var c = fs.readFileSync(f, 'utf8');

// Already has it?
if (c.indexOf('chart-psi-trend') !== -1) {
  console.log('Already has chart div, nothing to do.');
  process.exit(0);
}

// Inject right before <div id="notes"
var anchor = '<div id="notes"';
var idx = c.indexOf(anchor);
if (idx === -1) {
  console.log('ERROR: notes div not found');
  process.exit(1);
}

c = c.slice(0, idx) + CHART_HTML + c.slice(idx);
fs.writeFileSync(f, c, 'utf8');

console.log('Injected chart div. chart-psi-trend present: ' + (c.indexOf('chart-psi-trend') !== -1));
