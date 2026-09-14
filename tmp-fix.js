const fs = require('fs');
const path = 'C:\\Users\\KillerGrowth\\.openclaw\\workspace\\sites\\killergrowth-reporting\\data\\dons-heating.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

data.monthlyUpdates = [
  {
    month: "Aug 2026",
    text: "<p>August was a big month for Don\u2019s Heating and Air \u2014 the new KillerGrowth website officially went live. We overhauled the contact and booking flow sitewide, fixing all form and CTA buttons to route correctly to the HCP booking page, redesigning the contact section, and cleaning up location-specific address details across city pages. The site launched cleanly with no issues and the team handled several client communications throughout the month including domain transfer coordination and email setup. In the second half of August, the site generated 8 confirmed quote request form submissions \u2014 early proof the new site is converting.</p>"
  }
];

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
const verify = JSON.parse(fs.readFileSync(path, 'utf8'));
console.log('monthlyUpdates:', JSON.stringify(verify.monthlyUpdates));
