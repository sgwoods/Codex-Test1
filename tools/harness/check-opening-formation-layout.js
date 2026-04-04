#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 3, challenge: false, seed: 9051 }, async ({ page }) => {
    return page.evaluate(() => window.__galagaHarness__.formationState());
  });

  if(!result || result.challenge){
    fail('expected a normal stage 1 formation state', result);
  }
  if(!result.layout){
    fail('formation layout was not exposed through the harness', result);
  }
  if(result.targets.length !== 40){
    fail('stage 1 did not produce the expected 40 rack enemies', result);
  }

  const txs = result.targets.map(e => e.tx);
  const tys = result.targets.map(e => e.ty);
  const minTx = Math.min(...txs);
  const maxTx = Math.max(...txs);
  const minTy = Math.min(...tys);
  const maxTy = Math.max(...tys);

  if(Math.abs(result.layout.gx - 17) > 0.01 || Math.abs(result.layout.gy - 14) > 0.01){
    fail('stage 1 formation spacing drifted away from the expected Aurora rack layout', result);
  }
  if(minTx < 40 || maxTx > 240){
    fail('stage 1 formation target columns spilled outside the expected playfield bounds', {
      layout: result.layout,
      minTx,
      maxTx,
      sampleTargets: result.targets.slice(0, 6)
    });
  }
  if(minTy < 20 || maxTy > 90){
    fail('stage 1 formation target rows spilled outside the expected playfield band', {
      layout: result.layout,
      minTy,
      maxTy,
      sampleTargets: result.targets.slice(0, 6)
    });
  }

  console.log(JSON.stringify({
    ok: true,
    layout: result.layout,
    targets: {
      count: result.targets.length,
      minTx,
      maxTx,
      minTy,
      maxTy
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
