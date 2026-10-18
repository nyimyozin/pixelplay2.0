(function(){
"use strict";
const A=window.PixelArcade,C=window.ArcadeCore;
const $=(ctx,s)=>ctx.body.querySelector(s);
const $$=(ctx,s)=>[...ctx.body.querySelectorAll(s)];
function resultStatus(txt){return '<p class="arcade-status" role="status" aria-live="polite">'+txt+'</p>'}
function rps(ctx){
 const choices=["Rock","Paper","Scissors"],symbols=["✊","✋","✌"];let round=0,you=0,cpu=0;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>You <b id="rpsYou">0</b></span><span>Round <b id="rpsRound">1 / 5</b></span><span>CPU <b id="rpsCpu">0</b></span></div><div class="rps-face"><span id="rpsSelf">?</span><span class="rps-versus">VS</span><span id="rpsOther">?</span></div><div class="arcade-choices" id="rpsChoices">'+choices.map((c,i)=>'<button class="arcade-choice rps-choice" data-choice="'+i+'" type="button">'+symbols[i]+' '+c+'</button>').join("")+'</div>'+resultStatus("Choose rock, paper, or scissors. Best of five rounds.")+'</div>');
 ctx.on($(ctx,"#rpsChoices"),"click",e=>{const btn=e.target.closest("[data-choice]");if(!btn||ctx.finished||round>=5)return;const p=+btn.dataset.choice,c=Math.floor(Math.random()*3),outcome=(p-c+3)%3;if(outcome===1)you++;else if(outcome===2)cpu++;round++;$(ctx,"#rpsSelf").textContent=symbols[p];$(ctx,"#rpsOther").textContent=symbols[c];$(ctx,"#rpsYou").textContent=you;$(ctx,"#rpsCpu").textContent=cpu;$(ctx,"#rpsRound").textContent=Math.min(round+1,5)+" / 5";ctx.notice(choices[p]+" vs "+choices[c]+": "+(outcome===0?"draw":outcome===1?"you win!":"CPU wins."));if(round===5)ctx.finish(you>cpu,you>cpu?"You win the match!":you===cpu?"It's a tie!":"The computer wins", "Final score: "+you+" – "+cpu+".")});
}
function simon(ctx){
 let sequence=[],step=0,accept=false,level=0;
 const labels=["Violet","Coral","Mint","Sky"];
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Level <b id="simonLevel">1 / 5</b></span><span>Repeat the pattern</span></div><div class="simon-grid" id="simonBoard">'+labels.map((l,i)=>'<button class="simon-pad simon-'+i+'" data-i="'+i+'" type="button" aria-label="'+l+'"></button>').join("")+'</div><button type="button" class="btn ghost" id="simonRepeat">Replay sequence</button>'+resultStatus("Watch the colors, then tap them in the same order.")+'</div>');
 const pads=$$(ctx,".simon-pad");
 function flash(i){pads[i].classList.add("lit");ctx.after(()=>pads[i].classList.remove("lit"),370)}
 function playback(){accept=false;step=0;ctx.notice("Watch the pattern…");sequence.forEach((v,i)=>ctx.after(()=>flash(v),550+i*700));ctx.after(()=>{accept=true;ctx.notice("Your turn — repeat "+sequence.length+" colors!")},550+sequence.length*700)}
 function advance(){if(ctx.finished)return;sequence.push(Math.floor(Math.random()*4));level=sequence.length;$(ctx,"#simonLevel").textContent=level+" / 5";ctx.after(playback,500)}
 pads.forEach((pad,i)=>ctx.on(pad,"click",()=>{if(!accept||ctx.finished)return;flash(i);if(i!==sequence[step]){accept=false;ctx.finish(false,"Wrong sequence","You reached level "+level+". Keep practicing!");return}step++;if(step===sequence.length){accept=false;if(level===5)ctx.finish(true,"Perfect memory!","You remembered all five sequences.");else{ctx.notice("Correct! Next level…");advance()}}}));
 ctx.on($(ctx,"#simonRepeat"),"click",()=>{if(accept){accept=false;playback()}});
 advance();
}
function reaction(ctx){
 let state="idle",readyAt=0;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Challenge <b>Reflex</b></span><span>Unit <b>milliseconds</b></span></div><button class="reaction-pad" type="button" id="reactionPad"><strong id="reactionTitle">Ready?</strong><span id="reactionDesc">Tap to start</span></button>'+resultStatus("Wait for green — then tap as fast as possible.")+'</div>');
 const pad=$(ctx,"#reactionPad"),title=$(ctx,"#reactionTitle"),desc=$(ctx,"#reactionDesc");
 ctx.on(pad,"click",()=>{if(ctx.finished)return;if(state==="idle"){state="waiting";pad.className="reaction-pad waiting";title.textContent="Wait for it…";desc.textContent="Don't tap yet";ctx.after(()=>{state="ready";readyAt=performance.now();pad.className="reaction-pad go";title.textContent="TAP!";desc.textContent="Now!"},1400+Math.random()*2300)}else if(state==="waiting"){state="done";pad.className="reaction-pad";ctx.finish(false,"Too soon!","You tapped before the light turned green.")}else if(state==="ready"){state="done";const ms=Math.round(performance.now()-readyAt);pad.className="reaction-pad go";title.textContent=ms+"ms";ctx.finish(true,ms<250?"Lightning fast!":"Reaction recorded",ms+" milliseconds. Try again to beat your time.")}});
}
function typing(ctx){
 const phrases=["A little progress every day goes a long way.","The quick brown fox jumps over the lazy dog.","Great games are made one small step at a time.","The stars are beautiful in the evening sky.","Practice makes progress, not perfection.","The best ideas often start with curiosity.","PixelPlay is a cozy corner for fun and games.","Never stop exploring and learning new things.","Every keystroke brings you closer to the goal."];
 let index=0,done=0,started=0,time=30,correct=0;
 const order=C.shuffle(phrases);
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Time <b id="typeTime">30s</b></span><span>Completed <b id="typeDone">0</b></span><span>Accuracy <b id="typeAccuracy">100%</b></span></div><div class="typing-quote" id="typeQuote"></div><input class="arcade-text-input typing-input" id="typeInput" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Type the shown sentence" placeholder="Start typing here…">'+resultStatus("Your 30-second timer begins with the first letter.")+'</div>');
 const input=$(ctx,"#typeInput"),q=$(ctx,"#typeQuote");
 function draw(){const target=order[index%order.length],value=input.value;q.textContent=target;const good=[...value].filter((c,i)=>c===target[i]).length;$(ctx,"#typeAccuracy").textContent=value.length?Math.round(100*good/value.length)+"%":"100%";$(ctx,"#typeDone").textContent=done}
 function finish(){const elapsed=(performance.now()-started)/60000||.5;const wpm=Math.round(correct/5/Math.max(elapsed,.01));ctx.finish(done>0,"Time's up!","You completed "+done+" sentences at approximately "+wpm+" WPM.")}
 ctx.on(input,"input",()=>{if(ctx.finished)return;if(!started){started=performance.now();ctx.every(()=>{time=Math.max(0,30-Math.floor((performance.now()-started)/1000));$(ctx,"#typeTime").textContent=time+"s";if(!time)finish()},160)}const target=order[index%order.length];if(input.value===target){correct+=target.length;done++;index++;input.value="";ctx.notice("Nice! Keep going.")}draw()});
 draw();
}
function whack(ctx){
 let target=-1,hits=0,misses=0,started=performance.now();
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Hits <b id="whackHits">0</b></span><span>Time <b id="whackTime">30s</b></span></div><div class="whack-grid" id="whackGrid">'+Array.from({length:9},(_,i)=>'<button type="button" class="whack-hole" data-i="'+i+'" aria-label="Hole '+(i+1)+'"><span>◯</span></button>').join("")+'</div>'+resultStatus("Tap the popping critter! Get 12 hits in 30 seconds.")+'</div>');
 const grid=$(ctx,"#whackGrid");
 function paint(){[...grid.children].forEach((b,i)=>{b.classList.toggle("active",i===target);b.querySelector("span").textContent=i===target?"✿":"◯"});$(ctx,"#whackHits").textContent=hits}
 ctx.on(grid,"click",e=>{const b=e.target.closest("[data-i]");if(!b||ctx.finished)return;let i=+b.dataset.i;if(i===target){hits++;target=-1;paint();if(hits>=12)ctx.finish(true,"Whack champion!","You landed 12 hits with "+Math.ceil(30-(performance.now()-started)/1000)+" seconds to spare.")}else{misses++;ctx.notice("Miss! Aim for the flower.")}});
 ctx.every(()=>{if(ctx.finished)return;let i=Math.floor(Math.random()*9);target=i===target?(i+1)%9:i;paint()},620);
 ctx.every(()=>{const s=Math.max(0,30-Math.floor((performance.now()-started)/1000));$(ctx,"#whackTime").textContent=s+"s";if(!s)ctx.finish(false,"Time's up!","You scored "+hits+" hits. Get 12 to win.")},170);
}
function trivia(ctx){
 const questions=C.shuffle(C.QUESTIONS).slice(0,10);let index=0,score=0,locked=false;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Question <b id="quizQuestion">1 / 10</b></span><span>Score <b id="quizScore">0</b></span></div><div class="quiz-question" id="quizText"></div><div class="quiz-choices" id="quizChoices"></div>'+resultStatus("Pick the right answer. Seven correct answers to win.")+'</div>');
 function draw(){if(index===10){ctx.finish(score>=7,score>=7?"Trivia master!":"Quiz complete",score+" of 10 answers correct.");return}locked=false;const [q,answers]=questions[index];$(ctx,"#quizQuestion").textContent=index+1+" / 10";$(ctx,"#quizScore").textContent=score;$(ctx,"#quizText").textContent=q;const choices=$(ctx,"#quizChoices");choices.innerHTML=answers.map((a,i)=>'<button type="button" class="arcade-choice" data-answer="'+i+'">'+a+'</button>').join("")}
 ctx.on($(ctx,"#quizChoices"),"click",e=>{const b=e.target.closest("[data-answer]");if(!b||locked||ctx.finished)return;locked=true;const answer=+b.dataset.answer,right=questions[index][2];if(answer===right)score++;$(ctx,"#quizScore").textContent=score;[...$(ctx,"#quizChoices").children].forEach(el=>{el.disabled=true;el.classList.toggle("is-correct",+el.dataset.answer===right);el.classList.toggle("is-incorrect",+el.dataset.answer===answer&&answer!==right)});ctx.notice(answer===right?"Correct answer!":"The correct answer is "+questions[index][1][right]+".");index++;ctx.after(draw,850)});
 draw();
}
function math(ctx){
 let points=0,left=45,started=0,answer=0;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Time <b id="mathTime">45s</b></span><span>Correct <b id="mathPoints">0 / 10</b></span></div><div class="math-question" id="mathQuestion"></div><form id="mathForm" class="arcade-form"><input id="mathAnswer" type="number" inputmode="numeric" required autocomplete="off" aria-label="Math answer" placeholder="Answer…"><button class="btn primary">Submit</button></form>'+resultStatus("Solve 10 questions before time runs out. Clock starts on your first answer.")+'</div>');
 function question(){const op=Math.floor(Math.random()*3),a=2+Math.floor(Math.random()*18),b=2+Math.floor(Math.random()*12);if(op===0){answer=a+b;$(ctx,"#mathQuestion").textContent=a+" + "+b+" = ?"}else if(op===1){answer=a;$(ctx,"#mathQuestion").textContent=(a+b)+" − "+b+" = ?"}else{answer=a*b;$(ctx,"#mathQuestion").textContent=a+" × "+b+" = ?"}$(ctx,"#mathAnswer").value=""}
 ctx.on($(ctx,"#mathForm"),"submit",e=>{e.preventDefault();if(ctx.finished)return;if(!started){started=performance.now();ctx.every(()=>{left=Math.max(0,45-Math.floor((performance.now()-started)/1000));$(ctx,"#mathTime").textContent=left+"s";if(!left)ctx.finish(false,"Time's up!","You solved "+points+" of 10 questions.")},200)}const n=Number($(ctx,"#mathAnswer").value);if(n===answer){points++;ctx.notice("Correct!");$(ctx,"#mathPoints").textContent=points+" / 10";if(points===10){ctx.finish(true,"Math whiz!","Ten questions solved. Nice mental arithmetic.");return}question()}else{ctx.notice("Try again — check your arithmetic.");$(ctx,"#mathAnswer").select()}});
 question();
}
function colors(ctx){
 const palette=[["RED","#f87171"],["BLUE","#60a5fa"],["GREEN","#4ade80"],["YELLOW","#facc15"],["PURPLE","#c084fc"],["ORANGE","#fb923c"]];
 let round=0,points=0,locked=false,match=false;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Round <b id="colorRound">1 / 12</b></span><span>Score <b id="colorPoints">0</b></span></div><p class="color-rule">Does the <b>INK COLOR</b> match the written word?</p><div class="color-word" id="colorWord"></div><div class="arcade-choices" id="colorAnswers"><button class="arcade-choice" data-answer="yes" type="button">✓ Yes</button><button class="arcade-choice" data-answer="no" type="button">✕ No</button></div>'+resultStatus("Ignore what the word says. Focus on the color of the letters.")+'</div>');
 function question(){if(round>=12){ctx.finish(points>=9,points>=9?"Sharp eyes!":"Color challenge complete",points+" of 12 correct. Focus on the ink, not the word!");return}locked=false;const name=Math.floor(Math.random()*palette.length);match=Math.random()<.45;let ink=match?name:(name+1+Math.floor(Math.random()*(palette.length-1)))%palette.length;const el=$(ctx,"#colorWord");el.textContent=palette[name][0];el.style.color=palette[ink][1];$(ctx,"#colorRound").textContent=round+1+" / 12";$(ctx,"#colorPoints").textContent=points}
 ctx.on($(ctx,"#colorAnswers"),"click",e=>{const b=e.target.closest("[data-answer]");if(!b||locked||ctx.finished)return;locked=true;const right=(b.dataset.answer==="yes")===match;if(right)points++;ctx.notice(right?"Correct!":"Not quite!");round++;ctx.after(question,350)});
 question();
}
A.register("rps",rps);A.register("simon",simon);A.register("reaction",reaction);A.register("typing",typing);
A.register("whack",whack);A.register("trivia",trivia);A.register("math",math);A.register("colors",colors);
})();
