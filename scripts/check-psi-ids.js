const fs = require('fs');
const files = ['sunflower.html','dons-heating.html','good-to-be-clean.html','stewardright.html','killergrowth.html'];
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const oldM = (c.match(/id="psi-m-/g)||[]).length;
  const oldD = (c.match(/id="psi-d-/g)||[]).length;
  const newCards = (c.match(/id="psi-(?:performance|accessibility|bestpractices|seo)"/g)||[]).length;
  const boms = (c.match(/\uFEFF/g)||[]).length;
  const fffd = (c.match(/\uFFFD/g)||[]).length;
  console.log(f + ': stale psi-m=' + oldM + ' psi-d=' + oldD + ' new-cards=' + newCards + ' BOMs=' + boms + ' FFFD=' + fffd);
});
