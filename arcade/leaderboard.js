(function(){
"use strict";
const R=window.PixelLeaderboardRules;
let client=null,authTask=null;
function database(){
 const config=window.PIXELPLAY_LEADERBOARD||{};
 if(!config.url||!config.publishableKey)throw new Error("Online leaderboards are not connected yet. You can still play every game.");
 if(!window.supabase)throw new Error("Couldn't load the leaderboard service. Check your connection and try again.");
 if(!client)client=window.supabase.createClient(config.url,config.publishableKey);
 return client;
}
async function identity(){
 if(!authTask)authTask=(async()=>{const db=database();const current=await db.auth.getSession();if(current.error)throw current.error;if(current.data.session)return current.data.session.user;const signed=await db.auth.signInAnonymously();if(signed.error)throw signed.error;return signed.data.user})().catch(e=>{authTask=null;throw e});
 return authTask;
}
function button(text,handler){const b=document.createElement("button");b.type="button";b.className="btn ghost";b.textContent=text;b.addEventListener("click",handler);return b}
function text(tag,value){const el=document.createElement(tag);el.textContent=value;return el}
function readName(){try{return localStorage.getItem("pixelplay2.playerName")||""}catch{return ""}}
function show(game="hangman",mode=null,entry=null){
 const previous=document.querySelector("#leaderboardDialog");if(previous)previous.close();
 const modal=document.createElement("dialog");modal.id="leaderboardDialog";modal.className="leaderboard-dialog glass";modal.setAttribute("aria-labelledby","leaderboardTitle");
 const heading=text("h2","Global leaderboards");heading.id="leaderboardTitle";modal.append(heading);
 const close=button("Close",()=>modal.close());close.classList.add("leaderboard-close");modal.append(close);
 const controls=document.createElement("div");controls.className="leaderboard-controls";
 const gameLabel=text("label","Game "),games=document.createElement("select");games.className="select";
 window.ArcadeCore.CATALOG.forEach(g=>{const option=text("option",g.name);option.value=g.id;games.append(option)});games.value=game;gameLabel.append(games);
 const modeLabel=text("label","Difficulty "),modes=document.createElement("select");modes.className="select";modeLabel.append(modes);controls.append(gameLabel,modeLabel);modal.append(controls);
 const rule=text("p",""),state=text("p",""),list=document.createElement("div");state.setAttribute("role","status");list.className="leaderboard-list";modal.append(rule,state,list);
 let generation=0;
 function setModes(){modes.replaceChildren();const available=R.modes(games.value);modeLabel.textContent=["hangman","memory"].includes(games.value)?"Difficulty ":"Mode ";modeLabel.append(modes);for(const item of available){const option=text("option",item.label);option.value=item.value;modes.append(option)}modeLabel.hidden=available.length===1;modes.value=available.some(item=>item.value===mode)?mode:available[0].value}
 async function load(){
  const token=++generation,r=R.rules(games.value);list.replaceChildren();rule.textContent=(r.ascending?"Lowest ":"Highest ")+r.unit+" wins. Ties: faster completion, then earliest record. One best result per player."+(r.winsOnly?" Only wins qualify.":" Completed rounds qualify, including losses.");state.textContent="Loading rankings…";
  try{const response=await database().rpc("pixelplay_top",{p_game:games.value,p_mode:modes.value});if(response.error)throw response.error;if(token!==generation||!modal.open)return;
   const rows=response.data||[];state.textContent=rows.length?"Top "+rows.length+" players":"No results yet. Be the first!";
   if(!rows.length)return;const table=document.createElement("table"),head=document.createElement("thead"),hr=document.createElement("tr");["Rank","Player",r.unit,"Time"].forEach(v=>hr.append(text("th",v)));head.append(hr);table.append(head);const body=document.createElement("tbody");
   rows.forEach((row,i)=>{const tr=document.createElement("tr");[i+1,row.player_name,Number(row.score).toLocaleString(),(row.duration_ms/1000).toFixed(2)+"s"].forEach(v=>tr.append(text("td",v)));body.append(tr)});table.append(body);list.append(table);
  }catch(e){if(token===generation&&modal.open)state.textContent=e.message||"Unable to load rankings. Try again."}
 }
 games.addEventListener("change",()=>{mode=null;setModes();load()});modes.addEventListener("change",load);controls.append(button("Refresh",load));setModes();
 if(entry){
  const form=document.createElement("form");form.className="leaderboard-submit";const label=text("label","Your public player name "),name=document.createElement("input");name.required=true;name.minLength=2;name.maxLength=24;name.autocomplete="nickname";name.value=readName();label.append(name);const submit=text("button","Submit result");submit.className="btn primary";submit.type="submit";const status=text("p","");status.setAttribute("role","status");
  form.append(text("h3","Your result: "+entry.score+" "+R.rules(entry.game_id).unit),label,submit,text("p","Your name and best result will be public. A guest identity is saved on this browser; clearing browser data creates a new player."),status);
  form.addEventListener("submit",async event=>{event.preventDefault();const player=name.value.trim();if(player.length<2||player.length>24){status.textContent="Use 2–24 characters for your name.";return}submit.disabled=true;status.textContent="Submitting…";
   try{await identity();const response=await database().rpc("pixelplay_submit",{p_game:entry.game_id,p_mode:entry.mode,p_name:player,p_score:entry.score,p_duration:entry.duration_ms});if(response.error)throw response.error;try{localStorage.setItem("pixelplay2.playerName",player)}catch{}status.textContent="Result saved. Your best result is kept on the board.";submit.textContent="Submitted";games.value=entry.game_id;mode=entry.mode;setModes();await load()}
   catch(e){status.textContent=e.message||"Couldn't submit. Please try again.";submit.disabled=false}
  });modal.append(form);
 }
 // Keep game keyboard handlers from consuming keys used inside the modal.
 modal.addEventListener("keydown",event=>event.stopPropagation());
 modal.addEventListener("keyup",event=>event.stopPropagation());
 modal.addEventListener("close",()=>{generation++;modal.remove()},{once:true});document.body.append(modal);modal.showModal();load();
}
function offer(container,entry,game="hangman",mode="standard"){if(container)container.append(button(entry?"🏆 Submit & view leaderboard":"🏆 View leaderboard",()=>show(entry?.game_id||game,entry?.mode||mode,entry)))}
window.PixelLeaderboard={show,offer,result:R.result};
})();

