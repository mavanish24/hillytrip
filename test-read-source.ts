import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

async function testReadSource() {
  try {
    const sourceConfig = JSON.parse(fs.readFileSync('./firebase-applet-config-source.json', 'utf-8'));
    console.log("Testing read of Source Project ID:", sourceConfig.projectId);
    console.log("Database ID:", sourceConfig.firestoreDatabaseId);

    const sourceApp = initializeApp(sourceConfig, 'sourceAppInstanceRead');
    const sourceDb = getFirestore(sourceApp, sourceConfig.firestoreDatabaseId);

    const snap = await getDocs(query(collection(sourceDb, 'hubs'), limit(5)));
    console.log(`✅ Success! Read from source succeeded. Fetched ${snap.size} documents.`);
    snap.forEach(d => console.log(`   - Hub ID: ${d.id}, Name: ${d.data()?.name}`));
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Read from source failed:", err.message);
    process.exit(1);
  }
}

testReadSource();
