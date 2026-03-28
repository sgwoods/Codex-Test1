#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function captureBoardMessage(page, setup, expectedParts){
  await page.evaluate(setup);
  return waitForHarness(page, () => {
    const msg = document.getElementById('msg');
    const frame = document.getElementById('playfieldFrame');
    if(!msg || !frame) return null;
    if(!msg.classList.contains('boardMessage')) return null;
    const text = (msg.innerText || '').replace(/\s+/g, ' ').trim();
    if(!text) return null;
    const required = Array.isArray(window.__auroraHarnessExpectedMessageParts)
      ? window.__auroraHarnessExpectedMessageParts
      : [];
    if(required.some(part => !text.includes(part))) return null;
    const rect = msg.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    return {
      className: msg.className,
      text,
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      frameRect: { left: frameRect.left, top: frameRect.top, width: frameRect.width, height: frameRect.height }
    };
  }, 1200, 40);
}

function centeredEnough(sample){
  const msgCenter = sample.rect.left + sample.rect.width / 2;
  const frameCenter = sample.frameRect.left + sample.frameRect.width / 2;
  return Math.abs(msgCenter - frameCenter) <= 8;
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 9047 }, async ({ page }) => {
    const pause = await page.evaluate(async () => {
      window.__auroraHarnessExpectedMessageParts = ['PAUSED'];
      window.__galagaHarness__.setBoardMessage({ paused: true, mode: 'banner', bannerMode: 'pauseCheck', title: '', subtitle: '', duration: 0.1 });
      return true;
    }).then(() => captureBoardMessage(page, () => true, ['PAUSED']));
    const shipLoss = await page.evaluate(async () => {
      window.__auroraHarnessExpectedMessageParts = ['SHIP DESTROYED', 'TWO SHIPS REMAINING'];
      window.__galagaHarness__.setBoardMessage({ paused: false, mode: 'alert', text: 'SHIP DESTROYED\nTWO SHIPS REMAINING', duration: 1.2 });
      return true;
    }).then(() => captureBoardMessage(page, () => true, ['SHIP DESTROYED', 'TWO SHIPS REMAINING']));
    const stageTransition = await page.evaluate(async () => {
      window.__auroraHarnessExpectedMessageParts = ['GET READY', 'STAGE 03'];
      window.__galagaHarness__.setBoardMessage({ paused: false, mode: 'banner', bannerMode: 'stageTransition', title: 'STAGE 03', subtitle: 'GET READY', duration: 1.2 });
      return true;
    }).then(() => captureBoardMessage(page, () => true, ['GET READY', 'STAGE 03']));
    return { pause, shipLoss, stageTransition };
  });

  if(!result.pause.text.includes('PAUSED')) fail('pause banner did not render through the centered board-message path', result);
  if(!result.shipLoss.text.includes('SHIP DESTROYED') || !result.shipLoss.text.includes('TWO SHIPS REMAINING')){
    fail('ship-loss board message did not render multiline text through the shared board-message path', result);
  }
  if(!result.stageTransition.text.includes('GET READY') || !result.stageTransition.text.includes('STAGE 03')){
    fail('stage transition board message did not use the shared centered message renderer', result);
  }
  for(const [name, sample] of Object.entries(result)){
    if(!sample.className.includes('boardMessage')){
      fail(`${name} did not use the boardMessage class`, result);
    }
    if(!centeredEnough(sample)){
      fail(`${name} board message is no longer horizontally centered on the playfield`, result);
    }
  }

  console.log(JSON.stringify({
    ok: true,
    pause: result.pause.text,
    shipLoss: result.shipLoss.text,
    stageTransition: result.stageTransition.text
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
