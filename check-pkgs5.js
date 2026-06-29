const https = require('https');
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjU5ODM0OTg5NCwiYWFpIjoxMSwidWlkIjo3NjY1MDQ2NywiaWFkIjoiMjAyNS0xMi0xNlQxNjoxODo0Ny4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjk1NjU4OTgsInJnbiI6InVzZTEifQ.pfvfN5Ad-40GybbXB5Bd5RlT6epnV-So_M09cyoA_Ss';

// Check Projects & Tasks board for PKG references
const query = `{
  boards(ids: [10078098401]) {
    items_page(limit: 200) {
      items {
        name
        column_values {
          id
          text
        }
      }
    }
  }
}`;

const body = JSON.stringify({ query });
const options = {
  hostname: 'api.monday.com', path: '/v2', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': token, 'API-version': '2024-01', 'Content-Length': Buffer.byteLength(body) }
};

let resp = '';
const req = https.request(options, res => {
  res.on('data', d => resp += d);
  res.on('end', () => {
    const data = JSON.parse(resp);
    if (data.errors) { console.log('ERRORS:', JSON.stringify(data.errors)); return; }
    const items = data.data.boards[0].items_page.items;
    // Show items with PKG in name or column values
    items.forEach(item => {
      const hasPkg = item.name.includes('PKG') ||
        item.column_values.some(cv => cv.text && cv.text.includes('PKG'));
      if (hasPkg) {
        console.log('\nITEM:', item.name);
        item.column_values.filter(cv => cv.text).forEach(cv => console.log(' ', cv.id, ':', cv.text));
      }
    });
    console.log('\nTotal items checked:', items.length);
  });
});
req.write(body);
req.end();
