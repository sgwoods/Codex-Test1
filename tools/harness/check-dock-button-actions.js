#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

const PLATFORM_ARCADE_MUSIC_PLAYLIST = 'PLWDxjyS0X-zlKJsel_7Kg3ALGlSD89zSH';
const GUARDIANS_ARCADE_MUSIC_PLAYLIST = 'PLWDxjyS0X-zm5GrG4zytIyqRPQ8Jv4TA-';

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
    const dockState = await page.evaluate(() => {
      const status = document.querySelector('#gamePickerDockStatus');
      const platformBtn = document.querySelector('#platformSplashBtn');
      const platformIcon = document.querySelector('#platformSplashDockIcon');
      const platformLabel = document.querySelector('#platformSplashDockLabel');
      const iconRect = platformIcon?.getBoundingClientRect();
      const btnRect = platformBtn?.getBoundingClientRect();
      return {
        gamePickerStatus: status?.textContent?.trim() || '',
        platformLabelPresent: !!platformLabel,
        platformIconWidth: iconRect?.width || 0,
        platformIconHeight: iconRect?.height || 0,
        platformButtonWidth: btnRect?.width || 0,
        platformButtonHeight: btnRect?.height || 0
      };
    });

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

    const musicDefault = await page.evaluate(() => window.__platinumArcadeMusic?.state?.());
    const musicGuardians = await page.evaluate(() => {
      window.installGamePack?.('galaxy-guardians-preview', { persist: false });
      const guardians = window.__platinumArcadeMusic?.state?.();
      window.installGamePack?.('aurora-galactica', { persist: false });
      const restored = window.__platinumArcadeMusic?.state?.();
      return { guardians, restored };
    });
    await page.evaluate(() => {
      window.__platinumArcadeMusic?.setPlaylistForHarness?.('PLarcadeMusicHarness01');
      window.__platinumArcadeMusic?.stop?.();
    });
    const musicBefore = await waitForHarness(page, () => {
      const btn = document.querySelector('#arcadeMusicToggleBtn');
      const state = window.__platinumArcadeMusic?.state?.();
      return btn?.getAttribute('aria-pressed') === 'false' && state?.state === 'off'
        ? {
            aria: btn.getAttribute('aria-pressed'),
            title: btn.getAttribute('title') || '',
            state
          }
        : null;
    }, 1200, 50);
    await page.locator('#arcadeMusicToggleBtn').click();
    const musicActive = await waitForHarness(page, () => {
      const btn = document.querySelector('#arcadeMusicToggleBtn');
      const state = window.__platinumArcadeMusic?.state?.();
      const frame = document.querySelector('#arcadeMusicFrame');
      return btn?.getAttribute('aria-pressed') === 'false' && state?.state === 'playing' && frame
        ? {
            aria: btn.getAttribute('aria-pressed'),
            title: btn.getAttribute('title') || '',
            actionTip: btn.dataset.actionTip || '',
            musicState: btn.dataset.musicState || '',
            musicPlaying: btn.dataset.musicPlaying || '',
            musicMuted: btn.dataset.musicMuted || '',
            icon: btn.querySelector('.dockIcon')?.textContent || '',
            iconFontSize: getComputedStyle(btn.querySelector('.dockIcon')).fontSize,
            muteIconFontSize: getComputedStyle(document.querySelector('#muteToggleBtn .dockIcon')).fontSize,
            iconAnimation: getComputedStyle(btn.querySelector('.dockIcon')).animationName,
            src: frame?.getAttribute('src') || '',
            state
          }
        : null;
    }, 1200, 50);
    const musicTrackToast = await page.evaluate(() => {
      window.__platinumArcadeMusic?.noteTrackForHarness?.('Harness Song', 'Harness Band');
      const toast = document.querySelector('#platformTrackToast');
      return {
        visible: toast?.classList.contains('show') || false,
        title: document.querySelector('#platformTrackTitle')?.textContent || '',
        artist: document.querySelector('#platformTrackArtist')?.textContent || ''
      };
    });
    const audioMix = await page.evaluate(() => {
      const before = window.__platinumAudioMix?.state?.();
      const music = document.querySelector('#musicVolume');
      const game = document.querySelector('#gameSoundVolume');
      if(music){
        music.value = '77';
        music.dispatchEvent(new Event('input', { bubbles: true }));
        music.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if(game){
        game.value = '61';
        game.dispatchEvent(new Event('input', { bubbles: true }));
        game.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const after = window.__platinumAudioMix?.state?.();
      const events = window.__galagaHarness__?.recentEvents?.({ count: 20 }) || [];
      return {
        before,
        after,
        musicValue: music?.value || '',
        gameValue: game?.value || '',
        musicLabel: document.querySelector('#musicVolumeValue')?.textContent || '',
        gameLabel: document.querySelector('#gameSoundVolumeValue')?.textContent || '',
        audioMixEvents: events.filter(event => event.type === 'audio_mix_changed').map(event => event.setting)
      };
    });
    await page.locator('#arcadeMusicToggleBtn').click();
    const musicMuted = await waitForHarness(page, () => {
      const btn = document.querySelector('#arcadeMusicToggleBtn');
      const state = window.__platinumArcadeMusic?.state?.();
      return btn?.getAttribute('aria-pressed') === 'true' && state?.state === 'playing' && state?.arcadeMusicMuted && document.querySelector('#arcadeMusicFrame')
        ? {
            aria: btn.getAttribute('aria-pressed'),
            title: btn.getAttribute('title') || '',
            actionTip: btn.dataset.actionTip || '',
            musicState: btn.dataset.musicState || '',
            musicPlaying: btn.dataset.musicPlaying || '',
            musicMuted: btn.dataset.musicMuted || '',
            icon: btn.querySelector('.dockIcon')?.textContent || '',
            iconAnimation: getComputedStyle(btn.querySelector('.dockIcon')).animationName,
            state
          }
        : null;
    }, 1200, 50);
    await page.locator('#arcadeMusicToggleBtn').click();
    const musicUnmuted = await waitForHarness(page, () => {
      const btn = document.querySelector('#arcadeMusicToggleBtn');
      const state = window.__platinumArcadeMusic?.state?.();
      return btn?.getAttribute('aria-pressed') === 'false' && state?.state === 'playing' && !state?.arcadeMusicMuted && document.querySelector('#arcadeMusicFrame')
        ? {
            aria: btn.getAttribute('aria-pressed'),
            title: btn.getAttribute('title') || '',
            actionTip: btn.dataset.actionTip || '',
            musicState: btn.dataset.musicState || '',
            musicPlaying: btn.dataset.musicPlaying || '',
            musicMuted: btn.dataset.musicMuted || '',
            icon: btn.querySelector('.dockIcon')?.textContent || '',
            state
          }
        : null;
    }, 1200, 50);
    const musicStopped = await page.evaluate(() => {
      window.__platinumArcadeMusic?.stop?.();
      const btn = document.querySelector('#arcadeMusicToggleBtn');
      return {
        aria: btn?.getAttribute('aria-pressed') || '',
        title: btn?.getAttribute('title') || '',
        musicState: btn?.dataset.musicState || '',
        musicPlaying: btn?.dataset.musicPlaying || '',
        musicMuted: btn?.dataset.musicMuted || '',
        state: window.__platinumArcadeMusic?.state?.()
      };
    });
    await page.evaluate(() => window.__platinumArcadeMusic?.setPlaylistForHarness?.(''));

    const muteBefore = await page.locator('#muteToggleBtn').getAttribute('aria-pressed');
    await page.locator('#muteToggleBtn').click();
    const muteAfter = await page.locator('#muteToggleBtn').getAttribute('aria-pressed');
    await page.locator('#muteToggleBtn').click();
    const muteRestored = await page.locator('#muteToggleBtn').getAttribute('aria-pressed');
    const audioToggleEvents = await page.evaluate(() => {
      const events = window.__galagaHarness__?.recentEvents?.({ count: 200 }) || [];
      return events
        .filter(event => event.type === 'arcade_music_mute_changed' || event.type === 'audio_mute_changed')
        .map(event => ({ type: event.type, muted: event.muted, soundEffectsMuted: event.soundEffectsMuted, arcadeMusicMuted: event.arcadeMusicMuted }));
    });

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
          title: document.querySelector('#settingsPanelTitle')?.textContent || '',
          playlistGame: document.querySelector('#arcadeMusicPlaylistGame')?.textContent || '',
          playlistSource: document.querySelector('#arcadeMusicPlaylistSource')?.textContent || '',
          playlistId: document.querySelector('#arcadeMusicPlaylistId')?.textContent || '',
          playlistPlatformId: document.querySelector('#arcadeMusicPlatformPlaylistId')?.textContent || '',
          playlistOverride: document.querySelector('#arcadeMusicGameOverride')?.textContent || ''
        } : null;
      },
      '#settingsPanelClose'
    );
    await page.locator('#arcadeMusicToggleBtn').click();
    const musicRequested = await waitForHarness(page, () => {
      const btn = document.querySelector('#arcadeMusicToggleBtn');
      const state = window.__platinumArcadeMusic?.state?.();
      const frame = document.querySelector('#arcadeMusicFrame');
      return btn?.getAttribute('aria-pressed') === 'false'
        && state?.state === 'playing'
        && state?.playlistSource === 'platform'
        && frame
        ? {
            title: btn.getAttribute('title') || '',
            state,
            src: frame?.getAttribute('src') || ''
          }
        : null;
    }, 1200, 50);
    await page.reload();
    await page.waitForLoadState('load');
    await page.locator('body').click({ position: { x: 40, y: 40 } });
    const musicRestoredAfterReload = await waitForHarness(page, () => {
      const btn = document.querySelector('#arcadeMusicToggleBtn');
      const state = window.__platinumArcadeMusic?.state?.();
      const frame = document.querySelector('#arcadeMusicFrame');
      return btn?.getAttribute('aria-pressed') === 'false'
        && state?.state === 'playing'
        && state?.requested
        && state?.playlistSource === 'platform'
        && state?.activePlaylistId === state?.playlistId
        && frame
        ? {
            title: btn.getAttribute('title') || '',
            state,
            src: frame?.getAttribute('src') || ''
          }
        : null;
    }, 1800, 50);

    return {
      dockState,
      gamePicker,
      platform,
      pilot,
      guide,
      controls,
      movie,
      scores,
      feedback,
      settings,
      music: { default: musicDefault, guardians: musicGuardians, requested: musicRequested, restoredAfterReload: musicRestoredAfterReload, before: musicBefore, active: musicActive, muted: musicMuted, unmuted: musicUnmuted, stopped: musicStopped, trackToast: musicTrackToast },
      audioMix,
      mute: { before: muteBefore, after: muteAfter, restored: muteRestored },
      audioToggleEvents,
      pause: { before: pauseBefore, active: pauseActive, restored: pauseRestored }
    };
  });

  if(result.gamePicker.expanded !== 'true') fail('game picker dock button did not open via a real click', result);
  if(/wait mode|online/i.test(result.dockState.gamePickerStatus || '')){
    fail('game picker dock button still exposed the old online/wait-mode wording', result);
  }
  if(result.dockState.platformLabelPresent){
    fail('Platinum dock button still rendered a separate text label over the platform mark', result);
  }
  if(!result.dockState.platformIconWidth || !result.dockState.platformIconHeight){
    fail('Platinum dock button no longer rendered a visible platform mark', result);
  }
  if(result.dockState.platformIconWidth > result.dockState.platformButtonWidth || result.dockState.platformIconHeight > result.dockState.platformButtonHeight){
    fail('Platinum dock mark no longer fits cleanly inside the dock button', result);
  }
  if(result.platform.expanded !== 'true') fail('Platinum dock button did not open via a real click', result);
  if(result.pilot.expanded !== 'true') fail('pilot dock button did not open via a real click', result);
  if(result.guide.expanded !== 'true' || result.guide.activeTab !== 'guide' || !result.guide.actionVisible){
    fail('guide dock button did not open the guide tab correctly', result);
  }
  if(result.controls.expanded !== 'true' || result.controls.activeTab !== 'controls' || result.controls.actionVisible){
    fail('controls dock button did not open the controls tab correctly', result);
  }
  if(!result.music.default?.configured){
    fail('Arcade Music is not configured with a product playlist by default', result);
  }
  if(result.music.default.playlistId !== PLATFORM_ARCADE_MUSIC_PLAYLIST || result.music.default.playlistSource !== 'platform' || result.music.default.gameKey !== 'aurora-galactica'){
    fail('Aurora should inherit the platform Arcade Music playlist by default', result);
  }
  if(result.music.guardians.guardians?.playlistId !== GUARDIANS_ARCADE_MUSIC_PLAYLIST || result.music.guardians.guardians?.playlistSource !== 'game' || result.music.guardians.guardians?.gameKey !== 'galaxy-guardians-preview'){
    fail('Galaxy Guardians should resolve to its game-pack Arcade Music playlist override', result);
  }
  if(result.music.guardians.restored?.playlistId !== PLATFORM_ARCADE_MUSIC_PLAYLIST || result.music.guardians.restored?.playlistSource !== 'platform'){
    fail('Returning to Aurora should restore the platform default Arcade Music playlist', result);
  }
  if(result.music.requested.title !== 'Mute Arcade Music' || result.music.requested.state?.playlistSource !== 'platform' || !result.music.requested.src.includes(PLATFORM_ARCADE_MUSIC_PLAYLIST)){
    fail('Arcade Music did not start the platform playlist cleanly before persistence checks', result);
  }
  if(result.music.restoredAfterReload.title !== 'Mute Arcade Music' || result.music.restoredAfterReload.state?.playlistSource !== 'platform' || !result.music.restoredAfterReload.state?.requested || !result.music.restoredAfterReload.src.includes(PLATFORM_ARCADE_MUSIC_PLAYLIST)){
    fail('Arcade Music default request state did not restore after reload and the next interaction', result);
  }
  if(result.music.before?.aria !== 'false' || result.music.before?.title !== 'Start Arcade Music' || result.music.before?.state?.state !== 'off' || result.music.active.aria !== 'false' || result.music.active.title !== 'Mute Arcade Music' || result.music.active.actionTip !== 'Mute Arcade Music' || result.music.active.musicPlaying !== 'true' || result.music.active.musicMuted !== 'false' || result.music.active.state?.arcadeMusicMuted || !/youtube(?:-nocookie)?\.com\/embed\//.test(result.music.active.src)){
    fail('Arcade Music dock button did not start the configured playlist embed correctly', result);
  }
  if(result.music.active.state?.playlistSource !== 'harness' || !result.music.active.src.includes('PLarcadeMusicHarness01')){
    fail('Arcade Music harness override did not remain confined to the harness path', result);
  }
  if(result.music.active.icon !== '🎶' || result.music.active.iconFontSize !== result.music.active.muteIconFontSize || result.music.active.iconAnimation === 'none'){
    fail('Arcade Music dock icon did not match the sound icon size or active pulse state', result);
  }
  if(!result.music.trackToast.visible || result.music.trackToast.title !== 'Harness Song' || result.music.trackToast.artist !== 'Harness Band'){
    fail('Arcade Music track changes did not surface in the platform message box', result);
  }
  if(result.audioMix.before?.gameSoundPercent !== 68 || result.audioMix.before?.arcadeMusicPercent !== 72){
    fail('Audio mix defaults no longer match the intended quieter game / louder music balance', result);
  }
  if(result.audioMix.after?.gameSoundPercent !== 61 || result.audioMix.after?.arcadeMusicPercent !== 77 || result.audioMix.musicLabel !== '77%' || result.audioMix.gameLabel !== '61%'){
    fail('Audio mix sliders did not apply live values correctly', result);
  }
  if(!result.audioMix.audioMixEvents.includes('arcade_music_volume') || !result.audioMix.audioMixEvents.includes('game_sound_volume')){
    fail('Audio mix slider changes were not logged to session telemetry', result);
  }
  if(result.music.muted.aria !== 'true' || result.music.muted.title !== 'Unmute Arcade Music' || result.music.muted.musicState !== 'muted' || result.music.muted.musicMuted !== 'true' || !result.music.muted.state?.arcadeMusicMuted || !result.music.muted.state?.hasFrame){
    fail('Arcade Music dock button did not mute the active playlist independently', result);
  }
  if(result.music.unmuted.aria !== 'false' || result.music.unmuted.title !== 'Mute Arcade Music' || result.music.unmuted.musicMuted !== 'false' || result.music.unmuted.state?.arcadeMusicMuted || !result.music.unmuted.state?.hasFrame){
    fail('Arcade Music dock button did not unmute the active playlist independently', result);
  }
  if(result.music.stopped.aria !== 'false' || result.music.stopped.state?.hasFrame){
    fail('Arcade Music harness stop did not remove the playlist embed', result);
  }
  if(result.movie.expanded !== 'true') fail('movie dock button did not open via a real click', result);
  if(result.scores.expanded !== 'true') fail('scores dock button did not open via a real click', result);
  if(result.feedback.expanded !== 'true') fail('feedback dock button did not open via a real click', result);
  if(result.settings.expanded !== 'true') fail('settings dock button did not open via a real click', result);
  if(!result.settings.playlistGame.includes('Aurora Galactica') || result.settings.playlistSource !== 'Platform default' || result.settings.playlistId !== PLATFORM_ARCADE_MUSIC_PLAYLIST || result.settings.playlistPlatformId !== PLATFORM_ARCADE_MUSIC_PLAYLIST || result.settings.playlistOverride !== 'Inherits platform default'){
    fail('Developer Tools did not expose the active game Arcade Music playlist configuration', result);
  }
  if(result.mute.before === result.mute.after || result.mute.before !== result.mute.restored){
    fail('mute button did not toggle and restore aria-pressed state', result);
  }
  if(!result.audioToggleEvents.some(event => event.type === 'arcade_music_mute_changed' && event.arcadeMusicMuted === true) || !result.audioToggleEvents.some(event => event.type === 'audio_mute_changed' && event.soundEffectsMuted === true)){
    fail('separate music and sound-effect mute changes were not logged to session telemetry', result);
  }
  if(result.pause.active.aria !== 'true' || !result.pause.active.paused || result.pause.restored.aria !== 'false' || result.pause.restored.paused){
    fail('pause button did not toggle paused state correctly', result);
  }

  console.log(JSON.stringify({ ok: true, checked: result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
