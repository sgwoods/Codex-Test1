#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message,payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload,null,2));
  process.exit(1);
}

async function main(){
  const result=await withHarnessPage({ stage:1, ships:3, challenge:false, seed:9301, skipStart:true }, async ({ page }) => {
    await page.evaluate(() => {
      if(typeof startAttractDemo==='function')startAttractDemo({record:false});
      if(typeof draw==='function')draw();
    });
    const frontDoor=await page.evaluate(() => ({
      text:document.getElementById('msg')?.textContent||''
    }));
    await page.evaluate(() => document.getElementById('platformSplashBtn')?.click());
    const splash=await page.evaluate(() => ({
      open: document.getElementById('platformSplashBtn')?.getAttribute('aria-expanded') === 'true',
      text: document.getElementById('platformSplashPanel')?.textContent||''
    }));
    return { frontDoor, splash };
  });

  if(!result.frontDoor.text.includes('AURORA GALACTICA')) fail('front door did not render the Aurora application title', result);
  if(!result.frontDoor.text.includes('WAIT MODE')) fail('front door did not render the platform wait-mode subtitle', result);
  if(!result.frontDoor.text.includes('CHOOSE GAME TO SWITCH CABINETS')) fail('front door did not render the platform-owned choose-game hint', result);
  if(result.frontDoor.text.includes('GAME PICKER COMING SOON')) fail('front door still renders stale coming-soon game-picker copy', result);
  if(result.frontDoor.text.includes('Approved AI dystopian quotes will rotate here')) fail('front door still renders the stale placeholder quote copy', result);
  if(!result.splash.open) fail('platform splash did not open from the dock button', result);
  if(!result.splash.text.includes('shared cabinet shell, runtime, services, and release surface')) fail('platform splash did not render the refreshed platform-owned overview copy', result);

  console.log(JSON.stringify({
    ok:true,
    frontDoorChecks:{
      hasAuroraTitle:true,
      hasWaitMode:true,
      hasChooseGameHint:true,
      stalePickerHintRemoved:true,
      staleQuoteRemoved:true
    },
    splashChecks:{
      opens:true,
      hasPlatformOverview:true
    }
  },null,2));
}

main().catch(err=>fail(err&&err.stack||String(err)));
