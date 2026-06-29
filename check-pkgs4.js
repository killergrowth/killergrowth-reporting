const https = require('https');
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjU5ODM0OTg5NCwiYWFpIjoxMSwidWlkIjo3NjY1MDQ2NywiaWFkIjoiMjAyNS0xMi0xNlQxNjoxODo0Ny4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjk1NjU4OTgsInJnbiI6InVzZTEifQ.pfvfN5Ad-40GybbXB5Bd5RlT6epnV-So_M09cyoA_Ss';

// Query clients board — resolve linked items in board_relation_mkvx5vek (Services Provided)
const query = `{
  boards(ids: [10078098397]) {
    items_page(limit: 100) {
      items {
        name
        column_values(ids: ["board_relation_mkvx5vek"]) {
          ... on BoardRelationValue {
            linked_items {
              name
            }
          }
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
    items.forEach(client => {
      const svcCol = client.column_values[0];
      const linked = svcCol && svcCol.linked_items ? svcCol.linked_items : [];
      const pkgs = linked.filter(s => s.name.includes('PKG'));
      if (pkgs.length > 0) {
        console.log(client.name, '->', pkgs.map(p => p.name).join(', '));
      }
    });
  });
});
req.write(body);
req.end();
