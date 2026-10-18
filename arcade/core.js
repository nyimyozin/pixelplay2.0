(function(root){
"use strict";
const CATALOG=[
 ["hangman","Hangman","Words","A_Z","Guess a word before the drawing is complete.","#/hangman","violet"],
 ["memory","Memory Match","Puzzle","✦","Flip cards and find matching pairs.","#/memory","cyan"],
 ["snake","Snake","Arcade","⌁","Eat, grow, and dodge your own tail."],
 ["tetris","Block Drop","Arcade","▦","Stack falling blocks and clear lines."],
 ["2048","2048","Puzzle","2048","Merge tiles to reach the legendary 2048."],
 ["minesweeper","Minesweeper","Puzzle","✹","Reveal safe squares; mark the hidden mines."],
 ["tictactoe","Tic-Tac-Toe","Strategy","XO","Three in a row against a clever opponent."],
 ["connect4","Connect Four","Strategy","●","Drop four discs in a row before the computer."],
 ["pong","Pong","Arcade","◉","Retro paddle action against an AI rival."],
 ["breakout","Breakout","Arcade","▤","Bounce the ball and clear all the bricks."],
 ["flappy","Sky Hop","Arcade","➤","Tap to soar between the obstacles."],
 ["sudoku","Sudoku","Puzzle","123","Fill every row, column, and box with 1–9."],
 ["sliding","15 Puzzle","Puzzle","▦","Slide tiles into their proper order."],
 ["lights","Lights Out","Puzzle","✺","Switch off all the glowing tiles."],
 ["scramble","Word Scramble","Words","ABC","Unscramble five words with clues."],
 ["typing","Typing Sprint","Words","⌨","Type quickly and accurately against the clock."],
 ["trivia","Trivia Quiz","Quiz","?","Ten fun questions across different topics."],
 ["math","Math Sprint","Quiz","±","Solve as many mental-math questions as you can."],
 ["colors","Color Clash","Quiz","◒","Trust the ink color, not the written word."],
 ["simon","Simon Says","Reflex","◈","Remember a growing sequence of colored lights."],
 ["reaction","Reaction Time","Reflex","⚡","Test your reflexes down to the millisecond."],
 ["whack","Whack-a-Mole","Reflex","✿","Tap the hopping critter before it escapes."],
 ["rps","Rock Paper Scissors","Strategy","✊","A best-of-five showdown with the computer."],
 ["guess","Number Hunt","Puzzle","#","Deduce the secret number in seven guesses."]
].map(([id,name,category,symbol,description,link,tone])=>({id,name,category,symbol,description,link:link||"#/play/"+id,tone:tone||(["Arcade","Strategy"].includes(category)?"violet":category==="Reflex"?"rose":category==="Words"?"amber":"cyan")}));
function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function tttWinner(board){
 const combos=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 for(const [a,b,c] of combos)if(board[a]&&board[a]===board[b]&&board[b]===board[c])return board[a];
 return board.every(Boolean)?"draw":null;
}
function tttCpu(board){
 function score(b,turn,depth){
  const w=tttWinner(b);if(w)return w==="O"?10-depth:w==="X"?depth-10:0;
  const vals=[];for(let i=0;i<9;i++)if(!b[i]){b[i]=turn;vals.push(score(b,turn==="O"?"X":"O",depth+1));b[i]=null}
  return turn==="O"?Math.max(...vals):Math.min(...vals);
 }
 let best=-Infinity,choice=-1;
 for(const i of [4,0,2,6,8,1,3,5,7])if(!board[i]){board[i]="O";const v=score(board,"X",1);board[i]=null;if(v>best){best=v;choice=i}}
 return choice;
}
function connectWinner(board){
 const cells=board.length,cols=7;for(let r=0;r<6;r++)for(let c=0;c<cols;c++){const p=board[r*cols+c];if(!p)continue;for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){let n=1;while(n<4){const rr=r+n*dr,cc=c+n*dc;if(rr<0||rr>=6||cc<0||cc>=cols||board[rr*cols+cc]!==p)break;n++}if(n===4)return p}}return board.every(Boolean)?"draw":null;
}
function connectDrop(board,col,piece){
 if(col<0||col>=7)return null;
 const out=[...board];for(let row=5;row>=0;row--)if(!out[row*7+col]){out[row*7+col]=piece;return out}return null;
}
function cpuConnect(board){
 const possible=[3,2,4,1,5,0,6].filter(c=>connectDrop(board,c,"O"));
 for(const c of possible)if(connectWinner(connectDrop(board,c,"O"))==="O")return c;
 for(const c of possible)if(connectWinner(connectDrop(board,c,"X"))==="X")return c;
 return possible[0]??-1;
}
function slide2048(board,direction){
 const old=[...board],next=Array(16).fill(0);let points=0;
 for(let k=0;k<4;k++){
  const indexes=Array.from({length:4},(_,n)=>{
   if(direction==="left")return k*4+n;
   if(direction==="right")return k*4+(3-n);
   if(direction==="up")return n*4+k;
   return (3-n)*4+k;
  });
  const values=indexes.map(i=>old[i]).filter(Boolean),merged=[];
  for(let n=0;n<values.length;n++){if(values[n]===values[n+1]){merged.push(values[n]*2);points+=values[n]*2;n++}else merged.push(values[n])}
  indexes.forEach((idx,n)=>next[idx]=merged[n]||0);
 }
 return {board:next,points,moved:next.some((v,i)=>v!==old[i])};
}
function canMove2048(board){
 return board.some(v=>!v)||["left","right","up","down"].some(dir=>slide2048(board,dir).moved);
}
function createMines(size=8,count=10,safeIndex=0,random=Math.random){
 const protectedCells=new Set([safeIndex]);
 const row=Math.floor(safeIndex/size),col=safeIndex%size;
 for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){let r=row+dr,c=col+dc;if(r>=0&&r<size&&c>=0&&c<size)protectedCells.add(r*size+c)}
 const options=shuffle(Array.from({length:size*size},(_,i)=>i).filter(i=>!protectedCells.has(i)),random);
 const mines=new Set(options.slice(0,Math.min(count,options.length)));
 const neighbors=i=>{const rr=Math.floor(i/size),cc=i%size,arr=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){let r=rr+dr,c=cc+dc;if((dr||dc)&&r>=0&&r<size&&c>=0&&c<size)arr.push(r*size+c)}return arr};
 const counts=Array.from({length:size*size},(_,i)=>neighbors(i).filter(n=>mines.has(n)).length);
 return {mines,counts,neighbors};
}
function floodMines(board,start,flags,revealed){
 const out=new Set(revealed),queue=[start];
 while(queue.length){const i=queue.shift();if(out.has(i)||flags.has(i)||board.mines.has(i))continue;out.add(i);if(board.counts[i]===0)queue.push(...board.neighbors(i))}
 return out;
}
function sudokuGame(random=Math.random,clues=42){
 const base=(r,c)=>(r*3+Math.floor(r/3)+c)%9+1;
 function order(){const groups=shuffle([0,1,2],random);return groups.flatMap(g=>shuffle([0,1,2],random).map(n=>g*3+n))}
 const rows=order(),cols=order(),digits=shuffle([1,2,3,4,5,6,7,8,9],random);
 const solution=Array.from({length:81},(_,i)=>digits[base(rows[Math.floor(i/9)],cols[i%9])-1]);
 const indices=shuffle(Array.from({length:81},(_,i)=>i),random),givens=Array(81).fill(0);
 for(const i of indices.slice(0,Math.max(17,Math.min(81,clues))))givens[i]=solution[i];
 return {solution,givens};
}
const QUESTIONS=[
 ["Which planet is called the Red Planet?",["Venus","Mars","Jupiter","Mercury"],1],
 ["How many sides does a hexagon have?",["Five","Six","Seven","Eight"],1],
 ["What gas do plants absorb during photosynthesis?",["Oxygen","Helium","Carbon dioxide","Hydrogen"],2],
 ["What is the largest ocean on Earth?",["Atlantic","Arctic","Indian","Pacific"],3],
 ["Who painted the Mona Lisa?",["Van Gogh","Leonardo da Vinci","Picasso","Monet"],1],
 ["Which language runs natively in a web browser?",["Python","C++","Java","JavaScript"],3],
 ["What is the square root of 144?",["10","11","12","14"],2],
 ["Which instrument has 88 keys?",["Guitar","Piano","Violin","Flute"],1],
 ["What does H₂O represent?",["Salt","Water","Oxygen","Hydrogen"],1],
 ["Which continent is the Sahara Desert in?",["Asia","Africa","South America","Europe"],1],
 ["What is the smallest prime number?",["1","2","3","5"],1],
 ["Which animal is known for changing its color?",["Koala","Otter","Chameleon","Fox"],2],
 ["Which metal is liquid near room temperature?",["Iron","Gold","Mercury","Copper"],2],
 ["How many minutes are in two hours?",["90","100","120","180"],2],
 ["What is the capital of Japan?",["Kyoto","Osaka","Tokyo","Sapporo"],2],
 ["How many pieces does each player start with in chess?",["12","14","16","18"],2],
 ["Which organ pumps blood around the body?",["Liver","Heart","Lung","Kidney"],1],
 ["What is the chemical symbol for gold?",["Ag","Au","Fe","Go"],1],
 ["Which of these is a mammal?",["Shark","Dolphin","Octopus","Trout"],1],
 ["Who wrote Romeo and Juliet?",["Shakespeare","Dickens","Austen","Tolkien"],0]
];
const API={CATALOG,QUESTIONS,shuffle,tttWinner,tttCpu,connectWinner,connectDrop,cpuConnect,slide2048,canMove2048,createMines,floodMines,sudokuGame};
if(typeof module!=="undefined"&&module.exports)module.exports=API;
root.ArcadeCore=API;
})(typeof window!=="undefined"?window:globalThis);
