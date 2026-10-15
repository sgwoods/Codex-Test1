const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { createHash } = require('crypto');
const { execFileSync, spawnSync } = require('child_process');
const { inventory } = require('../build/frozen-beta-contract');
const { BETA_BASE_FILES } = require('../build/lane-files');

const project = path.resolve(__dirname, '../..');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aurora-frozen-publisher-fixture-'));
const git = (dir, args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: 'pipe' });
const passed = [];
try{
  for(const scenario of ['pass', 'gate-failure', 'gate-mutation', 'protected-prune', 'no-change']){
    const dir = path.join(root, scenario);
    const candidate = path.join(dir, 'candidate');
    const beta = path.join(candidate, 'beta');
    const remote = path.join(dir, 'remote');
    fs.mkdirSync(beta, { recursive: true });
    fs.mkdirSync(remote);
    const info = { commit: '1'.repeat(40), label: 'fixture-beta', shortCommit: '11111111',
      releaseChannel: 'production beta', dirty: false, promotedFromState: 'main@11111111 clean' };
    for(const file of BETA_BASE_FILES) fs.writeFileSync(path.join(beta, file), file);
    fs.writeFileSync(path.join(beta, 'build-info.json'), JSON.stringify(info));
    const files = inventory(beta);
    fs.writeFileSync(path.join(candidate, 'inventory.json'), JSON.stringify(files));
    fs.writeFileSync(path.join(candidate, 'freeze-receipt.json'), JSON.stringify({
      inventorySha256: createHash('sha256').update(JSON.stringify(files)).digest('hex'),
      fileCount: files.length, totalBytes: files.reduce((n, f) => n + f.bytes, 0),
      sourceCommit: info.commit, betaLabel: info.label
    }));
    fs.cpSync(beta, path.join(dir, 'incoming'), { recursive: true });
    git(remote, ['init', '-q']);
    git(remote, ['config', 'user.name', 'Fixture']);
    git(remote, ['config', 'user.email', 'fixture@example.com']);
    fs.writeFileSync(path.join(remote, 'index.html'), 'Protected production');
    if(scenario === 'no-change') fs.cpSync(beta, path.join(remote, 'beta'), { recursive: true });
    if(scenario === 'protected-prune'){
      fs.mkdirSync(path.join(remote, 'assets/reference-audio'), { recursive: true });
      fs.writeFileSync(path.join(remote, 'assets/reference-audio/protected.txt'), 'Protected fixture');
    }
    git(remote, ['add', '-A']);
    git(remote, ['commit', '-qm', 'Public fixture']);
    const hook = path.join(dir, 'hook.js');
    // Substitute only external gate/clone/push boundaries; staging and Git checks execute normally.
    fs.writeFileSync(hook, `
const fs=require('fs'),path=require('path'),cp=require('child_process');
const original=cp.execFileSync,project=${JSON.stringify(project)},dir=${JSON.stringify(dir)},scenario=${JSON.stringify(scenario)};
const record=x=>fs.appendFileSync(path.join(dir,'calls.jsonl'),JSON.stringify(x)+'\\n');
const paths=require.resolve(path.join(project,'tools/build/paths'));
require.cache[paths]={exports:{ROOT:${JSON.stringify(remote)},DIST_BETA:path.join(dir,'incoming'),BETA_BUILD_INFO:path.join(dir,'incoming/build-info.json')}};
const ready=require.resolve(path.join(project,'tools/build/check-publish-ready'));
require.cache[ready]={exports:{laneConfig:()=>({}),checkGitClean:()=>{},checkSourceDocs:()=>{},checkArtifacts:()=>{},checkBuildInfo:()=>{}}};
const contract=require(path.join(project,'tools/build/frozen-beta-contract'));
const verifyTree=contract.verifyGitTree;
contract.verifyGitTree=(...args)=>{record({treeVerified:true});return verifyTree(...args);};
cp.execFileSync=function(cmd,args,opts){
 record({cmd,args});
 if(cmd===process.execPath){
  if(!args[0].endsWith('check-code-review-gate.js')&&!args[0].endsWith('check-publish-ready.js'))throw Error('Unexpected generator');
  if(scenario==='gate-failure')throw Error('Fixture gate failure');
  if(scenario==='gate-mutation'&&args[0].endsWith('check-publish-ready.js'))fs.appendFileSync(path.join(dir,'incoming/index.html'),'mutation');
  return '';
 }
 if(cmd==='gh')return original('git',['clone','-q',${JSON.stringify(remote)},args[3]],{stdio:'pipe',encoding:'utf8'});
 if(cmd==='git'&&args.includes('push')){record({pushed:true});return '';}
 return original(cmd,args,opts);
};
`);
    const result = spawnSync(process.execPath, ['--require', hook,
      path.join(project, 'tools/build/publish-lane.js'), '--lane', 'beta', '--require-frozen', '--frozen-candidate', candidate],
    { encoding: 'utf8', env: { ...process.env, AURORA_PUBLIC_OWNER: 'fixture', AURORA_PUBLIC_REPO: 'fixture' } });
    const calls = fs.readFileSync(path.join(dir, 'calls.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
    const pushes = calls.filter(x => x.pushed).length;
    if(scenario === 'pass'){
      assert.equal(result.status, 0, result.stderr);
      assert.equal(pushes, 1);
      assert(calls.some(x => x.treeVerified));
      const gates = calls.filter(x => x.cmd === process.execPath);
      assert.equal(gates.length, 2);
      assert(gates[0].args[0].endsWith('check-code-review-gate.js'));
      assert(gates[1].args[0].endsWith('check-publish-ready.js'));
    }else if(scenario === 'no-change'){
      assert.equal(result.status, 0, result.stderr);
      assert.equal(pushes, 0);
      assert(calls.some(x => x.treeVerified));
    }else{
      assert.notEqual(result.status, 0, result.stdout);
      assert.equal(pushes, 0);
      if(scenario !== 'protected-prune') assert(!calls.some(x => x.cmd === 'gh'));
    }
    passed.push(scenario);
  }
  console.log(JSON.stringify({ ok: true, scenarios: passed, realNetworkCalls: 0,
    limitation: 'Gate bodies and remote clone/push are substituted; real gates must also pass separately.' }, null, 2));
}finally{
  fs.rmSync(root, { recursive: true, force: true });
}
