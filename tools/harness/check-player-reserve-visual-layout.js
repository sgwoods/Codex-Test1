#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

const MAX_SINGLE_PLAYER_SIZE = { width: 16, height: 15 };
const MAX_DUAL_PLAYER_SIZE = { width: 37, height: 15 };
const MAX_RESERVE_SHIP_SIZE = { width: 13, height: 12 };

function sizeOf(box){
  return {
    width: +(box.right - box.left).toFixed(2),
    height: +(box.bottom - box.top).toFixed(2)
  };
}

function assertLayout(label, row){
  if(!row?.ok) fail(`${label}: player visual bounds were not reported`, row);
  const playerSize = sizeOf(row.player);
  const maxPlayer = label.toLowerCase().includes('dual') ? MAX_DUAL_PLAYER_SIZE : MAX_SINGLE_PLAYER_SIZE;
  if(playerSize.width > maxPlayer.width || playerSize.height > maxPlayer.height){
    fail(`${label}: player fighter visual is too large for Galaga-style playfield proportions`, {
      playerSize,
      maxPlayer,
      row
    });
  }
  for(const reserve of row.reserve || []){
    const reserveSize = sizeOf(reserve);
    if(reserveSize.width > MAX_RESERVE_SHIP_SIZE.width || reserveSize.height > MAX_RESERVE_SHIP_SIZE.height){
      fail(`${label}: reserve ship icon visual is too large and risks crowding the player field`, {
        reserveSize,
        maxReserve: MAX_RESERVE_SHIP_SIZE,
        row
      });
    }
  }
  if(row.leftClearance < 0) fail(`${label}: player fighter bleeds past the left playfield edge`, row);
  if(row.rightClearance < 0) fail(`${label}: player fighter bleeds past the right playfield edge`, row);
  if(row.minReserveGap != null && row.minReserveGap < 2){
    fail(`${label}: player fighter overlaps or crowds reserve ships`, row);
  }
  if(row.minReservePairGap != null && row.minReservePairGap < 2){
    fail(`${label}: reserve ship icons overlap or crowd each other`, row);
  }
}

async function main(){
  const result = await withHarnessPage({
    stage: 1,
    ships: 3,
    challenge: false,
    seed: 541987
  }, async ({ page }) => {
    await waitForHarness(page, () => !!window.__galagaHarness__?.snapshot()?.started, 2400, 40);
    return page.evaluate(() => {
      const h = window.__galagaHarness__;
      return {
        leftSingle: h.playerReserveVisualLayout({ playerX: 0, reserveShips: 2 }),
        centerSingle: h.playerReserveVisualLayout({ reserveShips: 2 }),
        rightSingle: h.playerReserveVisualLayout({ playerX: 999, reserveShips: 2 }),
        leftDual: h.playerReserveVisualLayout({ playerX: 0, reserveShips: 2, dual: true })
      };
    });
  });

  for(const [label, row] of Object.entries(result)){
    assertLayout(label, row);
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
