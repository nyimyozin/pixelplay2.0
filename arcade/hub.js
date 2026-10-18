(function(){
"use strict";
const core=window.ArcadeCore,registry=new Map();
let active=null;
const categories=["All","Arcade","Puzzle","Strategy","Words","Quiz","Reflex"];
function readStats(){try{return JSON.parse(localStorage.getItem("pixelplay2.arcade.stats"))||{}}catch{return {}}}
function record(id,won){const stats=readStats(),s=stats[id]||{played:0,wins:0};s.played++;if(won)s.wins++;stats[id]=s;try{localStorage.setItem("pixelplay2.arcade.stats",JSON.stringify(stats))}catch{}}
function catalog(element,category="All"){
 if(!element)return;
 element.innerHTML='<section class="arcade-library" aria-label="More games"><div class="arcade-section-heading"><div><span class="eyebrow">THE WHOLE ARCADE</span><h2>Find your next favorite</h2><p>Quick games, brain teasers, and old-school favorites — play in your browser.</p></div><span class="arcade-count">'+core.CATALOG.length+' playable games</span></div><div class="arcade-toolbar glass"><label class="arcade-search"><span aria-hidden="true">⌕</span><input id="arcadeSearch" type="search" placeholder="Search games…" aria-label="Search games"></label><div class="arcade-filters" id="arcadeFilters" aria-label="Filter games by category"></div></div><div id="arcadeResults" class="arcade-cards"></div><p class="arcade-empty" id="arcadeEmpty" hidden>No games found. Try a different search or category.</p></section>';
 const filters=element.querySelector("#arcadeFilters"),results=element.querySelector("#arcadeResults"),search=element.querySelector("#arcadeSearch"),empty=element.querySelector("#arcadeEmpty");
 let selected=categories.includes(category)?category:"All";
 filters.innerHTML=categories.map(c=>'<button class="arcade-filter'+(c===selected?" is-active":"")+'" type="button" data-filter="'+c+'" aria-pressed="'+(c===selected)+'">'+c+'</button>').join("");
 function draw(){
  const query=search.value.toLowerCase().trim();
  const found=core.CATALOG.filter(item=>(selected==="All"||item.category===selected)&&[item.name,item.description,item.category].join(" ").toLowerCase().includes(query));
  results.innerHTML=found.map(g=>'<a class="arcade-card glass tone-'+g.tone+'" href="'+g.link+'"><span class="arcade-card-art" aria-hidden="true">'+g.symbol+'</span><span class="arcade-card-info"><span class="arcade-card-category">'+g.category+'</span><strong>'+g.name+'</strong><span class="arcade-card-desc">'+g.description+'</span></span><span class="arcade-card-arrow" aria-hidden="true">↗</span></a>').join("");
  empty.hidden=found.length>0;
 }
 filters.addEventListener("click",e=>{
  const button=e.target.closest("[data-filter]");if(!button)return;
  selected=button.dataset.filter;
  filters.querySelectorAll("button").forEach(el=>{let is=el===button;el.classList.toggle("is-active",is);el.setAttribute("aria-pressed",is)});
  draw();
 });
 search.addEventListener("input",draw);
 draw();
}
function register(id,setup){registry.set(id,setup)}
function clear(){if(active){active.dispose();active=null}}
const READY={
 snake:["Grow from 3 cells to a full 20 × 20 grid.","Use arrows, swipe, or the direction pad. Levels increase at 10, 25, 50, 100, 200 and 300 apples."],
 tetris:["Keep stacking until the board fills.","← → move, ↑ rotates, ↓ soft-drops and Space hard-drops. Every ten lines raises the level."],
 pong:["First to five points wins.","Move the paddle with a mouse, finger, ↑/↓ or the hold buttons."],
 breakout:["Clear waves of bricks and keep your lives.","Move or drag the paddle, or hold the direction buttons. Each new wave increases the pace."],
 flappy:["Fly for as long as you can.","Tap the canvas, Flap, or Space. Gaps gradually get narrower."],
 simon:["Remember an ever-growing pattern.","Watch first, then repeat. Replaying the sequence changes this run to practice."],
 whack:["Score as many hits as possible in 30 seconds.","Tap the flower; empty holes count as misses. The pace gradually increases."],
 typing:["A full 30-second typing sprint.","Type the shown sentence exactly. Correct characters in unfinished sentences count too."],
 math:["A full 45-second math sprint.","Solve as many questions as possible. There is no ten-answer limit."]
};
function mount(app,id){
 clear();
 const info=core.CATALOG.find(g=>g.id===id);
 if(!info||!registry.has(id)){app.innerHTML='<section class="page-intro"><h1>Game not found</h1><p>This game is not available yet.</p><a class="btn primary" href="#/">Back to the arcade</a></section>';return}
 app.innerHTML='<section class="page-intro arcade-game-title"><a class="back-link" href="#/">← All games</a><span class="eyebrow">'+info.category.toUpperCase()+' / NOW PLAYING</span><h1>'+info.name+'</h1><p>'+info.description+'</p></section><section class="glass arcade-game-shell"><div class="arcade-game-top"><span class="arcade-game-badge">'+info.symbol+' '+info.category+'</span><div class="arcade-run-controls"><button type="button" class="btn ghost" id="arcadePause" hidden>Pause</button><button type="button" class="btn ghost" id="arcadeEndRun" hidden>End run</button><button type="button" class="btn ghost arcade-restart" id="arcadeRestart">↻ New game</button></div></div><div class="arcade-game-content" id="arcadeGameContent"></div></section><div class="arcade-bottom"><p>Games run in your browser. Online score submission is optional.</p><a href="#/">Explore more games →</a></div>';
 const body=document.getElementById("arcadeGameContent"),pauseButton=document.getElementById("arcadePause"),endButton=document.getElementById("arcadeEndRun");
 let disposed=false,roundDisposers=[],allDisposers=[],running=false;
 const clock=new core.PlayClock(()=>performance.now());
 const ctx={
  id,info,body,finished:false,ranked:true,mode:window.PixelLeaderboardRules.defaultMode(id),endRun:null,
  get paused(){return clock.paused},
  now(){return clock.now()},
  elapsed(){return clock.elapsed()},
  screen(html){body.innerHTML=html},
  on(node,event,fn,options){
   if(!node)return;
   const wrapped=e=>{
    if(ctx.finished||ctx.paused&&!["keyup","pointerup","pointercancel","blur"].includes(event))return;
    if(node===document&&event==="keydown"){
     if(e.altKey||e.ctrlKey||e.metaKey||e.target.matches?.("input,select,textarea,[contenteditable=true]"))return;
     if(e.target.closest?.("button,a,summary")&&!body.contains(e.target))return;
    }
    fn(e);
   };
   node.addEventListener(event,wrapped,options);roundDisposers.push(()=>node.removeEventListener(event,wrapped,options));return node;
  },
  after(fn,ms){const due=ctx.now()+ms;const timer=setInterval(()=>{if(!disposed&&!ctx.finished&&!ctx.paused&&ctx.now()>=due){clearInterval(timer);fn()}},Math.min(25,Math.max(1,ms)));roundDisposers.push(()=>clearInterval(timer));return timer},
  every(fn,ms){let due=ctx.now()+ms;const timer=setInterval(()=>{if(!disposed&&!ctx.finished&&!ctx.paused&&ctx.now()>=due){due=ctx.now()+ms;fn()}},Math.min(50,ms));roundDisposers.push(()=>clearInterval(timer));return timer},
  loop(fn){let frame=0,alive=true;const tick=()=>{if(!alive||disposed||ctx.finished)return;if(!ctx.paused)fn(ctx.now());if(alive&&!disposed&&!ctx.finished)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);roundDisposers.push(()=>{alive=false;cancelAnimationFrame(frame)})},
  notice(message){const el=body.querySelector(".arcade-status");if(el)el.textContent=message},
  setEndRun(fn){ctx.endRun=fn;endButton.hidden=false},
  pause(message="Take a breather. Your game and clock are paused."){
   if(!running||ctx.finished||ctx.paused||!READY[id])return;
   clock.pause();pauseButton.textContent="Resume";for(const child of body.children)child.inert=true;
   body.insertAdjacentHTML("beforeend",'<div class="arcade-pause"><section class="glass arcade-pause-card" aria-label="Paused game"><h2>Paused</h2><p></p><button type="button" class="btn primary">Resume play</button></section></div>');
   const overlay=body.querySelector(".arcade-pause");overlay.querySelector("p").textContent=message;overlay.querySelector("button").addEventListener("click",()=>ctx.resume());overlay.querySelector("button").focus();
  },
  resume(){if(!ctx.paused||ctx.finished)return;clock.resume();body.querySelector(".arcade-pause")?.remove();for(const child of body.children)child.inert=false;pauseButton.textContent="Pause";body.querySelector("canvas,input,button")?.focus({preventScroll:true})},
  start(){
   for(const fn of roundDisposers.splice(0))fn();
   running=false;ctx.finished=false;ctx.ranked=true;ctx.endRun=null;endButton.hidden=true;pauseButton.hidden=true;pauseButton.textContent="Pause";clock.reset();
   if(READY[id]){
    ctx.screen('<section class="arcade-ready"><span class="eyebrow">READY WHEN YOU ARE</span><h2></h2><p class="ready-objective"></p><p class="ready-controls"></p><button class="btn primary" type="button">Play</button><p class="arcade-status">Nothing moves and no timer runs until you press Play.</p></section>');
    body.querySelector("h2").textContent="Play "+info.name;body.querySelector(".ready-objective").textContent=READY[id][0];body.querySelector(".ready-controls").textContent=READY[id][1];
    const play=body.querySelector("button");const begin=()=>{if(running)return;ctx.begin();body.scrollIntoView({block:"start",behavior:"instant"});body.querySelector("canvas,input,button")?.focus({preventScroll:true})};
    play.addEventListener("click",begin);roundDisposers.push(()=>play.removeEventListener("click",begin));
   }else ctx.begin();
  },
  begin(){running=true;clock.reset();pauseButton.hidden=!READY[id];registry.get(id)(ctx)},
  finish(won,headline,detail,score=null){
   if(disposed||ctx.finished)return;
   const duration=ctx.elapsed();ctx.finished=true;running=false;clock.pause();for(const fn of roundDisposers.splice(0))fn();
   pauseButton.hidden=true;endButton.hidden=true;body.querySelector(".arcade-pause")?.remove();for(const child of body.children)child.inert=false;record(id,won);
   body.insertAdjacentHTML("beforeend",'<div class="arcade-end" role="status"><div class="arcade-result glass"><div class="arcade-result-symbol">'+(won?"✦":"↻")+'</div><h2></h2><p></p><div class="button-row"><button class="btn primary arcade-again" type="button">Play again ↻</button><a class="btn ghost" href="#/">All games</a></div></div></div>');
   const result=body.querySelector(".arcade-result");result.querySelector("h2").textContent=headline;result.querySelector("p").textContent=detail+(ctx.ranked?"":" Practice run — score submission is disabled.");
   result.querySelector(".arcade-again").addEventListener("click",()=>ctx.start());
   window.PixelLeaderboard.offer(result.querySelector(".button-row"),ctx.ranked?window.PixelLeaderboard.result(id,won,score,duration,ctx.mode):null,id,ctx.mode);
   result.querySelector(".arcade-again").focus();
  },
  dispose(){if(disposed)return;disposed=true;running=false;for(const fn of roundDisposers.splice(0))fn();for(const fn of allDisposers.splice(0))fn()}
 };
 function listen(node,event,fn){node.addEventListener(event,fn);allDisposers.push(()=>node.removeEventListener(event,fn))}
 listen(document.getElementById("arcadeRestart"),"click",()=>ctx.start());
 listen(pauseButton,"click",()=>ctx.paused?ctx.resume():ctx.pause());
 listen(endButton,"click",()=>{if(running&&!ctx.finished)ctx.endRun?.()});
 listen(document,"visibilitychange",()=>{if(document.hidden)ctx.pause("You switched away. Resume whenever you are ready.")});
 listen(window,"blur",()=>ctx.pause("The window lost focus. Resume whenever you are ready."));
 active=ctx;ctx.start();
}
window.PixelArcade={catalog,register,mount,clear,totals(){const values=Object.values(readStats());return {played:values.reduce((n,s)=>n+(s.played||0),0),wins:values.reduce((n,s)=>n+(s.wins||0),0)}},get active(){return active}};
})();


