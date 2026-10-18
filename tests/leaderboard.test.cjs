const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const R=require('../arcade/leaderboard-rules.js');
const C=require('../arcade/core.js');
test('every game has a ranking, with safe limits and difficulty isolation',()=>{
 assert.deepEqual(Object.keys(R.specs).sort(),C.CATALOG.map(g=>g.id).sort());
 for(const g of C.CATALOG){const mode=['memory','hangman'].includes(g.id)?'easy':'standard';
  assert.ok(R.result(g.id,true,1,1000,mode));
  assert.equal(R.result(g.id,true,Infinity,1000,mode),null);
  assert.equal(R.result(g.id,true,R.rules(g.id).max+1,1000,mode),null);
  assert.equal(R.result(g.id,true,1,-1,mode),null);
  assert.equal(R.result(g.id,true,1,1000,'fake'),null);
 }
 assert.equal(R.result('memory',true,6,3000,'standard'),null);
 assert.equal(R.result('snake',false,4,5000).score,4);
 assert.equal(R.result('reaction',false,120,5000),null);
 assert.equal(R.result('memory',false,9,5000,'hard'),null);
 assert.equal(R.result('reaction',true,0,5000),null);
 assert.equal(R.result('snake',true,1.5,5000),null);
 assert.equal(R.result('hangman',true,null,1250,'hard').score,1.25);
});
// Minimal DOM exercising the actual UI controller and mocked Supabase boundary.
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.events={};this.value='';this.classList={add(){}}}
 append(...items){this.children.push(...items)}
 setAttribute(key,value){this[key]=value}
 replaceChildren(...items){this.children=items}
 addEventListener(event,fn){this.events[event]=fn}
 get options(){return this.children}
 showModal(){this.open=true}
 close(){this.open=false;this.events.close?.()}
 remove(){this.removed=true}
}
function ui(rpc){
 const body=new Element('body');const document={body,createElement:t=>new Element(t),querySelector:()=>null};
 const database={rpc,auth:{getSession:async()=>({data:{session:{user:{id:'guest'}}}})}};
 const window={PixelLeaderboardRules:R,ArcadeCore:C,PIXELPLAY_LEADERBOARD:{url:'https://example.supabase.co',publishableKey:'public-key'},supabase:{createClient:()=>database}};
 const context={window,document,localStorage:{getItem:()=>'',setItem(){}},console};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../arcade/leaderboard.js'),'utf8'),context);
 return {window,body};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('leaderboard renders remote names as text and submits the captured game result',async()=>{
 const calls=[];const {window,body}=ui(async(name,args)=>{calls.push([name,args]);return {data:name==='pixelplay_top'?[{player_name:'<img onerror=bad()>',score:4,duration_ms:2000}]:null}});
 window.PixelLeaderboard.show('snake','standard',R.result('snake',false,4,2000));await tick();
 const modal=body.children[0],list=modal.children[5],form=modal.children[6];
 assert.equal(list.children[0].children[1].children[0].children[1].textContent,'<img onerror=bad()>');
 form.children[1].children[0].value='Player One';
 await form.events.submit({preventDefault(){}});
 const submit=calls.find(c=>c[0]==='pixelplay_submit');assert.ok(submit);
 assert.equal(submit[1].p_game,'snake');assert.equal(submit[1].p_score,4);assert.equal(submit[1].p_duration,2000);
 assert.equal(form.children[2].disabled,true);assert.equal(form.children[2].textContent,'Submitted');
 modal.close();assert.equal(modal.removed,true);
});
test('unconfigured leaderboards explain status without creating an account',async()=>{
 const {window,body}=ui(()=>{throw Error('unexpected backend call')});window.PIXELPLAY_LEADERBOARD={};
 window.PixelLeaderboard.show('memory','hard');await tick();
 assert.match(body.children[0].children[4].textContent,/not connected yet/);
});
test('submission failure permits retry and keeps the result available',async()=>{
 let failed=true;
 const {window,body}=ui(async name=>name==='pixelplay_top'?{data:[]}:(failed?{error:{message:'Please try again'}}:{data:null}));
 window.PixelLeaderboard.show('snake','standard',R.result('snake',true,15,2000));await tick();const form=body.children[0].children[6];
 form.children[1].children[0].value='Guest';await form.events.submit({preventDefault(){}});
 assert.equal(form.children[2].disabled,false);assert.match(form.children[4].textContent,/try again/);
 failed=false;await form.events.submit({preventDefault(){}});assert.equal(form.children[2].textContent,'Submitted');
});
