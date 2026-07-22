import fs from 'fs';

function validateDb() {
  const file = './hillytrip_db_store.json';
  if (!fs.existsSync(file)) {
    console.log("Database file hillytrip_db_store.json does not exist yet.");
    process.exit(0);
  }

  console.log("Analyzing hillytrip_db_store.json...");
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const collections = Object.keys(data);
  console.log("Collections present:", collections);

  for (const col of collections) {
    const list = data[col];
    if (Array.isArray(list)) {
      console.log(`- Collection [${col}]: ${list.length} records`);
      const badRecords = list.filter((r, idx) => {
        if (!r) return true;
        if (typeof r !== 'object') return true;
        if (!r.id) {
          console.log(`    ❌ Found record at index ${idx} missing ID:`, JSON.stringify(r));
          return true;
        }
        return false;
      });
      if (badRecords.length > 0) {
        console.log(`    ⚠️ Found ${badRecords.length} invalid/empty records in [${col}]`);
      }
    } else {
      console.log(`- [${col}] is not an array! type:`, typeof list);
    }
  }

  process.exit(0);
}

validateDb();
