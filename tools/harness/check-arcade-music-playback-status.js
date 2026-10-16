#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../../src/js/01-runtime-shell.js'), 'utf8');

// Execute the complete production shell. Only the external player, DOM and clock
// are fixtures; assertions read the real runtime state and button output.
function fixture(){
  let now = 0;
  let nextId = 0;
  const timers = new Map();
  const frame = { tagName: 'IFRAME', isConnected: true };
  const button = {
    dataset: {}, attributes: {}, classList: { toggle(){} },
    setAttribute(key, value){ this.attributes[key] = value; },
    querySelector(){ return null; }
  };
  const context = {
    ARCADE_MUSIC: { state: 'loading', requested: true, mountToken: 1,
      activePlaylistId: 'PLfixture123', iframe: frame },
    BUILD_INFO: { platform: { media: { arcadeMusicPlaylistId: 'PLfixture123' } } },
    ARCADE_MUSIC_PLAYLIST_ID: 'PLfixture123', DOCS_PREVIEW_MODE: false,
    ARCADE_MUSIC_PREF_KEY: 'music', ARCADE_MUSIC_MUTED_PREF_KEY: 'muted',
    arcadeMusicVolume: 0.7, gameSoundVolume: 0.8, arcadeMusicMuted: false,
    arcadeMusicToggleBtn: button,
    arcadeMusicFrameHost: { querySelector(){ return frame; }, innerHTML: '' },
    document: { getElementById(){ return null; } },
    location: { hostname: 'localhost', origin: 'http://localhost:8000' },
    volumePercent: n => Math.round(n * 100),
    logEvent(){}, writePref(){}, showToast(){}, syncAudioMixControls(){},
    console: { warn(){} },
    setTimeout(callback, delay){ const id = ++nextId; timers.set(id, { at: now + delay, callback }); return id; },
    clearTimeout(id){ timers.delete(id); },
    window: { YT: { Player: function(id, config){
      const player = {
        code: -1, videoId: 'track1', events: config.events, plays: 0, skips: 0, muted: false,
        getPlayerState(){ return this.code; },
        getVideoData(){ return { title: 'Fixture track', video_id: this.videoId }; },
        getPlaylist(){ return ['track1']; }, getPlaylistIndex(){ return 0; },
        playVideo(){ this.plays++; }, playVideoAt(){ this.skips++; this.code = 3; },
        setVolume(value){ this.volume = value; }, mute(){ this.muted = true; }, unMute(){ this.muted = false; }, destroy(){}
      };
      return player;
    } } }
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: '01-runtime-shell.js' });
  function advance(ms){
    const end = now + ms;
    for(let guard = 0; guard < 1000; guard++){
      const entry = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if(!entry){ now = end; return; }
      now = entry[1].at; timers.delete(entry[0]); entry[1].callback();
    }
    throw new Error('Unbounded timer loop');
  }
  function mount(){
    assert.equal(context.mountArcadeMusicPlayer(context.ARCADE_MUSIC.mountToken), true);
    const player = context.ARCADE_MUSIC.player;
    player.events.onReady({ target: player });
    return player;
  }
  return { c: context, button, frame, timers, advance, mount };
}

