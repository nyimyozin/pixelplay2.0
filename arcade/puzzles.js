(function(){
"use strict";
const A=window.PixelArcade,C=window.ArcadeCore;
const $=(ctx,selector)=>ctx.body.querySelector(selector);
const all=(ctx,selector)=>[...ctx.body.querySelectorAll(selector)];
const action=(ctx,selector,fn)=>ctx.on($(ctx,selector),"click",fn);
const buttons=(labels,cl="arcade-choices")=>'<div class="'+cl+'">'+labels.map((text,i)=>'<button type="button" class="arcade-choice" data-choice="'+i+'">'+text+'</button>').join("")+'</div>';
function status(text){return '<p class="arcade-status" role="status" aria-live="polite">'+text+'</p>'}
function tictactoe(ctx){
 let board=Array(9).fill(null),busy=false;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>You: <b class="arcade-x">X</b></span><span>Computer: <b class="arcade-o">O</b></span></div><div class="arcade-grid three" id="tttGrid"></div>'+status("Your move — you are X. Get three in a row!")+'</div>');
 const grid=$(ctx,"#tttGrid");
 function draw(){grid.innerHTML=board.map((v,i)=>'<button type="button" class="arcade-cell ttt-cell '+(v?"marked":"")+'" data-i="'+i+'" aria-label="Square '+(i+1)+', '+(v||"empty")+'" '+(v||busy?"disabled":"")+'><span class="'+(v==="X"?"arcade-x":"arcade-o")+'">'+(v||"")+'</span></button>').join("")}
 function decide(){const result=C.tttWinner(board);if(result){draw();ctx.finish(result==="X",result==="X"?"Three in a row!":result==="draw"?"It's a draw!":"Computer wins",result==="X"?"You outsmarted the computer.":result==="draw"?"A perfectly matched game.":"Try a different opening move.",null);return true}return false}
 ctx.on(grid,"click",e=>{const b=e.target.closest("[data-i]");if(!b||busy||ctx.finished)return;let i=+b.dataset.i;if(board[i])return;board[i]="X";if(decide())return;busy=true;draw();ctx.after(()=>{const move=C.tttCpu(board);if(move>=0)board[move]="O";busy=false;if(!decide())draw()},220)});
 draw();
}
function connect4(ctx){
 let board=Array(42).fill(null),busy=false;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span class="disc-red">● You</span><span class="disc-yellow">● Computer</span></div><div class="connect-board" id="connectBoard" aria-label="Connect Four board"></div>'+status("Choose a column to drop your red disc.")+'</div>');
 const el=$(ctx,"#connectBoard");
 function draw(){el.innerHTML=board.map((v,i)=>'<button class="connect-slot" data-col="'+i%7+'" type="button" aria-label="Row '+(Math.floor(i/7)+1)+' column '+(i%7+1)+(v?", "+v:"")+'" '+(busy||ctx.finished?"disabled":"")+'><span class="connect-disc '+(v==="X"?"red":v==="O"?"yellow":"")+'"></span></button>').join("")}
 function decide(){const w=C.connectWinner(board);if(!w)return false;ctx.finish(w==="X",w==="X"?"Four connected!":w==="O"?"Computer wins":"Board filled!",w==="X"?"Excellent strategy.":w==="O"?"Give it another shot.":"Nobody could connect four.",null);return true}
 ctx.on(el,"click",e=>{let b=e.target.closest("[data-col]");if(!b||busy||ctx.finished)return;const next=C.connectDrop(board,+b.dataset.col,"X");if(!next)return;board=next;draw();if(decide())return;busy=true;draw();ctx.after(()=>{const column=C.cpuConnect(board);if(column!==-1)board=C.connectDrop(board,column,"O");busy=false;draw();decide()},240)});
 draw();
}
function game2048(ctx){
 let board=Array(16).fill(0),score=0;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Score <b id="tileScore">0</b></span><span>Goal <b>2048</b></span></div><div class="tile-grid" id="tileGrid" aria-label="2048 board"></div>'+buttons(["↑","←","↓","→"],"arcade-choices arrow-pad")+status("Swipe, use arrow keys, or tap the controls to slide tiles.")+'</div>');
 const grid=$(ctx,"#tileGrid");
 function spawn(){let free=board.map((v,i)=>v?-1:i).filter(i=>i>=0);if(free.length)board[free[Math.floor(Math.random()*free.length)]]=Math.random()<.9?2:4}
 function draw(){grid.innerHTML=board.map(v=>'<div class="tile '+(v?"tile-"+Math.min(v,2048):"")+'">'+(v||"")+'</div>').join("");$(ctx,"#tileScore").textContent=score}
 function move(dir){if(ctx.finished)return;const next=C.slide2048(board,dir);if(!next.moved)return;board=next.board;score+=next.points;spawn();draw();if(board.includes(2048))ctx.finish(true,"2048 reached!", "You merged your way to 2048 with "+score+" points.",score);else if(!C.canMove2048(board))ctx.finish(false,"No moves left","Final score: "+score+" points.",score)}
 ctx.on(document,"keydown",e=>{const dir={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"}[e.key];if(dir&&!e.altKey&&!e.ctrlKey){e.preventDefault();move(dir)}});
 all(ctx,"[data-choice]").forEach(btn=>ctx.on(btn,"click",()=>move(["up","left","down","right"][+btn.dataset.choice])));
 let sx=0,sy=0;
 ctx.on(grid,"touchstart",e=>{sx=e.changedTouches[0].clientX;sy=e.changedTouches[0].clientY},{passive:true});
 ctx.on(grid,"touchend",e=>{let dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;move(Math.abs(dx)>Math.abs(dy)?dx>0?"right":"left":dy>0?"down":"up")},{passive:true});
 spawn();spawn();draw();
}
function minesweeper(ctx){
 const size=8,total=10;
 let field=null,flags=new Set(),revealed=new Set(),done=false,mode="reveal";
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Mines: <b id="mineCount">10</b></span><button class="btn ghost" id="mineMode" type="button" aria-pressed="false">⚑ Flag mode: off</button></div><div class="mines-grid" id="minesGrid" aria-label="Minesweeper board"></div>'+status("First click is safe. Right-click to flag, or toggle flag mode on touch.")+'</div>');
 const el=$(ctx,"#minesGrid");
 const neighbors=i=>{const rr=Math.floor(i/size),cc=i%size,res=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const r=rr+dr,c=cc+dc;if((dr||dc)&&r>=0&&r<size&&c>=0&&c<size)res.push(r*size+c)}return res};
 function draw(){el.innerHTML=Array.from({length:64},(_,i)=>{let open=revealed.has(i),mine=field?.mines.has(i),flag=flags.has(i),value=open?(mine?"✹":field.counts[i]||""):flag?"⚑":"";return '<button type="button" class="mine-cell '+(open?"open ":"")+(flag?"flag ":"")+(open&&mine?"danger ":"")+'" data-i="'+i+'" aria-label="Cell '+(i+1)+(open?", revealed "+value:flag?", flagged":"")+'">'+value+'</button>'}).join("");$(ctx,"#mineCount").textContent=total-flags.size}
 function reveal(i){if(done||flags.has(i)||revealed.has(i))return;if(!field)field=C.createMines(size,total,i);if(field.mines.has(i)){revealed.add(i);done=true;for(const n of field.mines)revealed.add(n);draw();ctx.finish(false,"Boom!","You found a mine. Watch those numbers!",null);return}revealed=C.floodMines(field,i,flags,revealed);draw();if(revealed.size===64-total){done=true;ctx.finish(true,"Minefield cleared!","Every safe square uncovered. Nice work.",null)}}
 function toggleFlag(i){if(done||revealed.has(i))return;if(flags.has(i))flags.delete(i);else if(flags.size<total)flags.add(i);draw()}
 ctx.on(el,"click",e=>{const button=e.target.closest("[data-i]");if(!button)return;const i=+button.dataset.i;mode==="flag"?toggleFlag(i):reveal(i)});
 ctx.on(el,"contextmenu",e=>{const button=e.target.closest("[data-i]");if(!button)return;e.preventDefault();toggleFlag(+button.dataset.i)});
 action(ctx,"#mineMode",()=>{mode=mode==="flag"?"reveal":"flag";const btn=$(ctx,"#mineMode");btn.textContent="⚑ Flag mode: "+(mode==="flag"?"on":"off");btn.setAttribute("aria-pressed",mode==="flag")});
 draw();
}
function lights(ctx){
 const board=Array(25).fill(false);
 function toggle(i){const r=Math.floor(i/5),c=i%5;for(const [dr,dc] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<5&&cc>=0&&cc<5)board[rr*5+cc]=!board[rr*5+cc]}}
 for(let n=0;n<18;n++)toggle(Math.floor(Math.random()*25));
 if(board.every(v=>!v))toggle(12);
 let moves=0;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Moves <b id="lightMoves">0</b></span><span>Goal: all off</span></div><div class="arcade-grid five lights-grid" id="lightGrid"></div>'+status("Tap a tile to toggle it and its four neighbors.")+'</div>');
 const grid=$(ctx,"#lightGrid");
 function draw(){grid.innerHTML=board.map((v,i)=>'<button class="light-cell '+(v?"on":"")+'" data-i="'+i+'" type="button" aria-label="Light '+(i+1)+", "+(v?"on":"off")+'">'+(v?"✦":"")+'</button>').join("");$(ctx,"#lightMoves").textContent=moves}
 ctx.on(grid,"click",e=>{const b=e.target.closest("[data-i]");if(!b||ctx.finished)return;toggle(+b.dataset.i);moves++;draw();if(board.every(v=>!v))ctx.finish(true,"Lights out!","You solved the puzzle in "+moves+" moves.",moves)});
 draw();
}
function sliding(ctx){
 let cells=Array.from({length:15},(_,i)=>i+1).concat(0),moves=0;
 function neighbors(i){const r=i>>2,c=i%4;return [r>0?i-4:-1,r<3?i+4:-1,c>0?i-1:-1,c<3?i+1:-1].filter(x=>x>=0)}
 let prev=-1;
 for(let n=0;n<180;n++){let zero=cells.indexOf(0),possible=neighbors(zero).filter(i=>i!==prev),from=possible[Math.floor(Math.random()*possible.length)];[cells[zero],cells[from]]=[cells[from],cells[zero]];prev=zero}
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Moves <b id="slideMoves">0</b></span><span>Arrange 1 → 15</span></div><div class="arcade-grid four sliding-grid" id="slideGrid"></div>'+status("Tap a tile beside the empty space to slide it.")+'</div>');
 const grid=$(ctx,"#slideGrid");
 function draw(){grid.innerHTML=cells.map((v,i)=>'<button type="button" data-i="'+i+'" class="slide-cell '+(!v?"empty":"")+'" '+(!v?"disabled":"")+'>'+ (v||"")+'</button>').join("");$(ctx,"#slideMoves").textContent=moves}
 ctx.on(grid,"click",e=>{const b=e.target.closest("[data-i]");if(!b||ctx.finished)return;let i=+b.dataset.i,zero=cells.indexOf(0);if(!neighbors(zero).includes(i))return;[cells[i],cells[zero]]=[cells[zero],cells[i]];moves++;draw();if(cells.every((v,i)=>v===(i===15?0:i+1)))ctx.finish(true,"Puzzle solved!","All tiles in order after "+moves+" moves.",moves)});
 draw();
}
function sudoku(ctx){
 const game=C.sudokuGame(Math.random,43),state=[...game.givens];
 let selected=state.findIndex(v=>v===0),errors=0;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Filled: <b id="sudokuFilled">0/38</b></span><span>Incorrect entries <b id="sudokuErrors">0</b></span></div><div class="sudoku-grid" id="sudokuGrid" role="group" aria-label="Sudoku board"></div>'+buttons(["1","2","3","4","5","6","7","8","9","Erase"],"arcade-choices sudoku-keys")+status("Choose an empty cell, then type or tap a number. Wrong entries are marked.")+'</div>');
 const grid=$(ctx,"#sudokuGrid"),keys=all(ctx,"[data-choice]");
 function draw(){grid.innerHTML=state.map((v,i)=>{const wrong=v&&v!==game.solution[i],fixed=game.givens[i];return '<button class="sudoku-cell '+(fixed?"given ":"")+(wrong?"wrong ":"")+(selected===i?"selected ":"")+'" data-i="'+i+'" type="button" '+(fixed?"disabled":"")+' aria-label="Row '+(Math.floor(i/9)+1)+', column '+(i%9+1)+', '+(v||"empty")+'">'+(v||"")+'</button>'}).join("");$(ctx,"#sudokuFilled").textContent=state.filter(Boolean).length+"/81";$(ctx,"#sudokuErrors").textContent=errors}
 function put(value){if(ctx.finished||selected<0||game.givens[selected])return;const prev=state[selected];state[selected]=value;if(value&&value!==game.solution[selected]&&prev!==value)errors++;draw();if(state.every((n,i)=>n===game.solution[i]))ctx.finish(true,"Sudoku complete!","You filled every square. Incorrect attempts: "+errors+".",errors)}
 ctx.on(grid,"click",e=>{let b=e.target.closest("[data-i]");if(b){selected=+b.dataset.i;draw()}});
 keys.forEach((btn,i)=>ctx.on(btn,"click",()=>put(i===9?0:i+1)));
 ctx.on(document,"keydown",e=>{if(e.target.tagName==="INPUT"||ctx.finished)return;if(/^[1-9]$/.test(e.key))put(+e.key);else if(e.key==="Backspace"||e.key==="Delete")put(0);else if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){e.preventDefault();const delta={ArrowUp:-9,ArrowDown:9,ArrowLeft:-1,ArrowRight:1}[e.key];selected=(selected+delta+81)%81;draw()}});
 draw();
}
function scramble(ctx){
 const words=[...C.shuffle(window.PixelEngine.WORDS.medium)].slice(0,5);
 let round=0,score=0;
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span>Round <b id="scrambleRound">1 / 5</b></span><span>Correct <b id="scrambleScore">0</b></span></div><div class="scramble-word" id="scrambleWord"></div><p class="arcade-clue" id="scrambleHint"></p><form id="scrambleForm" class="arcade-form"><input id="scrambleInput" type="text" autocomplete="off" spellcheck="false" aria-label="Your unscrambled word" placeholder="Your answer…" required><button class="btn primary">Check</button></form><button type="button" class="arcade-inline" id="scrambleSkip">Skip word →</button>'+status("Unscramble the letters using the clue.")+'</div>');
 function question(){if(round===5){ctx.finish(score>=3,score>=3?"Word wizard!":"Good practice!",score+" of 5 words solved.",score);return}const [word,hint]=words[round];let mixed=C.shuffle(word.split("")).join("");if(mixed===word)mixed=word.split("").reverse().join("");$(ctx,"#scrambleWord").textContent=mixed.toUpperCase().split("").join(" ");$(ctx,"#scrambleHint").textContent="Hint: "+hint;$(ctx,"#scrambleRound").textContent=(round+1)+" / 5";$(ctx,"#scrambleScore").textContent=score;$(ctx,"#scrambleInput").value="";$(ctx,"#scrambleInput").focus()}
 ctx.on($(ctx,"#scrambleForm"),"submit",e=>{e.preventDefault();if(ctx.finished)return;const guess=$(ctx,"#scrambleInput").value.trim().toLowerCase();if(guess===words[round][0]){score++;round++;ctx.notice("Correct!");question()}else{ctx.notice("Not quite. Try another arrangement.");$(ctx,"#scrambleInput").select()}});
 action(ctx,"#scrambleSkip",()=>{round++;question()});
 question();
}
function guess(ctx){
 const secret=1+Math.floor(Math.random()*100);let attempts=7,low=1,high=100;
 ctx.screen('<div class="arcade-center"><div class="arcade-big-symbol">#?</div><h3>Find the secret number</h3><div class="arcade-scoreline"><span>Range <b id="guessRange">1–100</b></span><span>Guesses remaining <b id="guessLeft">7</b></span></div><form class="arcade-form" id="guessForm"><input id="guessInput" type="number" min="1" max="100" required placeholder="1–100" aria-label="Guess a number"><button class="btn primary">Guess</button></form>'+status("I picked a number from 1 to 100. Can you find it?")+'</div>');
 ctx.on($(ctx,"#guessForm"),"submit",e=>{e.preventDefault();if(ctx.finished)return;const n=Number($(ctx,"#guessInput").value);if(!Number.isInteger(n)||n<low||n>high){ctx.notice("Enter a whole number between "+low+" and "+high+".");return}attempts--;if(n===secret){ctx.finish(true,"You got it!","The answer was "+secret+". You used "+(7-attempts)+" guesses.",7-attempts);return}if(n<secret)low=Math.max(low,n+1);else high=Math.min(high,n-1);$(ctx,"#guessRange").textContent=low+"–"+high;$(ctx,"#guessLeft").textContent=attempts;ctx.notice(n<secret?"Higher! ↑":"Lower! ↓");$(ctx,"#guessInput").value="";if(!attempts)ctx.finish(false,"Out of guesses","The secret number was "+secret+".",7-attempts)});
}
A.register("tictactoe",tictactoe);A.register("connect4",connect4);A.register("2048",game2048);
A.register("minesweeper",minesweeper);A.register("lights",lights);A.register("sliding",sliding);
A.register("sudoku",sudoku);A.register("scramble",scramble);A.register("guess",guess);
})();

