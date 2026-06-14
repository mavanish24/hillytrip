import { dbStore } from './src/server/db';

async function test() {
  console.log("Loading db store...");
  // dbStore constructor calls load() automatically
  const hubs = dbStore.getHubs();
  const routes = dbStore.getRoutes();
  console.log(`Loaded ${hubs.length} hubs and ${routes.length} routes.`);

  if (hubs.length === 0) {
    console.log("No hubs found in the local file. Master data might not be loaded yet.");
    return;
  }

  // Pick a couple of distant hubs to test route search performance and results
  const testHubsList = hubs.slice(0, 10);
  console.log("Testing search routes between various hub pairs:");
  
  const startTime = Date.now();
  let pairsTested = 0;
  for (let i = 0; i < Math.min(hubs.length, 15); i++) {
    for (let j = 0; j < Math.min(hubs.length, 15); j++) {
      if (i === j) continue;
      const from = hubs[i].id;
      const to = hubs[j].id;
      
      const t0 = Date.now();
      const results = dbStore.searchRoutes(from, to);
      const elapsed = Date.now() - t0;
      
      pairsTested++;
      if (results.length > 0 || elapsed > 5) {
        console.log(`- ${from} -> ${to}: Found ${results.length} paths in ${elapsed}ms`);
      }
    }
  }
  console.log(`Total pairs tested: ${pairsTested} in ${Date.now() - startTime}ms`);
}

test();
