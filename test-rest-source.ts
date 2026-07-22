import fs from 'fs';

async function testRestSource() {
  const sourceConfig = JSON.parse(fs.readFileSync('./firebase-applet-config-source.json', 'utf-8'));
  const projectId = sourceConfig.projectId;
  const dbId = sourceConfig.firestoreDatabaseId;
  const apiKey = sourceConfig.apiKey;

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/hubs?key=${apiKey}`;

  console.log("Testing REST GET to source url:", url);
  try {
    const resGet = await fetch(url);
    const bodyGet = await resGet.json();
    console.log("Source GET Response Status:", resGet.status);
    console.log("Source GET Response Body:", JSON.stringify(bodyGet, null, 2).substring(0, 500) + "...");
  } catch (err: any) {
    console.error("Source GET Fetch failed:", err.message);
  }

  const urlWrite = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/hubs/test_rest_ping_source?key=${apiKey}`;
  console.log("\nTesting REST PUT to source url:", urlWrite);
  try {
    const resPut = await fetch(urlWrite, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          restWorked: { booleanValue: true },
          timestamp: { stringValue: new Date().toISOString() }
        }
      })
    });
    const bodyPut = await resPut.json();
    console.log("Source PUT Response Status:", resPut.status);
    console.log("Source PUT Response Body:", JSON.stringify(bodyPut, null, 2));
  } catch (err: any) {
    console.error("Source PUT Fetch failed:", err.message);
  }

  process.exit(0);
}

testRestSource();
