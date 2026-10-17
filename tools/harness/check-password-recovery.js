#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const baseline = process.argv.includes('--baseline');
const source = file => baseline
  ? execFileSync('git', ['show', `ce9f0b74:${file}`], { encoding: 'utf8' })
  : fs.readFileSync(path.join(__dirname, '../..', file), 'utf8');
const user = { id: 'fixture-user', email: 'pilot@example.invalid' };
function deferred(){ let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }

function fixture(options = {}){
  const jobs = [];
  const calls = [];
  let listener;
  let inCallback = false;
  let update = async () => ({ data: { user }, error: null });
  const c = {
    LEADERBOARD: { recoveryMode: 0, accountPanelOpen: 0, authBusy: 0, view: 'all', remote: {}, cacheStamp: {} },
    accountPassword: { value: '' }, accountPasswordConfirm: { value: '' },
    HARNESS_SUPABASE_BYPASS: false, SUPABASE_URL: 'https://fixture.invalid', SUPABASE_ANON_KEY: 'fixture',
    RELEASE_CHANNEL: options.production ? 'production' : 'production beta',
    location: { hash: options.hash || '', pathname: '/', search: '' }, URLSearchParams,
    history: { replaceState(){} }, document: { title: 'Fixture' },
    remoteAuthEnabled: () => !options.disabled, remoteWriteEnabled: () => false,
    remoteLeaderboardPolicyLabel: () => 'fixture',
    isSignedInAsTestAccount: () => c.LEADERBOARD.user?.id === 'test-fixture',
    hydrateLeaderboardCache(){},
    async loadOwnProfile(){ assert(!inCallback, 'Provider work under auth lock'); if(options.profileError)throw Error('profile failed'); },
    async refreshSignedInPilotRecords(){ assert(!inCallback, 'Provider work under auth lock'); },
    setAccountNotice(value){ c.notice = value; }, setLeaderboardStatus(){},
    syncOverlayPause(){}, syncLeaderboardPanelVisibility(){}, syncAccountPanelVisibility(){},
    primeLeaderboard(){}, scheduleLeaderboardRefresh(){},
    setTimeout(job){ jobs.push(job); return jobs.length; }
  };
  const session = { user: options.user || user };
  function emit(event, value = session){
    assert(listener, 'Recovery subscription must exist before session initialization');
    inCallback = true;
    try{
      const returned = listener(event, value);
      if(returned?.then)returned.catch(()=>{});
      assert(!returned?.then, 'Auth listener must return synchronously');
    }finally{ inCallback = false; }
  }
  const auth = {
    onAuthStateChange(handler){ listener = handler; if(options.onSubscribe)options.onSubscribe(emit); return { data: { subscription: { unsubscribe(){} } } }; },
    async getSession(){ assert(!inCallback, 'getSession under auth lock'); return options.sessionGate ? options.sessionGate.promise : { data: { session: options.noSession ? null : session } }; },
    async updateUser(value){ assert(!inCallback, 'update under auth lock'); calls.push(value); return update(value); },
    async signOut(){ assert(!inCallback, 'signOut under auth lock'); emit('SIGNED_OUT', null); return { error: null }; }
  };
  c.window = { supabase: { createClient(){ if(options.consumeHash)c.location.hash = ''; return { auth }; } } };
  const boundary = { ...c };
  vm.createContext(c);
  vm.runInContext(source('src/js/04-leaderboard-ui.js'), c);
  vm.runInContext(source('src/js/12-auth-session.js'), c);
  for(const [name, value] of Object.entries(boundary))if(typeof value === 'function')c[name] = value;
  // DOM projection only; browser coverage separately executes the complete UI.
  c.syncAccountUi = () => { c.recoveryFieldsVisible = !!c.LEADERBOARD.recoveryMode; };
  c.syncLeaderboardUi = () => c.syncAccountUi();
  c.syncLeaderboardBest = () => {};
  async function flush(){ for(let i = 0; jobs.length && i < 30; i++)await jobs.shift()(); assert.equal(jobs.length, 0); }
  return { c, calls, emit, flush, setUpdate(fn){ update = fn; }, start: () => c.initLeaderboard() };
}

