const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {withHarnessPage} = require('./browser-check-util');
const {createFrozenOutput} = require('./frozen-output');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'browser-helper-'));
  t.after(() => fs.rmSync(root, {recursive:true,force:true}));
  const bundle = path.join(root,'bundle'); fs.mkdirSync(bundle);
  fs.writeFileSync(path.join(bundle,'index.html'),'fixture');
  return {root,bundle};
}

test('frozen output refuses symlink aliases into input without writing', t => {
  const {root,bundle} = fixture(t), alias = path.join(root,'alias');
  fs.symlinkSync(bundle,alias,'dir');
  assert.throws(() => createFrozenOutput(bundle,path.join(alias,'nested','output')), /outside frozen/);
  assert.deepEqual(fs.readdirSync(bundle),['index.html']);
  assert.throws(() => createFrozenOutput(bundle,bundle), /outside frozen/);
  const output = createFrozenOutput(bundle,path.join(root,'new','output'));
  assert(fs.statSync(output.out).isDirectory());
  assert.throws(() => createFrozenOutput(bundle,output.out), /must be new/);
});

for (const failure of ['launch','newContext','newPage','contextClose','browserClose']) {
  test(`resource cleanup survives ${failure} failure`, async t => {
    const {bundle} = fixture(t), calls = [];
    const fail = name => {if(failure === name)throw new Error(name);};
    const context = {
      newPage:async()=>{fail('newPage');throw new Error('navigation fixture stop');},
      close:async()=>{calls.push('context');fail('contextClose');}
    };
    const browser = {
      newContext:async()=>{fail('newContext');return context;},
      close:async()=>{calls.push('browser');fail('browserClose');}
    };
    const server = {closeAllConnections:()=>calls.push('connections'),
      close:cb=>{calls.push('server');cb();}};
    await assert.rejects(withHarnessPage({root:bundle},()=>{}, {
      startServer:async()=>({server,port:1234}), launch:async()=>{fail('launch');return browser;}
    }));
    assert.deepEqual(calls.slice(-2),['connections','server']);
    assert.equal(calls.includes('browser'),failure !== 'launch');
    assert.equal(calls.includes('context'),!['launch','newContext'].includes(failure));
  });
}

test('offline routing permits local reads but refuses writes, external requests and sockets before navigation', async t => {
  const {bundle}=fixture(t), calls=[];
  let routeRequest, routeSocket, options, origin;
  const page={on(){},addInitScript:async()=>{},waitForFunction:async()=>{},
    goto:async url=>{
      assert(routeRequest && routeSocket,'Guards must be installed before navigation');
      origin=new URL(url).origin;
    }};
  const context={
    route:async(pattern,handler)=>{assert.equal(pattern,'**/*');routeRequest=handler;},
    routeWebSocket:async(pattern,handler)=>{assert.equal(pattern,'**/*');routeSocket=handler;},
    newPage:async()=>page,close:async()=>{}
  };
  const browser={newContext:async cfg=>{options=cfg;return context;},close:async()=>{}};
  const server={closeAllConnections(){},close:cb=>cb()};
  await withHarnessPage({root:bundle,offline:true,skipStart:true},async()=>{
    assert.equal(options.serviceWorkers,'block');
    for(const [url,method,expected] of [
      [origin+'/index.html','GET','continue'],[origin+'/asset','HEAD','continue'],
      [origin+'/score','POST','abort'],[origin+'/score','PUT','abort'],
      ['https://example.invalid/score','GET','abort'],['https://example.invalid/score','POST','abort']
    ]){
      await routeRequest({request:()=>({url:()=>url,method:()=>method}),
        continue:()=>calls.push('continue'),abort:()=>calls.push('abort')});
      assert.equal(calls.at(-1),expected);
    }
    routeSocket({close:()=>calls.push('socket-closed')});
    assert.equal(calls.at(-1),'socket-closed');
  },{startServer:async()=>({server,port:1234}),launch:async()=>browser});
});
