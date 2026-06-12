#!/usr/bin/env node
const { execFileSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function run(command, args, opts = {}){
  console.error(`[release-preflight:dev] ${[command, ...args].join(' ')}`);
  execFileSync(command, args, {
    cwd: ROOT,
    stdio: opts.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: 'utf8'
  });
}

function tryRun(command, args){
  try{
    run(command, args, { capture: true });
    return { ok: true, stdout: '', stderr: '' };
  }catch(err){
    return {
      ok: false,
      stdout: err.stdout ? String(err.stdout) : '',
      stderr: err.stderr ? String(err.stderr) : '',
      message: String(err.message || err)
    };
  }
}

function git(args){
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

function statusShort(){
  return git(['status', '--short']);
}

function fail(message, details = {}){
  console.error(JSON.stringify({
    ok: false,
    command: 'release:preflight:dev',
    message,
    ...details
  }, null, 2));
  process.exit(1);
}

function printBlocker(label, result){
  const detail = (result.stderr || result.stdout || result.message || '').trim();
  if(detail) console.error(`[release-preflight:dev] ${label}\n${detail}`);
}

function assertClean(reason){
  const status = statusShort();
  if(status){
    fail(reason, {
      status,
      nextAction: 'Commit or intentionally clear the generated/source changes, then rerun npm run release:preflight:dev.'
    });
  }
}

function main(){
  const startedAt = new Date().toISOString();
  const head = git(['rev-parse', '--short', 'HEAD']);
  assertClean('Dev release preflight requires a clean source tree before it starts.');

  const refreshed = [];
  const docs = tryRun(process.execPath, [path.join(ROOT, 'tools', 'harness', 'check-documentation-freshness.js')]);
  if(!docs.ok){
    printBlocker('Release conformance/documentation freshness is stale; refreshing release conformance docs now.', docs);
    run('npm', ['run', 'harness:refresh:release-conformance-docs']);
    refreshed.push('release conformance/documentation');
  }

  const codeReview = tryRun('npm', ['run', 'review:code:check']);
  if(!codeReview.ok){
    printBlocker('Code review packet is stale; refreshing it now.', codeReview);
    run('npm', ['run', 'review:code']);
    refreshed.push('code review');
  }

  if(refreshed.length){
    const label = refreshed.join(' and ');
    assertClean(`${label} refresh produced generated artifacts.`);
  }

  run('npm', ['run', 'build']);
  assertClean('Build changed tracked files; commit or inspect the generated source artifacts before publishing.');
  run('npm', ['run', 'publish:check:dev']);

  console.log(JSON.stringify({
    ok: true,
    command: 'release:preflight:dev',
    startedAt,
    completedAt: new Date().toISOString(),
    head,
    deploys: false,
    readyFor: 'npm run publish:dev',
    hostedSmokeExpectation: 'npm run publish:dev will verify hosted /dev and then run npm run harness:check:hosted-smoke:dev.'
  }, null, 2));
}

main();