const tests = {
  async 'recovery event before getSession resolves opens the form synchronously'(){
    const gate = deferred(); const f = fixture({ sessionGate: gate }); const init = f.start();
    f.emit('PASSWORD_RECOVERY');
    assert.equal(f.c.LEADERBOARD.accountPanelOpen, 1); assert.equal(f.c.recoveryFieldsVisible, true);
    gate.resolve({ data: { session: null } }); await init;
    assert.equal(f.c.LEADERBOARD.user.id, user.id); assert.equal(f.c.LEADERBOARD.recoveryMode, 1);
    await f.flush();
  },
  async 'URL recovery intent survives SDK URL cleanup and is consumed once'(){
    const f = fixture({ hash: '#access_token=synthetic&type=recovery', consumeHash: true });
    await f.start(); assert.equal(f.c.LEADERBOARD.recoveryMode, 1); assert.equal(f.c.LEADERBOARD.accountPanelOpen, 1);
    f.c.exitRecoveryMode(); f.emit('SIGNED_IN'); await f.flush(); assert.equal(f.c.LEADERBOARD.recoveryMode, 0);
  },
  async 'ordinary auth events preserve recovery and typed values'(){
    const f = fixture(); await f.start(); f.emit('PASSWORD_RECOVERY');
    f.c.accountPassword.value = 'fixture-pass'; f.c.accountPasswordConfirm.value = 'fixture-pass';
    for(const event of ['INITIAL_SESSION', 'SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'PASSWORD_RECOVERY']){
      f.emit(event); assert.equal(f.c.LEADERBOARD.recoveryMode, 1); assert.equal(f.c.accountPassword.value, 'fixture-pass');
    }
    await f.flush(); assert.equal(f.calls.length, 0);
  },
  async 'cancel and sign-out clear secrets and late session initialization cannot revive recovery'(){
    for(const action of ['cancel', 'signout']){
      const gate = deferred(); const f = fixture({ sessionGate: gate }); const init = f.start();
      f.emit('PASSWORD_RECOVERY'); f.c.accountPassword.value = 'secret';
      if(action === 'cancel')f.c.exitRecoveryMode(); else f.emit('SIGNED_OUT', null);
      gate.resolve({ data: { session: { user } } }); await init; await f.flush();
      assert.equal(f.c.LEADERBOARD.recoveryMode, 0); assert.equal(f.c.accountPassword.value, '');
      if(action === 'signout')assert.equal(f.c.LEADERBOARD.user, null);
      assert.equal(f.calls.length, 0);
    }
  },
  async 'empty, short and mismatched inputs never update the provider'(){
    const f = fixture(); await f.start(); f.emit('PASSWORD_RECOVERY');
    for(const [password, confirm] of [['', ''], ['short', 'short'], ['fixture-pass', 'different']]){
      f.c.accountPassword.value = password; f.c.accountPasswordConfirm.value = confirm;
      await f.c.applyRecoveredPassword(); assert.equal(f.calls.length, 0); assert.equal(f.c.LEADERBOARD.recoveryMode, 1);
    }
  },
  async 'provider errors and rejected saves retain recovery and release busy state'(){
    for(const reject of [false, true]){
      const f = fixture(); await f.start(); f.emit('PASSWORD_RECOVERY');
      f.c.accountPassword.value = f.c.accountPasswordConfirm.value = 'fixture-pass';
      f.setUpdate(async () => { if(reject)throw Error('offline'); return { error: { message: 'rejected' } }; });
      await f.c.applyRecoveredPassword();
      assert.equal(f.calls.length, 1); assert.equal(f.c.LEADERBOARD.authBusy, 0);
      assert.equal(f.c.LEADERBOARD.recoveryMode, 1); assert.match(f.c.notice, /Could not update password/);
    }
  },
  async 'explicit save is single-flight and succeeds despite profile refresh failure'(){
    const options = {}; const f = fixture(options); await f.start(); options.profileError = true; f.emit('PASSWORD_RECOVERY');
    f.c.accountPassword.value = f.c.accountPasswordConfirm.value = 'fixture-pass';
    const gate = deferred(); f.setUpdate(() => gate.promise);
    const save = f.c.applyRecoveredPassword(); await f.c.applyRecoveredPassword();
    assert.equal(f.calls.length, 1); assert.equal(f.c.LEADERBOARD.authBusy, 1);
    f.emit('USER_UPDATED'); gate.resolve({ data: { user }, error: null }); await save;
    assert.equal(f.c.LEADERBOARD.recoveryMode, 0); assert.equal(f.c.accountPassword.value, '');
    assert.equal(f.c.accountPasswordConfirm.value, ''); assert.match(f.c.notice, /Password updated/);
    await f.flush();
  },
  async 'sign-out during save cannot restore a stale user'(){
    const f = fixture(); await f.start(); f.emit('PASSWORD_RECOVERY');
    f.c.accountPassword.value = f.c.accountPasswordConfirm.value = 'fixture-pass';
    const gate = deferred(); f.setUpdate(() => gate.promise); const save = f.c.applyRecoveredPassword();
    f.emit('SIGNED_OUT', null); gate.resolve({ data: { user }, error: null }); await save; await f.flush();
    assert.equal(f.c.LEADERBOARD.user, null); assert.equal(f.c.LEADERBOARD.recoveryMode, 0);
  },
  async 'no session or disabled auth cannot turn a URL hint into recovery access'(){
    for(const options of [{ noSession: true }, { disabled: true }]){
      const f = fixture({ ...options, hash: '#type=recovery' }); await f.start();
      await f.c.applyRecoveredPassword(); assert.equal(f.calls.length, 0); assert.equal(f.c.LEADERBOARD.recoveryMode, 0);
    }
  },
  async 'production test-account exclusion remains outside the auth callback lock'(){
    const f = fixture({ production: true }); await f.start();
    f.emit('PASSWORD_RECOVERY', { user: { id: 'test-fixture' } });
    assert.equal(f.c.LEADERBOARD.user, null); assert.equal(f.c.LEADERBOARD.accountPanelOpen, 0);
    await f.c.applyRecoveredPassword(); assert.equal(f.calls.length, 0); await f.flush();
    assert.equal(f.c.LEADERBOARD.user, null); assert.equal(f.c.LEADERBOARD.recoveryMode, 0);
  },
  async 'obsolete client callbacks cannot replace the current session'(){
    const f = fixture(); await f.start(); const replacement = { auth: {} }; f.c.LEADERBOARD.client = replacement;
    f.emit('PASSWORD_RECOVERY'); assert.equal(f.c.LEADERBOARD.recoveryMode, 0);
    assert.equal(f.c.LEADERBOARD.client, replacement);
  },
  async 'profile responses after sign-out, user replacement or client replacement cannot seed or restore data'(){
    for(const change of ['signout', 'user', 'client', 'none']){
      const gate = deferred(); let upserts = 0; let seeded = false;
      const chain = { select(){ return this; }, eq(){ return this; },
        upsert(value){ upserts++; seeded = true; assert.equal(value.user_id, user.id); return this; },
        maybeSingle(){ return seeded ? Promise.resolve({ data: { user_id: user.id } }) : gate.promise; } };
      const c = { LEADERBOARD: { client: { from: () => chain }, user, profile: null },
        preferredInitialsFromUser: () => 'TST', syncAccountUi(){} };
      vm.createContext(c); vm.runInContext(source('src/js/11-leaderboard-service.js'), c);
      const work = c.loadOwnProfile();
      if(change === 'signout')c.LEADERBOARD.user = null;
      if(change === 'user'){ c.LEADERBOARD.user = { id: 'replacement' }; c.LEADERBOARD.profile = { user_id: 'replacement' }; }
      if(change === 'client')c.LEADERBOARD.client = { from: () => chain };
      gate.resolve({ data: null }); await work;
      assert.equal(upserts, change === 'none' ? 1 : 0);
      assert.equal(c.LEADERBOARD.profile?.user_id || null, change === 'none' ? user.id : change === 'user' ? 'replacement' : null);
    }
  }
};
(async () => {
  let failures = 0;
  for(const [name, test] of Object.entries(tests)){
    try{ await test(); console.log(`PASS ${name}`); }
    catch(error){ failures++; console.error(`FAIL ${name}: ${error.stack}`); }
  }
  console.log(JSON.stringify({ ok: !failures, baseline, cases: Object.keys(tests).length, failures }));
  process.exitCode = failures ? 1 : 0;
})();
