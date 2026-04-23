// Boot, constants, audio, logging, UI, and input handling.
const c=document.getElementById('c'),ctx=c.getContext('2d'),msg=document.getElementById('msg'),hud=document.getElementById('hud'),left=document.getElementById('left'),center=document.getElementById('center'),right=document.getElementById('right');
const settingsBtn=document.getElementById('settingsBtn'),settingsPanel=document.getElementById('settingsPanel'),settingsPanelClose=document.getElementById('settingsPanelClose');
const cabinetShell=document.getElementById('cabinetShell');
const cabinetLeftFrame=document.getElementById('cabinetLeftFrame');
const cabinetRightFrame=document.getElementById('cabinetRightFrame');
const gamePickerDockBtn=document.getElementById('gamePickerDockBtn');
const gamePickerDockStatus=document.getElementById('gamePickerDockStatus');
const gamePickerModal=document.getElementById('gamePickerModal');
const gamePickerPanel=document.getElementById('gamePickerPanel');
const gamePickerClose=document.getElementById('gamePickerClose');
const gamePickerCurrent=document.getElementById('gamePickerCurrent');
const gamePickerList=document.getElementById('gamePickerList');
const gamePickerStatus=document.getElementById('gamePickerStatus');
const platformSplashBtn=document.getElementById('platformSplashBtn');
const platformSplashModal=document.getElementById('platformSplashModal');
const platformSplashPanel=document.getElementById('platformSplashPanel');
const platformSplashClose=document.getElementById('platformSplashClose');
const gamePreviewModal=document.getElementById('gamePreviewModal');
const gamePreviewPanel=document.getElementById('gamePreviewPanel');
const gamePreviewClose=document.getElementById('gamePreviewClose');
const openViewerBtn=document.getElementById('openViewerBtn');
const openProjectGuideBtn=document.getElementById('openProjectGuideBtn');
const guideDockBtn=document.getElementById('guideDockBtn');
const controlsDockBtn=document.getElementById('controlsDockBtn');
const feedbackDockBtn=document.getElementById('feedbackDockBtn');
const helpModal=document.getElementById('helpModal'),helpClose=document.getElementById('helpClose'),helpGuideFrame=document.getElementById('helpGuideFrame'),helpOpenWindowBtn=document.getElementById('helpOpenWindowBtn');
const helpTabButtons=Array.from(document.querySelectorAll('[data-help-tab]')),helpPanels=Array.from(document.querySelectorAll('[data-help-panel]'));
const feedbackModal=document.getElementById('feedbackModal'),feedbackForm=document.getElementById('feedbackForm'),feedbackClose=document.getElementById('feedbackClose');
const fbType=document.getElementById('fbType'),fbSummary=document.getElementById('fbSummary'),fbDescription=document.getElementById('fbDescription'),fbCancel=document.getElementById('fbCancel');
const feedbackSubtitle=document.getElementById('feedbackSubtitle');
const feedbackStatus=document.getElementById('feedbackStatus'),feedbackToast=document.getElementById('feedbackToast'),exportBtn=document.getElementById('exportBtn'),recordBtn=document.getElementById('recordBtn'),playAudioTestBtn=document.getElementById('playAudioTestBtn');
const testPanel=document.getElementById('testPanel'),testStage=document.getElementById('testStage'),testShips=document.getElementById('testShips'),testExtendFirst=document.getElementById('testExtendFirst'),testExtendRecurring=document.getElementById('testExtendRecurring'),testChallenge=document.getElementById('testChallenge'),audioTheme=document.getElementById('audioTheme'),graphicsTheme=document.getElementById('graphicsTheme'),graphicsStarfieldIntensity=document.getElementById('graphicsStarfieldIntensity'),graphicsStarfieldSpeed=document.getElementById('graphicsStarfieldSpeed');
const muteToggleBtn=document.getElementById('muteToggleBtn');
const pauseToggleBtn=document.getElementById('pauseToggleBtn');
const statusPanels=document.getElementById('statusPanels');
const settingsRuntime=document.getElementById('settingsRuntime');
const settingsChannel=document.getElementById('settingsChannel');
const settingsVersion=document.getElementById('settingsVersion');
const settingsRelease=document.getElementById('settingsRelease');
const settingsState=document.getElementById('settingsState');
const settingsAudioDebugBody=document.getElementById('settingsAudioDebugBody');
const buildStamp=document.getElementById('buildStamp'),buildStampChannel=document.getElementById('buildStampChannel'),buildStampVersion=document.getElementById('buildStampVersion'),buildStampRelease=document.getElementById('buildStampRelease');
const buildStampDismissBtn=document.getElementById('buildStampDismissBtn');
const buildStampRefreshBtn=document.getElementById('buildStampRefreshBtn');
const helpGuideActions=document.getElementById('helpGuideActions');
let t0=0,started=0,paused=0,aud=0,keys={},keyState={};
let RNG_SEED=0,RNG_STATE=0;
const DOCS_PREVIEW_MODE=typeof location!=='undefined'&&/\bdocsPreview=1\b/.test(String(location.search||''));
window.__platinumCarryDebug=window.__platinumCarryDebug??window.__auroraCarryDebug??0;
window.__auroraCarryDebug=window.__platinumCarryDebug;
const PLATFORM_NAME='Platinum';
let PRODUCT_NAME=PLATFORM_NAME;
const PLATINUM_SHELL_FRAME_THEMES=Object.freeze({
 'platinum-release':Object.freeze({
  shellLine:'rgba(122,215,255,.28)',
  shellGlow:'rgba(178,236,255,.12)',
  marqueeBorder:'#8ce8ff',
  marqueeGlow:'rgba(122,215,255,.34)',
  marqueeBackground:'linear-gradient(180deg,#f7fbff,#dde8f5)',
 shellTopBackground:[
   'radial-gradient(circle at 14% 26%,rgba(189,221,255,.28) 0 10%,transparent 11%)',
   'radial-gradient(circle at 86% 30%,rgba(112,216,255,.24) 0 10%,transparent 11%)',
   'linear-gradient(135deg,rgba(255,255,255,.16) 0 10%,transparent 10% 22%,rgba(126,189,255,.12) 22% 33%,transparent 33% 46%,rgba(255,255,255,.08) 46% 56%,transparent 56%)',
   'linear-gradient(180deg,rgba(10,16,32,.97),rgba(18,28,48,.9))'
  ].join(','),
  shellSideBackground:[
   'radial-gradient(circle at 50% 14%,rgba(163,236,255,.2) 0 9%,transparent 10%)',
   'radial-gradient(circle at 22% 82%,rgba(255,235,171,.14) 0 10%,transparent 11%)',
   'linear-gradient(150deg,rgba(116,167,225,.16) 0 14%,transparent 14% 28%,rgba(255,255,255,.06) 28% 34%,transparent 34% 48%,rgba(116,167,225,.12) 48% 62%,transparent 62%)',
   'linear-gradient(180deg,rgba(6,12,26,.98),rgba(12,20,39,.96))'
  ].join(','),
  shellBottomBackground:[
   'radial-gradient(circle at 20% 62%,rgba(164,229,255,.16) 0 11%,transparent 12%)',
   'radial-gradient(circle at 82% 58%,rgba(255,224,147,.14) 0 10%,transparent 11%)',
   'linear-gradient(150deg,rgba(116,167,225,.14) 0 14%,transparent 14% 28%,rgba(255,255,255,.05) 28% 34%,transparent 34% 48%,rgba(116,167,225,.1) 48% 62%,transparent 62%)',
   'linear-gradient(180deg,rgba(10,16,32,.98),rgba(4,8,20,.98))'
  ].join(','),
  shellPanelBorder:'rgba(188,226,255,.08)',
  shellPanelShadow:'inset 0 -6px 14px rgba(0,0,0,.18)',
  leftRailBorder:'rgba(142,206,255,.1)',
  leftRailBackground:[
   'radial-gradient(circle at 72% 14%,rgba(145,224,255,.24) 0 8%,transparent 9%)',
   'radial-gradient(circle at 24% 84%,rgba(255,224,151,.12) 0 9%,transparent 10%)',
   'linear-gradient(200deg,rgba(16,24,46,.78),rgba(6,11,24,.86))',
   'repeating-linear-gradient(24deg,rgba(114,171,230,.16) 0 16px,transparent 16px 38px)'
  ].join(','),
  rightRailBorder:'rgba(142,206,255,.1)',
  rightRailBackground:[
   'radial-gradient(circle at 72% 14%,rgba(145,224,255,.22) 0 8%,transparent 9%)',
   'radial-gradient(circle at 76% 86%,rgba(255,224,151,.12) 0 9%,transparent 10%)',
   'linear-gradient(160deg,rgba(16,24,46,.78),rgba(6,11,24,.86))',
   'repeating-linear-gradient(156deg,rgba(114,171,230,.16) 0 16px,transparent 16px 38px)'
  ].join(','),
  railInnerBorder:'rgba(255,255,255,0)',
  railInnerGlow:'rgba(255,229,122,.015)'
 }),
 'aurora-crown':Object.freeze({
  shellLine:'rgba(121,246,198,.34)',
  shellGlow:'rgba(255,227,138,.14)',
  marqueeBorder:'#48f0c3',
  marqueeGlow:'rgba(201,140,255,.32)',
  marqueeBackground:'linear-gradient(180deg,#fbfcff,#eef8f7)',
  shellTopBackground:[
   'radial-gradient(circle at 14% 24%,rgba(121,246,198,.24) 0 10%,transparent 11%)',
   'radial-gradient(circle at 86% 28%,rgba(201,140,255,.2) 0 10%,transparent 11%)',
   'linear-gradient(140deg,rgba(121,246,198,.12) 0 12%,transparent 12% 24%,rgba(201,140,255,.1) 24% 38%,transparent 38% 52%,rgba(255,231,138,.08) 52% 62%,transparent 62%)',
   'linear-gradient(180deg,rgba(8,18,32,.96),rgba(18,28,48,.88))'
  ].join(','),
  shellSideBackground:[
   'radial-gradient(circle at 46% 14%,rgba(121,246,198,.18) 0 9%,transparent 10%)',
   'radial-gradient(circle at 28% 82%,rgba(201,140,255,.14) 0 10%,transparent 11%)',
   'linear-gradient(150deg,rgba(121,246,198,.12) 0 14%,transparent 14% 28%,rgba(201,140,255,.08) 28% 34%,transparent 34% 48%,rgba(255,231,138,.08) 48% 62%,transparent 62%)',
   'linear-gradient(180deg,rgba(5,12,24,.98),rgba(11,20,34,.96))'
  ].join(','),
  shellBottomBackground:[
   'radial-gradient(circle at 18% 62%,rgba(121,246,198,.14) 0 11%,transparent 12%)',
   'radial-gradient(circle at 84% 58%,rgba(201,140,255,.14) 0 10%,transparent 11%)',
   'linear-gradient(150deg,rgba(121,246,198,.12) 0 14%,transparent 14% 28%,rgba(201,140,255,.08) 28% 34%,transparent 34% 48%,rgba(255,231,138,.08) 48% 62%,transparent 62%)',
   'linear-gradient(180deg,rgba(8,15,28,.98),rgba(4,8,20,.98))'
  ].join(','),
  shellPanelBorder:'rgba(173,255,229,.16)',
  shellPanelShadow:'inset 0 -8px 18px rgba(0,0,0,.28)',
  leftRailBorder:'rgba(121,246,198,.2)',
  leftRailBackground:[
   'radial-gradient(circle at 72% 16%,rgba(121,246,198,.2) 0 8%,transparent 9%)',
   'radial-gradient(circle at 24% 86%,rgba(201,140,255,.12) 0 9%,transparent 10%)',
   'linear-gradient(200deg,rgba(12,22,36,.8),rgba(4,9,20,.86))',
   'repeating-linear-gradient(24deg,rgba(121,246,198,.14) 0 16px,transparent 16px 38px)'
  ].join(','),
  rightRailBorder:'rgba(201,140,255,.2)',
  rightRailBackground:[
   'radial-gradient(circle at 74% 16%,rgba(201,140,255,.2) 0 8%,transparent 9%)',
   'radial-gradient(circle at 76% 84%,rgba(255,231,138,.12) 0 9%,transparent 10%)',
   'linear-gradient(160deg,rgba(12,22,36,.8),rgba(4,9,20,.86))',
   'repeating-linear-gradient(156deg,rgba(201,140,255,.14) 0 16px,transparent 16px 38px)'
  ].join(','),
  railInnerBorder:'rgba(255,255,255,.06)',
  railInnerGlow:'rgba(255,229,122,.04)'
 }),
 'guardians-preview':Object.freeze({
  shellLine:'rgba(255,124,116,.32)',
  shellGlow:'rgba(255,215,133,.12)',
  marqueeBorder:'#ff6c57',
  marqueeGlow:'rgba(255,216,109,.28)',
  marqueeBackground:'linear-gradient(180deg,#fffaf6,#ffe8db)',
  shellTopBackground:[
   'radial-gradient(circle at 16% 24%,rgba(255,108,87,.26) 0 10%,transparent 11%)',
   'radial-gradient(circle at 86% 24%,rgba(255,216,109,.18) 0 10%,transparent 11%)',
   'linear-gradient(142deg,rgba(255,108,87,.12) 0 14%,transparent 14% 28%,rgba(255,216,109,.08) 28% 40%,transparent 40% 54%,rgba(255,255,255,.08) 54% 64%,transparent 64%)',
   'linear-gradient(180deg,rgba(20,10,16,.97),rgba(40,14,18,.9))'
  ].join(','),
  shellSideBackground:[
   'radial-gradient(circle at 50% 14%,rgba(255,124,116,.16) 0 9%,transparent 10%)',
   'radial-gradient(circle at 24% 82%,rgba(255,216,109,.12) 0 10%,transparent 11%)',
   'linear-gradient(150deg,rgba(255,124,116,.1) 0 14%,transparent 14% 28%,rgba(255,216,109,.08) 28% 34%,transparent 34% 48%,rgba(255,255,255,.05) 48% 62%,transparent 62%)',
   'linear-gradient(180deg,rgba(18,8,14,.98),rgba(26,10,18,.96))'
  ].join(','),
  shellBottomBackground:[
   'radial-gradient(circle at 18% 62%,rgba(255,124,116,.14) 0 11%,transparent 12%)',
   'radial-gradient(circle at 84% 56%,rgba(255,216,109,.12) 0 10%,transparent 11%)',
   'linear-gradient(150deg,rgba(255,124,116,.1) 0 14%,transparent 14% 28%,rgba(255,216,109,.08) 28% 34%,transparent 34% 48%,rgba(255,255,255,.05) 48% 62%,transparent 62%)',
   'linear-gradient(180deg,rgba(18,8,14,.98),rgba(10,4,10,.98))'
  ].join(','),
  shellPanelBorder:'rgba(255,181,151,.16)',
  shellPanelShadow:'inset 0 -8px 18px rgba(0,0,0,.28)',
  leftRailBorder:'rgba(255,124,116,.2)',
  leftRailBackground:[
   'radial-gradient(circle at 72% 16%,rgba(255,124,116,.18) 0 8%,transparent 9%)',
   'radial-gradient(circle at 24% 84%,rgba(255,216,109,.12) 0 9%,transparent 10%)',
   'linear-gradient(200deg,rgba(35,14,18,.8),rgba(14,6,12,.86))',
   'repeating-linear-gradient(24deg,rgba(255,124,116,.12) 0 16px,transparent 16px 38px)'
  ].join(','),
  rightRailBorder:'rgba(255,181,151,.2)',
  rightRailBackground:[
   'radial-gradient(circle at 74% 16%,rgba(255,216,109,.16) 0 8%,transparent 9%)',
   'radial-gradient(circle at 76% 84%,rgba(255,124,116,.14) 0 9%,transparent 10%)',
   'linear-gradient(160deg,rgba(35,14,18,.8),rgba(14,6,12,.86))',
   'repeating-linear-gradient(156deg,rgba(255,181,151,.12) 0 16px,transparent 16px 38px)'
  ].join(','),
  railInnerBorder:'rgba(255,255,255,.06)',
  railInnerGlow:'rgba(255,229,122,.04)'
 }),
 'classic-blue':Object.freeze({
  shellLine:'rgba(83,140,255,.32)',
  shellGlow:'rgba(255,222,134,.08)',
  marqueeBorder:'#f05e1d',
  marqueeGlow:'#38d6a0',
  marqueeBackground:'linear-gradient(180deg,#fbfcff,#edf4ff)',
  shellTopBackground:[
   'radial-gradient(circle at 12% 22%,rgba(255,232,102,.38) 0 9%,transparent 10%)',
   'radial-gradient(circle at 88% 24%,rgba(242,181,78,.3) 0 11%,transparent 12%)',
   'repeating-linear-gradient(150deg,rgba(42,66,201,.48) 0 24px,transparent 24px 54px)',
   'linear-gradient(180deg,rgba(5,8,24,.95),rgba(8,14,32,.82))'
  ].join(','),
  shellSideBackground:[
   'radial-gradient(circle at 38% 12%,rgba(228,214,89,.74) 0 8%,rgba(165,138,48,.38) 9%,transparent 18%)',
   'radial-gradient(circle at 28% 78%,rgba(110,126,255,.34) 0 11%,transparent 18%)',
   'repeating-linear-gradient(150deg,rgba(40,64,198,.68) 0 24px,transparent 24px 54px)',
   'linear-gradient(180deg,rgba(2,4,12,.98),rgba(4,6,18,.98))'
  ].join(','),
  shellBottomBackground:[
   'radial-gradient(circle at 16% 70%,rgba(110,126,255,.24) 0 11%,transparent 17%)',
   'radial-gradient(circle at 86% 66%,rgba(229,208,86,.36) 0 10%,transparent 16%)',
   'repeating-linear-gradient(150deg,rgba(40,64,198,.58) 0 24px,transparent 24px 54px)',
   'linear-gradient(180deg,rgba(4,6,18,.98),rgba(2,4,12,.98))'
  ].join(','),
  shellPanelBorder:'rgba(171,214,255,.18)',
  shellPanelShadow:'inset 0 -8px 18px rgba(0,0,0,.28)',
  leftRailBorder:'rgba(127,183,255,.18)',
  leftRailBackground:[
   'radial-gradient(circle at 74% 12%,rgba(115,200,255,.42) 0 7%,transparent 8%)',
   'radial-gradient(circle at 26% 88%,rgba(255,214,104,.34) 0 8%,transparent 9%)',
   'radial-gradient(circle at 78% 72%,rgba(123,163,255,.18) 0 10%,transparent 11%)',
   'linear-gradient(200deg,rgba(13,18,42,.72),rgba(4,8,20,.8))',
   'repeating-linear-gradient(25deg,rgba(58,76,255,.44) 0 18px,transparent 18px 44px)'
  ].join(','),
  rightRailBorder:'rgba(127,183,255,.18)',
  rightRailBackground:[
   'radial-gradient(circle at 70% 12%,rgba(242,181,78,.74) 0 9%,rgba(171,84,34,.32) 10%,transparent 18%)',
   'radial-gradient(circle at 74% 86%,rgba(229,208,86,.58) 0 10%,rgba(143,94,28,.22) 11%,transparent 18%)',
   'radial-gradient(circle at 22% 72%,rgba(123,163,255,.18) 0 10%,transparent 11%)',
   'linear-gradient(160deg,rgba(13,18,42,.72),rgba(4,8,20,.8))',
   'repeating-linear-gradient(155deg,rgba(58,76,255,.44) 0 18px,transparent 18px 44px)'
  ].join(','),
  railInnerBorder:'rgba(255,255,255,.06)',
  railInnerGlow:'rgba(255,229,122,.05)'
 })
});
function platinumShellFrameTheme(id='platinum-release'){
 return PLATINUM_SHELL_FRAME_THEMES[id]||PLATINUM_SHELL_FRAME_THEMES['platinum-release'];
}
// Keep the existing browser storage namespace until we plan and ship an
// explicit migration for live users and their historical local data.
const STORAGE_PREFIX='auroraGalactica';
const PLATFORM_STORAGE_PREFIX='platinum';
const LEGACY_STORAGE_PREFIX='galagaTrib';
const GAME_PACK_PREF_KEY=`${STORAGE_PREFIX}SelectedGamePack`;
const RECORD_PREF_KEY=`${STORAGE_PREFIX}AutoVideo`;
const TEST_PREF_KEY=`${STORAGE_PREFIX}TestCfg`;
const SEED_PREF_KEY=`${STORAGE_PREFIX}HarnessSeed`;
const SCOREBOARD_KEY=`${STORAGE_PREFIX}Top10`;
const LEADERBOARD_PREF_KEY=`${STORAGE_PREFIX}LeaderboardView`;
const LEADERBOARD_DATE_FILTER_KEY=`${STORAGE_PREFIX}LeaderboardAfterDate`;
const AUDIO_MUTED_PREF_KEY=`${STORAGE_PREFIX}AudioMuted`;
const BEST_SCORE_KEY=`${STORAGE_PREFIX}Best`;
const SYSTEM_LOG_KEY=`${STORAGE_PREFIX}SystemLog`;
const LEGACY_STORAGE_KEYS={
 [RECORD_PREF_KEY]:`${LEGACY_STORAGE_PREFIX}AutoVideo`,
 [TEST_PREF_KEY]:`${LEGACY_STORAGE_PREFIX}TestCfg`,
 [SEED_PREF_KEY]:`${LEGACY_STORAGE_PREFIX}HarnessSeed`,
 [SCOREBOARD_KEY]:`${LEGACY_STORAGE_PREFIX}Top10`,
 [LEADERBOARD_PREF_KEY]:`${LEGACY_STORAGE_PREFIX}LeaderboardView`,
 [AUDIO_MUTED_PREF_KEY]:`${LEGACY_STORAGE_PREFIX}AudioMuted`,
 [BEST_SCORE_KEY]:`${LEGACY_STORAGE_PREFIX}Best`,
 [SYSTEM_LOG_KEY]:`${LEGACY_STORAGE_PREFIX}SystemLog`
};
const PLATFORM_STORAGE_KEYS={
 [GAME_PACK_PREF_KEY]:`${PLATFORM_STORAGE_PREFIX}SelectedGamePack`,
 [RECORD_PREF_KEY]:`${PLATFORM_STORAGE_PREFIX}AutoVideo`,
 [TEST_PREF_KEY]:`${PLATFORM_STORAGE_PREFIX}TestCfg`,
 [SEED_PREF_KEY]:`${PLATFORM_STORAGE_PREFIX}HarnessSeed`,
 [SCOREBOARD_KEY]:`${PLATFORM_STORAGE_PREFIX}Top10`,
 [LEADERBOARD_PREF_KEY]:`${PLATFORM_STORAGE_PREFIX}LeaderboardView`,
 [AUDIO_MUTED_PREF_KEY]:`${PLATFORM_STORAGE_PREFIX}AudioMuted`,
 [BEST_SCORE_KEY]:`${PLATFORM_STORAGE_PREFIX}Best`,
 [SYSTEM_LOG_KEY]:`${PLATFORM_STORAGE_PREFIX}SystemLog`
};
const SYSTEM_LOG_LIMIT=80;
let audioMuted=readPref(AUDIO_MUTED_PREF_KEY)==='1';
let buildStampDismissed=0;
function readPref(key){
 try{
  const current=localStorage.getItem(key);
  if(current!=null)return current;
  const fallbackKeys=[PLATFORM_STORAGE_KEYS[key],LEGACY_STORAGE_KEYS[key]].filter(Boolean);
  for(const fallbackKey of fallbackKeys){
   const fallback=localStorage.getItem(fallbackKey);
   if(fallback!=null){
    localStorage.setItem(key,fallback);
    return fallback;
   }
  }
  return null;
 }catch{
  return null;
 }
}
function writePref(key,value){
 try{
  localStorage.setItem(key,value);
  const platformKey=PLATFORM_STORAGE_KEYS[key];
  if(platformKey)localStorage.setItem(platformKey,value);
 }catch{}
}
function removePref(key){
 try{
  localStorage.removeItem(key);
  const platformKey=PLATFORM_STORAGE_KEYS[key];
  if(platformKey)localStorage.removeItem(platformKey);
 }catch{}
}
function loadSystemLog(){
 try{
  return JSON.parse(readPref(SYSTEM_LOG_KEY)||'[]')
   .filter(entry=>entry&&entry.at&&entry.action)
   .slice(-SYSTEM_LOG_LIMIT);
 }catch{
  return [];
 }
}
function saveSystemLog(entries){
 writePref(SYSTEM_LOG_KEY,JSON.stringify((entries||[]).slice(-SYSTEM_LOG_LIMIT)));
}
function recentSystemLogEntries(limit=20){
 const count=Math.max(1,Math.min(SYSTEM_LOG_LIMIT,+limit||20));
 return loadSystemLog().slice(-count);
}
function queueBugSuggestion(summary='',description=''){
 pendingBugSuggestion={
  summary:String(summary||'').trim(),
  description:String(description||'').trim(),
  at:Date.now()
 };
}
function applyPendingBugSuggestion(){
 if(!pendingBugSuggestion)return;
 if(fbType)fbType.value='bug_report';
 if(fbSummary&&!String(fbSummary.value||'').trim())fbSummary.value=pendingBugSuggestion.summary||'Unexpected game issue';
 if(fbDescription&&!String(fbDescription.value||'').trim())fbDescription.value=pendingBugSuggestion.description||'Please describe what happened. Recent diagnostics will be attached automatically.';
 pendingBugSuggestion=null;
}
function formatDiagnosticsLines(label,rows){
 if(!rows.length)return [`${label}: none`];
 return[
  `${label}:`,
  ...rows.map(row=>`- ${row.at||'--'} | ${row.level||'info'} | ${row.action||'event'} | ${row.message||''}${row.data?` | ${JSON.stringify(row.data)}`:''}`)
 ];
}
function recentSessionDiagnostics(limit=20){
 const count=Math.max(1,Math.min(200,+limit||20));
 if(!REC)return [];
 return REC.events.slice(-count).map(event=>({
  at:`+${Number.isFinite(+event.t)?(+event.t).toFixed(3):'0.000'}s`,
  level:'info',
  action:event.type||'event',
  message:event.type||'event',
  data:event
 }));
}
function getSystemDiagnosticsReport(limit=20){
 return{
  systemLog:recentSystemLogEntries(limit),
  sessionEvents:recentSessionDiagnostics(limit)
 };
}
function getSystemStatusReport(limit=40){
 const count=Math.max(1,Math.min(SYSTEM_LOG_LIMIT,+limit||40));
 const debug=window.__platinumAudioDebug||window.__auroraAudioDebug||{};
 const audioReference=debug.reference||{};
 return{
  generatedAt:new Date().toISOString(),
  build:BUILD_INFO,
  location:location.href,
  game:{
   stage:S.stage,
   score:S.score,
   lives:Math.max(0,S.lives+1),
   started:!!started,
   paused:!!paused,
   challenge:!!S.challenge,
   attract:!!ATTRACT.active
  },
  audioDebug:{
   theme:(typeof currentAudioOverrides==='function'&&currentAudioOverrides().audioTheme)||'auto',
   lastCue:debug.lastCue||null,
   reference:{
    lastRequested:audioReference.lastRequested||'',
    lastLoaded:audioReference.lastLoaded||'',
    lastStarted:audioReference.lastStarted||'',
    lastError:audioReference.lastError||'',
    activeCount:Number.isFinite(+audioReference.activeCount)?+audioReference.activeCount:0
   },
   statusLine:String(window.__auroraAudioStatusLine||'').trim()
  },
  systemLog:recentSystemLogEntries(count),
  sessionEvents:recentSessionDiagnostics(Math.min(40,count))
 };
}
function recordSystemIssue(action,message,data={},opts={}){
 const entry={
  at:new Date().toISOString(),
  level:String(opts.level||'error'),
  action:String(action||'issue'),
  message:String(message||'').trim()||'Unexpected issue',
  build:BUILD,
  channel:String(BUILD_INFO?.releaseChannel||'development'),
  url:location.href,
  stage:S.stage,
  score:S.score,
  lives:Math.max(0,S.lives+1),
  started:!!started,
  paused:!!paused
 };
 if(data&&Object.keys(data).length)entry.data=data;
 const rows=loadSystemLog();
 rows.push(entry);
 saveSystemLog(rows);
 logEvent('system_issue',{level:entry.level,action:entry.action,message:entry.message});
 if(opts.suggestBugReport){
  queueBugSuggestion(
   opts.summary||'Unexpected game issue',
   opts.description||`${entry.message}\n\nPlease describe what you were doing when this happened.`
  );
  const prompt=opts.prompt||'Please submit a bug report. Recent diagnostics will be attached automatically.';
  if(feedbackOpen)setFeedbackStatus(prompt,1);
  showToast(prompt);
 }
 return entry;
}
window.recordSystemIssue=recordSystemIssue;
window.getSystemDiagnosticsReport=getSystemDiagnosticsReport;
window.getSystemStatusReport=getSystemStatusReport;
window.recentSystemLogEntries=recentSystemLogEntries;
function randUnit(){
 if(!RNG_SEED)return Math.random();
 RNG_STATE=(RNG_STATE+0x6D2B79F5)|0;
 let t=Math.imul(RNG_STATE^RNG_STATE>>>15,1|RNG_STATE);
 t^=t+Math.imul(t^t>>>7,61|t);
 return((t^t>>>14)>>>0)/4294967296;
}
function auxRandUnit(){
 return Math.random();
}
function setSeed(seed=0){
 RNG_SEED=(+seed>>>0)||0;
 RNG_STATE=RNG_SEED||0;
 if(RNG_SEED)writePref(SEED_PREF_KEY,String(RNG_SEED));
 else removePref(SEED_PREF_KEY);
 return RNG_SEED;
}
const rnd=(a=1,b=0)=>randUnit()*(a-b)+b,auxRnd=(a=1,b=0)=>auxRandUnit()*(a-b)+b,cl=(v,a,b)=>v<a?a:v>b?b:v;
let DPR=1;
const BUILD_INFO={version:'{{BUILD_VERSION}}',label:'{{BUILD_LABEL}}',commit:'{{BUILD_COMMIT}}',branch:'{{BUILD_BRANCH}}',dirty:{{BUILD_DIRTY}},released:'{{BUILD_RELEASE_ET}}',state:'{{BUILD_STATE}}',releaseChannel:'{{BUILD_CHANNEL}}'};
const BUILD=BUILD_INFO.label;
const BUILD_INFO_URL=new URL('build-info.json',location.href).toString();
const BUILD_REFRESH_CHECK_MS=60000;
const BUILD_SEEN_KEY=`${STORAGE_PREFIX}LastSeenBuild:${String(BUILD_INFO.releaseChannel||'development').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
const BUILD_UPDATE={available:0,label:'',mode:'',notified:0,timer:0,checking:0};
const BUILD_REFRESH_HINT=(()=>{
 try{
  return new URLSearchParams(location.search).get('refreshHint')==='1';
 }catch{
  return false;
 }
})();
function clearBuildRefreshHintUrl(){
 if(!BUILD_REFRESH_HINT)return;
 try{
  const url=new URL(location.href);
  url.searchParams.delete('refreshHint');
  history.replaceState(null,'',url.toString());
 }catch{}
}
const FEEDBACK_RATE_MS=30000;
const MODEM_FEATURE_EMAIL='default-dimiglyd88@inbox.modem.dev';
const WEB3FORMS_ENDPOINT='https://api.web3forms.com/submit';
const WEB3FORMS_ACCESS_KEY='{{WEB3FORMS_ACCESS_KEY}}';
let feedbackOpen=0,feedbackBusy=0,feedbackPrevPaused=0,feedbackLastSubmit=0,toastTimer=0;
let gamePickerOpen=0,gamePickerPrevPaused=0;
let platformSplashOpen=0,platformSplashPrevPaused=0;
let gamePreviewOpen=0,gamePreviewPrevPaused=0;
let pendingBugSuggestion=null;
let helpOpen=0,helpPrevPaused=0,helpMode='controls';
let settingsOpen=0,settingsPrevPaused=0;
let REC=null,recShotT=0,sessionN=0;
let autoExportedSessionId='';
let gameOverHtml='';
let gameOverState=null;
let harnessFrameAccum=0;
let harnessClockControlled=0;
const ATTRACT={active:0,phase:'',timer:0,cycle:0,scoreViews:['all','validated'],scoreViewIndex:0,scoreViewTimer:0,scoreViewDwell:4.5,audioPulseTimer:0,audioPulseIndex:0};
const CHALLENGE_GROUP_BONUS=[1000,1000,1000,2000,2000,2000,3000,3000,3000];
const VIDEO_REC={enabled:readPref(RECORD_PREF_KEY)!=='0',active:0,rec:null,stream:null,chunks:[],mime:'',sessionId:'',file:'',afterStop:[],stopMeta:null};
const VIDEO_REC_INCLUDE_AUDIO=1;
const PLAY_W=280,PLAY_H=360;
const VIS={shipW:36,shipH:28,enemyW:36,enemyH:28,gx:118,gy:66,playerBottom:92,beamLen:380,formTop:28};
const STAGE1_SCRIPT=[
 {t:4.6,type:'bee',c:1},{t:6.1,type:'bee',c:8},
 {t:8.2,type:'but',c:2},{t:9.8,type:'but',c:7},
 {t:12.4,type:'bee',c:0},{t:14.2,type:'bee',c:9},
 {t:17.3,type:'but',c:4},{t:20.4,type:'boss',c:3,escort:1},
 {t:24.1,type:'bee',c:5},{t:26.0,type:'but',c:6},
 {t:29.6,type:'boss',c:6,capture:1},
 {t:34.0,type:'bee',c:2},{t:37.2,type:'but',c:8},
 {t:41.0,type:'boss',c:4,escort:1}
];
function enemyFamilyForType(profile, type){
 if(type === 'bee') return profile.beeFamily;
 if(type === 'but') return profile.butFamily;
 if(type === 'boss') return profile.bossFamily;
 if(type === 'rogue') return 'rogue';
 return 'classic';
}

const AC=()=>{
 if(sfx.a)return sfx.a;
 const A=new (window.AudioContext||webkitAudioContext)();
 sfx.a=A;
 sfx.bus=A.createGain();
 sfx.bus.gain.value=audioMuted?0:.9;
 sfx.tap=A.createMediaStreamDestination();
 sfx.keep=A.createConstantSource();
 sfx.keep.offset.value=0;
 sfx.keep.connect(sfx.bus);
 sfx.keep.start();
 sfx.bus.connect(A.destination);
 sfx.bus.connect(sfx.tap);
 return A;
};
window.__platinumAudioDebug=window.__platinumAudioDebug||window.__auroraAudioDebug||{lastCue:null,history:[]};
if(!Array.isArray(window.__platinumAudioDebug.history))window.__platinumAudioDebug.history=[];
if(!window.__platinumAudioDebug.reference)window.__platinumAudioDebug.reference={lastRequested:'',lastLoaded:'',lastStarted:'',lastError:'',activeCount:0};
window.__auroraAudioDebug=window.__platinumAudioDebug;
const sfx={
 a:null,n:null,bus:null,tap:null,keep:null,recOsc:null,recGain:null,referenceActive:[],referenceCooldowns:Object.create(null),referenceBuffers:Object.create(null),
 resolveAtmosphere(opts={}){
  const attractPhase=opts.attractPhase!==undefined?opts.attractPhase:((typeof ATTRACT!=='undefined'&&ATTRACT.phase)||'');
  const frontDoor=opts.frontDoor!==undefined?!!opts.frontDoor:(!started&&!S.attract);
  const challenge=opts.challenge!==undefined?!!opts.challenge:!!S.challenge;
  const phase=String(opts.phase||'').trim()||(
   frontDoor?'frontDoor'
    : attractPhase==='scores'?'wait'
    : attractPhase==='demo'?'demo'
    : challenge?'challenge'
    : 'stage'
  );
  if(typeof resolvedAudioAtmosphere==='function'){
   return resolvedAudioAtmosphere({
    stagePresentation:opts.stagePresentation||S.stagePresentation,
    atmosphereTheme:opts.atmosphereTheme||'',
    phase,
    challenge,
    frontDoor,
    attractPhase
   });
  }
  return Object.freeze({id:'classic-arcade',audioTheme:'classic-arcade',phase});
 },
 recordCue(name,atmosphere,opts={},cue=null){
  const entry=Object.freeze({
   cue:String(name||''),
   atmosphereId:atmosphere?.id||'classic-arcade',
   audioTheme:atmosphere?.audioTheme||'classic-arcade',
   phase:atmosphere?.phase||opts.phase||'stage',
   variant:Number.isFinite(+opts.variant)?(+opts.variant|0):0,
   referenceClip:String(cue?.referenceClip||'').trim(),
   referenceClipStart:Number.isFinite(+cue?.clipStart)?+cue.clipStart:0,
   referenceClipDuration:Number.isFinite(+cue?.clipDuration)?+cue.clipDuration:0,
   stage:+(S.stage||0),
   challenge:!!S.challenge,
   at:+(performance.now()/1000).toFixed(3)
  });
  window.__platinumAudioDebug.lastCue=entry;
  window.__platinumAudioDebug.history.push(entry);
  if(window.__platinumAudioDebug.history.length>24)window.__platinumAudioDebug.history.shift();
  return entry;
 },
 logCueEvent(entry=null){
  if(!entry||typeof logEvent!=='function')return;
  logEvent('audio_cue',{
   cue:entry.cue,
   atmosphereId:entry.atmosphereId,
   audioTheme:entry.audioTheme,
   phase:entry.phase,
   variant:entry.variant,
   referenceClip:entry.referenceClip||'',
   referenceClipStart:Number.isFinite(+entry.referenceClipStart)?+entry.referenceClipStart:0,
    referenceClipDuration:Number.isFinite(+entry.referenceClipDuration)?+entry.referenceClipDuration:0,
   challenge:!!entry.challenge,
   stage:+(entry.stage||0)
  });
 },
 cueDef(name,opts={}){
  const atmosphere=opts.resolvedAtmosphere||this.resolveAtmosphere(opts);
  const cue=typeof currentGamePackAudioCue==='function'
   ? currentGamePackAudioCue(name,{
    stagePresentation:opts.stagePresentation||S.stagePresentation,
    atmosphereTheme:atmosphere.id,
    resolvedAtmosphere:atmosphere,
    phase:atmosphere.phase,
    challenge:opts.challenge!==undefined?!!opts.challenge:!!S.challenge,
    attractPhase:opts.attractPhase!==undefined?opts.attractPhase:((typeof ATTRACT!=='undefined'&&ATTRACT.phase)||''),
    frontDoor:opts.frontDoor!==undefined?!!opts.frontDoor:(!started&&!S.attract)
   })
   : null;
  if(!cue){
   this.recordCue(name,atmosphere,opts,null);
   return null;
  }
  this.recordCue(name,atmosphere,opts,cue);
  if(Array.isArray(cue.variants)&&cue.variants.length){
   return cue.variants[Math.abs(Number.isFinite(+opts.variant)?(+opts.variant|0):0)%cue.variants.length];
  }
  return cue;
 },
 playCue(name,opts={}){
  if(DOCS_PREVIEW_MODE&&!opts.docsPreview)return;
  const cue=this.cueDef(name,opts);
  if(!cue)return;
  const allowIdle=!!cue.allowIdle||!!opts.allowIdle;
  const cueEntry=window.__platinumAudioDebug.lastCue||null;
  if(cue.referenceClip){
   if(Array.isArray(cue.stopCueNames)&&cue.stopCueNames.length)this.stopCueNames(cue.stopCueNames);
   this.playReferenceClip(cue.referenceClip,{
    allowIdle,
    volume:cue.referenceVolume,
    cooldownMs:cue.cooldownMs,
    clipStart:cue.clipStart,
    clipDuration:cue.clipDuration,
    cueEntry
   });
   return;
  }
  this.logCueEvent(cueEntry);
  if(Array.isArray(cue.seq)&&cue.seq.length)this.seq(cue.seq,cue.step||.05,cue.wave||'square',cue.volume||.02,cue.slide||0,cue.lpHz||3600,allowIdle);
  if(Array.isArray(cue.tones))for(const tone of cue.tones){
   this.play(tone.freq||440,tone.duration||.08,tone.wave||'square',tone.volume||.02,tone.slide||0,tone.detune||0,tone.lpHz||4200,tone.delay||0,allowIdle);
  }
  if(Array.isArray(cue.noise))for(const burst of cue.noise){
   this.noise(burst.duration||.08,burst.volume||.02,burst.hp||900,burst.delay||0,allowIdle);
  }
 },
 stopReferenceClips(predicate=null){
  const matches=typeof predicate==='function'?predicate:()=>true;
  const active=[...this.referenceActive];
  for(const source of active){
   if(!source||!matches(source))continue;
   try{source.stop(0);}catch{}
  }
 },
 stopCueNames(names=[]){
  const allow=new Set((names||[]).map(name=>String(name||'').trim()).filter(Boolean));
  if(!allow.size)return;
  this.stopReferenceClips(source=>allow.has(String(source?.__cue||'').trim()));
 },
 playReferenceClip(src='',opts={}){
  const clip=String(src||'').trim();
  if(!clip||(!(aud||opts.allowIdle)))return;
  const now=performance.now();
  const cooldown=Math.max(0,+opts.cooldownMs||0);
  const lastAt=+this.referenceCooldowns[clip]||0;
  if(cooldown&&lastAt&&(now-lastAt)<cooldown)return;
  this.referenceCooldowns[clip]=now;
  window.__platinumAudioDebug.reference.lastRequested=clip;
  this.logCueEvent(opts.cueEntry||window.__platinumAudioDebug.lastCue||null);
  const volume=Math.max(0,Math.min(1,Number.isFinite(+opts.volume)?+opts.volume:1));
  const clipStart=Math.max(0,Number.isFinite(+opts.clipStart)?+opts.clipStart:0);
  const clipDuration=Math.max(0,Number.isFinite(+opts.clipDuration)?+opts.clipDuration:0);
  this.loadReferenceBuffer(clip).then(buffer=>{
   if(!buffer||audioMuted)return;
   try{
      const A=AC();
    if(typeof A.resume==='function'&&A.state==='suspended')A.resume().catch(()=>{});
    const source=A.createBufferSource();
    const gain=A.createGain();
    gain.gain.value=volume;
    source.buffer=buffer;
    source.__cue=String(opts?.cueEntry?.cue||'').trim();
    source.__clip=clip;
    source.__clipStart=clipStart;
    source.__clipDuration=clipDuration;
      source.connect(gain);
      gain.connect(this.bus);
      if(clipDuration>0)source.start(0,Math.min(clipStart,Math.max(0,buffer.duration-.01)),Math.min(clipDuration,Math.max(.01,buffer.duration-clipStart)));
      else if(clipStart>0)source.start(0,Math.min(clipStart,Math.max(0,buffer.duration-.01)));
      else source.start();
      this.referenceActive.push(source);
      window.__platinumAudioDebug.reference.lastStarted=clip;
      window.__platinumAudioDebug.reference.activeCount=this.referenceActive.length;
      if(this.referenceActive.length>24)this.referenceActive.splice(0,this.referenceActive.length-24);
      const cleanup=()=>{
       this.referenceActive=this.referenceActive.filter(entry=>entry!==source);
       window.__platinumAudioDebug.reference.activeCount=this.referenceActive.length;
      };
      source.addEventListener('ended',cleanup,{once:true});
    }catch{}
  }).catch(()=>{});
 },
 loadReferenceBuffer(src=''){
  const clip=String(src||'').trim();
  if(!clip)return Promise.resolve(null);
  if(this.referenceBuffers[clip])return this.referenceBuffers[clip];
  const url=new URL(clip,location.href).toString();
  this.referenceBuffers[clip]=fetch(url)
   .then(response=>{
    if(!response.ok)throw new Error(`Failed to load reference audio: ${response.status}`);
   return response.arrayBuffer();
  })
  .then(bytes=>AC().decodeAudioData(bytes.slice(0)))
  .then(buffer=>{
   if(buffer)window.__platinumAudioDebug.reference.lastLoaded=clip;
   return buffer;
  })
  .catch(err=>{
    delete this.referenceBuffers[clip];
    window.__platinumAudioDebug.reference.lastError=`${clip}: ${String(err&&err.message||err)}`;
    recordSystemIssue('reference_audio_load_failed',`Reference audio failed to load for ${clip}`,{clip,error:String(err&&err.message||err)},{level:'warn'});
    return null;
  });
  return this.referenceBuffers[clip];
 },
 primeReferenceTheme(themeId=''){
  if(String(themeId||'').trim()!=='galaga-reference-assets')return;
  [
   'assets/reference-audio/galaga3-start.m4a',
   'assets/reference-audio/galaga3-ambience-convoy.m4a',
   'assets/reference-audio/galaga3-attack-charger.m4a',
   'assets/reference-audio/galaga3-tractor-beam.m4a',
   'assets/reference-audio/galaga3-fighter-captured.m4a',
   'assets/reference-audio/galaga3-death.m4a',
   'assets/reference-audio/galaga3-challenging-stage.m4a',
   'assets/reference-audio/galaga2-challenging-stage-results.m4a',
   'assets/reference-audio/galaga2-challenging-stage-perfect.m4a',
   'assets/reference-audio/galaga3-level-underscore.m4a',
   'assets/reference-audio/galaga-last-ship-destroyed-ambience.m4a'
  ].forEach(clip=>{this.loadReferenceBuffer(clip).catch(()=>{});});
 },
 play(f=440,d=.08,t='square',v=.03,sl=0,det=0,lpHz=4200,at=0,allowIdle=0){if(!(aud||allowIdle))return;const A=AC(),tm=A.currentTime+at,o=A.createOscillator(),o2=A.createOscillator(),g=A.createGain(),lp=A.createBiquadFilter();
  lp.type='lowpass';lp.frequency.value=lpHz;g.gain.setValueAtTime(.0001,tm);g.gain.exponentialRampToValueAtTime(v,tm+.008);g.gain.exponentialRampToValueAtTime(.0001,tm+d);
  o.type=t;o.frequency.setValueAtTime(f,tm);o.frequency.linearRampToValueAtTime(Math.max(25,f+sl),tm+d);
  o2.type=t==='square'?'triangle':'square';o2.frequency.setValueAtTime(f*(1+det),tm);o2.frequency.linearRampToValueAtTime(Math.max(25,(f+sl)*(1+det)),tm+d);
  o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(this.bus);o.start(tm);o2.start(tm);o.stop(tm+d+.03);o2.stop(tm+d+.03);
 },
 noise(d=.08,v=.02,hp=900,at=0,allowIdle=0){if(!(aud||allowIdle))return;const A=AC(),tm=A.currentTime+at,b=this.n||(this.n=(()=>{const n=A.sampleRate*.35,buf=A.createBuffer(1,n,A.sampleRate),ch=buf.getChannelData(0);for(let i=0;i<n;i++)ch[i]=auxRandUnit()*2-1;return buf})()),src=A.createBufferSource(),g=A.createGain(),f=A.createBiquadFilter();
  src.buffer=b;src.loop=true;f.type='highpass';f.frequency.value=hp;g.gain.setValueAtTime(v,tm);g.gain.exponentialRampToValueAtTime(.0001,tm+d);src.connect(f);f.connect(g);g.connect(this.bus);src.start(tm);src.stop(tm+d+.01);
 },
 seq(ns=[],step=.05,t='square',v=.02,sl=0,lpHz=3600,allowIdle=0){for(let i=0;i<ns.length;i++)if(ns[i]>0)this.play(ns[i],step,t,v,sl,0,lpHz,i*step*.92,allowIdle)},
 start(){this.playCue('gameStart',{phase:S.challenge?'challenge':'stage',challenge:!!S.challenge})},
 formationArrival(){this.playCue('formationArrival',{phase:S.challenge?'challenge':'stage',challenge:!!S.challenge})},
 shot(){this.playCue('playerShot',{phase:S.challenge?'challenge':'stage'})},
 enemyShot(){this.playCue('enemyShot',{phase:S.challenge?'challenge':'stage'})},
 hit(){this.playCue('enemyHit',{phase:S.challenge?'challenge':'stage'})},
 bossHit(){this.playCue('bossHit',{phase:S.challenge?'challenge':'stage'})},
 shipHit(){this.playCue('playerHit',{phase:S.challenge?'challenge':'stage'})},
 boom(k='bee'){this.playCue(k==='boss'||k==='rogue'?'bossBoom':'enemyBoom',{phase:S.challenge?'challenge':'stage'})},
 beam(){this.playCue('captureBeam',{phase:S.challenge?'challenge':'stage'})},
 captureSuccess(){this.playCue('captureSuccess',{phase:S.challenge?'challenge':'stage'})},
 rescue(){this.playCue('rescueJoin',{phase:S.challenge?'challenge':'stage'})},
 extend(){this.playCue('extendAward',{phase:'stage'})},
 over(){this.playCue('gameOver',{phase:'results'})},
 capturedFighterDestroyed(){this.playCue('capturedFighterDestroyed',{phase:S.challenge?'challenge':'stage'})},
 challengeResult(perfect=0){this.playCue(perfect?'challengePerfect':'challengeResults',{phase:'challenge',challenge:1})},
 march(i=0){this.playCue('stagePulse',{phase:S.challenge?'challenge':'stage',variant:i})},
 attackCharge(){this.playCue('attackCharge',{phase:S.challenge?'challenge':'stage'})},
 uiTick(){this.playCue('uiTick',{phase:(!started&&!S.attract)?'frontDoor':((typeof ATTRACT!=='undefined'&&ATTRACT.phase==='scores')?'wait':'stage')})},
 uiConfirm(){this.playCue('uiConfirm',{phase:(!started&&!S.attract)?'frontDoor':((typeof ATTRACT!=='undefined'&&ATTRACT.phase==='scores')?'wait':'stage')})},
 captureRetreat(){this.playCue('captureRetreat',{phase:S.challenge?'challenge':'stage'})},
 join(){this.playCue('rescueJoin',{phase:S.challenge?'challenge':'stage'})},
 highScore(rank=0){this.playCue(rank===1?'highScoreFirst':'highScoreOther',{phase:'results'})},
 transition(challenge=0){this.playCue(challenge?'challengeTransition':'stageTransition',{phase:challenge?'challenge':'stage',challenge:!!challenge})},
 attractEnter(phase='demo'){
  const frontDoorTheme=currentGamePack()?.frontDoor?.atmosphereTheme||'';
  this.playCue('attractEnter',{
   phase,
   allowIdle:1,
   atmosphereTheme:(phase==='wait'||phase==='demo')?frontDoorTheme:''
  });
 },
 attractPulse(phase='demo',variant=0){this.playCue('attractPulse',{phase,variant,allowIdle:1})}
};

function unlockAudioFromInteraction(){
 aud=1;
 try{
  AC();
  if(sfx.a&&typeof sfx.a.resume==='function'&&sfx.a.state==='suspended')sfx.a.resume().catch(()=>{});
 }catch{}
}

window.__auroraDocsPreview=window.__platinumDocsPreview={
 ready(){
  return typeof currentGamePackAudioCue==='function';
 },
 playCue(payload={}){
  const cue=String(payload.cue||'').trim();
  if(!cue)throw new Error('Missing cue for Aurora docs preview.');
  if(typeof installGamePack==='function'&&typeof currentGamePackKey==='function'&&currentGamePackKey()!=='aurora-galactica'){
   installGamePack('aurora-galactica',{persist:false});
  }
  unlockAudioFromInteraction();
  const phase=String(payload.phase||'stage').trim()||'stage';
  const atmosphereTheme=String(payload.atmosphereTheme||'').trim();
  const attractPhase=payload.attractPhase!==undefined
   ? String(payload.attractPhase||'')
   : phase==='wait'?'scores':phase==='demo'?'demo':'';
  const frontDoor=payload.frontDoor!==undefined?!!payload.frontDoor:phase==='frontDoor';
  const challenge=!!payload.challenge;
  const variant=Number.isFinite(+payload.variant)?(+payload.variant|0):0;
  const audioTheme=String(payload.audioTheme||'').trim();
  const pack=typeof currentGamePack==='function'?currentGamePack():null;
  const stagePresentation=payload.stagePresentation||(
   atmosphereTheme
    ? {
      atmosphereTheme,
      backgroundMode:typeof resolvePackAtmosphereBackground==='function'
       ? resolvePackAtmosphereBackground({pack,atmosphereTheme,phase:phase==='frontDoor'?'frontDoor':phase})
       : ''
     }
    : null
  );
  const resolvedAtmosphere=audioTheme
   ? Object.freeze({
      id:atmosphereTheme||stagePresentation?.atmosphereTheme||'classic-arcade',
      phase,
      audioTheme,
      backgroundMode:stagePresentation?.backgroundMode||'',
      group:'docs-preview'
     })
   : null;
  sfx.playCue(cue,{
   phase,
   atmosphereTheme,
   stagePresentation,
   resolvedAtmosphere,
   challenge,
   variant,
   frontDoor,
   attractPhase,
   allowIdle:1,
   docsPreview:1
  });
  return Object.freeze({
   cue,
   phase,
   atmosphereTheme:atmosphereTheme||stagePresentation?.atmosphereTheme||'',
   audioTheme:audioTheme||resolvedAtmosphere?.audioTheme||'',
   challenge,
   variant
  });
 }
};

const P={
 ship:{
  a:[[2,0],[3,0],[1,1],[2,1],[3,1],[4,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[1,3],[2,3],[3,3],[4,3],[2,4],[3,4]],
  b:[[2,1],[3,1],[2,2],[3,2],[2,3],[3,3]],
  c:[[0,2],[5,2],[1,1],[4,1]]
 },
 bee:{
  a:[[0,1],[6,1],[-1,2],[0,2],[6,2],[7,2],[0,3],[6,3],[1,4],[5,4]],
  b:[[2,0],[3,0],[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2],[4,2],[2,3],[3,3],[2,4],[3,4]],
  c:[[2,1],[3,1],[2,4],[3,4]]
 },
 but:{
  a:[[0,1],[6,1],[-1,2],[0,2],[6,2],[7,2],[0,3],[6,3],[1,4],[5,4]],
  b:[[2,0],[3,0],[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],[4,3],[2,4],[3,4]],
  c:[[2,1],[3,1],[2,3],[3,3]]
 },
 boss:{
  a:[[0,1],[1,1],[6,1],[7,1],[-1,2],[0,2],[1,2],[6,2],[7,2],[8,2],[0,3],[1,3],[6,3],[7,3],[1,4],[6,4]],
  b:[[2,0],[3,0],[4,0],[5,0],[2,1],[3,1],[4,1],[5,1],[2,2],[3,2],[4,2],[5,2],[2,3],[3,3],[4,3],[5,3],[3,4],[4,4]],
  c:[[2,0],[5,0],[3,2],[4,2]]
 },
 rogue:{
  a:[[0,1],[1,1],[6,1],[7,1],[-1,2],[0,2],[1,2],[6,2],[7,2],[8,2],[0,3],[1,3],[6,3],[7,3],[1,4],[6,4]],
  b:[[2,0],[3,0],[4,0],[5,0],[2,1],[3,1],[4,1],[5,1],[2,2],[3,2],[4,2],[5,2],[2,3],[3,3],[4,3],[5,3],[3,4],[4,4]],
  c:[[2,0],[5,0],[3,2],[4,2]]
 }
};

const S={score:0,best:+readPref(BEST_SCORE_KEY)||0,lives:2,stage:1,shake:0,st:[],neb:[],e:[],pb:[],eb:[],fx:[],cap:null,banner:0,bannerTxt:'',bannerMode:'',bannerSub:'',fireCD:0,t:null,rogue:0,attract:0,extendFirst:0,extendRecurring:0,nextExtendScore:0,extendAwards:0,extendFlashT:0,extendFlashShips:0,
 p:{x:0,y:0,vx:0,s:440,accel:12,decel:18,manualTapSpeed:248,manualTapWindow:.072,manualReverseWindow:.11,cd:0,inv:0,dual:0,captured:0,returning:0,pending:0,spawn:0,capBoss:null,capT:0,hNoShotT:0,hDebugT:0,demoTargetId:null,demoTargetT:0},att:0,challenge:0,ch:{hits:0,total:0,done:0},seq:0,seqT:0,startCueT:0,formationCueT:0,audioPulseHoldT:0,alertT:0,alertTxt:'',ultra:1,recoverT:0,attackGapT:0,nextStageT:0,postChallengeT:0,pendingStage:0,transitionMode:'',lastChallengeClearT:null,challengeTransitionStallLogged:0,transitionCueT:0,transitionCueKind:0,challengeResultCueT:0,challengeResultPerfect:0,profile:{name:'classic',beeFamily:'classic',butFamily:'classic',bossFamily:'classic',challengeFamily:'classic'},stagePresentation:null,
 scriptMode:0,scriptT:0,scriptI:0,scriptShotI:0,scriptShotT:1.4,forceChallenge:0,liveCount:40,stageClock:0,simT:0,squadSeq:0,captureCountStage:0,lastCaptureStartT:null,lastFighterCapturedT:null,sequenceT:0,sequenceMode:'',stats:{shots:0,hits:0}};

const DEFAULT_STARFIELD_PROFILE=Object.freeze({
 id:'classic-arcade-stars',
 count:108,
 sizeMin:.95,
 sizeMax:1.55,
 alphaMin:.52,
 alphaMax:.96,
 twinkleMin:.88,
 twinkleAmp:.2,
 speedMin:9,
 speedMax:23,
 palette:Object.freeze(['#ffffff','#d8ecff','#8bb8ff','#1e52ff','#fff36a','#ffb21f','#9cff71','#ff3b33','#db38ff','#3fe7ff','#d7a4ff'])
});

function resolvedStarfieldProfile(opts={}){
 const atmosphere=typeof resolvedVisualAtmosphere==='function'
  ? resolvedVisualAtmosphere({
   stagePresentation:opts.stagePresentation||S.stagePresentation,
   atmosphereTheme:opts.atmosphereTheme||'',
   phase:opts.phase||'',
   challenge:opts.challenge!==undefined?!!opts.challenge:!!S.challenge,
   frontDoor:opts.frontDoor!==undefined?!!opts.frontDoor:(!started&&!S.attract),
   attractPhase:opts.attractPhase!==undefined?opts.attractPhase:((typeof ATTRACT!=='undefined'&&ATTRACT.phase)||'')
  })
  : null;
 const graphics=currentGraphicsOverrides();
 const intensityScale=sanitizeStarfieldMultiplier(graphics.starfieldIntensity,1);
 const speedScale=sanitizeStarfieldMultiplier(graphics.starfieldSpeed,1);
 const profile=Object.assign({},DEFAULT_STARFIELD_PROFILE,atmosphere?.starfield||{});
 profile.alphaMin=Math.min(1,Math.max(.08,profile.alphaMin*intensityScale));
 profile.alphaMax=Math.min(1,Math.max(profile.alphaMin,profile.alphaMax*intensityScale));
 profile.speedMin=Math.max(2,profile.speedMin*speedScale);
 profile.speedMax=Math.max(profile.speedMin,profile.speedMax*speedScale);
 profile.intensityScale=intensityScale;
 profile.speedScale=speedScale;
 return profile;
}

function syncStarfieldProfile(opts={}){
 const profile=resolvedStarfieldProfile(opts);
 const sig=JSON.stringify({
  id:profile.id||'classic-arcade-stars',
  count:+(profile.count||DEFAULT_STARFIELD_PROFILE.count),
  sizeMin:+(profile.sizeMin||DEFAULT_STARFIELD_PROFILE.sizeMin),
  sizeMax:+(profile.sizeMax||DEFAULT_STARFIELD_PROFILE.sizeMax),
  alphaMin:+(profile.alphaMin||DEFAULT_STARFIELD_PROFILE.alphaMin),
  alphaMax:+(profile.alphaMax||DEFAULT_STARFIELD_PROFILE.alphaMax),
  twinkleMin:+(profile.twinkleMin||DEFAULT_STARFIELD_PROFILE.twinkleMin),
  twinkleAmp:+(profile.twinkleAmp||DEFAULT_STARFIELD_PROFILE.twinkleAmp),
  speedMin:+(profile.speedMin||DEFAULT_STARFIELD_PROFILE.speedMin),
  speedMax:+(profile.speedMax||DEFAULT_STARFIELD_PROFILE.speedMax),
  intensityScale:+(profile.intensityScale||1),
  speedScale:+(profile.speedScale||1),
  palette:[...(profile.palette||DEFAULT_STARFIELD_PROFILE.palette)]
 });
 if(S.starfieldSig===sig&&S.st.length===profile.count)return profile;
 S.starfieldSig=sig;
 S.st.length=0;
 const palette=(profile.palette&&profile.palette.length)?profile.palette:DEFAULT_STARFIELD_PROFILE.palette;
 const count=Math.max(24,+profile.count||DEFAULT_STARFIELD_PROFILE.count);
 const sizeMin=Math.max(.5,+profile.sizeMin||DEFAULT_STARFIELD_PROFILE.sizeMin);
 const sizeMax=Math.max(sizeMin,+profile.sizeMax||DEFAULT_STARFIELD_PROFILE.sizeMax);
 const alphaMin=Math.max(.08,Math.min(.98,+profile.alphaMin||DEFAULT_STARFIELD_PROFILE.alphaMin));
 const alphaMax=Math.max(alphaMin,Math.min(1,+profile.alphaMax||DEFAULT_STARFIELD_PROFILE.alphaMax));
 const twinkleMin=Math.max(.2,Math.min(1,+profile.twinkleMin||DEFAULT_STARFIELD_PROFILE.twinkleMin));
 const twinkleAmp=Math.max(0,Math.min(.5,+profile.twinkleAmp||DEFAULT_STARFIELD_PROFILE.twinkleAmp));
 const speedMin=Math.max(2,+profile.speedMin||DEFAULT_STARFIELD_PROFILE.speedMin);
 const speedMax=Math.max(speedMin,+profile.speedMax||DEFAULT_STARFIELD_PROFILE.speedMax);
 for(let i=0;i<count;i++){
  S.st.push({
   x:auxRnd(PLAY_W),
   y:auxRnd(PLAY_H),
   s:auxRnd(sizeMax,sizeMin),
   c:palette[(auxRandUnit()*palette.length)|0],
   tw:auxRnd(6.28),
   alpha:auxRnd(alphaMax,alphaMin),
   twMin:auxRnd(Math.min(1,twinkleMin+.04),Math.max(.18,twinkleMin-.04)),
   twAmp:auxRnd(Math.min(.4,twinkleAmp+.04),Math.max(.04,twinkleAmp-.04)),
   vy:auxRnd(speedMax,speedMin)
  });
 }
 return profile;
}

const isChallengeStage=s=>currentGamePackIsChallengeStage(s);
const CHALLENGE_STAGE_TUNE={shotCap:0,attackCap:0,diveRate:0,coolA:99,coolB:99,globalA:99,globalB:99,capChance:0,diveShotRate:0,aimMul:.08,aimClamp:10,aimRnd:1,bulletVy:170,bulletVyStage:2};
const STAGE_RULES={
 opening:{maxStage:1,tune:{shotCap:1,attackCap:1,diveRate:.34,coolA:7.6,coolB:5.7,globalA:3.4,globalB:2.65,capChance:.11,diveShotRate:.24,aimMul:.08,aimClamp:11,aimRnd:1.4,bulletVy:154,bulletVyStage:2},flight:{scriptedDiveVy:80,randomDiveVy:82,diveAccel:150}},
 stage2:{maxStage:2,tune:{shotCap:1,attackCap:1,diveRate:.56,coolA:6.2,coolB:4.2,globalA:2.2,globalB:1.62,capChance:.12,diveShotRate:.46,aimMul:.1,aimClamp:14,aimRnd:1.8,bulletVy:169,bulletVyStage:3},flight:{scriptedDiveVy:86,randomDiveVy:88,diveAccel:162}},
 stage3:{maxStage:3,tune:{shotCap:2,attackCap:2,diveRate:.82,coolA:5.3,coolB:3.2,globalA:1.8,globalB:1.28,capChance:.2,diveShotRate:.58,aimMul:.11,aimClamp:15,aimRnd:2.2,bulletVy:174,bulletVyStage:3},flight:{scriptedDiveVy:92,randomDiveVy:88,diveAccel:162}},
 stage4:{maxStage:4,tune:{shotCap:1,attackCap:1,diveRate:.49,coolA:7.2,coolB:4.9,globalA:2.82,globalB:1.98,capChance:.14,diveShotRate:.28,aimMul:.11,aimClamp:15,aimRnd:2,bulletVy:166,bulletVyStage:3},flight:{scriptedDiveVy:92,randomDiveVy:88,diveAccel:172}},
 stage5:{maxStage:5,tune:{shotCap:1,attackCap:2,diveRate:.67,coolA:6.5,coolB:4.2,globalA:2.24,globalB:1.56,capChance:.17,diveShotRate:.42,aimMul:.12,aimClamp:16,aimRnd:2.2,bulletVy:171,bulletVyStage:3},flight:{scriptedDiveVy:92,randomDiveVy:94,diveAccel:172}},
 endless:{maxStage:Infinity,tune:s=>({shotCap:2+(s>8),attackCap:2+(s>8)+(s>12),diveRate:.9+s*.035,coolA:4.8,coolB:2.5,globalA:1.34,globalB:.96,capChance:.24,diveShotRate:.66,aimMul:.16,aimClamp:20,aimRnd:3.3,bulletVy:181,bulletVyStage:4}),flight:{scriptedDiveVy:92,randomDiveVy:94,diveAccel:172}}
};
function stageRuleSet(stage){
 for(const key of Object.keys(STAGE_RULES)){
  const rule=STAGE_RULES[key];
  if(stage<=rule.maxStage)return rule;
 }
 return STAGE_RULES.endless;
}
const stageTune=(s,ch)=>{
 if(ch)return CHALLENGE_STAGE_TUNE;
 const tune=stageRuleSet(s).tune;
 return typeof tune==='function'?tune(s):tune;
};
const stageFlightTune=s=>stageRuleSet(s).flight;
function challengeStagesBefore(stage){
 const n=Math.max(1, stage|0);
 const cadence=currentGamePack()?.stageCadence||{};
 const first=Math.max(1, cadence.challengeFirstStage||3);
 const every=Math.max(1, cadence.challengeEvery||4);
 if(n<=first)return 0;
 return 1+Math.floor((n-1-first)/every);
}
function displayStageNumber(stage,challenge=isChallengeStage(stage)){
 const n=Math.max(1, stage|0);
 return Math.max(1, n-challengeStagesBefore(n)-(challenge?1:0));
}
function formatDisplayedStage(stage,challenge=isChallengeStage(stage),pad=2){
 return String(displayStageNumber(stage,challenge)).padStart(pad,'0');
}
const shotCap=()=>S.t?S.t.shotCap:0;
const recTime=()=>{
 if(!REC)return 0;
 if(isHarnessClockControlled()||useDeterministicHarnessClock()){
  return +(+S.simT||0).toFixed(3);
 }
 return +((performance.now()-REC.t0)/1000).toFixed(3);
};
function useDeterministicHarnessClock(){
 return !!(window.__platinumHarnessPersona||window.__auroraHarnessPersona);
}
function advanceGameplayClock(dt){
 S.simT=(Number.isFinite(S.simT)?S.simT:0)+dt;
 if(useDeterministicHarnessClock())return S.simT;
 return performance.now()/1000;
}
function resetHarnessFrameClock(){
 harnessFrameAccum=0;
}
function setHarnessClockControlled(enabled){
 harnessClockControlled=enabled?1:0;
 if(!harnessClockControlled)resetHarnessFrameClock();
}
function isHarnessClockControlled(){
 return !!harnessClockControlled;
}
const playLane=x=>cl(Math.round((cl(+x||0,0,PLAY_W)/(PLAY_W||1))*9),0,9);
const snapshot=()=>({gameKey:typeof currentGamePack==='function'?currentGamePack()?.metadata?.gameKey||'aurora-galactica':'aurora-galactica',started:!!started,paused:!!paused,attract:{active:!!ATTRACT.active,phase:ATTRACT.phase||''},stage:S.stage,score:S.score,lives:Math.max(0,S.lives+1),challenge:!!S.challenge,scriptMode:!!S.scriptMode,profile:S.profile?.name||'classic',theme:S.stagePresentation?.id||'classic',simT:+(+S.simT||0).toFixed(3),stageClock:+(+S.stageClock||0).toFixed(3),rngState:RNG_SEED?(RNG_STATE>>>0):0,player:{x:+S.p.x.toFixed(2),y:+S.p.y.toFixed(2),vx:+(+S.p.vx||0).toFixed(2),cd:+(+S.p.cd||0).toFixed(3),inv:+(+S.p.inv||0).toFixed(3),spawn:+(+S.p.spawn||0).toFixed(3),dual:!!S.p.dual,captured:!!S.p.captured,pending:!!S.p.pending,hNoShotT:+(+S.p.hNoShotT||0).toFixed(3),hDebugT:+(+S.p.hDebugT||0).toFixed(3),demoTargetId:S.p.demoTargetId??null,demoTargetT:+(+S.p.demoTargetT||0).toFixed(3)},timers:{fireCD:+(+S.fireCD||0).toFixed(3),recoverT:+(+S.recoverT||0).toFixed(3),attackGapT:+(+S.attackGapT||0).toFixed(3),nextStageT:+(+S.nextStageT||0).toFixed(3),postChallengeT:+(+S.postChallengeT||0).toFixed(3),sequenceT:+(+S.sequenceT||0).toFixed(3)},counts:{enemies:S.e.filter(e=>e.hp>0).length,playerBullets:S.pb.length,enemyBullets:S.eb.length,effects:S.fx.length,attackers:S.att}});
const enemyRef=e=>e?{id:e.id,enemyType:e.t,enemyFamily:e.fam||'classic',column:e.c,row:e.r,lane:playLane(e.x),dive:e.dive,carry:!!e.carry}:null;
function loadScoreboard(){
 try{
  return JSON.parse(readPref(SCOREBOARD_KEY)||'[]').filter(x=>x&&Number.isFinite(+x.score)).map(x=>({id:String(x.id||''),initials:String(x.initials||'---').toUpperCase().replace(/[^A-Z]/g,'').padEnd(3,'-').slice(0,3),score:+x.score|0,stage:+x.stage|0,at:String(x.at||''),build:String(x.build||'')})).sort((a,b)=>b.score-a.score).slice(0,10);
 }catch{return[]}
}
function saveScoreboard(list){
 writePref(SCOREBOARD_KEY,JSON.stringify(list.slice(0,10)));
}
function formatScore(v){return String(Math.max(0,v|0)).padStart(6,'0')}
function sanitizeInitials(txt=''){return String(txt).toUpperCase().replace(/[^A-Z]/g,'').slice(0,3)}
function cycleInitial(ch='A',dir=1){
 const code=((String(ch||'A').charCodeAt(0)-65+dir+26)%26)+65;
 return String.fromCharCode(code);
}
function hitMissRatio(stats){
 if(!stats?.shots)return 0;
 return Math.round((stats.hits/stats.shots)*100);
}
function buildResultsHtml(stats,score,stage,challenge=isChallengeStage(stage)){
 const shots=Math.max(0,stats?.shots|0),hits=Math.max(0,stats?.hits|0),ratio=hitMissRatio(stats);
 return `<span class="gameOverTitle">GAME OVER</span><span class="gameOverSub">RESULTS</span><span class="resultsTable"><span class="resultsLabel">SHOTS FIRED</span><span class="resultsValue">${shots}</span><span class="resultsLabel">NUMBER OF HITS</span><span class="resultsValue">${hits}</span><span class="resultsLabel">HIT-MISS RATIO</span><span class="resultsValue">${ratio}%</span><span class="resultsLabel">SCORE</span><span class="resultsValue">${formatScore(score)}</span><span class="resultsLabel">STAGE</span><span class="resultsValue">${formatDisplayedStage(stage,challenge)}</span></span><span class="gameOverFoot blinkPrompt"><span class="k">Enter</span> to continue</span>`;
}
function recordScore(score,stage,initials='YOU'){
 const entry={id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,initials:sanitizeInitials(initials||'YOU').padEnd(3,'-').slice(0,3),score:score|0,stage:stage|0,at:new Date().toISOString(),build:BUILD};
 const board=loadScoreboard();
 board.push(entry);
 board.sort((a,b)=>b.score-a.score||b.stage-a.stage||a.at.localeCompare(b.at));
 const top=board.slice(0,10);
 saveScoreboard(top);
 S.best=top[0]?.score||0;
 writePref(BEST_SCORE_KEY,String(S.best));
 return{entry,board:top,rank:top.findIndex(x=>x.id===entry.id)+1};
}
function saveGameOverInitials(){
 if(!gameOverState?.entryId)return;
 const board=loadScoreboard();
 const row=board.find(x=>x.id===gameOverState.entryId);
  if(row){
  row.initials=sanitizeInitials(gameOverState.initials.join('')).padEnd(3,'-');
  saveScoreboard(board);
 }
}
function buildGameOverHtmlFromState(){
 if(!gameOverState)return '';
 if(gameOverState.phase==='results')return buildResultsHtml(gameOverState.stats,gameOverState.score,gameOverState.stage,gameOverState.challenge);
 const board=leaderboardRowsForView();
 const filled=(board.length?board:Array.from({length:10},(_,i)=>({initials:'---',score:0,stage:0,idx:i+1})));
 const rows=filled.map((row,i)=>`<span class="scoreRank${row.id===gameOverState.entryId?' scoreHot':''}">${String((row.idx||i+1)).padStart(2,'0')}</span><span class="scoreName${row.id===gameOverState.entryId?' scoreHot':''}">${row.initials}</span><span class="scoreValue${row.id===gameOverState.entryId?' scoreHot':''}">${formatScore(row.score)}</span><span class="scoreStage${row.id===gameOverState.entryId?' scoreHot':''}">${String(row.stage).padStart(2,' ')}</span>`).join('');
 const rankTxt=gameOverState.rank?`YOUR RANK ${String(gameOverState.rank).padStart(2,'0')}`:'SCORE NOT IN TOP 10';
 const boardTitle=currentLeaderboardTitle();
 let entryHtml='';
 let footHtml='<span class="gameOverFoot blinkPrompt"><span class="k">Enter</span> to play again</span>';
 if(gameOverState.editing){
  const shown=gameOverState.initials.map((ch,i)=>`<span class="entrySlot${i===gameOverState.cursor?' entryCursor':''}">${ch||'_'}</span>`).join('');
  entryHtml=`<span class="gameOverEntry"><span class="entryLabel">ENTER INITIALS</span><span class="entrySlots">${shown}</span></span>`;
  footHtml='<span class="gameOverFoot"><span class="gameOverFootLine"><span class="k">Left/Right</span> select, <span class="k">Up/Down</span> change</span><span class="gameOverFootLine">type letters or press <span class="k">Enter</span> to save</span></span>';
 }
 return `<span class="gameOverTitle">GAME OVER</span><span class="gameOverSub">${boardTitle}</span><span class="gameOverMeta">${rankTxt}</span>${entryHtml}<span class="scoreTable"><span class="scoreHead scoreRank">NO</span><span class="scoreHead scoreName">ID</span><span class="scoreHead scoreValue">SCORE</span><span class="scoreHead scoreStage">STG</span>${rows}</span>${footHtml}`;
}
function buildAttractScoreboardHtml(){
 const activeView=(ATTRACT.phase==='scores'&&ATTRACT.active)?(ATTRACT.scoreViews[ATTRACT.scoreViewIndex]||'all'):LEADERBOARD.view;
 const board=leaderboardRowsForView(activeView);
 const boardTitle=currentLeaderboardTitle(activeView);
 const rows=(board.length?board:Array.from({length:10},(_,i)=>({initials:'---',score:0,stage:0,idx:i+1}))).map((row,i)=>`<span class="scoreRank">${String((row.idx||i+1)).padStart(2,'0')}</span><span class="scoreName">${row.initials}</span><span class="scoreValue">${formatScore(row.score)}</span><span class="scoreStage">${String(row.stage).padStart(2,' ')}</span>`).join('');
 return `<span class="gameOverTitle">HIGH SCORES</span><span class="gameOverSub">${boardTitle}</span><span class="scoreTable"><span class="scoreHead scoreRank">NO</span><span class="scoreHead scoreName">ID</span><span class="scoreHead scoreValue">SCORE</span><span class="scoreHead scoreStage">STG</span>${rows}</span><span class="gameOverFoot blinkPrompt"><span class="k">Enter</span> to start</span>`;
}
function buildGameOverState(score,stage,challenge=0){
 const pilotInitials=(typeof preferredInitialsFromUser==='function'?preferredInitialsFromUser():'').padEnd(3,'-').slice(0,3);
 const lockedPilotInitials=typeof LEADERBOARD!=='undefined'&&LEADERBOARD?.user&&pilotInitials&&pilotInitials!=='---';
 const shownStage=displayStageNumber(stage,challenge);
 const res=recordScore(score,shownStage,lockedPilotInitials?pilotInitials:'YOU');
 const editing=!!res.rank&&!lockedPilotInitials;
 return{
  entryId:res.entry.id,
  rank:res.rank,
  phase:'results',
  score:score|0,
  stage:stage|0,
  challenge:!!challenge,
  shownStage,
  stats:{shots:S.stats.shots|0,hits:S.stats.hits|0},
  initials:(lockedPilotInitials?pilotInitials:'YOU').split('').slice(0,3),
  cursor:0,
  editing,
  remoteSubmitted:0
 };
}
function resetAttractBackdrop(){
 S.pb.length=0;S.eb.length=0;S.fx.length=0;S.cap=null;S.alertT=0;S.alertTxt='';S.banner=0;S.bannerTxt='';S.bannerMode='';S.bannerSub='';
 for(const e of S.e)e.hp=0;
 S.p.x=PLAY_W/2;S.p.y=PLAY_H-VIS.playerBottom;S.p.vx=0;S.p.cd=0;S.p.inv=0;S.p.dual=0;S.p.captured=0;S.p.returning=0;S.p.pending=0;S.p.spawn=0;S.p.capBoss=null;S.p.capT=0;S.p.hNoShotT=0;S.p.hDebugT=0;S.p.demoTargetId=null;S.p.demoTargetT=0;
}
function enterAttractScores(){
 ATTRACT.active=1;
 ATTRACT.phase='scores';
 ATTRACT.scoreViews=typeof attractLeaderboardViews==='function'?attractLeaderboardViews():['all','validated'];
 ATTRACT.scoreViewIndex=0;
 ATTRACT.scoreViewDwell=4.5;
 ATTRACT.scoreViewTimer=ATTRACT.scoreViewDwell;
 ATTRACT.audioPulseTimer=.95;
 ATTRACT.audioPulseIndex=0;
 ATTRACT.timer=Math.max(ATTRACT.scoreViewDwell*ATTRACT.scoreViews.length,9);
 S.attract=1;
 resetAttractBackdrop();
 if(typeof prefetchLeaderboards==='function')prefetchLeaderboards(1);
 sfx.attractEnter('wait');
 logEvent('attract_scores',{cycle:ATTRACT.cycle});
}
function startAttractDemo(opts={}){
 const record=opts.record!==false;
 stopRunRecording();
 autoExportedSessionId='';
 if(typeof clearRuntimeLoopFault==='function')clearRuntimeLoopFault();
 resetSession('attract_demo');
 resetActiveInputState('attract_demo');
 gameOverHtml='';gameOverState=null;
 aud=0;
 started=0;paused=0;
 syncPauseUi();
 ATTRACT.active=1;
 ATTRACT.phase='demo';
 ATTRACT.timer=9.5;
 ATTRACT.scoreViews=['all','validated'];
 ATTRACT.scoreViewIndex=0;
 ATTRACT.scoreViewTimer=0;
 ATTRACT.audioPulseTimer=.8;
 ATTRACT.audioPulseIndex=0;
 ATTRACT.cycle++;
 Object.assign(S,{score:0,lives:2,stage:1,shake:0,banner:0,bannerTxt:'',bannerMode:'',bannerSub:'',seq:0,seqT:.45,startCueT:0,formationCueT:0,audioPulseHoldT:0,rogue:0,alertT:0,alertTxt:'',forceChallenge:0,liveCount:40,recoverT:0,attackGapT:0,nextStageT:0,transitionMode:'',transitionCueT:0,transitionCueKind:0,challengeResultCueT:0,challengeResultPerfect:0,sequenceT:0,sequenceMode:'',attract:1,simT:0,extendFirst:0,extendRecurring:0,nextExtendScore:0,extendAwards:0,extendFlashT:0,extendFlashShips:0});
 resetHarnessFrameClock();
 S.stats={shots:0,hits:0};
 Object.assign(S.p,{dual:0,captured:0,returning:0,pending:0,spawn:0,cd:0,capBoss:null,capT:0,inv:0,vx:0,hNoShotT:0,hDebugT:0,demoTargetId:null,demoTargetT:0});
 logEvent('attract_demo_start',{cycle:ATTRACT.cycle,record});
 sfx.attractEnter('demo');
 if(record)startRunRecording();
 spawnStage();
}
window.startAttractDemo=startAttractDemo;
function stopAttractLoop(){
 ATTRACT.active=0;
 ATTRACT.phase='';
 ATTRACT.timer=0;
 ATTRACT.scoreViews=['all','validated'];
 ATTRACT.scoreViewIndex=0;
 ATTRACT.scoreViewTimer=0;
 ATTRACT.audioPulseTimer=0;
 ATTRACT.audioPulseIndex=0;
 S.attract=0;
 syncPauseUi();
}
window.enterAttractScores=enterAttractScores;
const initialBoard=loadScoreboard();
if((initialBoard[0]?.score||0)>S.best){
 S.best=initialBoard[0].score;
 writePref(BEST_SCORE_KEY,String(S.best));
}
const DEFAULT_TEST_CFG=Object.freeze({
 stage:1,
 ships:3,
 extendFirst:20000,
 extendRecurring:70000,
 challenge:false,
 audioTheme:'auto',
 graphicsTheme:'auto',
 starfieldIntensity:1,
 starfieldSpeed:1
});
let testCfgCache=null;
function sanitizeAudioThemeValue(value=''){
 const next=String(value||'').trim()||'auto';
 return ['auto','aurora-application','galaga-original-reference','galaga-reference-assets'].includes(next)?next:'auto';
}
function sanitizeGraphicsThemeValue(value=''){
 const next=String(value||'').trim()||'auto';
 if(next==='auto')return 'auto';
 if(typeof currentGamePackAtmosphereTheme!=='function')return 'auto';
 const resolved=currentGamePackAtmosphereTheme(next);
 return resolved?.id===next?next:'auto';
}
function sanitizeStarfieldMultiplier(value,fallback=1){
 const next=+value;
 if(!Number.isFinite(next))return fallback;
 return Math.round(cl(next,.5,1.8)*100)/100;
}
function applyTestCfgToControls(cfg){
 if(testStage)testStage.value=cfg.stage;
 if(testShips)testShips.value=cfg.ships;
 if(testExtendFirst)testExtendFirst.value=cfg.extendFirst;
 if(testExtendRecurring)testExtendRecurring.value=cfg.extendRecurring;
 if(testChallenge)testChallenge.checked=cfg.challenge;
 if(audioTheme)audioTheme.value=cfg.audioTheme;
 if(graphicsTheme)graphicsTheme.value=cfg.graphicsTheme;
 if(graphicsStarfieldIntensity)graphicsStarfieldIntensity.value=String(cfg.starfieldIntensity);
 if(graphicsStarfieldSpeed)graphicsStarfieldSpeed.value=String(cfg.starfieldSpeed);
}
function currentAudioOverrides(){
 const cfg=testCfgCache||loadTestCfg();
 return{
  audioTheme:sanitizeAudioThemeValue(cfg.audioTheme)
 };
}
function usesReferenceTimingModel(){
 return typeof currentGamePackReferenceTiming==='function';
}
function usesRuntimeGalagaReferenceAudio(){
 return currentAudioOverrides().audioTheme==='galaga-reference-assets';
}
const REFERENCE_TRANSITION_SENSITIVE_CUES=Object.freeze([
 'stagePulse',
 'attackCharge',
 'enemyShot',
 'enemyHit',
 'enemyBoom',
 'bossHit',
 'bossBoom',
 'stageTransition',
 'challengeTransition',
 'challengeResults',
 'challengePerfect'
]);
const REFERENCE_BOSS_MOMENT_CUES=Object.freeze([
 'stagePulse',
 'attackCharge',
 'enemyShot',
 'enemyHit',
 'enemyBoom',
 'bossHit'
]);
function stopReferenceCueSet(names=[]){
 if(!usesRuntimeGalagaReferenceAudio()||typeof sfx==='undefined'||typeof sfx.stopCueNames!=='function')return;
 sfx.stopCueNames(names);
}
function holdReferenceGameplayCadence(seconds=0){
 S.audioPulseHoldT=Math.max(+S.audioPulseHoldT||0,Math.max(0,+seconds||0));
}
function clearReferenceTransitionCueWindow(extra=[]){
 stopReferenceCueSet([...REFERENCE_TRANSITION_SENSITIVE_CUES,...(extra||[])]);
}
function clearReferenceBossMomentCueWindow(){
 stopReferenceCueSet(REFERENCE_BOSS_MOMENT_CUES);
 const timing=typeof currentGamePackReferenceTiming==='function'?currentGamePackReferenceTiming('bossMoments'):null;
 holdReferenceGameplayCadence(timing?.deathCadenceHold??.72);
}
function resolvedAudioAtmosphere(opts={}){
 const atmosphere=typeof currentGamePackResolvedAtmosphere==='function'
  ? currentGamePackResolvedAtmosphere(opts)
  : Object.freeze({id:'classic-arcade',audioTheme:'classic-arcade',phase:String(opts.phase||'stage').trim()||'stage'});
 const selection=currentAudioOverrides().audioTheme;
 if(selection==='auto'||selection==='aurora-application')return atmosphere;
 const phase=String(atmosphere?.phase||opts.phase||'stage').trim()||'stage';
 const useGalagaReference=phase==='demo'||phase==='stage'||phase==='challenge'||phase==='results';
 const overrideTheme=selection==='galaga-reference-assets'
  ? 'galaga-reference-assets'
  : 'galaga-original-reference';
 return Object.freeze(Object.assign({},atmosphere,{
  audioTheme:useGalagaReference?overrideTheme:(atmosphere?.audioTheme||'aurora-crown'),
  audioThemeOverride:selection
 }));
}
function currentGraphicsOverrides(){
 const cfg=testCfgCache||loadTestCfg();
 return{
  graphicsTheme:sanitizeGraphicsThemeValue(cfg.graphicsTheme),
  starfieldIntensity:sanitizeStarfieldMultiplier(cfg.starfieldIntensity,1),
  starfieldSpeed:sanitizeStarfieldMultiplier(cfg.starfieldSpeed,1)
 };
}
function resolvedVisualAtmosphere(opts={}){
 const atmosphere=typeof currentGamePackResolvedAtmosphere==='function'
  ? currentGamePackResolvedAtmosphere(opts)
  : null;
 const graphics=currentGraphicsOverrides();
 if(graphics.graphicsTheme==='auto'||typeof currentGamePackAtmosphereTheme!=='function')return atmosphere;
 const theme=currentGamePackAtmosphereTheme(graphics.graphicsTheme);
 const pack=typeof currentGamePack==='function'?currentGamePack():null;
 const phase=String(
  atmosphere?.phase
  || opts.phase
  || (opts.frontDoor?'frontDoor':'')
  || (opts.challenge?'challenge':'')
  || (opts.attractPhase==='scores'?'wait':'')
  || (opts.attractPhase==='demo'?'demo':'')
  || 'stage'
 ).trim()||'stage';
 return Object.freeze({
  id:theme.id,
  label:theme.label||theme.id,
  group:theme.group||'default',
  phase,
  backgroundMode:typeof resolvePackAtmosphereBackground==='function'
   ? resolvePackAtmosphereBackground({pack,atmosphereTheme:theme.id,phase})
   : atmosphere?.backgroundMode||'classic-stars',
  audioTheme:atmosphere?.audioTheme||theme.audioTheme||'classic-arcade',
  starfield:theme.starfield||atmosphere?.starfield||null,
  baseThemeId:atmosphere?.id||'',
  overrideThemeId:theme.id
 });
}
function loadTestCfg(){
 if(testCfgCache)return Object.assign({},testCfgCache);
 try{
  const raw=JSON.parse(readPref(TEST_PREF_KEY)||'{}');
  const extendFirst=Number.isFinite(+raw.extendFirst)?cl(Math.max(0,+raw.extendFirst),0,999999)|0:20000;
  const extendRecurring=Number.isFinite(+raw.extendRecurring)?cl(Math.max(0,+raw.extendRecurring),0,999999)|0:70000;
  testCfgCache={
   stage:cl(+raw.stage||1,1,99)|0,
   ships:cl(+raw.ships||3,1,9)|0,
   extendFirst,
   extendRecurring,
   challenge:!!raw.challenge,
   audioTheme:sanitizeAudioThemeValue(raw.audioTheme),
   graphicsTheme:sanitizeGraphicsThemeValue(raw.graphicsTheme),
   starfieldIntensity:sanitizeStarfieldMultiplier(raw.starfieldIntensity,1),
   starfieldSpeed:sanitizeStarfieldMultiplier(raw.starfieldSpeed,1)
  };
 }catch{
  testCfgCache=Object.assign({},DEFAULT_TEST_CFG);
 }
 return Object.assign({},testCfgCache);
}
function saveTestCfg(){
 const cfg={
  stage:cl(+testStage.value||1,1,99)|0,
  ships:cl(+testShips.value||3,1,9)|0,
  extendFirst:cl(Math.max(0,+testExtendFirst.value||0),0,999999)|0,
  extendRecurring:cl(Math.max(0,+testExtendRecurring.value||0),0,999999)|0,
  challenge:!!testChallenge.checked,
  audioTheme:sanitizeAudioThemeValue(audioTheme?.value||'auto'),
  graphicsTheme:sanitizeGraphicsThemeValue(graphicsTheme?.value||'auto'),
  starfieldIntensity:sanitizeStarfieldMultiplier(graphicsStarfieldIntensity?.value,1),
  starfieldSpeed:sanitizeStarfieldMultiplier(graphicsStarfieldSpeed?.value,1)
 };
 testCfgCache=cfg;
 applyTestCfgToControls(cfg);
 writePref(TEST_PREF_KEY,JSON.stringify(cfg));
 if(typeof sfx!=='undefined'&&typeof sfx.primeReferenceTheme==='function')sfx.primeReferenceTheme(cfg.audioTheme);
 return Object.assign({},cfg);
}
function syncSettingsUi(){
 settingsPanel.classList.toggle('open',settingsOpen);
 settingsPanel.setAttribute('aria-hidden',settingsOpen?'false':'true');
 settingsBtn.classList.toggle('open',settingsOpen);
 settingsBtn.setAttribute('aria-expanded',settingsOpen?'true':'false');
 if(settingsChannel)settingsChannel.textContent=`Lane ${String(BUILD_INFO.releaseChannel||'development').toUpperCase()}`;
 if(settingsVersion)settingsVersion.textContent=`Version ${BUILD_INFO.version}`;
 if(settingsRelease)settingsRelease.textContent=BUILD_INFO.released||'';
 if(settingsState)settingsState.textContent=BUILD_INFO.state||'';
 syncAudioDebugUi();
}
function syncAudioDebugUi(){
 if(!settingsAudioDebugBody)return;
 const debug=window.__platinumAudioDebug||window.__auroraAudioDebug;
 const lastCue=debug?.lastCue;
 const ref=debug?.reference;
 const selection=currentAudioOverrides().audioTheme||'auto';
 const parts=[
  `Theme: ${selection}`,
  lastCue?.cue?`last cue ${lastCue.cue} (${lastCue.audioTheme||'no-theme'})`:'no cue yet'
 ];
 if(ref){
  if(ref.lastRequested)parts.push(`requested ${ref.lastRequested.split('/').pop()}`);
  if(ref.lastLoaded)parts.push(`loaded ${ref.lastLoaded.split('/').pop()}`);
  if(ref.lastStarted)parts.push(`started ${ref.lastStarted.split('/').pop()}`);
  if(ref.lastError)parts.push(`error ${ref.lastError}`);
  if(Number.isFinite(+ref.activeCount))parts.push(`active ${+ref.activeCount}`);
 }
 const text=parts.join(' · ');
 settingsAudioDebugBody.textContent=text;
 window.__auroraAudioStatusLine=text;
}
function playCurrentAudioThemeTest(){
 unlockAudioFromInteraction();
 const selection=currentAudioOverrides().audioTheme||'auto';
 const beforeRef=(window.__platinumAudioDebug||window.__auroraAudioDebug||{}).reference||{};
 if(typeof recordSystemIssue==='function'){
  recordSystemIssue('audio_test_requested','Developer audio test requested',{
   audioTheme:selection,
   priorRequested:beforeRef.lastRequested||'',
   priorError:beforeRef.lastError||''
  },{level:'info'});
 }
 if(typeof sfx!=='undefined'&&typeof sfx.primeReferenceTheme==='function')sfx.primeReferenceTheme(selection);
 if(typeof sfx!=='undefined'&&typeof sfx.playCue==='function'){
  sfx.playCue('gameStart',{
   phase:'stage',
   atmosphereTheme:'aurora-borealis',
   allowIdle:1
  });
  setTimeout(()=>syncAudioDebugUi(),80);
  setTimeout(()=>syncAudioDebugUi(),500);
  setTimeout(()=>syncAudioDebugUi(),1200);
 }
}
function syncHelpUi(){
 if(!helpModal)return;
 helpModal.classList.toggle('open',helpOpen);
 helpModal.setAttribute('aria-hidden',helpOpen?'false':'true');
 if(guideDockBtn){
  const open=helpOpen&&helpMode==='guide';
  guideDockBtn.classList.toggle('open',open);
  guideDockBtn.setAttribute('aria-expanded',open?'true':'false');
 }
 if(controlsDockBtn){
  const open=helpOpen&&helpMode==='controls';
  controlsDockBtn.classList.toggle('open',open);
  controlsDockBtn.setAttribute('aria-expanded',open?'true':'false');
 }
 helpTabButtons.forEach(btn=>{
  const active=btn.dataset.helpTab===helpMode;
  btn.setAttribute('aria-selected',active?'true':'false');
  btn.classList.toggle('active',active);
 });
 helpPanels.forEach(panel=>{
  const active=panel.dataset.helpPanel===helpMode;
  panel.hidden=!active;
  panel.classList.toggle('visible',active);
 });
 if(helpGuideActions)helpGuideActions.hidden=!(helpOpen&&helpMode==='guide');
 if(helpGuideFrame&&helpMode==='guide'&&!helpGuideFrame.src)helpGuideFrame.src=playersGuideUrl();
}
function syncPlatformSplashUi(){
 if(!platformSplashModal)return;
 platformSplashModal.classList.toggle('open',platformSplashOpen);
 platformSplashModal.setAttribute('aria-hidden',platformSplashOpen?'false':'true');
 if(platformSplashBtn){
  platformSplashBtn.classList.toggle('open',platformSplashOpen);
  platformSplashBtn.classList.toggle('active',platformSplashOpen);
  platformSplashBtn.setAttribute('aria-expanded',platformSplashOpen?'true':'false');
 }
}
function syncGamePreviewUi(){
 if(!gamePreviewModal)return;
 gamePreviewModal.classList.toggle('open',gamePreviewOpen);
 gamePreviewModal.setAttribute('aria-hidden',gamePreviewOpen?'false':'true');
}
function syncTestUi(){
 const cfg=loadTestCfg();
 applyTestCfgToControls(cfg);
 syncAudioUi();
 syncPauseUi();
 syncSettingsUi();
 syncHelpUi();
 syncPlatformSplashUi();
 syncGamePreviewUi();
}
function closeSettings(){
 if(!settingsOpen)return;
 if(settingsOpen&&started)paused=settingsPrevPaused;
 settingsOpen=0;
 resetActiveInputState('settings_close');
 syncSettingsUi();
 syncPauseUi();
}
function openSettings(){
 closeDockOverlays('settings');
 settingsPrevPaused=paused;
 if(started&&!paused)paused=1;
 settingsOpen=1;
 resetActiveInputState('settings_open');
 syncSettingsUi();
 syncPauseUi();
}
function logViewerUrl(){
 return 'http://127.0.0.1:4311/';
}
function projectGuideUrl(){
 return `${location.origin}${location.pathname.replace(/[^/]*$/,'')}project-guide.html`;
}
function playersGuideUrl(){
 return `${location.origin}${location.pathname.replace(/[^/]*$/,'')}player-guide.html`;
}
function openProjectGuide(){
 const win=window.open(projectGuideUrl(), '_blank', 'noopener');
 if(win){
  try{win.focus();}catch{}
  showToast('Opened project guide');
 }else showToast('Allow popups to open the project guide');
}
function openPlayersGuideWindow(){
 const win=window.open(playersGuideUrl(), '_blank', 'noopener');
 if(win){
  try{win.focus();}catch{}
  showToast('Opened players guide');
 }else showToast('Allow popups to open the players guide');
}
function openHelp(mode='controls'){
 if(helpOpen&&helpMode===mode)return;
 closeDockOverlays('help');
 helpPrevPaused=paused;
 if(started&&!paused)paused=1;
 helpMode=mode==='guide'?'guide':'controls';
 helpOpen=1;
 resetActiveInputState('help_open');
 logEvent('help_open',{mode:helpMode});
 syncHelpUi();
 syncPauseUi();
 setTimeout(()=>{
  const target=helpMode==='guide'?helpOpenWindowBtn:helpTabButtons.find(btn=>btn.dataset.helpTab===helpMode);
  target?.focus?.();
 },0);
}
function openPlatformSplash(){
 if(platformSplashOpen)return;
 closeDockOverlays('platformSplash');
 platformSplashPrevPaused=paused;
 if(started&&!paused)paused=1;
 platformSplashOpen=1;
 resetActiveInputState('platform_splash_open');
 logEvent('platform_splash_open',{pack:typeof currentGamePackKey==='function'?currentGamePackKey():''});
 syncPlatformSplashUi();
 syncPauseUi();
 setTimeout(()=>platformSplashClose?.focus?.(),0);
}
function closePlatformSplash(force=0){
 if(!platformSplashOpen&&!force)return;
 platformSplashOpen=0;
 if(started)paused=platformSplashPrevPaused;
 resetActiveInputState('platform_splash_close');
 logEvent('platform_splash_close',{force:!!force});
 syncPlatformSplashUi();
 syncPauseUi();
}
function openGamePreview(){
 if(gamePreviewOpen)return;
 closeDockOverlays('gamePreview');
 gamePreviewPrevPaused=paused;
 if(started&&!paused)paused=1;
 gamePreviewOpen=1;
 resetActiveInputState('game_preview_open');
 logEvent('game_preview_open',{pack:typeof currentGamePackKey==='function'?currentGamePackKey():''});
 syncGamePreviewUi();
 syncPauseUi();
 setTimeout(()=>gamePreviewClose?.focus?.(),0);
}
function closeGamePreview(force=0){
 if(!gamePreviewOpen&&!force)return;
 gamePreviewOpen=0;
 if(started)paused=gamePreviewPrevPaused;
 resetActiveInputState('game_preview_close');
 logEvent('game_preview_close',{force:!!force});
 syncGamePreviewUi();
 syncPauseUi();
}
function restorePlayableGamePackForLaunch(){
 if(typeof currentGamePackPlayable!=='function'||currentGamePackPlayable())return 0;
 if(typeof installGamePack==='function')installGamePack(DEFAULT_GAME_PACK_KEY,{persist:1});
 closeGamePreview(1);
 if(typeof draw==='function')draw();
 showToast('Galaxy Guardians is preview-only. Launching Aurora Galactica.');
 return 1;
}
function closeHelp(force=0){
 if(!helpOpen&&!force)return;
 helpOpen=0;
 if(started)paused=helpPrevPaused;
 resetActiveInputState('help_close');
 logEvent('help_close',{force:!!force,mode:helpMode});
 syncHelpUi();
 syncPauseUi();
}
function setHelpMode(mode='controls'){
 helpMode=mode==='guide'?'guide':'controls';
 if(helpOpen)logEvent('help_tab',{mode:helpMode});
 syncHelpUi();
}
function openLogViewer(){
 const win=window.open(logViewerUrl(), '_blank', 'noopener');
 if(win){
  try{win.focus();}catch{}
  showToast('Opened log viewer');
 }else showToast('Allow popups to open the log viewer');
}
function exportAndReturnToWaitMode(reason='manual_capture_reset'){
 if(!REC)resetSession();
 logEvent('capture_export_reset',{reason,started:!!started,attract:!!ATTRACT.active,stage:S.stage,score:S.score,lives:Math.max(0,S.lives+1)});
 exportSession({silent:1});
 const finish=()=>{
  if(feedbackOpen)closeFeedback();
  if(settingsOpen)closeSettings();
  gameOverHtml='';gameOverState=null;
  startAttractDemo({record:false});
  showToast('Run exported, returned to wait mode');
 };
 if(VIDEO_REC.rec||VIDEO_REC.active){
  runAfterRecordingStops(finish);
  stopRunRecording();
 }else finish();
}

function setFeedbackStatus(t='',err=0){
 feedbackStatus.textContent=t;
 feedbackStatus.className=err?'err':'';
}
function showToast(t){
 feedbackToast.textContent=t;
 feedbackToast.classList.add('show');
 clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>feedbackToast.classList.remove('show'),1700);
}
function openFeedback(){
 if(feedbackOpen)return;
 closeDockOverlays('feedback');
 feedbackPrevPaused=paused;paused=1;feedbackOpen=1;resetActiveInputState('feedback_open');
 logEvent('feedback_open');
 feedbackModal.classList.add('open');
 feedbackModal.setAttribute('aria-hidden','false');
 if(feedbackDockBtn){
  feedbackDockBtn.classList.add('open');
  feedbackDockBtn.setAttribute('aria-expanded','true');
 }
 if(feedbackSubtitle)feedbackSubtitle.textContent='Report a bug or send a feature idea without leaving the game board. Recent diagnostics are attached automatically.';
 applyPendingBugSuggestion();
 setFeedbackStatus('');
 syncPauseUi();
 setTimeout(()=>fbSummary.focus(),0);
}
function closeFeedback(force=0){
 if(!feedbackOpen||(!force&&feedbackBusy))return;
 feedbackOpen=0;paused=feedbackPrevPaused;
 resetActiveInputState('feedback_close');
 logEvent('feedback_close',{force:!!force});
 feedbackModal.classList.remove('open');
 feedbackModal.setAttribute('aria-hidden','true');
 if(feedbackDockBtn){
  feedbackDockBtn.classList.remove('open');
  feedbackDockBtn.setAttribute('aria-expanded','false');
 }
 syncPauseUi();
}
async function submitFeedback(ev){
 ev.preventDefault();
 if(feedbackBusy)return;
 const now=Date.now(),wait=FEEDBACK_RATE_MS-(now-feedbackLastSubmit);
 if(wait>0){setFeedbackStatus(`Please wait ${Math.ceil(wait/1000)}s before sending another report.`,1);return;}
 const type=fbType.value==='feature_request'?'feature_request':'bug_report';
 const title=fbSummary.value.trim().replace(/\s+/g,' ');
 const description=fbDescription.value.trim();
 if(title.length<4){setFeedbackStatus('Title must be at least 4 characters.',1);return;}
 if(description.length<10){setFeedbackStatus('Description must be at least 10 characters.',1);return;}
 feedbackBusy=1;
 setFeedbackStatus('Sending feedback...');
 const payload={
  type,title,description,
  timestamp:new Date(now).toISOString(),
  game:{name:PRODUCT_NAME,version:BUILD,url:location.href,user_agent:navigator.userAgent,language:navigator.language},
  game_state:{stage:S.stage,score:S.score,lives:Math.max(0,S.lives+1),started:!!started,paused:!!paused,challenge:!!S.challenge,attract:!!ATTRACT.active}
 };
 const diagnostics=getSystemDiagnosticsReport(20);
 const systemStatus=getSystemStatusReport(40);
 const kind=type==='feature_request'?'Feature Request':'Bug Report';
 const subject=`[${kind}] ${title}`;
 const lines=[
  description,'',
  '---',
  `Type: ${kind}`,
  `Build: ${BUILD}`,
  `Timestamp: ${payload.timestamp}`,
  `URL: ${location.href}`,
  `Stage: ${S.stage}`,
  `Score: ${S.score}`,
  `Lives: ${Math.max(0,S.lives+1)}`,
  `Started: ${started?1:0}`,
  `Paused: ${paused?1:0}`,
  `Challenge: ${S.challenge?1:0}`,
  `User-Agent: ${navigator.userAgent}`,
  '',
  'System status:',
  JSON.stringify(systemStatus,null,2),
  '',
  ...formatDiagnosticsLines('Recent system log',diagnostics.systemLog),
  '',
  ...formatDiagnosticsLines('Recent session events',diagnostics.sessionEvents)
 ];
 try{
  const fields=new FormData();
  fields.set('access_key',WEB3FORMS_ACCESS_KEY);
  fields.set('subject',subject);
  fields.set('from_name',PRODUCT_NAME);
  fields.set('botcheck','');
  fields.set('product',PRODUCT_NAME);
  fields.set('type',kind);
  fields.set('title',title);
  fields.set('description',description);
  fields.set('build',BUILD);
  fields.set('timestamp',payload.timestamp);
  fields.set('url',location.href);
  fields.set('stage',String(S.stage));
  fields.set('score',String(S.score));
  fields.set('lives',String(Math.max(0,S.lives+1)));
  fields.set('started',started?'1':'0');
  fields.set('paused',paused?'1':'0');
  fields.set('challenge',S.challenge?'1':'0');
  fields.set('user_agent',navigator.userAgent);
  fields.set('system_log',JSON.stringify(diagnostics.systemLog));
  fields.set('recent_session_events',JSON.stringify(diagnostics.sessionEvents));
  fields.set('system_status_report',JSON.stringify(systemStatus));
  fields.set('message',lines.join('\n'));
  await sendFeedbackDirect(fields);
  feedbackLastSubmit=now;
  fbType.value='bug_report';fbSummary.value='';fbDescription.value='';
  setFeedbackStatus('Sent to Modem inbox.');
  showToast('Feedback sent');
  setTimeout(()=>closeFeedback(),1200);
 }catch(err){
  recordSystemIssue('feedback_submit_failed',String(err?.message||err||'Feedback submission failed'),{type,title},{level:'warn'});
  openMailFallback(subject,lines);
  setFeedbackStatus('Direct send could not complete. Opened mail draft fallback.',1);
  showToast('Mail fallback opened');
 }
 feedbackBusy=0;
 return;
}

function rs(){
 DPR=window.devicePixelRatio||1;
 c.width=innerWidth*DPR;c.height=innerHeight*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
 ctx.imageSmoothingEnabled=false;
 syncStarfieldProfile();
 VIS.gx=17;VIS.gy=14;VIS.playerBottom=20;VIS.beamLen=300;VIS.formTop=28;
 S.p.x=PLAY_W/2;S.p.y=PLAY_H-VIS.playerBottom;
}
addEventListener('resize',rs);
function toggleFullscreen(){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.();}
settingsBtn.addEventListener('click',()=>{if(settingsOpen)closeSettings();else openSettings();});
if(settingsPanelClose)settingsPanelClose.addEventListener('click',closeSettings);
if(openViewerBtn)openViewerBtn.addEventListener('click',()=>{openLogViewer();closeSettings();});
if(openProjectGuideBtn)openProjectGuideBtn.addEventListener('click',()=>{openProjectGuide();closeSettings();});
if(platformSplashBtn)platformSplashBtn.addEventListener('click',()=>{if(platformSplashOpen)closePlatformSplash();else openPlatformSplash();});
if(platformSplashClose)platformSplashClose.addEventListener('click',()=>closePlatformSplash());
if(platformSplashModal)platformSplashModal.addEventListener('click',e=>{if(e.target===platformSplashModal)closePlatformSplash();});
if(platformSplashPanel)platformSplashPanel.addEventListener('click',e=>e.stopPropagation());
if(gamePreviewClose)gamePreviewClose.addEventListener('click',()=>closeGamePreview());
if(gamePreviewModal)gamePreviewModal.addEventListener('click',e=>{if(e.target===gamePreviewModal)closeGamePreview();});
if(gamePreviewPanel)gamePreviewPanel.addEventListener('click',e=>e.stopPropagation());
if(guideDockBtn)guideDockBtn.addEventListener('click',()=>openHelp('guide'));
if(controlsDockBtn)controlsDockBtn.addEventListener('click',()=>openHelp('controls'));
if(feedbackDockBtn)feedbackDockBtn.addEventListener('click',openFeedback);
if(helpClose)helpClose.addEventListener('click',()=>closeHelp());
if(helpOpenWindowBtn)helpOpenWindowBtn.addEventListener('click',openPlayersGuideWindow);
helpTabButtons.forEach(btn=>btn.addEventListener('click',()=>setHelpMode(btn.dataset.helpTab)));
exportBtn.addEventListener('click',exportSession);
recordBtn.addEventListener('click',()=>{
 if(VIDEO_REC.active)return;
 VIDEO_REC.enabled=!VIDEO_REC.enabled;
 writePref(RECORD_PREF_KEY,VIDEO_REC.enabled?'1':'0');
 showToast(VIDEO_REC.enabled?'Auto video enabled':'Auto video disabled');
 syncRecordUi();
});
if(playAudioTestBtn)playAudioTestBtn.addEventListener('click',playCurrentAudioThemeTest);
for(const el of [testStage,testShips,testExtendFirst,testExtendRecurring,testChallenge,audioTheme,graphicsTheme,graphicsStarfieldIntensity,graphicsStarfieldSpeed])if(el)el.addEventListener('change',saveTestCfg);
for(const el of [testStage,testShips,testExtendFirst,testExtendRecurring])if(el)el.addEventListener('input',saveTestCfg);
if(muteToggleBtn)muteToggleBtn.addEventListener('click',()=>setAudioMuted(!audioMuted,{silent:0}));
if(pauseToggleBtn)pauseToggleBtn.addEventListener('click',toggleGameplayPause);
fbCancel.addEventListener('click',()=>closeFeedback());
if(feedbackClose)feedbackClose.addEventListener('click',()=>closeFeedback());
if(helpModal)helpModal.addEventListener('click',e=>{if(e.target===helpModal)closeHelp();});
feedbackModal.addEventListener('click',e=>{if(e.target===feedbackModal)closeFeedback();});
settingsPanel.addEventListener('click',e=>e.stopPropagation());
feedbackForm.addEventListener('submit',submitFeedback);
if(buildStampRefreshBtn)buildStampRefreshBtn.addEventListener('click',()=>location.reload());
if(buildStampDismissBtn)buildStampDismissBtn.addEventListener('click',()=>{
 buildStampDismissed=1;
 if(buildStamp)buildStamp.classList.add('dismissed');
});
addEventListener('pointerdown',()=>unlockAudioFromInteraction(),{passive:true});
function keyboardTargetIsEditable(target){
 if(!target||typeof target.closest!=='function')return false;
 return !!target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');
}
addEventListener('keydown',e=>{
 const typingTarget=keyboardTargetIsEditable(e.target);
 const wasDown=!!keys[e.code];
 const now=performance.now();
 logEvent('key_down',{code:e.code,key:e.key,repeat:!!e.repeat,alreadyDown:wasDown});
 if(e.code==='F1'||e.key==='?'){e.preventDefault();openFeedback();return;}
 if(platformSplashOpen){if(e.code==='Escape'){e.preventDefault();closePlatformSplash();}return;}
 if(gamePreviewOpen){if(e.code==='Escape'){e.preventDefault();closeGamePreview();}return;}
 if(helpOpen){if(e.code==='Escape'){e.preventDefault();closeHelp();}return;}
 if(feedbackOpen){if(e.code==='Escape'){e.preventDefault();closeFeedback();}return;}
 if(gamePickerOpen){if(e.code==='Escape'){e.preventDefault();closeGamePicker();}return;}
 if(typeof isMoviePanelOpen==='function'&&isMoviePanelOpen()){if(e.code==='Escape'){e.preventDefault();closeMoviePanel();}return;}
 if(settingsOpen&&e.code==='Escape'){e.preventDefault();closeSettings();return;}
 if(typeof closeAccountPanel==='function'&&e.code==='Escape')closeAccountPanel();
 if(!typingTarget&&e.code==='KeyL'){e.preventDefault();exportSession();return;}
 if(!typingTarget&&e.code==='KeyX'&&(started||ATTRACT.active)){e.preventDefault();exportAndReturnToWaitMode('manual_hotkey');return;}
 if(typingTarget){
  if(e.code==='Escape'&&settingsOpen){e.preventDefault();closeSettings();}
  return;
 }
 keys[e.code]=1;
 if(!wasDown)keyState[e.code]={downAt:now,upAt:0};
 if([...movementControlCodes(),'Space'].includes(e.code))e.preventDefault();
 if(e.code==='KeyF')toggleFullscreen();
 if(e.code==='KeyU')S.ultra=S.ultra?0:1;
 if(e.code==='KeyT'){
  e.preventDefault();
  if(settingsOpen)closeSettings();
  else openSettings();
  return;
 }
 if(!started&&gameOverState){
  if(gameOverState.phase==='results'){
   if(e.code==='Enter'){
    e.preventDefault();
    gameOverState.phase='scoreboard';
    if(!gameOverState.editing)submitGameOverScore();
    if(gameOverState.rank)sfx.highScore(gameOverState.rank);
    gameOverHtml=buildGameOverHtmlFromState();
   }
   return;
  }
 }
 if(!started&&gameOverState?.editing){
  if(e.code==='Enter'){
   e.preventDefault();
   saveGameOverInitials();
   gameOverState.editing=0;
   submitGameOverScore();
   sfx.uiConfirm();
   gameOverHtml=buildGameOverHtmlFromState();
   return;
  }
  if(e.code==='ArrowLeft'){
   e.preventDefault();
   gameOverState.cursor=Math.max(0,gameOverState.cursor-1);
   sfx.uiTick();
   gameOverHtml=buildGameOverHtmlFromState();
   return;
  }
  if(e.code==='ArrowRight'){
   e.preventDefault();
   gameOverState.cursor=Math.min(2,gameOverState.cursor+1);
   sfx.uiTick();
   gameOverHtml=buildGameOverHtmlFromState();
   return;
  }
  if(e.code==='ArrowUp'||e.code==='ArrowDown'){
   e.preventDefault();
   gameOverState.initials[gameOverState.cursor]=cycleInitial(gameOverState.initials[gameOverState.cursor],e.code==='ArrowUp'?1:-1);
   saveGameOverInitials();
   sfx.uiTick();
   gameOverHtml=buildGameOverHtmlFromState();
   return;
  }
  if(e.code==='Backspace'){
   e.preventDefault();
   gameOverState.cursor=Math.max(0,gameOverState.cursor-1);
    gameOverState.initials[gameOverState.cursor]='A';
   saveGameOverInitials();
   sfx.uiTick();
   gameOverHtml=buildGameOverHtmlFromState();
   return;
  }
  const m=e.code.match(/^Key([A-Z])$/);
  if(m){
   e.preventDefault();
   gameOverState.initials[gameOverState.cursor]=m[1];
   gameOverState.cursor=Math.min(2,gameOverState.cursor+1);
   saveGameOverInitials();
   sfx.uiTick();
   gameOverHtml=buildGameOverHtmlFromState();
   return;
  }
 }
 if(!started&&e.code==='Enter'){
  if(typeof currentGamePackPlayable==='function'&&!currentGamePackPlayable()){
   e.preventDefault();
   restorePlayableGamePackForLaunch();
  }
  if(gameOverState&&!gameOverState.editing)submitGameOverScore();
  stopAttractLoop();start();
 }
 if(started&&e.code==='KeyP'){
  toggleGameplayPause();
 }
 if((!aud||sfx.a?.state==='suspended')&&['Enter','Space'].includes(e.code))unlockAudioFromInteraction();
});
addEventListener('keyup',e=>{
 keys[e.code]=0;
 if(!keyState[e.code])keyState[e.code]={downAt:0,upAt:performance.now()};
 else keyState[e.code].upAt=performance.now();
 logEvent('key_up',{code:e.code,key:e.key});
});
addEventListener('blur',()=>resetActiveInputState('window_blur'));
document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='hidden'){
  resetActiveInputState('document_hidden');
  return;
 }
 if(document.visibilityState==='visible'&&typeof checkForHostedBuildUpdate==='function')checkForHostedBuildUpdate();
});
addEventListener('pointerdown',e=>{
 if(!settingsOpen)return;
 if(e.target===settingsBtn||settingsPanel.contains(e.target))return;
 closeSettings();
});
syncTestUi();
syncBuildStampUi();
startHostedBuildUpdateChecks();
window.openPlatformSplash=openPlatformSplash;
window.closePlatformSplash=closePlatformSplash;
window.openGamePreview=openGamePreview;
window.closeGamePreview=closeGamePreview;
