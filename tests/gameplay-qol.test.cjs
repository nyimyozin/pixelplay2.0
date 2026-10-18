const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const C=require('../arcade/core.js');
function game(id,module){
 let now=1000;const handlers=new Map(),nodes=new Map(),timers=[],intervals=[],registry=new Map();
 const drawing=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 function node(selector){if(!nodes.has(selector))nodes.set(selector,{textContent:'',value:'',disabled:false,style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},focus(){},select(){},getContext:()=>drawing,querySelector:s=>node(selector+' '+s),children:[],getBoundingClientRect:()=>({left:0,top:0,width:560,height:400})});return nodes.get(selector)}
 node('#whackGrid').children=Array.from({length:9},(_,i)=>node('hole'+i));
 const pads=Array.from({length:4},(_,i)=>node('pad'+i));
 const document={},window={ArcadeCore:C,PixelArcade:{register:(key,fn)=>registry.set(key,fn)}};
 const math=Object.create(Math);math.random=()=>.2;
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../arcade/'+module+'.js'),'utf8'),{window,document,Math:math});
 const ctx={info:{name:id},body:{querySelector:node,querySelectorAll:s=>s==='.simon-pad'?pads:[]},finished:false,ranked:true,
  now:()=>now,screen(){},notice(){},loop(){},on(target,event,fn){if(!handlers.has(target))handlers.set(target,{});handlers.get(target)[event]=fn},
  after(fn,ms){timers.push({fn,at:now+ms})},every(fn){intervals.push(fn)},setEndRun(fn){ctx.endRun=fn},
  finish(won,title,detail,score){ctx.finished=true;ctx.result={won,title,detail,score}}
 };
 registry.get(id)(ctx);
 return {ctx,node,pads,intervals,key(key){handlers.get(document).keydown({key,preventDefault(){}})},click(selector,index){const target=node(selector);handlers.get(target).click({target:{closest:()=>({dataset:{i:String(index)}})}})},input(selector,value){const target=node(selector);target.value=value;handlers.get(target).input({})},submit(selector){handlers.get(node(selector)).submit({preventDefault(){}})},flush(){while(timers.length&&!ctx.finished){timers.sort((a,b)=>a.at-b.at);const item=timers.shift();now=item.at;item.fn()}},stepTimer(){timers.sort((a,b)=>a.at-b.at);const item=timers.shift();now=item.at;item.fn()},setTime(t){now=t},setRandom(fn){math.random=fn},handlers};
}
test('Block Drop continues after six cleared lines instead of ending its leaderboard run',()=>{
 const g=game('tetris','action');
 // A deterministic square piece fills each pair of columns, clearing two rows per batch.
 for(let batch=0;batch<3;batch++)for(const column of [0,2,4,6,8]){for(let i=0;i<Math.abs(column-4);i++)g.key(column<4?'ArrowLeft':'ArrowRight');g.key(' ')}
 assert.equal(g.ctx.finished,false);assert.match(g.node('#arcadeLiveScore').textContent,/Lines: 6/);
 g.ctx.endRun();assert.equal(g.ctx.result.score,900);
});
test('Simon continues beyond five levels and replay explicitly switches to practice',()=>{
 const g=game('simon','quick');g.setRandom(()=>0);g.flush();
 // First sequence entry is zero too: floor(.2 * 4) === 0.
 for(let level=1;level<=6;level++){for(let tap=0;tap<level;tap++)g.handlers.get(g.pads[0]).click({});g.flush()}
 assert.equal(g.ctx.finished,false);assert.equal(g.node('#simonLevel').textContent,7);
 g.handlers.get(g.node('#simonRepeat')).click({});assert.equal(g.ctx.ranked,false);
 g.ctx.endRun();assert.equal(g.ctx.result.score,6);
});
test('Whack-a-Mole keeps running after twelve hits and allows only one attempt per target',()=>{
 const g=game('whack','quick');
 for(let hit=0;hit<13;hit++){g.click('#whackGrid',1);g.click('#whackGrid',1);if(hit<12)g.stepTimer()}
 assert.equal(g.ctx.finished,false);assert.equal(g.node('#whackHits').textContent,13);
 g.setTime(31000);g.intervals[0]();assert.equal(g.ctx.result.score,13);
});
test('Math Sprint accepts more than ten answers and scores only when its full timer ends',()=>{
 const g=game('math','quick');
 // floor(.2 * 3) chooses addition; a=5, b=4.
 for(let i=0;i<12;i++){g.node('#mathAnswer').value='9';g.submit('#mathForm')}
 assert.equal(g.ctx.finished,false);assert.equal(g.node('#mathPoints').textContent,12);
 g.setTime(46000);g.intervals[0]();assert.equal(g.ctx.result.score,12);
});
test('Typing Sprint includes correct characters from its unfinished final sentence',()=>{
 const g=game('typing','quick');const quote=g.node('#typeQuote').textContent;
 g.input('#typeInput',quote.slice(0,10));g.setTime(31000);g.intervals[0]();
 assert.equal(g.ctx.result.score,4);assert.equal(g.node('#typeInput').disabled,true);
});
