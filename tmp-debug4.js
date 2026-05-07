const fs = require('fs');
const html = fs.readFileSync('dist/killergrowth/index.html', 'utf8');

// Get the last 6000 chars which should contain the scripts
const tail = html.substring(html.length - 6000);
console.log(tail);
