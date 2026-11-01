#!/usr/bin/env node
'use strict';
// Private copied-bundle probe. Never builds, publishes, or changes the input bundle.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const SOURCE = 'cb70121e9c5f29c483eec54f17b44e115a87c55f';
const CLEAN_INPUT_HASH = 'e75da83616ce4e6eddb97a79e446f5e8b413d7fc4114bd1e3387ffca0884f3fe';
const POLICY_HASH = '737862f389315c0763c2c978fe55c955e7bc4413cc3f8515f2ccb92ec683c3a5';
const MAX_TICKS = 900 * 60;
const WALL_MS = 180000;
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
const line = (fd, value) => fs.writeSync(fd, JSON.stringify(value) + '\n');

function verifyMethods(job) {
  assert.equal(digest(fs.readFileSync(__filename)), job.methodSha256, 'Worker method changed');
  assert.equal(digest(fs.readFileSync(path.join(job.repo, 'tools/harness/browser-launch.js'))),
    job.helperSha256, 'Browser helper changed');
  assert.equal(digest(fs.readFileSync(path.join(job.repo, 'tools/testing/managed-child.js'))),
    job.supervisorSha256, 'Managed supervisor changed');
}

function inventory(root) {
  const files = [];
  function visit(rel) {
    const file = path.join(root, rel), stat = fs.lstatSync(file);
    assert(!stat.isSymbolicLink(), `Symlink refused: ${file}`);
    if (stat.isDirectory()) for (const name of fs.readdirSync(file).sort()) visit(path.join(rel, name));
    else {
      assert(stat.isFile(), `Non-file input: ${file}`);
      const bytes = fs.readFileSync(file);
      files.push({ file: rel.split(path.sep).join('/'), bytes: bytes.length, sha256: digest(bytes) });
    }
  }
  visit('');
  return { sha256: digest(JSON.stringify(files)), files };
}

function once(text, before, after) {
  assert.equal(text.split(before).length - 1, 1, `Expected one anchor: ${before}`);
  return text.replace(before, () => after);
}

// These observers are byte-identical in both arms. No board, score, clock or RNG writes.
const EVENT_OBSERVER = `
 if(window.__naturalProbe?.active){
  const n=window.__naturalProbe;
  if(n.events.length>=100000)throw new Error('Natural event queue overflow');
  n.events.push({tick:n.tick,owner:S.watchMode?'watch':(S.playerTwo?.activeTurn||'p1'),
   event:JSON.parse(JSON.stringify(REC.events[REC.events.length-1]))});
 }`;
const TRACE_OBSERVER = `
 if(window.__naturalProbe?.active&&axis!==preferredAxis){
  const n=window.__naturalProbe;
  n.trace.push({tick:n.tick,owner:S.watchMode?'watch':(S.playerTwo?.activeTurn||'p1'),
   t:S.simT,stage:S.stage,challenge:!!S.challenge,score:S.score,lives:S.lives,
   preferredAxis,axis,p:{x:p.x,y:p.y,s:p.s},
   e:S.e.filter(e=>e.hp>0).map(e=>({id:e.id,t:e.t,x:e.x,y:e.y,dive:e.dive,box:enemyCollisionHitbox(e)})),
   eb:S.eb.map(b=>({x:b.x,y:b.y,vx:b.vx,vy:b.vy}))});
 }`;

function derive(source, policy, candidate) {
  let text = source;
  if (candidate) {
    text = once(text, 'function harnessResolveHazardAxis(', policy + '\nfunction harnessResolveHazardAxis(');
    const guard = " if(cfg.name!=='professional'||state.challenge||state.stage<4)return preferredAxis;";
    text = once(text, guard,
      " if(cfg.name==='expert'&&!state.challenge&&state.stage>=4)return harnessExpertBodyVeto(state,p,cfg,preferredAxis,dt);\n" + guard);
  }
  const log = ' REC.events.push(Object.assign({t:recTime(),type},data));';
  text = once(text, log, log + EVENT_OBSERVER);
  const axis = ' const axis=harnessResolveHazardAxis(S,p,cfg,preferredAxis,dt);';
  text = once(text, axis, axis + TRACE_OBSERVER);
  for (const match of text.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    if (/type="application\/json"/.test(match[1] || '')) JSON.parse(match[2]);
    else if (match[2].trim()) new vm.Script(match[2]);
  }
  return text;
}

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    // Randomized rival presentation only, not gameplay RNG or lane mechanics.
    if (value.mode === 'persona-rival' && ['variance', 'initials', 'label'].includes(key)) continue;
    out[key] = normalize(val);
  }
  return out;
}

