const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const C=require('../arcade/core.js');
const R=require('../arcade/leaderboard-rules.js');
class Node{
 constructor(parent=null){this.parent=parent;this.listeners={};this.nodes=new Map();this.children=[];this._html='';this.inert=false;this.hidden=false}
 set innerHTML(value){this._html=value;this.nodes.clear();this.children=[]}
 get innerHTML(){return this._html}
 querySelector(selector){if(selector==='.arcade-pause'&&!this._html.includes('class="arcade-pause"'))return null;if(!this.nodes.has(selector))this.nodes.set(selector,new Node(this));return this.nodes.get(selector)}
 addEventListener(event,fn){(this.listeners[event]??=[]).push(fn)}
 removeEventListener(event,fn){this.listeners[event]=(this.listeners[event]||[]).filter(f=>f!==fn)}
 emit(event,extra={}){for(const fn of [...(this.listeners[event]||[])])fn({target:this,preventDefault(){},...extra})}
 contains(node){return node===this||node.parent===this}
 matches(){return false}
 closest(){return null}
 focus(){}
 scrollIntoView(){}
 insertAdjacentHTML(_,html){this._html+=html}
 remove(){if(this.parent){this.parent._html=this.parent._html.replace('class="arcade-pause"','class="removed"');this.parent.nodes.delete('.arcade-pause')}}
}
function harness(id='snake'){
 let time=1000,next=0;const timers=new Map(),frames=new Map(),nodes=new Map();
 const document=new Node();document.hidden=false;document.getElementById=id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id)};
 const window=new Node();window.ArcadeCore=C;window.PixelLeaderboardRules=R;window.PixelLeaderboard={offer(){},result:R.result};
 const context={window,document,performance:{now:()=>time},localStorage:{getItem:()=>null,setItem(){}},setInterval:fn=>{const id=++next;timers.set(id,fn);return id},clearInterval:id=>timers.delete(id),requestAnimationFrame:fn=>{const id=++next;frames.set(id,fn);return id},cancelAnimationFrame:id=>frames.delete(id)};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../arcade/hub.js'),'utf8'),context);
 const api=window.PixelArcade;let setups=0,after=0,every=0,keys=0;let ctx;
 api.register(id,value=>{ctx=value;setups++;value.screen('<div class="fixture"></div>');value.after(()=>after++,100);value.every(()=>every++,50);value.on(document,'keydown',()=>keys++)});
 api.mount(new Node(),id);
 return {api,document,window,nodes,get ctx(){return api.active},counts:()=>({setups,after,every,keys}),play(){nodes.get('arcadeGameContent').querySelector('button').emit('click')},advance(ms){time+=ms;for(const fn of [...timers.values()])fn()},timers};
}
test('action games wait for Play, freeze timers while paused and resume without catch-up',()=>{
 const h=harness();h.advance(5000);assert.equal(h.counts().setups,0);
 h.play();assert.equal(h.counts().setups,1);h.advance(40);h.ctx.pause();h.advance(5000);
 assert.deepEqual(h.counts(),{setups:1,after:0,every:0,keys:0});assert.equal(h.ctx.elapsed(),40);
 h.ctx.resume();h.advance(70);assert.equal(h.counts().after,1);assert.equal(h.counts().every,1);assert.equal(h.ctx.elapsed(),110);
});
test('restart returns to ready and disposal cancels timers and input handlers',()=>{
 const h=harness();h.play();h.ctx.pause();h.ctx.start();h.advance(200);assert.equal(h.counts().after,0);assert.equal(h.timers.size,0);
 h.play();assert.equal(h.counts().setups,2);h.api.clear();h.advance(1000);h.document.emit('keydown');assert.equal(h.counts().keys,0);assert.equal(h.timers.size,0);
});
test('hidden action games auto-pause and focused inputs do not trigger game shortcuts',()=>{
 const h=harness();h.play();const input=new Node();input.matches=()=>true;h.document.emit('keydown',{target:input});assert.equal(h.counts().keys,0);
 h.document.emit('keydown');assert.equal(h.counts().keys,1);h.document.hidden=true;h.document.emit('visibilitychange');assert.equal(h.ctx.paused,true);
});
test('turn-based puzzles render immediately without an unnecessary ready screen',()=>{
 const h=harness('minesweeper');assert.equal(h.counts().setups,1);
 h.document.hidden=true;h.document.emit('visibilitychange');assert.equal(h.ctx.paused,false);
 h.api.clear();
});
