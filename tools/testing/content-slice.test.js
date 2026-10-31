const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { formationSlice } = require('./content-slice');
const source = file => fs.readFileSync(path.join(__dirname, '../../src/js', file), 'utf8');

function runtime() {
  const context = vm.createContext({
    STORAGE_PREFIX: 'proof', PLAY_W: 280, PLAY_H: 360, BUILD_INFO: {},
    GALAXY_GUARDIANS_PACK: { metadata: { gameKey: 'proof-other' } },
    randUnit: () => .5, rnd: (max, min = 0) => (max + min) / 2,
    applicationReleaseRecord: (_key, fallback) => fallback,
    buildPlatformInfo: () => ({}),
    isAuroraRuntimeState: () => true, usesReferenceTimingModel: () => false,
  });
  const boot = source('00-boot.js');
  const family = boot.slice(boot.indexOf('function enemyFamilyForType('), boot.indexOf('const AC=', boot.indexOf('function enemyFamilyForType(')));
  // Exclude only registry browser preference installation; execute its real selectors.
  const registry = source('13-game-pack-registry.js').split('\n{\n const savedGamePackKey=')[0];
  for (const code of [source('13-aurora-game-pack.js'), registry, family,
    source('14-entity-model.js'), source('09-stage-flow.js')]) vm.runInContext(code, context);
  return {
    layouts: JSON.parse(vm.runInContext('JSON.stringify(AURORA_FORMATION_LAYOUTS)', context)),
    spawn(stage, layouts) {
      context.layouts = layouts;
      context.stage = stage;
      return JSON.parse(vm.runInContext(`
        ACTIVE_GAME_PACK={...AURORA_GAME_PACK,formationLayouts:layouts};
        JSON.stringify((()=>{const s={stage,e:[],rogue:0,challenge:false,attract:false};spawnFormation(s);return s.e;})())
      `, context));
    },
  };
}

test('authoring proof rejects unsupported patches atomically', () => {
  const layouts = [{ fromStage: 4, gx: 20, gy: 18, oy: 30 }];
  const before = JSON.stringify(layouts);
  for (const json of ['{}', 'null', '[]', '"gx"', '{"gx":"22"}', '{"gx":1e999}',
    '{"gx":23}', '{"gx":18}', '{"gx":19.9}', '{"gy":16}', '{"gy":17.9}', '{"oy":33}', '{"gx":22,"spacingX":99}',
    '{"__proto__":{}}', '{"constructor":1}', '{"gx":{}}', '{"fromStage":6}']) {
    assert.throws(() => formationSlice(layouts, json), json);
    assert.equal(JSON.stringify(layouts), before);
  }
  assert.throws(() => formationSlice([], '{"gx":22}'));
  assert.throws(() => formationSlice(layouts, { gx: 22 }));
});

test('real formation consumer applies each allowed field and isolates other stages', () => {
  const game = runtime();
  const baseline = game.spawn(4, game.layouts);
  assert.equal(baseline.length, 40);
  assert.deepEqual([Math.min(...baseline.map(e => e.tx)), Math.max(...baseline.map(e => e.tx))], [50, 230]);
  assert.deepEqual([Math.min(...baseline.map(e => e.ty)), Math.max(...baseline.map(e => e.ty))], [30, 84]);
  for (const [key, value] of [['gx', 22], ['gy', 20], ['oy', 32]]) {
    const changed = formationSlice(game.layouts, JSON.stringify({ [key]: value }));
    assert.ok(Object.isFrozen(changed));
    for (const stage of [4, 5]) {
      const before = game.spawn(stage, game.layouts);
      const after = game.spawn(stage, changed);
      assert.equal(after.length, before.length);
      after.forEach((enemy, i) => {
        const expected = { ...before[i] };
        if (key === 'gx') expected.tx += (enemy.c - 4.5) * 2;
        if (key === 'gy') expected.ty += enemy.r * 2;
        if (key === 'oy') expected.ty += 2;
        assert.deepEqual(enemy, expected);
      });
    }
    for (const stage of [1, 2, 6, 8, 12]) assert.deepEqual(game.spawn(stage, changed), game.spawn(stage, game.layouts));
  }
  const ignored = game.layouts.map(row => ({ ...row, spacingX: 99 }));
  assert.deepEqual(game.spawn(4, ignored), baseline, 'unknown runtime data really is ignored; validator must refuse it');
});