const MECHANICAL_EVENTS = new Set(('game_start game_over player_shot ship_lost enemy_damaged enemy_killed '
  + 'enemy_attack_start enemy_bullet_fired enemy_lower_field challenge_enemy_contact capture_escape '
  + 'capture_retreat_phase capture_started fighter_captured captured_fighter_destroyed '
  + 'captured_fighter_hostile_spawned captured_fighter_released captured_fighter_turned_hostile '
  + 'challenge_clear challenge_group_bonus challenge_transition_queued extend_awarded fighter_rescued '
  + 'rescue_join_phase score_awarded special_attack_bonus stage_profile stage_spawn stage_clear '
  + 'challenge_transition_started challenge_transition_recovered challenge_transition_spawn_commit '
  + 'challenge_transition_stalled challenge_transition_timer_elapsed late_reward_squadron_window '
  + 'player_two_life_turn_queued player_two_life_turn_start player_two_progress player_two_stage_advance '
  + 'player_two_turn_active player_two_turn_complete player_two_human_turn_complete').split(' '));

function classify(state, events, ticks, budgetTicks = MAX_TICKS) {
  const gameOver = events.findLast(row => row.event.type === 'game_over');
  if (!state.started) {
    assert(gameOver && state.lives === 0, 'Unexplained stop (not game over)');
    assert.equal(gameOver.event.score, state.score);
    return { kind: 'game-over', censored: false, requestedSeconds: ticks / 60 };
  }
  assert.equal(ticks, budgetTicks, 'Active run stopped before its simulation budget');
  return { kind: 'time-limit', censored: true, requestedSeconds: ticks / 60,
    note: 'Observed scores/survival are lower bounds; simT can rewind on lane restoration.' };
}

function argsFrom(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (['--smoke', '--extended'].includes(argv[i])) {
      const key = argv[i].slice(2);
      assert(!args[key], `Duplicate ${argv[i]}`);
      args[key] = true;
      i--;
      continue;
    }
    assert(['--repo', '--bundle', '--policy', '--out'].includes(argv[i]) && argv[i + 1],
      'Usage: node check-natural-persona-lifecycle.js --repo REPO --bundle CLEAN_INPUT --policy POLICY_JS --out NEW_DIR [--smoke|--extended]');
    const key = argv[i].slice(2);
    assert(!args[key], `Duplicate option ${argv[i]}`);
    args[key] = path.resolve(argv[i + 1]);
  }
  for (const key of ['repo', 'bundle', 'policy', 'out']) assert(args[key], `Missing --${key}`);
  assert(!(args.smoke && args.extended), 'Smoke and extended budgets are mutually exclusive');
  return args;
}

