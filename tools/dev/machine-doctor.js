#!/usr/bin/env node
const { gatherMachineSnapshot } = require('./machine-report');

async function main(){
  const snapshot = await gatherMachineSnapshot({ includePublic: true });
  const ok = snapshot.readiness.development === 'ready';
  console.log(JSON.stringify({
    ok,
    mode: 'doctor',
    machine: snapshot.machine,
    repo: snapshot.repo,
    tools: snapshot.tools,
    release_authority: snapshot.release_authority,
    local_services: snapshot.local_services,
    live_lanes: snapshot.live_lanes,
    public_sync: snapshot.public_sync,
    readiness: snapshot.readiness,
    next: snapshot.next
  }, null, 2));
  if(!ok){
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
