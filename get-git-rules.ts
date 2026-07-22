import { execSync } from 'child_process';

function run() {
  try {
    console.log("=== Git History of firestore.rules ===");
    const commits = execSync('git log --oneline -n 10', { encoding: 'utf8' });
    console.log(commits);

    console.log("=== Original firestore.rules from git ===");
    const originalRules = execSync('git show HEAD:firestore.rules', { encoding: 'utf8' });
    console.log(originalRules);
  } catch (err: any) {
    console.error("Error running git commands:", err.message);
  }
}

run();
