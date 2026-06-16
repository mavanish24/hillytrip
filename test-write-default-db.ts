import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

async function testWriteDefault() {
  try {
    const targetConfig = JSON.parse(fs.readFileSync('./firebase-applet-config-target.json', 'utf-8'));
    console.log("Testing write to Project ID:", targetConfig.projectId);
    console.log("Using (default) database.");

    // Remove firestoreDatabaseId key to force (default) database behavior
    const configWithDefaultDb = { ...targetConfig };
    delete configWithDefaultDb.firestoreDatabaseId;

    const targetApp = initializeApp(configWithDefaultDb, 'testAppInstanceDefaultDb');
    // Initialize without database ID to use (default) database
    const targetDb = getFirestore(targetApp);

    const testRef = doc(targetDb, 'hubs', 'test_migration_default_ping');
    await setDoc(testRef, {
      pingDefault: true,
      timestamp: new Date().toISOString()
    });

    console.log("✅ Success! Write to target (default) database succeeded without PERMISSION_DENIED!");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Write failed on (default) database:", err.message);
    process.exit(1);
  }
}

testWriteDefault();
