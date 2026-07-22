import { execSync } from 'child_process';

function run() {
  console.log("=== Available Env Variables ===");
  Object.keys(process.env).forEach(key => {
    // Show key names, but mask the values for security
    const val = process.env[key];
    const masked = val ? (val.length > 8 ? val.substring(0, 4) + "..." + val.substring(val.length - 4) : "***") : "empty";
    console.log(`${key}: ${masked}`);
  });
}

run();
