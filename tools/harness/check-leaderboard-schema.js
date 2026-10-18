#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const file = 'src/js/11-leaderboard-service.js';
const source = process.argv.includes('--baseline')
  ? execFileSync('git', ['show', `e9f72dfe:${file}`], { encoding: 'utf8' })
  : fs.readFileSync(path.join(__dirname, '../..', file), 'utf8');
const columns = new Set(['id', 'initials', 'score', 'stage', 'build', 'achieved_at', 'user_id', 'is_verified', 'game_key', 'game_title']);
const rows = [
  { id: 'a', user_id: 'pilot', score: 100, stage: 2, is_verified: true },
  { id: 'b', user_id: 'other', score: 100, stage: 4, is_verified: false },
  { id: 'c', user_id: 'test1', score: 300, stage: 1, is_verified: true },
  { id: 'd', user_id: 'test2', score: 200, stage: 1, is_verified: true }
].map(row => ({ ...row, game_key: 'aurora-galactica' }));
rows.push({ id: 'g', user_id: 'pilot', score: 9999, stage: 1, is_verified: true, game_key: 'galaxy-guardians-preview' });
async function check(view, hidden, expected, failure = null, gameKey = 'aurora-galactica'){
  let requests = 0;
  const client = { from(table){
    assert.equal(table, gameKey === 'aurora-galactica' ? 'scores' : 'game_scores');
    let selected, limit;
    const orders = [], filters = [];
    const q = {
      select(value){ selected = value.split(','); return q; },
      order(key, options){ orders.push([key, options.ascending]); return q; },
      limit(value){ limit = value; return q; },
      eq(key, value){ filters.push(row => row[key] === value); return q; },
      neq(key, value){ filters.push(row => row[key] !== value); return q; },
      not(key, op, value){ assert.equal(op, 'in'); const excluded = value.slice(1, -1).split(','); filters.push(row => !excluded.includes(row[key])); return q; },
      then(resolve, reject){
        requests++;
        const missing = selected.find(key => !columns.has(key));
        if(missing)return Promise.resolve({ error: { code: '42703', message: `column scores.${missing} does not exist` } }).then(resolve, reject);
        assert.deepEqual(orders, [['score', false], ['stage', false]]);
        assert.equal(limit, 10);
        const data = rows.filter(row => filters.every(filter => filter(row)))
          .sort((a, b) => b.score - a.score || b.stage - a.stage).slice(0, limit)
          .map(row => Object.fromEntries(selected.map(key => [key, row[key]])));
        return Promise.resolve({ data: failure ? null : data, error: failure }).then(resolve, reject);
      }
    };
    return q;
  } };
  const context = vm.createContext({ currentScoreStorageGameKey: () => gameKey, LEADERBOARD: { client, user: { id: 'pilot' } }, shouldHideTestAccountScores: () => hidden.length > 0, configuredTestAccountUserIds: () => hidden });
  vm.runInContext(source, context);
  const result = await context.fetchLeaderboardScores(view);
  assert.equal(requests, 1, 'Each refresh must use one supported query, without a failing schema probe');
  assert.equal(result.error, failure);
  if(!failure)assert.deepEqual(result.data.map(row => row.id), expected);
}
(async () => {
  await check('all', [], ['c', 'd', 'b', 'a']);
  await check('validated', [], ['c', 'd', 'a']);
  await check('mine', ['pilot'], ['a']);
  await check('all', ['test1'], ['d', 'b', 'a']);
  await check('all', ['test1', 'test2'], ['b', 'a']);
  await check('all', [], [], { code: '42501', message: 'permission denied' });
  await check('mine', [], ['g'], null, 'galaxy-guardians-preview');
  await check('all', [], ['g'], null, 'galaxy-guardians-preview');
  console.log('PASS: 8 leaderboard schema cases; per-game ranking, ownership filter, test exclusions, errors and one request per refresh.');
})().catch(error => { console.error(error); process.exitCode = 1; });
