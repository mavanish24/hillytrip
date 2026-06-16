import { Firestore } from '@google-cloud/firestore';

async function testAdminWriteDefault() {
  try {
    console.log("Initializing admin Firestore with ADC for (default) database...");
    const db = new Firestore({
      projectId: 'hillytrip-prod'
      // No custom databaseId, will use (default)
    });

    console.log("Attempting administrative bypass write on (default)...");
    const docRef = db.collection('hubs').doc('admin_bypass_test_ping_default');
    await docRef.set({
      bypassWorking: true,
      timestamp: new Date().toISOString()
    });

    console.log("✅ SUCCESS! Administrative write to (default) database bypassed security rules perfectly!");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Admin write failed on (default):", err.message);
    process.exit(1);
  }
}

testAdminWriteDefault();
