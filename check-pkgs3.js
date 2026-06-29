const https = require('https');
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjU5ODM0OTg5NCwiYWFpIjoxMSwidWlkIjo3NjY1MDQ2NywiaWFkIjoiMjAyNS0xMi0xNlQxNjoxODo0Ny4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjk1NjU4OTgsInJnbiI6InVzZTEifQ.pfvfN5Ad-40GybbXB5Bd5RlT6epnV-So_M09cyoA_Ss';

// Query clients board — get name + all column values to find PKG service links
const query = `{
  boards(ids: [10078098397]) {
    items_page(limit: 100) {
      items {
        name
        column_values {
          id
          text
          value
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
    const items = data.data.boards[0].items_page.items;
    items.forEach(client => {
      // Check all column values for PKG references
      const pkgCols = client.column_values.filter(cv => {
        if (cv.text && cv.text.includes('PKG')) return true;
        if (cv.value && cv.value.includes('PKG')) return true;
        return false;
      });
      if (pkgCols.length > 0) {
        console.log('\nCLIENT:', client.name);
        pkgCols.forEach(cv => console.log(' ', cv.id, cv.text || cv.value));
      }
    });
    // Also dump ALL column IDs from first client to understand structure
    if (items.length > 0) {
      console.log('\n--- COLUMN IDs (first client) ---');
      items[0].column_values.forEach(cv => console.log(cv.id, ':', cv.text || '(empty)'));
    }
  });
});
req.write(body);
req.end();
