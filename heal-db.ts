import fs from 'fs';

function healDb() {
  const file = './hillytrip_db_store.json';
  if (!fs.existsSync(file)) {
    console.log("Database file hillytrip_db_store.json does not exist yet.");
    process.exit(0);
  }

  console.log("Healing hillytrip_db_store.json of corrupt entries...");
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const collections = Object.keys(data);

  let totalRemoved = 0;

  for (const col of collections) {
    const list = data[col];
    if (Array.isArray(list)) {
      const originalCount = list.length;
      const healedList = list.filter(r => r && typeof r === 'object' && r.id);
      const removedCount = originalCount - healedList.length;
      if (removedCount > 0) {
        console.log(`🧹 Cleaned [${col}]: Removed ${removedCount} corrupt entries (original: ${originalCount}, current: ${healedList.length})`);
        data[col] = healedList;
        totalRemoved += removedCount;
      }
    }
  }

  if (totalRemoved > 0) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Healing complete! Saved database with ${totalRemoved} bad entries successfully removed.`);
  } else {
    console.log("✅ No corrupt entries identified in the database.");
  }

  process.exit(0);
}

healDb();
