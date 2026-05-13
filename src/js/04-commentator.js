// Optional gameplay callouts shown through the platform message window.
var commentatorEnabled=readPref(COMMENTATOR_PREF_KEY)!=='0';

function commentatorSafeLine(value=''){
 return String(value||'').trim().replace(/\s+/g,' ').slice(0,44);
}
function commentatorState(){
 return {
  enabled:!!commentatorEnabled,
  active:+(+S.commentaryT||0).toFixed(3),
  cooldown:+(+S.commentaryCooldown||0).toFixed(3),
  title:S.commentaryTitle||'',
  lines:Array.isArray(S.commentaryLines)?S.commentaryLines.slice(0,3):[]
 };
}
function syncCommentatorControls(){
 if(commentatorToggle)commentatorToggle.checked=!!commentatorEnabled;
}
function setCommentatorEnabled(enabled,opts={}){
 commentatorEnabled=!!enabled;
 writePref(COMMENTATOR_PREF_KEY,commentatorEnabled?'1':'0');
 if(!commentatorEnabled){
  S.commentaryT=0;
  S.commentaryTitle='';
  S.commentaryLines=[];
 }
 syncCommentatorControls();
 if(opts.log&&typeof logEvent==='function'){
  logEvent('commentator_setting_changed',{
   enabled:!!commentatorEnabled,
   source:opts.source||'settings',
   stage:S.stage,
   score:S.score,
   watchMode:!!S.watchMode,
   persona:S.harnessPersona||S.watchPersona||''
  });
 }
 return commentatorState();
}
function updateCommentator(dt){
 S.commentaryCooldown=Math.max(0,(+S.commentaryCooldown||0)-dt);
 if(S.commentaryT>0&&S.alertT<=0&&S.banner<=0){
  S.commentaryT=Math.max(0,S.commentaryT-dt);
  if(!S.commentaryT){
   S.commentaryTitle='';
   S.commentaryLines=[];
  }
 }
}
function commentatorMessageState(){
 if(!commentatorEnabled||S.commentaryT<=0||S.alertT>0||S.banner>0)return null;
 if(typeof buildBoardMessageHtml!=='function')return null;
 return {
  mode:'board',
  html:buildBoardMessageHtml({
   title:S.commentaryTitle||'TACTICAL UPDATE',
   lines:Array.isArray(S.commentaryLines)?S.commentaryLines.slice(0,3):[]
  }),
  topRatio:.62
 };
}
function queueCommentatorCallout(key,title,lines=[],opts={}){
 if(!commentatorEnabled||!started||S.attract)return false;
 if(!opts.force&&S.commentaryCooldown>0)return false;
 const cleanedLines=(Array.isArray(lines)?lines:[lines])
  .map(commentatorSafeLine)
  .filter(Boolean)
  .slice(0,3);
 const cleanTitle=commentatorSafeLine(title||'TACTICAL UPDATE')||'TACTICAL UPDATE';
 S.commentaryTitle=cleanTitle;
 S.commentaryLines=cleanedLines;
 S.commentaryT=Math.max(.8,Math.min(5,+opts.duration||2.25));
 S.commentaryCooldown=Math.max(1,Math.min(20,+opts.minGap||7.5));
 if(typeof logEvent==='function'){
  logEvent('commentator_callout',{
   key:String(key||'callout'),
   title:cleanTitle,
   lines:cleanedLines,
   duration:+S.commentaryT.toFixed(3),
   minGap:+S.commentaryCooldown.toFixed(3),
   stage:S.stage,
   score:S.score,
   watchMode:!!S.watchMode,
   persona:S.harnessPersona||S.watchPersona||''
  });
 }
 return true;
}
function commentatorEvent(type,payload={}){
 switch(String(type||'')){
  case 'boss_damaged':
   return queueCommentatorCallout('boss_damaged','BOSS DAMAGED',['Keep pressure on the flagship.'],{duration:1.8,minGap:5});
  case 'boss_destroyed':
   return queueCommentatorCallout('boss_destroyed','BOSS DOWN',[payload.points?`${payload.points} POINTS`:'Flagship destroyed.'],{duration:2,minGap:5});
  case 'capture_started':
   return queueCommentatorCallout('capture_started','TRACTOR BEAM',['Break away or prepare a rescue.'],{duration:2.35,minGap:4.5,force:1});
  case 'fighter_rescued':
   return queueCommentatorCallout('fighter_rescued','DUAL FIGHTER',['Firepower restored.'],{duration:2.1,minGap:4.5,force:1});
  case 'challenge_perfect':
   return queueCommentatorCallout('challenge_perfect','PERFECT CHALLENGE',['All targets destroyed.'],{duration:2.4,minGap:4.5,force:1});
  case 'challenge_clear':
   return queueCommentatorCallout('challenge_clear','CHALLENGE COMPLETE',[`Hits ${payload.hits||0}/${payload.total||0}`],{duration:2.1,minGap:4.5,force:1});
  case 'stage_clear':
   return queueCommentatorCallout('stage_clear','STAGE CLEAR',[`Score ${formatScore(payload.score||S.score)}`],{duration:2,minGap:4.5,force:1});
  case 'watch_mode':
   return queueCommentatorCallout('watch_mode','WATCH MODE',[payload.persona?`${payload.persona} flying now.`:'Persona pilot active.'],{duration:2.2,minGap:3,force:1});
  default:
   return false;
 }
}

if(commentatorToggle){
 commentatorToggle.addEventListener('change',()=>setCommentatorEnabled(commentatorToggle.checked,{log:1,source:'settings'}));
}
syncCommentatorControls();

window.__platinumCommentator=window.__auroraCommentator={
 state:commentatorState,
 setEnabled:setCommentatorEnabled,
 queueForHarness:queueCommentatorCallout,
 eventForHarness:commentatorEvent
};
