import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

async function testRead() {
  try {
    const targetConfig = JSON.parse(fs.readFileSync('./firebase-applet-config-target.json', 'utf-8'));
    console.log("Testing read of Project ID:", targetConfig.projectId);
    console.log("Database ID:", targetConfig.firestoreDatabaseId);

    const targetApp = initializeApp(targetConfig, 'testAppInstanceRead');
    const targetDb = getFirestore(targetApp, targetConfig.firestoreDatabaseId);

    const snap = await getDocs(collection(targetDb, 'hubs'));
    console.log(`✅ Success! Read from target succeeded. Fetched ${snap.size} documents.`);
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Read failed:", err.message);
    process.exit(1);
  }
}

testRead();
