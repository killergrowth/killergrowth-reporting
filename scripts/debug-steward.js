const fs = require('fs');
const c = fs.readFileSync('stewardright.html', 'utf8');

const chartDivIdx = c.indexOf('id="chart-psi-trend"');
const scriptStart = c.indexOf('<script>');
console.log('chart-psi-trend div at:', chartDivIdx, '| script at:', scriptStart, '| div BEFORE script:', chartDivIdx < scriptStart);

// Check all ApexCharts inits
const chartInits = [...c.matchAll(/new ApexCharts\(document\.querySelector\('([^']+)'\)/g)];
chartInits.forEach(m => {
  const sel = m[1];
  const id = sel.replace('#','');
  const divPresent = c.indexOf('id="' + id + '"') !== -1;
  console.log('  chart selector ' + sel + ' -> div present: ' + divPresent);
});

// Data fetch path
const fetchIdx = c.indexOf('fetch(');
if (fetchIdx !== -1) console.log('fetch call:', c.substring(fetchIdx, fetchIdx+80).replace(/[\r\n]/g,' '));

// Is the charts object initialized before individual chart assignments?
const chartsObj = c.indexOf('const charts = {') !== -1 ? 'const charts = {}' :
                  c.indexOf('let charts = {') !== -1 ? 'let charts = {}' :
                  c.indexOf('var charts = ') !== -1 ? 'var charts' : 'NOT FOUND';
console.log('charts object:', chartsObj);
const chartsIdx = c.indexOf('charts = {');
if (chartsIdx !== -1) console.log('charts init:', c.substring(chartsIdx, chartsIdx+30));
