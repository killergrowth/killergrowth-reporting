/**
 * trace-steward-errors.js
 * Extract the full loadData body and simulate it with the real data,
 * using a minimal DOM mock to find exactly where it throws.
 */
const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const html = fs.readFileSync('stewardright.html', 'utf8');
const data = JSON.parse(fs.readFileSync(path.join('data', 'stewardright.json'), 'utf8'));

// Extract script block
const scriptStart = html.indexOf('<script>') + '<script>'.length;
const scriptEnd   = html.lastIndexOf('</script>');
const fullScript  = html.substring(scriptStart, scriptEnd);

// Minimal DOM mock
const elements = {};
const mockDocument = {
  getElementById: (id) => elements[id] || { textContent: '', innerHTML: '', style: {}, classList: { remove: ()=>{}, add: ()=>{}, contains: ()=>false }, querySelector: ()=>null, nextElementSibling: null },
  querySelector:  (sel) => ({ innerHTML: '', style: {}, classList: { remove:()=>{}, add:()=>{}, contains:()=>false } }),
  querySelectorAll: (sel) => [],
  addEventListener: (evt, fn) => {},
};

const sandbox = {
  document:  mockDocument,
  window:    { __reportData: data, __psiScores: null, __psiHistory: [], __psiView: 'mobile' },
  console:   { log: console.log, warn: console.warn, error: console.error },
  ApexCharts: function(el, opts) { return { render: ()=>{}, updateOptions: ()=>{} }; },
  fetch:     () => Promise.resolve({ json: () => Promise.resolve(data) }),
  Promise:   Promise,
  // Make setPsiView available globally
  setPsiView: function(v) {},
  charts: {},
};
sandbox.window.setPsiView = sandbox.setPsiView;

try {
  const script = new vm.Script(fullScript);
  const ctx = vm.createContext(sandbox);
  script.runInContext(ctx);
  console.log('Script parsed OK. Calling loadData...');

  // Call loadData manually
  const result = ctx.loadData ? ctx.loadData() : sandbox.loadData();
  if (result && result.catch) {
    result.catch(err => console.error('loadData async error:', err.message, '\nStack:', err.stack));
    result.then(() => console.log('loadData completed without error'));
  }
} catch(e) {
  console.error('Script error:', e.message);
  console.error('Stack:', e.stack);
}
