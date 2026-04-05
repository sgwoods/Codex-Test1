#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function expectOpen(page, buttonSelector, stateFn, closeSelector){
  await page.locator(buttonSelector).click();
  const opened = await waitForHarness(page, stateFn, 2200, 50);
  if(closeSelector){
    await page.locator(closeSelector).click();
    await page.waitForTimeout(180);
  }
  return opened;
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 49028 }, async ({ page }) => {
    const gamePicker = await expectOpen(
      page,
      '#gamePickerDockBtn',
      () => {
        const modal = document.querySelector('#gamePickerModal');
        return modal && modal.classList.contains('open') ? {
          expanded: document.querySelector('#gamePickerDockBtn')?.getAttribute('aria-expanded') || '',
          title: document.querySelector('#gamePickerTitle')?.textContent || ''
        } : null;
      },
      '#gamePickerClose'
    );

    const platform = await expectOpen(
      page,
      '#platformSplashBtn',
      () => {
        const modal = document.querySelector('#platformSplashModal');
        return modal && modal.classList.contains('open') ? {
          expanded: document.querySelector('#platformSplashBtn')?.getAttribute('aria-expanded') || '',
          title: document.querySelector('#platformSplashTitle')?.textContent || ''
        } : null;
      },
      '#platformSplashClose'
    );

    const pilot = await expectOpen(
      page,
      '#accountDockBtn',
      () => {
        const panel = document.querySelector('#accountPanel');
        return panel && !panel.hidden ? {
          expanded: document.querySelector('#accountDockBtn')?.getAttribute('aria-expanded') || '',
          title: document.querySelector('#accountPanelTitle')?.textContent || ''
        } : null;
      },
      '#accountPanelClose'
    );

    const guide = await expectOpen(
      page,
      '#guideDockBtn',
      () => {
        const modal = document.querySelector('#helpModal');
        return modal && modal.classList.contains('open') ? {
          expanded: document.querySelector('#guideDockBtn')?.getAttribute('aria-expanded') || '',
          activeTab: document.querySelector('[data-help-tab].active')?.dataset.helpTab || '',
          actionVisible: !document.querySelector('#helpGuideActions')?.hidden
        } : null;
      },
      '#helpClose'
    );

    const controls = await expectOpen(
      page,
      '#controlsDockBtn',
      () => {
        const modal = document.querySelector('#helpModal');
        return modal && modal.classList.contains('open') ? {
          expanded: document.querySelector('#controlsDockBtn')?.getAttribute('aria-expanded') || '',
          activeTab: document.querySelector('[data-help-tab].active')?.dataset.helpTab || '',
          actionVisible: !document.querySelector('#helpGuideActions')?.hidden
        } : null;
      },
      '#helpClose'
    );

    const muteBefore = await page.locator('#muteToggleBtn').getAttribute('aria-pressed');
    await page.locator('#muteToggleBtn').click();
    const muteAfter = await page.locator('#muteToggleBtn').getAttribute('aria-pressed');
    await page.locator('#muteToggleBtn').click();
    const muteRestored = await page.locator('#muteToggleBtn').getAttribute('aria-pressed');

    const pauseBefore = await page.locator('#pauseToggleBtn').getAttribute('aria-pressed');
    await page.locator('#pauseToggleBtn').click();
    const pauseActive = await waitForHarness(page, () => {
      const btn = document.querySelector('#pauseToggleBtn');
      return btn?.getAttribute('aria-pressed') === 'true'
        ? {
            aria: btn.getAttribute('aria-pressed'),
            paused: !!window.__galagaHarness__.state().paused
          }
        : null;
    }, 1200, 50);
    await page.locator('#pauseToggleBtn').click();
    const pauseRestored = await waitForHarness(page, () => {
      const btn = document.querySelector('#pauseToggleBtn');
      return btn?.getAttribute('aria-pressed') === 'false'
        ? {
            aria: btn.getAttribute('aria-pressed'),
            paused: !!window.__galagaHarness__.state().paused
          }
        : null;
    }, 1200, 50);

    const movie = await expectOpen(
      page,
      '#movieDockBtn',
      () => {
        const panel = document.querySelector('#moviePanel');
        return panel && !panel.hidden ? {
          expanded: document.querySelector('#movieDockBtn')?.getAttribute('aria-expanded') || '',
          visible: getComputedStyle(panel).display !== 'none'
        } : null;
      },
      '#moviePanelClose'
    );

    const scores = await expectOpen(
      page,
      '#leaderboardDockBtn',
      () => {
        const panel = document.querySelector('#leaderboardPanel');
        return panel && !panel.hidden ? {
          expanded: document.querySelector('#leaderboardDockBtn')?.getAttribute('aria-expanded') || '',
          title: document.querySelector('#leaderboardPanelTitle')?.textContent || ''
        } : null;
      },
      '#leaderboardPanelClose'
    );

    const feedback = await expectOpen(
      page,
      '#feedbackDockBtn',
      () => {
        const modal = document.querySelector('#feedbackModal');
        return modal && modal.classList.contains('open') ? {
          expanded: document.querySelector('#feedbackDockBtn')?.getAttribute('aria-expanded') || '',
          title: document.querySelector('#feedbackTitle')?.textContent || ''
        } : null;
      },
      '#feedbackClose'
    );

    const settings = await expectOpen(
      page,
      '#settingsBtn',
      () => {
        const panel = document.querySelector('#settingsPanel');
        return panel && panel.classList.contains('open') ? {
          expanded: document.querySelector('#settingsBtn')?.getAttribute('aria-expanded') || '',
          title: document.querySelector('#settingsPanelTitle')?.textContent || ''
        } : null;
      },
      '#settingsPanelClose'
    );

    return {
      gamePicker,
      platform,
      pilot,
      guide,
      controls,
      movie,
      scores,
      feedback,
      settings,
      mute: { before: muteBefore, after: muteAfter, restored: muteRestored },
      pause: { before: pauseBefore, active: pauseActive, restored: pauseRestored }
    };
  });

  if(result.gamePicker.expanded !== 'true') fail('game picker dock button did not open via a real click', result);
  if(result.platform.expanded !== 'true') fail('Platinum dock button did not open via a real click', result);
  if(result.pilot.expanded !== 'true') fail('pilot dock button did not open via a real click', result);
  if(result.guide.expanded !== 'true' || result.guide.activeTab !== 'guide' || !result.guide.actionVisible){
    fail('guide dock button did not open the guide tab correctly', result);
  }
  if(result.controls.expanded !== 'true' || result.controls.activeTab !== 'controls' || result.controls.actionVisible){
    fail('controls dock button did not open the controls tab correctly', result);
  }
  if(result.movie.expanded !== 'true') fail('movie dock button did not open via a real click', result);
  if(result.scores.expanded !== 'true') fail('scores dock button did not open via a real click', result);
  if(result.feedback.expanded !== 'true') fail('feedback dock button did not open via a real click', result);
  if(result.settings.expanded !== 'true') fail('settings dock button did not open via a real click', result);
  if(result.mute.before === result.mute.after || result.mute.before !== result.mute.restored){
    fail('mute button did not toggle and restore aria-pressed state', result);
  }
  if(result.pause.active.aria !== 'true' || !result.pause.active.paused || result.pause.restored.aria !== 'false' || result.pause.restored.paused){
    fail('pause button did not toggle paused state correctly', result);
  }

  console.log(JSON.stringify({ ok: true, checked: result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
