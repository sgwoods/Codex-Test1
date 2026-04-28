#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({
    skipStart: true,
    seed: 673810,
    viewport: { width: 673, height: 810 }
  }, async ({ page }) => page.evaluate(() => {
    if(typeof draw === 'function') draw();
    const rectFor = id => {
      const el = document.getElementById(id);
      if(!el) return null;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        display: style.display,
        visibility: style.visibility,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      canvas: rectFor('c'),
      shell: rectFor('cabinetShell'),
      playfield: rectFor('playfieldFrame'),
      leftRail: rectFor('cabinetLeftFrame'),
      rightRail: rectFor('cabinetRightFrame'),
      pickerIcon: rectFor('gamePickerDockIcon'),
      platformIcon: rectFor('platformSplashDockIcon'),
      guideIcon: rectFor('guideDockBtn'),
      settingsIcon: rectFor('settingsBtn')
    };
  }));

  for(const key of ['leftRail','rightRail','pickerIcon','platformIcon','guideIcon','settingsIcon']){
    const rect = result[key];
    if(!rect || rect.display === 'none' || rect.visibility === 'hidden' || rect.width < 16 || rect.height < 16){
      fail(`Compact cabinet ${key} is not visible at the in-app browser scale`, result);
    }
  }
  if(result.leftRail.right > result.playfield.left + 3){
    fail('Compact left rail overlaps the playfield instead of staying on the side frame', result);
  }
  if(result.rightRail.left < result.playfield.right - 3){
    fail('Compact right rail overlaps the playfield instead of staying on the side frame', result);
  }

  console.log(JSON.stringify({
    ok: true,
    viewport: result.viewport,
    leftRail: result.leftRail,
    rightRail: result.rightRail,
    pickerIcon: result.pickerIcon,
    settingsIcon: result.settingsIcon
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
