const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjU5ODM0OTg5NCwiYWFpIjoxMSwidWlkIjo3NjY1MDQ2NywiaWFkIjoiMjAyNS0xMi0xNlQxNjoxODo0Ny4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjk1NjU4OTgsInJnbiI6InVzZTEifQ.pfvfN5Ad-40GybbXB5Bd5RlT6epnV-So_M09cyoA_Ss';

const query = `{
  boards(ids: [18424933399]) {
    items_page(limit: 100) {
      items {
        id name
        column_values { id text }
        subitems {
          id name
          column_values { id text }
        }
      }
    }
  }
}`;

fetch('https://api.monday.com/v2', {
  method: 'POST',
  headers: { Authorization: token, 'Content-Type': 'application/json', 'API-Version': '2024-01' },
  body: JSON.stringify({ query })
}).then(r => r.json()).then(d => {
  if (d.errors) { console.log('ERRORS:', JSON.stringify(d.errors)); return; }
  const items = d.data.boards[0].items_page.items;
  const keystone = items.filter(i =>
    i.name.toLowerCase().includes('keystone') ||
    i.name.toLowerCase().includes('timnath')
  );
  if (keystone.length) {
    console.log('KEYSTONE ITEMS:', JSON.stringify(keystone, null, 2));
  } else {
    console.log('No keystone items found. All item names:');
    items.forEach(i => console.log(' -', i.name));
  }
}).catch(e => console.error(e));
