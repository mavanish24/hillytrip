import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

async function testAnonymousWrite() {
  try {
    const targetConfig = JSON.parse(fs.readFileSync('./firebase-applet-config-target.json', 'utf-8'));
    console.log("Testing Anonymous Auth then write to Project ID:", targetConfig.projectId);
    console.log("Database ID:", targetConfig.firestoreDatabaseId);

    const targetApp = initializeApp(targetConfig, 'testAppInstanceAnon');
    const auth = getAuth(targetApp);

    console.log("Signing in anonymously...");
    const userCredential = await signInAnonymously(auth);
    console.log("✅ Authenticated anonymously! UID:", userCredential.user.uid);

    const targetDb = getFirestore(targetApp, targetConfig.firestoreDatabaseId);

    // Try to write to trip_leads with our authenticated session
    console.log("Attempting write to 'trip_leads'...");
    const testRef = doc(targetDb, 'trip_leads', 'test_anon_migration_ping');
    await setDoc(testRef, {
      id: 'test_anon_migration_ping',
      name: 'Anon Migration Ping',
      mobile: '9876543210',
      destination: 'Sikkim',
      createdAt: new Date().toISOString()
    });

    console.log("✅ Success! Authenticated anonymous write to 'trip_leads' succeeded!");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Anonymous write failed:", err.message);
    process.exit(1);
  }
}

testAnonymousWrite();
