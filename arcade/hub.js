(function(){
"use strict";
const core=window.ArcadeCore,registry=new Map();
let active=null;
const categories=["All","Arcade","Puzzle","Strategy","Words","Quiz","Reflex"];
function readStats(){try{return JSON.parse(localStorage.getItem("pixelplay2.arcade.stats"))||{}}catch{return {}}}
function record(id,won){const stats=readStats(),s=stats[id]||{played:0,wins:0};s.played++;if(won)s.wins++;stats[id]=s;try{localStorage.setItem("pixelplay2.arcade.stats",JSON.stringify(stats))}catch{}}
function catalog(element){
 if(!element)return;
 element.innerHTML='<section class="arcade-library" aria-label="More games"><div class="arcade-section-heading"><div><span class="eyebrow">THE WHOLE ARCADE</span><h2>Find your next favorite</h2><p>Quick games, brain teasers, and old-school favorites — play in your browser.</p></div><span class="arcade-count">'+core.CATALOG.length+' playable games</span></div><div class="arcade-toolbar glass"><label class="arcade-search"><span aria-hidden="true">⌕</span><input id="arcadeSearch" type="search" placeholder="Search games…" aria-label="Search games"></label><div class="arcade-filters" id="arcadeFilters" aria-label="Filter games by category"></div></div><div id="arcadeResults" class="arcade-cards"></div><p class="arcade-empty" id="arcadeEmpty" hidden>No games found. Try a different search or category.</p></section>';
 const filters=element.querySelector("#arcadeFilters"),results=element.querySelector("#arcadeResults"),search=element.querySelector("#arcadeSearch"),empty=element.querySelector("#arcadeEmpty");
 let selected="All";
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
function mount(app,id){
 clear();
 const info=core.CATALOG.find(g=>g.id===id);
 if(!info||!registry.has(id)){app.innerHTML='<section class="page-intro"><h1>Game not found</h1><p>This game is not available yet.</p><a class="btn primary" href="#/">Back to the arcade</a></section>';return}
 app.innerHTML='<section class="page-intro arcade-game-title"><a class="back-link" href="#/">← All games</a><span class="eyebrow">'+info.category.toUpperCase()+' / NOW PLAYING</span><h1>'+info.name+'</h1><p>'+info.description+'</p></section><section class="glass arcade-game-shell"><div class="arcade-game-top"><span class="arcade-game-badge">'+info.symbol+' '+info.category+'</span><button type="button" class="btn ghost arcade-restart" id="arcadeRestart">↻ New game</button></div><div class="arcade-game-content" id="arcadeGameContent"></div></section><div class="arcade-bottom"><p>All games run locally in your browser. No account needed.</p><a href="#/">Explore more games →</a></div>';
 const body=document.getElementById("arcadeGameContent");
 let disposed=false,roundDisposers=[],allDisposers=[];
 const ctx={
  id,info,body,finished:false,
  screen(html){body.innerHTML=html},
  on(node,event,fn,options){if(!node)return;node.addEventListener(event,fn,options);roundDisposers.push(()=>node.removeEventListener(event,fn,options));return node},
  after(fn,ms){const id=setTimeout(()=>{if(!disposed&&!ctx.finished)fn()},ms);roundDisposers.push(()=>clearTimeout(id));return id},
  every(fn,ms){const id=setInterval(()=>{if(!disposed&&!ctx.finished)fn()},ms);roundDisposers.push(()=>clearInterval(id));return id},
  loop(fn){let frame=0,alive=true;const tick=t=>{if(!alive||disposed||ctx.finished)return;fn(t);frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);roundDisposers.push(()=>{alive=false;cancelAnimationFrame(frame)})},
  notice(text){const el=body.querySelector(".arcade-status");if(el)el.textContent=text},
  start(){
   for(const fn of roundDisposers.splice(0))fn();
   ctx.finished=false;ctx.startedAt=performance.now();
   registry.get(id)(ctx);
  },
  finish(won,headline,detail,score=null){
   if(disposed||ctx.finished)return;
   ctx.finished=true;record(id,won);
   body.insertAdjacentHTML("beforeend",'<div class="arcade-end" role="status"><div class="arcade-result glass"><div class="arcade-result-symbol">'+(won?"✦":"↻")+'</div><h2></h2><p></p><div class="button-row"><button class="btn primary arcade-again" type="button">Play again ↻</button><a class="btn ghost" href="#/">All games</a></div></div></div>');
   const result=body.querySelector(".arcade-result");result.querySelector("h2").textContent=headline;result.querySelector("p").textContent=detail;
   result.querySelector(".arcade-again").addEventListener("click",()=>ctx.start());
   window.PixelLeaderboard.offer(result.querySelector(".button-row"),window.PixelLeaderboard.result(id,won,score,performance.now()-ctx.startedAt),id);
   result.querySelector(".arcade-again").focus();
  },
  dispose(){if(disposed)return;disposed=true;for(const fn of roundDisposers.splice(0))fn();for(const fn of allDisposers.splice(0))fn()}
 };
 const restart=document.getElementById("arcadeRestart");const restartHandler=()=>ctx.start();
 restart.addEventListener("click",restartHandler);allDisposers.push(()=>restart.removeEventListener("click",restartHandler));
 active=ctx;ctx.start();
}
window.PixelArcade={catalog,register,mount,clear,totals(){const values=Object.values(readStats());return {played:values.reduce((n,s)=>n+(s.played||0),0),wins:values.reduce((n,s)=>n+(s.wins||0),0)}},get active(){return active}};
})();

