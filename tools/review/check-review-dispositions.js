#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const LATEST = path.join(ROOT, 'reference-artifacts', 'analyses', 'review-learning', 'latest.json');
const VALID_DECISIONS = new Set(['addressed', 'dismissed']);

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function main(){
  if(!fs.existsSync(LATEST)){
    fail('Review learning ledger missing. Run npm run review:cycle before release review.', {
      expected: rel(LATEST)
    });
  }
  const ledger = JSON.parse(fs.readFileSync(LATEST, 'utf8'));
  const issues = Array.isArray(ledger.issueNotes) ? ledger.issueNotes : [];
  const unresolved = [];
  for(const issue of issues){
    const disposition = issue.productionDisposition || {};
    const decision = String(disposition.decision || '').trim();
    const reason = String(disposition.reason || '').trim();
    const evidence = Array.isArray(disposition.evidence) ? disposition.evidence.filter(Boolean) : [];
    if(!VALID_DECISIONS.has(decision)){
      unresolved.push({ id: issue.id, severity: issue.severity, problem: 'missing addressed/dismissed production disposition' });
      continue;
    }
    if(reason.length < 24){
      unresolved.push({ id: issue.id, severity: issue.severity, decision, problem: 'missing disposition rationale' });
    }
    if(!evidence.length){
      unresolved.push({ id: issue.id, severity: issue.severity, decision, problem: 'missing disposition evidence' });
    }
    if((issue.severity === 'P0' || issue.severity === 'P1') && decision !== 'addressed'){
      unresolved.push({ id: issue.id, severity: issue.severity, decision, problem: 'P0/P1 issues must be addressed, not dismissed' });
    }
  }
  if(unresolved.length){
    fail('Review disposition gate failed. Before production, every review issue must be addressed or dismissed with rationale and evidence.', {
      unresolved
    });
  }
  console.log(JSON.stringify({
    ok: true,
    ledger: rel(LATEST),
    issueCount: issues.length,
    addressed: issues.filter(issue => issue.productionDisposition?.decision === 'addressed').length,
    dismissed: issues.filter(issue => issue.productionDisposition?.decision === 'dismissed').length
  }, null, 2));
}

main();
