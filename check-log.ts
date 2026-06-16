import fs from 'fs';

try {
  const content = fs.readFileSync('migration_run_3.log', 'utf8');
  // Remove null bytes or weird non-printable characters
  const cleanContent = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
  const lines = cleanContent.split('\n');
  
  console.log(`Log File Stats - Lines: ${lines.length}, Bytes: ${content.length}`);
  
  // Find "MIGRATION REPORT" index
  const reportIndex = lines.findIndex(line => line.includes("MIGRATION REPORT"));
  
  if (reportIndex !== -1) {
    console.log("Found Migration Report!");
    console.log(lines.slice(reportIndex).join('\n'));
  } else {
    console.log("Migration is still running, or did not print a report yet. Printing last 30 lines:");
    const lastLines = lines.slice(-30);
    console.log(lastLines.join('\n'));
    
    // Look for any errors or successes we can find in the entire file
    const permissionDeniedCount = lines.filter(l => l.includes("PERMISSION_DENIED")).length;
    const committedBatchCount = lines.filter(l => l.includes("Committed batch")).length;
    const docFailCount = lines.filter(l => l.includes("Doc fail")).length;
    
    console.log(`\nFast stats in entire log:`);
    console.log(`  - PERMISSION_DENIED count: ${permissionDeniedCount}`);
    console.log(`  - Committed batch count: ${committedBatchCount}`);
    console.log(`  - Doc fail count: ${docFailCount}`);
  }
} catch (e: any) {
  console.error("Error checking log:", e.message);
}
