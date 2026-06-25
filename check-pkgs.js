const https = require('https');
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjU5ODM0OTg5NCwiYWFpIjoxMSwidWlkIjo3NjY1MDQ2NywiaWFkIjoiMjAyNS0xMi0xNlQxNjoxODo0Ny4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjk1NjU4OTgsInJnbiI6InVzZTEifQ.pfvfN5Ad-40GybbXB5Bd5RlT6epnV-So_M09cyoA_Ss';

// Query services board for PKG items, and clients board for their linked services
const query = `{
  boards(ids: [10078200495]) {
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
    items.filter(i => i.name.includes('PKG')).forEach(i => {
      console.log('SERVICE:', i.name);
      i.column_values.forEach(cv => {
        if (cv.text && cv.text.trim()) console.log(' ', cv.id, ':', cv.text);
      });
    });
  });
});
req.write(body);
req.end();