async function bounded(work, ms, label) {
  let timer;
  try { return await Promise.race([work, new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label}: ${ms}ms deadline`)), ms);
  })]); } finally { clearTimeout(timer); }
}

// Evaluated in the page. Each chunk stops at ownership changes BEFORE another update.
function stepChunk(limit) {
  const h = window.__galagaHarness__, n = window.__naturalProbe;
  const rows = [];
  function owner(s) { return s.watchMode ? 'watch' : s.playerTwo?.activeTurn || 'p1'; }
  const initial = owner(h.state());
  for (let i = 0; i < limit; i++) {
    const before = h.state();
    if (!before.started) break;
    const active = owner(before), automated = active === 'watch' || active === 'p2';
    const input = h.inputState();
    if (!automated && input.keys.length) throw new Error('Held keys reached manual P1');
    if (n.mode === 'p2' && before.persona) throw new Error('Global autopilot contaminates Rival');
    if (automated ? before.harnessPersona !== 'expert' : !!before.harnessPersona) {
      throw new Error('Incorrect persona ownership');
    }
    n.tick++;
    const state = h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: true });
    if (active === 'p2' &&
        before.playerTwo.humanScore !== state.playerTwo.humanScore) {
      throw new Error('P2 update changed the human score');
    }
    const snapshot = h.snapshot();
    delete snapshot.counts.effects;
    rows.push({ tick: n.tick, owner: active, afterOwner: owner(state),
      held: input.keys, state: { started: state.started, persona: state.persona,
        harnessPersona: state.harnessPersona }, snapshot, scene: h.spriteRuntimeState() });
    if (!state.started || owner(state) !== initial) break;
  }
  return { rows, events: n.events.splice(0), trace: n.trace.splice(0), state: h.state() };
}

async function worker(job) {
  let browser, context, server;
  const maxTicks = job.smoke ? 12 * 60 : job.extended ? MAX_TICKS * 2 : MAX_TICKS;
  const receipt = { name: job.name, arm: job.arm, mode: job.mode, variant: job.variant,
    seed: 91001, step: 1 / 60, maxTicks, smoke: !!job.smoke, wallLimitMs: job.extended ? WALL_MS * 2 : WALL_MS,
    startedAt: new Date().toISOString(), passed: false, blocked: [], pageErrors: [],
    consoleErrors: [], inputWindows: [], teardownErrors: [], firstIntervention: null };
  const fds = {};
  const events = [], trace = [];
  let ticks = 0, heldTicks = 0, lateTicks = 0, p2Entered = false;
  const postVeto = { automatedTicks: 0, returned: false, manualTicks: 0 };
  try {
    verifyMethods(job);
    receipt.methods = { methodSha256: job.methodSha256, helperSha256: job.helperSha256,
      supervisorSha256: job.supervisorSha256 };
    assert.equal(inventory(job.bundle).sha256, job.bundleSha256, 'Derived input changed');
    for (const name of ['ticks', 'checkpoints', 'events', 'trace']) {
      fds[name] = fs.openSync(path.join(job.out, name + '.jsonl'), 'wx');
    }
    server = http.createServer((req, res) => {
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
      try {
        const rel = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        const file = fs.realpathSync(path.resolve(job.bundle, '.' + (rel === '/' ? '/index.html' : rel)));
        assert(file.startsWith(job.bundle + path.sep));
        const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
          '.css': 'text/css', '.m4a': 'audio/mp4', '.png': 'image/png' };
        const bytes = fs.readFileSync(file);
        res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
        res.end(req.method === 'HEAD' ? undefined : bytes);
      } catch { res.writeHead(404).end(); }
    });
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    const origin = `http://127.0.0.1:${server.address().port}`;
    const helper = path.join(job.repo, 'tools/harness/browser-launch.js');
    assert.equal(digest(fs.readFileSync(helper)), job.helperSha256, 'Browser helper changed');
    browser = await require(helper).launchHarnessBrowser({});
    receipt.browserVersion = browser.version();
    context = await browser.newContext({ serviceWorkers: 'block', acceptDownloads: false,
      viewport: { width: 1100, height: 1000 } });
    context.setDefaultTimeout(5000);
    await context.routeWebSocket('**/*', socket => {
      receipt.blocked.push({ websocket: socket.url() }); socket.close();
    });
    await context.route('**/*', route => {
      const req = route.request();
      if (new URL(req.url()).origin === origin && ['GET', 'HEAD'].includes(req.method())) return route.continue();
      receipt.blocked.push({ url: req.url(), method: req.method() });
      return route.abort();
    });
    // Disposable preferences only. No persistent browser profile or live account is used.
    await context.addInitScript(expected => {
      if (window !== window.top || location.origin !== expected) return;
      window.__naturalProbe = { active: false, tick: 0, events: [], trace: [] };
      for (const prefix of ['platinum', 'auroraGalactica']) {
        localStorage.setItem(prefix + 'AutoVideo', '0');
        localStorage.setItem(prefix + 'HarnessSeed', '91001');
        localStorage.setItem(prefix + 'TestCfg', JSON.stringify({stage:1, ships:3, expertPlays:'human', seed:91001}));
      }
    }, origin);
    const page = await context.newPage();
    page.on('pageerror', error => receipt.pageErrors.push(String(error)));
    page.on('console', msg => { if (msg.type() === 'error') receipt.consoleErrors.push(msg.text()); });
    await page.goto(origin + '/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.__galagaHarness__);
    receipt.identity = await page.evaluate(() => {
      const h = window.__galagaHarness__; h.showFrontDoor(); h.setControlledClock(true);
      return h.audioRuntimeInfo();
    });
    assert.equal(receipt.identity.commit, SOURCE);
    receipt.audio = await page.evaluate(async files => {
      const ac = new AudioContext(), results = [];
      try {
        for (const file of files) {
          const response = await fetch('/' + file);
          if (!response.ok) throw new Error(`Audio HTTP ${response.status}: ${file}`);
          const audio = await ac.decodeAudioData(await response.arrayBuffer());
          results.push({ file, duration: audio.duration, frames: audio.length });
        }
      } finally { await ac.close(); }
      return results;
    }, job.audio);
    assert.equal(receipt.audio.length, 24);
    assert(receipt.audio.every(row => row.frames > 0 && row.duration > 0));
    let state = await page.evaluate(mode => {
      const h = window.__galagaHarness__, n = window.__naturalProbe;
      n.mode = mode; n.active = true;
      if (mode === 'p2') h.setupPlayerTwoModeTest({ signedIn: true, initials: 'TST', email: 'pilot@example.com' });
      h.start({ seed:91001, stage:1, stageMode:'internal', challenge:false, ships:3,
        expertPlays:'human', autoVideo:false, controlledClock:true,
        persona:mode === 'watch' ? 'expert' : '', watchMode:mode === 'watch', watchScope:'game',
        playerTwo:mode === 'p2', playerTwoPersona:'expert' });
      return h.state();
    }, job.mode);
    assert(state.started && state.stage === 1);
    assert.equal(state.watchMode, job.mode === 'watch');
    assert.equal(!!state.playerTwo?.enabled, job.mode === 'p2');
    let held = '';
    const release = async () => {
      if (held) {
        await page.keyboard.up(held); await page.keyboard.up('Space'); held = '';
      }
    };
    while (state.started && ticks < maxTicks) {
      const automated = state.watchMode || state.playerTwo?.activeTurn === 'p2';
      // Fixed 1-second alternating DOM-key windows, independent of arm/observed vetoes.
      const desired = job.variant === 'held' && automated ? (Math.floor(ticks / 60) % 2 ? 'ArrowRight' : 'ArrowLeft') : '';
      await release();
      if (desired) {
        await page.keyboard.down(desired); await page.keyboard.down('Space'); held = desired;
        const input = await page.evaluate(() => window.__galagaHarness__.inputState());
        assert(input.keys.includes(desired) && input.keys.includes('Space'), 'DOM keys not routed');
        receipt.inputWindows.push({ beforeTick: ticks + 1, owner: state.watchMode ? 'watch' : 'p2', keys: input.keys });
      }
      const batch = await page.evaluate(stepChunk, Math.min(60 - ticks % 60, maxTicks - ticks));
      // Release at an ownership boundary before any subsequent manual update.
      await release();
      assert(batch.rows.length > 0, 'No simulation progress');
      for (const event of batch.events) { events.push(event); line(fds.events, event); }
      for (const entry of batch.trace) {
        trace.push(entry); line(fds.trace, entry);
        receipt.firstIntervention ||= entry;
      }
      for (const row of batch.rows) {
        assert.equal(row.tick, ++ticks);
        if (row.held.length) heldTicks++;
        if (row.owner === 'p2') p2Entered = true;
        if (row.snapshot.stage >= 4 && !row.snapshot.challenge && ['watch', 'p2'].includes(row.owner)) lateTicks++;
        const { held: keys, ...mechanical } = row;
        line(fds.ticks, { tick: ticks, owner: row.owner, sha256: digest(JSON.stringify(normalize(mechanical))) });
        if (ticks % 60 === 0 || row.owner !== row.afterOwner || batch.trace.some(t => t.tick === ticks)) line(fds.checkpoints, row);
        observePostVeto(postVeto, row, receipt.firstIntervention?.tick);
      }
      state = batch.state;
      assert.deepEqual(receipt.pageErrors, [], 'Browser page errors');
    }
    receipt.final = state;
    receipt.ticks = ticks;
    receipt.outcome = classify(state, events, ticks, maxTicks);
    receipt.interventions = trace.length;
    assert(job.arm !== 'control' || trace.length === 0, 'Control unexpectedly changed preferred axis');
    assert(trace.every(t => t.stage >= 4 && !t.challenge && ['watch', 'p2'].includes(t.owner)), 'Veto outside its contract');
    for (const { owner, event } of events.filter(e => e.event.type === 'score_awarded')) {
      assert.equal(event.owner, owner === 'p2' ? 'p2' : 'p1', 'Earned score assigned to wrong lane');
      assert.equal(event.after - event.before, event.points, 'Invalid earned score delta');
    }
    if (job.mode === 'p2') assert(!events.some(e => e.owner === 'p1' && e.event.type === 'player_shot'),
      'Idle manual P1 fired without DOM input');
    assert(!events.some(e => e.event.type === 'system_issue' && e.event.action === 'reference_audio_load_failed'), 'Audio load failure');
    const missing = [];
    if (job.smoke) missing.push('smoke only: full natural lifecycle matrix not attempted');
    if (!lateTicks) missing.push('natural late regular stage');
    if (job.mode === 'p2' && !p2Entered) missing.push('natural P1-to-P2 handoff');
    if (job.arm === 'candidate' && !trace.length) missing.push('natural Expert intervention');
    if (job.arm === 'candidate' && trace.length && postVeto.automatedTicks < 120) missing.push('two automated seconds after intervention');
    if (job.arm === 'candidate' && job.mode === 'p2' && !postVeto.manualTicks) missing.push('natural post-veto P1 return and subsequent manual update');
    if (job.variant === 'held' && !heldTicks) missing.push('automated DOM-held updates');
    receipt.coverage = { status: missing.length ? 'incomplete' : 'complete', missing, lateTicks, heldTicks,
      p2Entered, postVeto };
    receipt.losses = ['watch', 'p1', 'p2'].map(owner => {
      const losses = events.filter(e => e.owner === owner && e.event.type === 'ship_lost');
      return { owner, count: losses.length, first: losses[0] || null,
        absence: losses.length ? null : 'No observed loss in this requested-tick window; not zero-time survival.' };
    });
    receipt.finalInput = await page.evaluate(() => window.__galagaHarness__.inputState());
    assert.deepEqual(receipt.finalInput.keys, []);
    const screenshot = await page.screenshot();
    fs.writeFileSync(path.join(job.out, 'final.png'), screenshot, { flag: 'wx' });
    receipt.screenshotSha256 = digest(screenshot);
    assert.equal(inventory(job.bundle).sha256, job.bundleSha256, 'Input modified');
    verifyMethods(job);
    receipt.passed = true;
  } catch (error) { receipt.error = String(error.stack || error); }
  finally {
    receipt.ticks = ticks;
    for (const [label, close] of [
      ['context', () => context?.close()], ['browser', () => browser?.close()],
      ['server', () => server && new Promise((resolve, reject) => {
        server.closeAllConnections(); server.close(error => error ? reject(error) : resolve());
      })]
    ]) try { await bounded(Promise.resolve().then(close), 5000, label); }
    catch (error) { receipt.teardownErrors.push(String(error)); }
    if (receipt.teardownErrors.length) receipt.passed = false;
    receipt.finishedAt = new Date().toISOString();
    for (const fd of Object.values(fds)) fs.closeSync(fd);
    write(path.join(job.out, 'receipt.json'), receipt);
  }
  return receipt;
}

function observePostVeto(coverage, row, firstTick) {
  if (!(firstTick < row.tick)) return;
  if (row.owner === 'watch' || row.owner === 'p2') coverage.automatedTicks++;
  if (row.owner === 'p2' && row.afterOwner === 'p1') coverage.returned = true;
  if (coverage.returned && row.owner === 'p1') coverage.manualTicks++;
}

function normalizeSettlement(result, receipt, interrupted, wallMs) {
  const error = result.error ? String(result.error.stack || result.error) : null;
  const cleanup = result.cleanup || { status: 'unknown', scope: 'observed-descendants', detachedDescendants: 'not-verifiable' };
  const normalClose = result.status === 0 && !error && receipt?.passed === true &&
    Array.isArray(receipt.teardownErrors) && receipt.teardownErrors.length === 0;
  // Normal close uses the worker's explicit browser/context teardown receipt.
  // 'verified' means observed descendants only, never complete detached containment.
  const cleanupAcceptable = cleanup.status === 'verified' || (cleanup.status === 'not-attempted' && normalClose);
  return { code: result.status ?? null, signal: result.signal ?? null, error, cleanup,
    cleanupAcceptable, cleanupBasis: cleanup.status === 'verified' ? 'observed-descendants' :
      cleanupAcceptable ? 'normal-close-and-worker-teardown' : 'unconfirmed',
    interrupted, wallMs };
}

async function runCase(job) {
  fs.mkdirSync(job.out);
  const spec = path.join(job.out, 'job.json'); write(spec, job);
  const stdout = fs.openSync(path.join(job.out, 'stdout.log'), 'wx');
  const stderr = fs.openSync(path.join(job.out, 'stderr.log'), 'wx');
  const started = Date.now();
  const controller = new AbortController();
  let interrupted = false, result;
  const interrupt = () => { interrupted = true; controller.abort(); };
  process.once('SIGINT', interrupt); process.once('SIGTERM', interrupt);
  try {
    verifyMethods(job);
    const { managedNode } = require(path.join(job.repo, 'tools/testing/managed-child.js'));
    result = await managedNode([__filename, '--worker', spec], {
      cwd: job.repo, timeout: job.extended ? WALL_MS * 2 : WALL_MS, signal: controller.signal, stdio: ['ignore', stdout, stderr]
    });
    verifyMethods(job);
  } catch (error) {
    result = { status: null, signal: null, error, cleanup: { status: 'unknown',
      scope: 'observed-descendants', detachedDescendants: 'not-verifiable' } };
  } finally {
    process.removeListener('SIGINT', interrupt); process.removeListener('SIGTERM', interrupt);
    fs.closeSync(stdout); fs.closeSync(stderr);
  }
  const receiptFile = path.join(job.out, 'receipt.json');
  let receipt = fs.existsSync(receiptFile) ? read(receiptFile) : null;
  if (!receipt) {
    receipt = { name: job.name, passed: false, coverage: { status: 'incomplete', missing: ['worker receipt'] },
      error: result.error ? String(result.error) : 'Worker exited without receipt',
      limitation: 'Supervisor failure or timeout is not a censored career.' };
    write(path.join(job.out, 'failure.json'), receipt);
  }
  const settlement = normalizeSettlement(result, receipt, interrupted, Date.now() - started);
  write(path.join(job.out, 'settlement.json'), settlement);
  return { name: job.name, arm: job.arm, mode: job.mode, variant: job.variant, out: job.out,
    passed: receipt.passed && settlement.code === 0 && !settlement.error && !interrupted && settlement.cleanupAcceptable,
    coverage: receipt.coverage || { status: 'incomplete' }, settlement };
}

function readLines(file) { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse); }

function comparison(left, right, prefix) {
  const result = { left: left.name, right: right.name, kind: prefix ? 'pre-intervention-prefix' : 'within-arm-mode', passed: false };
  try {
    assert(left.passed && right.passed, 'A case failed');
    const receipt = read(path.join(right.out, 'receipt.json'));
    const cutoff = prefix ? receipt.firstIntervention?.tick ?? Infinity : Infinity;
    result.exclusiveCutoffTick = Number.isFinite(cutoff) ? cutoff : null;
    for (const file of ['ticks', 'events', ...(prefix ? [] : ['trace'])]) {
      const rows = entry => readLines(path.join(entry.out, file + '.jsonl'))
        .filter(row => row.tick < cutoff)
        .filter(row => file !== 'events' || MECHANICAL_EVENTS.has(row.event.type)).map(normalize);
      const a = rows(left), b = rows(right);
      result[file + 'Counts'] = [a.length, b.length];
      const mismatch = a.findIndex((row, i) => JSON.stringify(row) !== JSON.stringify(b[i]));
      if (mismatch !== -1 || a.length !== b.length) {
        result.firstMismatch = { file, index: mismatch === -1 ? Math.min(a.length, b.length) : mismatch,
          left: a[mismatch === -1 ? b.length : mismatch], right: b[mismatch === -1 ? a.length : mismatch] };
        throw new Error(`${file} mismatch`);
      }
    }
    result.passed = true;
  } catch (error) { result.error = String(error); }
  return result;
}

async function main(args) {
  assert(process.platform !== 'win32', 'POSIX process-group containment required');
  args.repo = fs.realpathSync(args.repo); args.bundle = fs.realpathSync(args.bundle);
  assert(!fs.existsSync(args.out), '--out must be new; no receipt overwrite');
  // Resolve existing parents to prevent writing into inputs through a symlink.
  let ancestor = path.dirname(args.out), suffix = path.basename(args.out);
  while (!fs.existsSync(ancestor)) { suffix = path.join(path.basename(ancestor), suffix); ancestor = path.dirname(ancestor); }
  args.out = path.join(fs.realpathSync(ancestor), suffix);
  assert(!args.out.startsWith(args.bundle + path.sep), 'Output cannot be inside input');
  fs.mkdirSync(args.out, { recursive: true });
  const summary = { passed: false, status: 'failed', cases: [], comparisons: [],
    baseline: 'b17c5d63', source: SOURCE, seed: 91001, smoke: !!args.smoke,
    simulatedSeconds: args.smoke ? 12 : args.extended ? 1800 : 900, wallLimitMs: args.extended ? WALL_MS * 2 : WALL_MS,
    limitations: [
      'Derived experimental arms retain original build metadata; neither is an unchanged clean build.',
      'No injected losses, points, board replacement, stage jumps or post-start clock resets.',
      'P1 is idle; this does not prove manual actuator feasibility or manual movement/fire after return.',
      'Watch/Rival trajectories are not compared: shared RNG and rounded board restoration differ.',
      'Tick projections use rounded public snapshots/enemy poses, not bit-exact full-state replay.',
      'All raw observed events retained; equality uses an explicit mechanical event allowlist.',
      'Local preferences/score storage are disposable; all external requests and network writes blocked before boot.',
      'managedNode cleanup is snapshot-based and covers observed descendants/groups only; unobserved detached descendants remain not verifiable.',
      'Normal worker close relies on successful explicit context/browser teardown; incomplete or unknown cleanup blocks the next case.'
    ] };
  try {
    const sourceInventory = inventory(args.bundle), build = read(path.join(args.bundle, 'build-info.json'));
    assert.equal(sourceInventory.sha256, CLEAN_INPUT_HASH, 'Expected the frozen build1257 input, including canonical audio');
    assert.equal(build.commit, SOURCE); assert.equal(String(build.buildNumber), '1257'); assert.equal(build.dirty, false);
    const policy = fs.readFileSync(args.policy, 'utf8');
    assert.equal(digest(policy), POLICY_HASH, 'Not the frozen Expert policy');
    const source = fs.readFileSync(path.join(args.bundle, 'index.html'), 'utf8');
    const audio = sourceInventory.files.filter(row => /^assets\/reference-audio\/.*\.m4a$/.test(row.file)).map(row => row.file);
    assert.equal(audio.length, 24, 'Expected 24 canonical private audio dependencies');
    const methods = { methodSha256: digest(fs.readFileSync(__filename)),
      helperSha256: digest(fs.readFileSync(path.join(args.repo, 'tools/harness/browser-launch.js'))),
      supervisorSha256: digest(fs.readFileSync(path.join(args.repo, 'tools/testing/managed-child.js'))) };
    const arms = {};
    for (const arm of ['control', 'candidate']) {
      const folder = path.join(args.out, arm + '-input');
      fs.cpSync(args.bundle, folder, { recursive: true, force: false, errorOnExist: true });
      fs.writeFileSync(path.join(folder, 'index.html'), derive(source, policy, arm === 'candidate'));
      const derivedInventory = inventory(folder);
      assert.deepEqual(derivedInventory.files.filter(r => r.file !== 'index.html'), sourceInventory.files.filter(r => r.file !== 'index.html'));
      arms[arm] = { folder, inventory: derivedInventory, derived: true, originalBuildMetadataRetained: true };
    }
    write(path.join(args.out, 'provenance.json'), { ...args, ...methods, build,
      sourceInventory, policySha256: digest(policy), observerSha256: digest(EVENT_OBSERVER + TRACE_OBSERVER), arms,
      label: 'DERIVED EXPERIMENTAL INPUTS - original build metadata retained',
      mechanicalEvents: [...MECHANICAL_EVENTS], heldSchedule: 'Alternate Left/Right+Space each 60 requested ticks, automated turns only.' });
    fs.copyFileSync(__filename, path.join(args.out, 'method.js'), fs.constants.COPYFILE_EXCL);
    fs.copyFileSync(path.join(args.repo, 'tools/testing/managed-child.js'),
      path.join(args.out, 'managed-child.js'), fs.constants.COPYFILE_EXCL);
    // Four quiet discovery cases first; no seed search or policy tuning after observation.
    const variants = args.smoke ? ['quiet'] : ['quiet', 'repeat', 'held'];
    for (const variant of variants) for (const mode of ['watch', 'p2']) for (const arm of ['control', 'candidate']) {
      const name = `${arm}-${mode}-${variant}`;
      const result = await runCase({ name, arm, mode, variant, repo: args.repo,
        bundle: arms[arm].folder, bundleSha256: arms[arm].inventory.sha256,
        out: path.join(args.out, name), audio, smoke: !!args.smoke, extended: !!args.extended, ...methods });
      summary.cases.push(result);
      console.log(JSON.stringify(result));
      assert(result.settlement.cleanupAcceptable && !result.settlement.interrupted, 'Cleanup uncertain or interrupted; refusing next worker');
    }
    const get = (arm, mode, variant) => summary.cases.find(row => row.arm === arm && row.mode === mode && row.variant === variant);
    for (const mode of ['watch', 'p2']) {
      for (const arm of ['control', 'candidate']) for (const variant of variants.filter(v => v !== 'quiet')) {
        summary.comparisons.push(comparison(get(arm, mode, 'quiet'), get(arm, mode, variant), false));
      }
      for (const variant of variants) {
        summary.comparisons.push(comparison(get('control', mode, variant), get('candidate', mode, variant), true));
      }
    }
    assert.equal(inventory(args.bundle).sha256, sourceInventory.sha256, 'Original input changed');
    assert.equal(digest(fs.readFileSync(args.policy)), POLICY_HASH, 'Policy changed');
    verifyMethods({ repo: args.repo, ...methods });
    const checksPass = summary.cases.every(c => c.passed) && summary.comparisons.every(c => c.passed);
    const coverageComplete = summary.cases.every(c => c.coverage.status === 'complete');
    summary.status = !checksPass ? 'failed' : !coverageComplete ? 'coverage-incomplete' : 'passed';
    summary.passed = checksPass && coverageComplete;
  } catch (error) { summary.error = String(error.stack || error); }
  finally { write(path.join(args.out, 'summary.json'), summary); }
  return summary;
}

module.exports = { derive, normalize, classify, comparison, argsFrom, inventory, stepChunk, observePostVeto, normalizeSettlement, MAX_TICKS, POLICY_HASH, CLEAN_INPUT_HASH };
if (require.main === module) {
  const task = process.argv[2] === '--worker'
    ? worker(read(process.argv[3])).then(result => { process.exitCode = result.passed ? 0 : 1; })
    : Promise.resolve().then(() => main(argsFrom(process.argv.slice(2)))).then(result => {
      console.log(JSON.stringify({ status: result.status, passed: result.passed }));
      process.exitCode = result.passed ? 0 : result.status === 'coverage-incomplete' ? 2 : 1;
    });
  task.catch(error => { console.error(error); process.exitCode = 1; });
}
