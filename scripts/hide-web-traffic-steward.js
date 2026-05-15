/**
 * hide-web-traffic-steward.js
 * Removes the #section-web-traffic block and its associated rows from stewardright.html
 * Uses JS DOM removal on page load (safer than CSS sibling selectors which are too broad)
 */
const fs = require('fs');

var f = 'stewardright.html';
var c = fs.readFileSync(f, 'utf8');

// Remove previous bad CSS if it was added
c = c.replace(/\n[ \t]*\/\* Hide web traffic section[^\n]*\n[ \t]*#section-web-traffic[^\n]*\n/g, '');

// Already has the JS hide?
if (c.indexOf('hideWebTrafficSection') !== -1) {
  fs.writeFileSync(f, c, 'utf8');
  console.log('Already has JS hide (cleaned up bad CSS if present).');
  process.exit(0);
}

// Inject a small inline script right after <body or near the charts init
// that removes the section-web-traffic title + its following rows up to the next section-title
var JS_HIDE = [
'    /* Hide web traffic section — not in StewardRight package */',
'    (function hideWebTrafficSection() {',
'        var el = document.getElementById(\'section-web-traffic\');',
'        if (!el) return;',
'        // Hide the title itself',
'        el.style.display = \'none\';',
'        // Hide all following siblings until we hit the next section-title or end of parent',
'        var sib = el.nextElementSibling;',
'        while (sib && !sib.classList.contains(\'section-title\')) {',
'            sib.style.display = \'none\';',
'            sib = sib.nextElementSibling;',
'        }',
'    })();',
''
].join('\n');

// Also hide the sidebar "Website" link that points to #section-web-traffic (if still present)
// and remove the N/A overlay — just inject a DOMContentLoaded call
var FULL_JS = '\n    document.addEventListener(\'DOMContentLoaded\', function() {\n' + JS_HIDE + '\n    });\n';

// Inject before closing </script> of the main script block (last one)
var scriptEnd = c.lastIndexOf('    loadData();');
if (scriptEnd === -1) {
  console.log('ERROR: loadData() not found');
  process.exit(1);
}

c = c.slice(0, scriptEnd) + FULL_JS + c.slice(scriptEnd);
fs.writeFileSync(f, c, 'utf8');
console.log('Done. JS hide injected.');
