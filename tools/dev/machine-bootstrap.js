#!/usr/bin/env node
const {
  ROOT,
  MACHINE_PROFILE_FILE,
  currentIdentity,
  gitStatusSummary,
  toolChecks,
  buildMachineProfile,
  writeJson,
  runCommandOrThrow
} = require('./machine-common');
const { gatherMachineSnapshot } = require('./machine-report');

async function main(){
  const identity = currentIdentity();
  const checks = toolChecks();
  const repo = gitStatusSummary();

  const missing = [];
  if(!checks.npm.ok) missing.push('npm');
  if(!checks.python3.ok) missing.push('python3');
  if(!checks.gh.ok) missing.push('gh');

  if(missing.length){
    const summary = {
      ok: false,
      mode: 'bootstrap',
      machine: identity,
      blocked_by: missing,
      message: 'Install the missing tools, then rerun npm run machine:bootstrap.'
    };
    console.log(JSON.stringify(summary, null, 2));
    process.exit(1);
  }

  const actions = [];
  const warnings = [];

  if(repo.branch === 'main' && !repo.dirty){
    runCommandOrThrow('git', ['-C', ROOT, 'pull', '--rebase', 'origin', 'main'], 'git pull --rebase origin main');
    actions.push('git pull --rebase origin main');
  } else if(repo.branch === 'main' && repo.dirty){
    warnings.push('Dirty main prevented automatic pull. Commit or stash changes, then rerun bootstrap.');
  } else {
    warnings.push(`Current branch is "${repo.branch}". Skipping automatic pull because bootstrap only updates main automatically.`);
  }

  runCommandOrThrow('npm', ['install'], 'npm install');
  actions.push('npm install');
  runCommandOrThrow('npm', ['run', 'machine:ensure-browser'], 'npm run machine:ensure-browser');
  actions.push('npm run machine:ensure-browser');
  runCommandOrThrow('npm', ['run', 'build'], 'npm run build');
  actions.push('npm run build');
  runCommandOrThrow('npm', ['run', 'local:resume'], 'npm run local:resume');
  actions.push('npm run local:resume');
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const successfulAt = new Date().toISOString();
  writeJson(MACHINE_PROFILE_FILE, buildMachineProfile(identity, checks, successfulAt));

  const snapshot = await gatherMachineSnapshot({ includePublic: true });
  const ok = warnings.length === 0 && snapshot.readiness.development === 'ready';
  console.log(JSON.stringify({
    ok,
    mode: 'bootstrap',
    machine: snapshot.machine,
    repo: snapshot.repo,
    release_authority: snapshot.release_authority,
    local_services: snapshot.local_services,
    live_lanes: snapshot.live_lanes,
    public_sync: snapshot.public_sync,
    ran: actions,
    warnings,
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
