(function(){
"use strict";
const A=window.PixelArcade,C=window.ArcadeCore;
const $=(ctx,s)=>ctx.body.querySelector(s);
const $$=(ctx,s)=>[...ctx.body.querySelectorAll(s)];
function resultStatus(txt){return '<p class="arcade-status" role="status" aria-live="polite">'+txt+'</p>'}
function rps(ctx){
 const choices=["Rock","Paper","Scissors"],symbols=["✊","✋","✌"];let round=0,you=0,cpu=0;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>You <b id="rpsYou">0</b></span><span>Round <b id="rpsRound">1 / 5</b></span><span>CPU <b id="rpsCpu">0</b></span></div><div class="rps-face"><span id="rpsSelf">?</span><span class="rps-versus">VS</span><span id="rpsOther">?</span></div><div class="arcade-choices" id="rpsChoices">'+choices.map((c,i)=>'<button class="arcade-choice rps-choice" data-choice="'+i+'" type="button">'+symbols[i]+' '+c+'</button>').join("")+'</div>'+resultStatus("Choose rock, paper, or scissors. Best of five rounds.")+'</div>');
 ctx.on($(ctx,"#rpsChoices"),"click",e=>{const btn=e.target.closest("[data-choice]");if(!btn||ctx.finished||round>=5)return;const p=+btn.dataset.choice,c=Math.floor(Math.random()*3),outcome=(p-c+3)%3;if(outcome===1)you++;else if(outcome===2)cpu++;round++;$(ctx,"#rpsSelf").textContent=symbols[p];$(ctx,"#rpsOther").textContent=symbols[c];$(ctx,"#rpsYou").textContent=you;$(ctx,"#rpsCpu").textContent=cpu;$(ctx,"#rpsRound").textContent=Math.min(round+1,5)+" / 5";ctx.notice(choices[p]+" vs "+choices[c]+": "+(outcome===0?"draw":outcome===1?"you win!":"CPU wins."));if(round===5)ctx.finish(you>cpu,you>cpu?"You win the match!":you===cpu?"It's a tie!":"The computer wins", "Final score: "+you+" – "+cpu+".",you)});
}
function simon(ctx){
 let sequence=[],step=0,accept=false,level=0;
 const labels=["Violet","Coral","Mint","Sky"];
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Level <b id="simonLevel">1</b></span><span>Repeat the pattern</span></div><div class="simon-grid" id="simonBoard">'+labels.map((l,i)=>'<button class="simon-pad simon-'+i+'" data-i="'+i+'" type="button" aria-label="'+l+'"></button>').join("")+'</div><button type="button" class="btn ghost" id="simonRepeat">Replay (practice)</button>'+resultStatus("Watch the colors, then tap them in the same order.")+'</div>');
 const pads=$$(ctx,".simon-pad");
 function flash(i){pads[i].classList.add("lit");ctx.after(()=>pads[i].classList.remove("lit"),370)}
 function playback(){accept=false;step=0;ctx.notice("Watch the pattern…");sequence.forEach((v,i)=>ctx.after(()=>flash(v),550+i*700));ctx.after(()=>{accept=true;ctx.notice("Your turn — repeat "+sequence.length+" colors!")},550+sequence.length*700)}
 function advance(){if(ctx.finished)return;sequence.push(Math.floor(Math.random()*4));level=sequence.length;$(ctx,"#simonLevel").textContent=level;ctx.after(playback,500)}
 pads.forEach((pad,i)=>ctx.on(pad,"click",()=>{if(!accept||ctx.finished)return;flash(i);if(i!==sequence[step]){accept=false;ctx.finish(false,"Wrong sequence","You reached level "+level+". Keep practicing!",Math.max(0,level-(step===sequence.length?0:1)));return}step++;if(step===sequence.length){accept=false;ctx.notice("Correct! Next level…");advance()}}));
 ctx.on($(ctx,"#simonRepeat"),"click",()=>{if(accept){ctx.ranked=false;accept=false;playback();$(ctx,"#simonRepeat").textContent="Replay (practice run)"}});
 ctx.setEndRun(()=>ctx.finish(false,"Sequence saved","You completed "+Math.max(0,level-1)+" levels.",Math.max(0,level-1)));
 advance();
}
function reaction(ctx){
 let state="idle",readyAt=0;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Challenge <b>Reflex</b></span><span>Unit <b>milliseconds</b></span></div><button class="reaction-pad" type="button" id="reactionPad"><strong id="reactionTitle">Ready?</strong><span id="reactionDesc">Tap to start</span></button>'+resultStatus("Wait for green — then tap as fast as possible.")+'</div>');
 ctx.on(document,"visibilitychange",()=>{if(document.hidden&&(state==="waiting"||state==="ready")){state="done";ctx.finish(false,"Trial cancelled","The page was hidden during the trial. Start again when you are ready.",null)}});
 const pad=$(ctx,"#reactionPad"),title=$(ctx,"#reactionTitle"),desc=$(ctx,"#reactionDesc");
 ctx.on(pad,"click",()=>{if(ctx.finished)return;if(state==="idle"){state="waiting";pad.className="reaction-pad waiting";title.textContent="Wait for it…";desc.textContent="Don't tap yet";ctx.after(()=>{state="ready";readyAt=ctx.now();pad.className="reaction-pad go";title.textContent="TAP!";desc.textContent="Now!"},1400+Math.random()*2300)}else if(state==="waiting"){state="done";pad.className="reaction-pad";ctx.finish(false,"Too soon!","You tapped before the light turned green.",null)}else if(state==="ready"){state="done";const ms=Math.round(ctx.now()-readyAt);pad.className="reaction-pad go";title.textContent=ms+"ms";ctx.finish(true,ms<250?"Lightning fast!":"Reaction recorded",ms+" milliseconds. Try again to beat your time.",ms)}});
}
function typing(ctx){
 const phrases=["A little progress every day goes a long way.","The quick brown fox jumps over the lazy dog.","Great games are made one small step at a time.","The stars are beautiful in the evening sky.","Practice makes progress, not perfection.","The best ideas often start with curiosity.","PixelPlay is a cozy corner for fun and games.","Never stop exploring and learning new things.","Every keystroke brings you closer to the goal."];
 let index=0,done=0,correct=0,previous="",attempts=0,mistakes=0;const started=ctx.now(),order=C.shuffle(phrases);
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Time <b id="typeTime">30s</b></span><span>Completed <b id="typeDone">0</b></span><span>Accuracy <b id="typeAccuracy">100%</b></span></div><div class="typing-quote" id="typeQuote"></div><input class="arcade-text-input typing-input" id="typeInput" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Type the shown sentence" placeholder="Start typing here…">'+resultStatus("Type for 30 seconds. Correct characters in unfinished sentences count. Paste is disabled.")+'</div>');
 const input=$(ctx,"#typeInput"),quote=$(ctx,"#typeQuote");
 function draw(){quote.textContent=order[index%order.length];$(ctx,"#typeDone").textContent=done;$(ctx,"#typeAccuracy").textContent=(attempts?Math.round(100*(attempts-mistakes)/attempts):100)+"%"}
 function finish(){const target=order[index%order.length],partial=[...input.value].filter((c,i)=>c===target[i]).length;const wpm=Math.round((correct+partial)/5/.5);input.disabled=true;ctx.finish(done>0||partial>0,"Sprint complete",wpm+" WPM · "+(attempts?Math.round(100*(attempts-mistakes)/attempts):100)+"% accuracy · "+done+" full sentences.",wpm)}
 ctx.on(input,"input",()=>{
  const target=order[index%order.length],value=input.value;let common=0;while(common<previous.length&&common<value.length&&previous[common]===value[common])common++;
  for(let i=common;i<value.length;i++){attempts++;if(value[i]!==target[i])mistakes++}
  previous=value;if(value===target){correct+=target.length;done++;index++;input.value="";previous="";ctx.notice("Sentence complete! Keep going.")}draw();
 });
 ctx.on(input,"paste",e=>{e.preventDefault();ctx.notice("Type the sentence yourself — paste is disabled for this sprint.")});
 ctx.on(input,"drop",e=>e.preventDefault());
 ctx.every(()=>{const left=Math.max(0,30-Math.floor((ctx.now()-started)/1000));$(ctx,"#typeTime").textContent=left+"s";if(!left)finish()},100);
 draw();
}
function whack(ctx){
 let target=-1,hits=0,misses=0;const started=ctx.now();
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Hits <b id="whackHits">0</b></span><span>Misses <b id="whackMisses">0</b></span><span>Time <b id="whackTime">30s</b></span></div><div class="whack-grid" id="whackGrid">'+Array.from({length:9},(_,i)=>'<button type="button" class="whack-hole" data-i="'+i+'" aria-label="Hole '+(i+1)+'"><span>◯</span></button>').join("")+'</div>'+resultStatus("A full 30-second sprint. One attempt per flower. Empty holes count as misses.")+'</div>');
 const grid=$(ctx,"#whackGrid");
 function paint(){[...grid.children].forEach((b,i)=>{b.classList.toggle("active",i===target);b.querySelector("span").textContent=i===target?"✿":"◯";b.setAttribute("aria-label","Hole "+(i+1)+(i===target?", flower":", empty"))});$(ctx,"#whackHits").textContent=hits;$(ctx,"#whackMisses").textContent=misses}
 ctx.on(grid,"click",e=>{const b=e.target.closest("[data-i]");if(!b||target<0)return;if(+b.dataset.i===target)hits++;else misses++;target=-1;paint()});
 function pop(){let next=Math.floor(Math.random()*9);target=next===target?(next+1)%9:next;paint();ctx.after(pop,Math.max(260,650-Math.floor((ctx.now()-started)/5000)*65))}
 pop();ctx.every(()=>{const left=Math.max(0,30-Math.floor((ctx.now()-started)/1000));$(ctx,"#whackTime").textContent=left+"s";if(!left)ctx.finish(hits>=12,"Sprint complete",hits+" hits and "+misses+" misses in 30 seconds.",hits)},100);
}
function trivia(ctx){
 const questions=C.shuffle(C.QUESTIONS).slice(0,10);let index=0,score=0,locked=false;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Question <b id="quizQuestion">1 / 10</b></span><span>Score <b id="quizScore">0</b></span></div><div class="quiz-question" id="quizText"></div><div class="quiz-choices" id="quizChoices"></div>'+resultStatus("Pick the right answer. Seven correct answers to win.")+'</div>');
 function draw(){if(index===10){ctx.finish(score>=7,score>=7?"Trivia master!":"Quiz complete",score+" of 10 answers correct.",score);return}locked=false;const [q,answers]=questions[index];$(ctx,"#quizQuestion").textContent=index+1+" / 10";$(ctx,"#quizScore").textContent=score;$(ctx,"#quizText").textContent=q;const choices=$(ctx,"#quizChoices");choices.innerHTML=answers.map((a,i)=>'<button type="button" class="arcade-choice" data-answer="'+i+'">'+a+'</button>').join("")}
 ctx.on($(ctx,"#quizChoices"),"click",e=>{const b=e.target.closest("[data-answer]");if(!b||locked||ctx.finished)return;locked=true;const answer=+b.dataset.answer,right=questions[index][2];if(answer===right)score++;$(ctx,"#quizScore").textContent=score;[...$(ctx,"#quizChoices").children].forEach(el=>{el.disabled=true;el.classList.toggle("is-correct",+el.dataset.answer===right);el.classList.toggle("is-incorrect",+el.dataset.answer===answer&&answer!==right)});ctx.notice(answer===right?"Correct answer!":"The correct answer is "+questions[index][1][right]+".");index++;ctx.after(draw,850)});
 draw();
}
function math(ctx){
 let points=0,misses=0,answer=0;const started=ctx.now();
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Time <b id="mathTime">45s</b></span><span>Correct <b id="mathPoints">0</b></span><span>Mistakes <b id="mathMisses">0</b></span></div><div class="math-question" id="mathQuestion"></div><form id="mathForm" class="arcade-form"><input id="mathAnswer" type="number" inputmode="numeric" required autocomplete="off" aria-label="Math answer" placeholder="Answer…"><button class="btn primary">Submit</button></form>'+resultStatus("Solve as many questions as you can in 45 seconds. There is no answer limit.")+'</div>');
 function question(){const op=Math.floor(Math.random()*3),a=2+Math.floor(Math.random()*18),b=2+Math.floor(Math.random()*12);if(op===0){answer=a+b;$(ctx,"#mathQuestion").textContent=a+" + "+b+" = ?"}else if(op===1){answer=a;$(ctx,"#mathQuestion").textContent=(a+b)+" − "+b+" = ?"}else{answer=a*b;$(ctx,"#mathQuestion").textContent=a+" × "+b+" = ?"}$(ctx,"#mathAnswer").value=""}
 ctx.on($(ctx,"#mathForm"),"submit",e=>{e.preventDefault();const input=$(ctx,"#mathAnswer");if(!input.value.trim())return;if(Number(input.value)===answer){points++;$(ctx,"#mathPoints").textContent=points;ctx.notice("Correct!");question()}else{misses++;$(ctx,"#mathMisses").textContent=misses;ctx.notice("Try again — check your arithmetic.");input.select()}});
 ctx.every(()=>{const left=Math.max(0,45-Math.floor((ctx.now()-started)/1000));$(ctx,"#mathTime").textContent=left+"s";if(!left)ctx.finish(points>=10,"Sprint complete",points+" correct answers and "+misses+" mistakes in 45 seconds.",points)},100);
 question();
}
function colors(ctx){
 const palette=[["RED","#f87171"],["BLUE","#60a5fa"],["GREEN","#4ade80"],["YELLOW","#facc15"],["PURPLE","#c084fc"],["ORANGE","#fb923c"]];
 let round=0,points=0,locked=false,match=false;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Round <b id="colorRound">1 / 12</b></span><span>Score <b id="colorPoints">0</b></span></div><p class="color-rule">Does the <b>INK COLOR</b> match the written word?</p><div class="color-word" id="colorWord"></div><div class="arcade-choices" id="colorAnswers"><button class="arcade-choice" data-answer="yes" type="button">✓ Yes</button><button class="arcade-choice" data-answer="no" type="button">✕ No</button></div>'+resultStatus("Ignore what the word says. Focus on the color of the letters.")+'</div>');
 function question(){if(round>=12){ctx.finish(points>=9,points>=9?"Sharp eyes!":"Color challenge complete",points+" of 12 correct. Focus on the ink, not the word!",points);return}locked=false;const name=Math.floor(Math.random()*palette.length);match=Math.random()<.45;let ink=match?name:(name+1+Math.floor(Math.random()*(palette.length-1)))%palette.length;const el=$(ctx,"#colorWord");el.textContent=palette[name][0];el.style.color=palette[ink][1];$(ctx,"#colorRound").textContent=round+1+" / 12";$(ctx,"#colorPoints").textContent=points}
 ctx.on($(ctx,"#colorAnswers"),"click",e=>{const b=e.target.closest("[data-answer]");if(!b||locked||ctx.finished)return;locked=true;const right=(b.dataset.answer==="yes")===match;if(right)points++;ctx.notice(right?"Correct!":"Not quite!");round++;ctx.after(question,350)});
 question();
}
A.register("rps",rps);A.register("simon",simon);A.register("reaction",reaction);A.register("typing",typing);
A.register("whack",whack);A.register("trivia",trivia);A.register("math",math);A.register("colors",colors);
})();