const tests = {
  'missed PLAYING callback is reconciled from the player API'(){
    const f = fixture(); const player = f.mount();
    assert.equal(f.c.arcadeMusicState().state, 'loading');
    player.code = 1; f.advance(1100);
    assert.equal(f.c.arcadeMusicState().state, 'playing');
    assert.equal(f.button.dataset.musicPlaying, 'true');
    assert.equal(f.button.attributes['aria-label'], 'Mute Arcade Music');
    f.c.stopArcadeMusic({ silent: true }); assert.equal(f.timers.size, 0);
  },
  'iframe presence alone does not prove playback'(){
    const f = fixture();
    assert.equal(f.c.activateArcadeMusicIframeFallback('fixture', f.frame), true);
    assert.equal(f.c.arcadeMusicState().state, 'unconfirmed');
    assert.equal(f.c.arcadeMusicState().audible, false);
    assert.equal(f.button.dataset.musicPlaying, 'false');
    assert.match(f.button.attributes['aria-label'], /unconfirmed/);
    f.c.toggleArcadeMusicMute();
    assert.equal(f.c.arcadeMusicState().state, 'off');
  },
  'buffering, pause and end do not retain a playing indicator'(){
    const f = fixture(); const player = f.mount();
    for(const [code, state] of [[1, 'playing'], [3, 'loading'], [1, 'playing'], [2, 'paused'], [0, 'ended']]){
      player.code = code; f.advance(1100);
      assert.equal(f.c.arcadeMusicState().state, state);
      assert.equal(f.c.arcadeMusicState().audible, code === 1);
    }
    f.c.stopArcadeMusic({ silent: true }); assert.equal(f.timers.size, 0);
  },
  'warmup still requires playlist membership and stays muted'(){
    const f = fixture(); f.c.ARCADE_MUSIC.warming = true; f.c.ARCADE_MUSIC.forceMuted = true;
    const player = f.mount(); player.videoId = 'opening-ad'; player.code = 1;
    f.advance(1100);
    assert.equal(f.c.ARCADE_MUSIC.warming, true);
    assert.equal(f.c.arcadeMusicState().audible, false);
    player.videoId = 'track1'; f.advance(1100);
    assert.equal(f.c.ARCADE_MUSIC.warmReady, true);
    assert.equal(f.c.ARCADE_MUSIC.forceMuted, true);
    assert.equal(player.muted, true);
    f.c.toggleArcadeMusicMute(); assert.equal(f.c.arcadeMusicState().audible, true);
    assert.equal(player.muted, false);
    f.c.stopArcadeMusic({ silent: true }); assert.equal(f.timers.size, 0);
  },
  'paused or buffering playlist metadata cannot complete warmup'(){
    for(const code of [2, 3]){
      const f = fixture(); f.c.ARCADE_MUSIC.warming = true; f.c.ARCADE_MUSIC.forceMuted = true;
      const player = f.mount(); player.videoId = 'opening-ad'; player.code = 1;
      f.advance(1100);
      player.code = code; player.events.onStateChange({ target: player, data: code });
      player.videoId = 'track1'; f.advance(3000);
      assert.equal(f.c.ARCADE_MUSIC.warming, true);
      assert.equal(f.c.arcadeMusicState().audible, false);
      assert.notEqual(f.c.arcadeMusicState().state, 'playing');
      player.code = 1; f.advance(1100);
      assert.equal(f.c.ARCADE_MUSIC.warmReady, true);
      f.c.stopArcadeMusic({ silent: true }); assert.equal(f.timers.size, 0);
    }
  },
  'resume preserves mute and unavailable API methods do not break cleanup'(){
    const f = fixture(); const player = f.mount();
    f.c.setArcadeMusicMuted(true, { silent: true });
    player.code = 2; f.advance(1100); const plays = player.plays;
    f.c.toggleArcadeMusicMute();
    assert.equal(player.plays, plays + 1); assert.equal(player.muted, true);
    player.getPlayerState = () => { throw new Error('not ready'); }; f.advance(1100);
    delete player.getPlayerState; f.advance(1100);
    assert.equal(f.c.arcadeMusicState().state, 'paused');
    f.c.stopArcadeMusic({ silent: true }); assert.equal(f.timers.size, 0);
    assert.equal(f.c.resolveArcadeMusicIframe(), f.frame);
    f.c.arcadeMusicFrameHost.querySelector = () => null;
    f.c.ARCADE_MUSIC.iframe = null;
    assert.equal(f.c.resolveArcadeMusicIframe(), null);
  },
  'blocked-track recovery and stale callbacks after remount'(){
    const f = fixture(); const old = f.mount();
    old.events.onError({ target: old, data: 150 }); assert.equal(old.skips, 1);
    f.c.stopArcadeMusic({ silent: true });
    old.events.onReady({ target: old }); old.events.onStateChange({ target: old, data: 1 });
    old.events.onError({ target: old, data: 150 });
    assert.equal(f.c.arcadeMusicState().state, 'off'); assert.equal(old.skips, 1);
    assert.equal(f.timers.size, 0);
    f.c.ARCADE_MUSIC.requested = true; const current = f.mount();
    old.events.onReady({ target: old }); old.events.onError({ target: old, data: 150 });
    old.events.onStateChange({ target: old, data: 1 });
    assert.equal(f.c.ARCADE_MUSIC.player, current);
    assert.equal(old.skips, 1);
    current.code = 1; f.advance(1100); assert.equal(f.c.arcadeMusicState().state, 'playing');
    f.c.stopArcadeMusic({ silent: true }); assert.equal(f.timers.size, 0);
  }
};
let failures = 0;
for(const [name, test] of Object.entries(tests)){
  try{ test(); console.log(`PASS ${name}`); }
  catch(error){ failures++; console.error(`FAIL ${name}: ${error.stack}`); }
}
console.log(JSON.stringify({ ok: !failures, cases: Object.keys(tests).length, failures }));
process.exitCode = failures ? 1 : 0;
