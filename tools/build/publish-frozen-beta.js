const path = require('path');
const { execFileSync } = require('child_process');
const { createHash } = require('crypto');
const { ROOT } = require('./paths');
const { loadFrozenCandidate } = require('./frozen-beta-contract');

async function main(){
  const args = process.argv.slice(2);
  for(let i = 0; i < args.length; i++){
    if(args[i] === '--frozen-candidate'){
      if(args.indexOf('--frozen-candidate') !== i) throw new Error('Specify one frozen candidate only.');
      i++;
    }else if(!['--dry-run', '--keep-temp'].includes(args[i])){
      throw new Error(`Unsupported frozen beta option: ${args[i]}`);
    }
  }
  const index = args.indexOf('--frozen-candidate');
  if(index < 0 || !args[index + 1] || args[index + 1].startsWith('--')){
    throw new Error('Use --frozen-candidate PATH for an accepted local beta freeze.');
  }
  const frozen = loadFrozenCandidate(path.resolve(args[index + 1]));
  const run = (script, extra = []) => execFileSync(process.execPath, [path.join(ROOT, script), ...extra],
    { cwd: ROOT, stdio: 'inherit' });
  run('tools/build/publish-lane.js', ['--lane', 'beta', '--require-frozen', ...args]);
  if(args.includes('--dry-run')) return;
  // A post-push failure is not a rollback. Report it and retain the published state.
  try{
    run('tools/build/verify-live-lane.js', ['--lane', 'beta']);
    run('tools/harness/check-hosted-lane-smoke.js', ['--lane', 'beta']);
    for(const file of frozen.files){
      const encoded = file.path.split('/').map(encodeURIComponent).join('/');
      const response = await fetch(`https://sgwoods.github.io/Aurora-Galactica/beta/${encoded}`,
        { cache: 'no-store', signal: AbortSignal.timeout(30000) });
      if(!response.ok) throw new Error(`Hosted beta file unavailable: ${file.path} (${response.status})`);
      const data = Buffer.from(await response.arrayBuffer());
      const hash = createHash('sha256').update(data).digest('hex');
      if(data.length !== file.bytes || hash !== file.sha256) throw new Error(`Hosted beta byte mismatch: ${file.path}`);
    }
    console.log(JSON.stringify({ ok: true, lane: 'beta', label: frozen.receipt.betaLabel,
      hostedFilesVerified: frozen.files.length, inventorySha256: frozen.receipt.inventorySha256 }, null, 2));
  }catch(error){
    throw new Error(`Beta publication completed or was already present, but post-publication verification failed: ${error.message}`);
  }
}

main().catch(error => { console.error(error.message || error); process.exitCode = 1; });
