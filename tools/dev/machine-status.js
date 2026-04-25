#!/usr/bin/env node
const { gatherMachineSnapshot } = require('./machine-report');

async function main(){
  const snapshot = await gatherMachineSnapshot({ includePublic: false });
  console.log(JSON.stringify({
    ok: true,
    mode: 'status',
    machine: snapshot.machine,
    repo: snapshot.repo,
    release_authority: snapshot.release_authority,
    local_services: snapshot.local_services,
    live_lanes: snapshot.live_lanes,
    publish_permitted: snapshot.readiness.release === 'ready',
    next: snapshot.next
  }, null, 2));
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
