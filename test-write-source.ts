import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

async function testWriteSource() {
  try {
    const sourceConfig = JSON.parse(fs.readFileSync('./firebase-applet-config-source.json', 'utf-8'));
    console.log("Testing write to Source Project ID:", sourceConfig.projectId);
    console.log("Database ID:", sourceConfig.firestoreDatabaseId);

    const sourceApp = initializeApp(sourceConfig, 'sourceAppInstanceWriteTest');
    const sourceDb = getFirestore(sourceApp, sourceConfig.firestoreDatabaseId);

    const testRef = doc(sourceDb, 'hubs', 'test_migration_source_ping');
    await setDoc(testRef, {
      pingSource: true,
      timestamp: new Date().toISOString()
    });

    console.log("✅ Success! Write to source database succeeded!");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Write failed on source:", err.message);
    process.exit(1);
  }
}

testWriteSource();
