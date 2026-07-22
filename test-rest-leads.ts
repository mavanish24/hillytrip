import fs from 'fs';

async function testRestLeads() {
  const targetConfig = JSON.parse(fs.readFileSync('./firebase-applet-config-target.json', 'utf-8'));
  const projectId = targetConfig.projectId;
  const dbId = targetConfig.firestoreDatabaseId;
  const apiKey = targetConfig.apiKey;

  // Let's test writes to trip_leads which represents anonymous customer submissions
  const urlWrite = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/trip_leads/test_leads_ping?key=${apiKey}`;
  console.log("Testing REST PUT to target trip_leads url:", urlWrite);
  try {
    const resPut = await fetch(urlWrite, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: 'test_leads_ping' },
          name: { stringValue: 'Migration Ping Test' },
          mobile: { stringValue: '1234567890' },
          destination: { stringValue: 'Darjeeling' },
          createdAt: { stringValue: new Date().toISOString() }
        }
      })
    });
    const bodyPut = await resPut.json();
    console.log("Target trip_leads PUT Response Status:", resPut.status);
    console.log("Target trip_leads Response Body:", JSON.stringify(bodyPut, null, 2));
  } catch (err: any) {
    console.error("Target trip_leads PUT Fetch failed:", err.message);
  }

  process.exit(0);
}

testRestLeads();
