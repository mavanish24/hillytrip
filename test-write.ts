import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

async function testWrite() {
  try {
    const targetConfig = JSON.parse(fs.readFileSync('./firebase-applet-config-target.json', 'utf-8'));
    console.log("Testing write to Project ID:", targetConfig.projectId);
    console.log("Database ID:", targetConfig.firestoreDatabaseId);

    const targetApp = initializeApp(targetConfig, 'testAppInstance');
    const targetDb = getFirestore(targetApp, targetConfig.firestoreDatabaseId);

    const testRef = doc(targetDb, 'hubs', 'test_migration_ping');
    await setDoc(testRef, {
      ping: true,
      timestamp: new Date().toISOString()
    });

    console.log("✅ Success! Write to target succeeded without PERMISSION_DENIED.");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Write failed:", err.message);
    process.exit(1);
  }
}

testWrite();
