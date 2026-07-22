import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';

async function migrate() {
  console.log("=========================================");
  console.log("     FIRESTORE DATA MIGRATION SCRIPT     ");
  console.log("          (BATCH OPTIMIZED)              ");
  console.log("=========================================");

  const collections = [
    'attractions',
    'audit_logs',
    'destinations',
    'homestays',
    'hubs',
    'images',
    'likes',
    'notifications',
    'routes',
    'trip_leads',
    'user_analytics',
    'users'
  ];

  let sourceConfig: any;
  let targetConfig: any;

  try {
    sourceConfig = JSON.parse(fs.readFileSync('./firebase-applet-config-source.json', 'utf-8'));
    console.log(`Source Project: ${sourceConfig.projectId}`);
    console.log(`Source Database Id: ${sourceConfig.firestoreDatabaseId}`);
  } catch (err: any) {
    console.error("Failed to load source configuration from /firebase-applet-config-source.json:", err.message);
    process.exit(1);
  }

  try {
    targetConfig = JSON.parse(fs.readFileSync('./firebase-applet-config-target.json', 'utf-8'));
    console.log(`Target Project: ${targetConfig.projectId}`);
    console.log(`Target Database Id: ${targetConfig.firestoreDatabaseId}`);
  } catch (err: any) {
    console.error("Failed to load target configuration from /firebase-applet-config-target.json:", err.message);
    process.exit(1);
  }

  // Initialize both Firebase Apps
  const sourceApp = initializeApp(sourceConfig, 'sourceAppInstance');
  const targetApp = initializeApp(targetConfig, 'targetAppInstance');

  // Initialize Firestore instances
  const sourceDb = getFirestore(sourceApp, sourceConfig.firestoreDatabaseId);
  const targetDb = getFirestore(targetApp, targetConfig.firestoreDatabaseId);

  const migrationSummary: Record<string, {
    sourceCount: number;
    targetCount: number;
    successCount: number;
    failedDocs: { id: string; error: string }[];
  }> = {};

  for (const col of collections) {
    console.log(`\n-----------------------------------------`);
    console.log(`Migrating Collection: [${col}]`);
    console.log(`-----------------------------------------`);

    migrationSummary[col] = {
      sourceCount: 0,
      targetCount: 0,
      successCount: 0,
      failedDocs: []
    };

    // 1. Fetch from source
    let sourceDocs: any[] = [];
    try {
      const snap = await getDocs(collection(sourceDb, col));
      snap.forEach(docSnap => {
        sourceDocs.push({
          id: docSnap.id,
          data: docSnap.data()
        });
      });
      migrationSummary[col].sourceCount = sourceDocs.length;
      console.log(`Fetched ${sourceDocs.length} documents from source [${col}].`);
    } catch (err: any) {
      console.error(`Error reading from source collection [${col}]:`, err.message);
      migrationSummary[col].failedDocs.push({ id: '_collection_read_', error: err.message });
      continue;
    }

    if (sourceDocs.length === 0) {
      console.log(`Collection [${col}] is empty. Skipping entry writing.`);
      continue;
    }

    // 2. Write to target in batches of 500
    console.log(`Writing documents to target [${col}] using Firestore Batches...`);
    const BATCH_SIZE = 500;
    for (let i = 0; i < sourceDocs.length; i += BATCH_SIZE) {
      const chunk = sourceDocs.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(targetDb);
      
      for (const sDoc of chunk) {
        const targetDocRef = doc(targetDb, col, sDoc.id);
        batch.set(targetDocRef, sDoc.data);
      }

      try {
        await batch.commit();
        migrationSummary[col].successCount += chunk.length;
        console.log(`Committed batch of ${chunk.length} documents (${i + chunk.length}/${sourceDocs.length}).`);
      } catch (err: any) {
        console.error(`Failed to commit batch of ${chunk.length} documents starting at index ${i}:`, err.message);
        // Fallback to item-by-item for this chunk to isolate the specific failures
        for (const sDoc of chunk) {
          try {
            const singleBatch = writeBatch(targetDb);
            const targetDocRef = doc(targetDb, col, sDoc.id);
            singleBatch.set(targetDocRef, sDoc.data);
            await singleBatch.commit();
            migrationSummary[col].successCount++;
          } catch (singleErr: any) {
            console.error(`Doc fail: [${sDoc.id}]:`, singleErr.message);
            migrationSummary[col].failedDocs.push({ id: sDoc.id, error: singleErr.message });
          }
        }
      }
    }

    // 3. Verify counts in target
    try {
      const targetSnap = await getDocs(collection(targetDb, col));
      migrationSummary[col].targetCount = targetSnap.size;
      console.log(`Verified. Target count for [${col}]: ${targetSnap.size}`);
    } catch (err: any) {
      console.error(`Failed to verify counts in target [${col}]:`, err.message);
    }
  }

  // Print results
  console.log("\n=========================================");
  console.log("            MIGRATION REPORT             ");
  console.log("=========================================");
  
  let totalSource = 0;
  let totalTarget = 0;
  let totalSuccess = 0;
  let totalFailed = 0;

  console.log(
    String("Collection").padEnd(20) + " | " +
    String("Source").padStart(8) + " | " +
    String("Target").padStart(8) + " | " +
    String("Success").padStart(8) + " | " +
    String("Failed").padStart(8)
  );
  console.log("-".repeat(60));

  for (const [colName, stats] of Object.entries(migrationSummary)) {
    totalSource += stats.sourceCount;
    totalTarget += stats.targetCount;
    totalSuccess += stats.successCount;
    totalFailed += stats.failedDocs.length;

    console.log(
      colName.padEnd(20) + " | " +
      String(stats.sourceCount).padStart(8) + " | " +
      String(stats.targetCount).padStart(8) + " | " +
      String(stats.successCount).padStart(8) + " | " +
      String(stats.failedDocs.length).padStart(8)
    );
  }
  
  console.log("-".repeat(60));
  console.log(
    String("TOTAL").padEnd(20) + " | " +
    String(totalSource).padStart(8) + " | " +
    String(totalTarget).padStart(8) + " | " +
    String(totalSuccess).padStart(8) + " | " +
    String(totalFailed).padStart(8)
  );

  console.log("\n=========================================");
  if (totalFailed > 0) {
    console.log("⚠️ Some documents failed to migrate. Details below:");
    for (const [colName, stats] of Object.entries(migrationSummary)) {
      if (stats.failedDocs.length > 0) {
        console.log(`\nFailed docs in [${colName}]:`);
        stats.failedDocs.forEach(fd => {
          console.log(`  - Doc ID: ${fd.id} | Error: ${fd.error}`);
        });
      }
    }
  } else {
    console.log("🎉 SUCCESS! All collections migrated with 0 failures.");
  }
  console.log("=========================================");
}

migrate();
