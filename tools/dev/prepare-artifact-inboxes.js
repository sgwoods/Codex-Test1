#!/usr/bin/env node
const {
  describeImportSourcePolicy,
  ensureImportInboxes
} = require('../harness/artifact-source-policy');

function main(){
  const inboxes = ensureImportInboxes();
  const missingRequired = inboxes.filter((entry) => entry.required && !entry.exists);
  const summary = {
    ok: missingRequired.length === 0,
    importSourcePolicy: describeImportSourcePolicy(),
    inboxes
  };
  console.log(JSON.stringify(summary, null, 2));
  if(!summary.ok){
    process.exit(1);
  }
}

main();
