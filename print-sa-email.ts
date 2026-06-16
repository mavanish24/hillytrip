function printSAEmail() {
  const email = process.env.AUTHORIZED_SERVICE_ACCOUNT_EMAIL || 'not_found';
  console.log("Active Service Account Email for this Workspace:");
  console.log("================================================");
  console.log(email);
  console.log("================================================");
  process.exit(0);
}

printSAEmail();
