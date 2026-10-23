const assert=require('node:assert/strict');
const {withHarnessPage}=require('./browser-check-util');
async function main(){
 const result=await withHarnessPage({stage:2,ships:3,challenge:false,seed:49031},async({page})=>{
  return page.evaluate(()=>window.__galagaHarness__.checkReplayProfileMetadata());
 });
 assert.equal(result.saved.stage,17);
 assert.equal(result.saved.displayStage,13);
 assert.equal(result.saved.scoreEntryId,'fixture-score');
 assert(result.saved.completedAt);
 assert.equal(result.rows.length,1);
 assert.equal(result.merged.length,1);
 assert.equal(result.merged[0].replayId,'metadata-browser-fixture');
 assert.match(result.rendered,/STG 13/);
 assert.doesNotMatch(result.rendered,/STG 17/);
 console.log('PASS browser replay metadata -> IndexedDB catalog -> pilot row -> merged rendered Stage13. Isolated fixture, no live score writes.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
