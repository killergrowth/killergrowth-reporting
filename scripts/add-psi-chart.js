/**
 * add-psi-chart.js — adds PSI trend line chart to all client dashboard HTML files
 * Run with: node scripts/add-psi-chart.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = ['sunflower.html','dons-heating.html','good-to-be-clean.html','stewardright.html','killergrowth.html'];

// The chart HTML block to inject after the score cards, inside the Website Performance section
const CHART_HTML = `
                <!-- PSI TREND CHART -->
                <div class="row g-3 mb-3 mt-2">
                    <div class="col-12">
                        <div class="kg-card">
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
                                <div style="font-size:14px;font-weight:700;color:#f8fafc;">Score Trends</div>
                                <div style="display:flex;gap:6px;">
                                    <button id="psi-toggle-mobile"  onclick="setPsiView('mobile')"  style="font-size:12px;font-weight:600;padding:5px 14px;border-radius:6px;border:1px solid #b8e600;background:#b8e600;color:#111;cursor:pointer;">Mobile</button>
                                    <button id="psi-toggle-desktop" onclick="setPsiView('desktop')" style="font-size:12px;font-weight:600;padding:5px 14px;border-radius:6px;border:1px solid #2a2a2a;background:transparent;color:#9ca3af;cursor:pointer;">Desktop</button>
                                </div>
                            </div>
                            <div id="chart-psi-trend"></div>
                        </div>
                    </div>
                </div>
`;

// The JS to inject — chart init + data binding + toggle logic
const CHART_JS_INIT = `
    /* PSI Trend Chart */
    charts.psiTrend = new ApexCharts(document.querySelector('#chart-psi-trend'), makeChartOpts({
        chart: { ...baseChart.chart, type: 'line', height: 260 },
        series: [
            { name: 'Performance',    data: [] },
            { name: 'Accessibility',  data: [] },
            { name: 'Best Practices', data: [] },
            { name: 'SEO',            data: [] }
        ],
        xaxis: { categories: [], labels: { style: { colors: KG_MUTED }, rotate: -30 } },
        yaxis: { min: 0, max: 100, labels: { style: { colors: KG_MUTED } } },
        colors: ['#b8e600', '#3b82f6', '#8b5cf6', '#f59e0b'],
        stroke: { curve: 'smooth', width: 2 },
        markers: { size: 4 },
        legend: { labels: { colors: KG_MUTED }, position: 'top' },
        dataLabels: { enabled: false },
        annotations: {
            yaxis: [{ y: 90, borderColor: '#22c55e', strokeDashArray: 4, label: { text: 'Good', style: { color: '#22c55e', background: 'transparent', fontSize: '10px' } } },
                    { y: 50, borderColor: '#f97316', strokeDashArray: 4, label: { text: 'Needs work', style: { color: '#f97316', background: 'transparent', fontSize: '10px' } } }]
        }
    }));
    charts.psiTrend.render();
`;

// The JS to inject — data update + toggle function (goes inside loadData)
const CHART_JS_DATA = `
        /* PSI history chart */
        window.__psiHistory = d.website?.psiHistory ?? [];
        window.__psiView    = 'mobile';
        function setPsiView(view) {
            window.__psiView = view;
            const mb = document.getElementById('psi-toggle-mobile');
            const db = document.getElementById('psi-toggle-desktop');
            if (mb) { mb.style.background = view === 'mobile'  ? '#b8e600' : 'transparent'; mb.style.color = view === 'mobile'  ? '#111' : '#9ca3af'; mb.style.borderColor = view === 'mobile' ? '#b8e600' : '#2a2a2a'; }
            if (db) { db.style.background = view === 'desktop' ? '#b8e600' : 'transparent'; db.style.color = view === 'desktop' ? '#111' : '#9ca3af'; db.style.borderColor = view === 'desktop' ? '#b8e600' : '#2a2a2a'; }
            const hist = window.__psiHistory;
            if (!hist || !hist.length) return;
            const dates = hist.map(h => h.date);
            const s = view;
            charts.psiTrend.updateOptions({
                series: [
                    { name: 'Performance',    data: hist.map(h => h[s]?.performance    ?? null) },
                    { name: 'Accessibility',  data: hist.map(h => h[s]?.accessibility  ?? null) },
                    { name: 'Best Practices', data: hist.map(h => h[s]?.bestPractices  ?? null) },
                    { name: 'SEO',            data: hist.map(h => h[s]?.seo            ?? null) }
                ],
                xaxis: { categories: dates }
            });
        }
        if (window.__psiHistory.length) setPsiView('mobile');
`;

FILES.forEach(filename => {
  const filepath = path.join(ROOT, filename);
  if (!fs.existsSync(filepath)) {
    console.log('SKIP (not found): ' + filename);
    return;
  }

  let c = fs.readFileSync(filepath, 'utf8');

  // 1. Add chart HTML after the closing </div> of the desktop PSI card row
  const scoreRowEnd = '</div>\n\n                <!-- NOTES -->';
  const scoreRowEndSteward = '</div>\n\n                <div id="notes"';
  if (c.includes(scoreRowEnd)) {
    c = c.replace(scoreRowEnd, `</div>${CHART_HTML}\n                <!-- NOTES -->`);
  } else if (c.includes(scoreRowEndSteward)) {
    c = c.replace(scoreRowEndSteward, `</div>${CHART_HTML}\n                <div id="notes"`);
  } else {
    // Fallback: insert after the psi-desktop-scores closing divs
    c = c.replace(
      /(<\/div>\s*<\/div>\s*<\/div>\s*)\n(\s*<!-- NOTES -->)/,
      `$1\n${CHART_HTML}\n$2`
    );
  }

  // 2. Add chart init before the loadData function call area
  const chartInitAnchor = '    charts.socialEngagement = new ApexCharts';
  if (c.includes(chartInitAnchor)) {
    // Insert psiTrend chart init right before socialEngagement chart
    c = c.replace(chartInitAnchor, `${CHART_JS_INIT}\n    charts.socialEngagement = new ApexCharts`);
  }

  // 3. Add JS data + toggle inside loadData, after PSI scores block
  const psiDataAnchor = '        /* PSI scores */\n        const psi = d.website?.psiScores;';
  if (c.includes(psiDataAnchor)) {
    c = c.replace(
      '        /* Ads spend chart */',
      `${CHART_JS_DATA}\n        /* Ads spend chart */`
    );
  }

  fs.writeFileSync(filepath, c, 'utf8');
  console.log('Updated: ' + filename + ' (' + c.length + ' chars)');
});

console.log('\nAll done. Run node build.js to verify.');
