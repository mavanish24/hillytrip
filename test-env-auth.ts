import { execSync } from 'child_process';

function run() {
  console.log("=== Checking for Firebase / GCP Auth Env Vars ===");
  Object.keys(process.env).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('google') || lowerKey.includes('firebase') || lowerKey.includes('key') || lowerKey.includes('secret') || lowerKey.includes('sa_')) {
      const val = process.env[key];
      // Print safely: if it's long, only print length or shape, if short show it.
      const displayVal = val ? (val.length > 30 ? `${val.substring(0, 10)}...[len:${val.length}]...${val.substring(val.length - 5)}` : val) : 'empty';
      console.log(`${key}: ${displayVal}`);
    }
  });
}

run();
