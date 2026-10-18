const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const core=require("../arcade/core.js");

const range=Array.from({length:9},(_,i)=>i+1);
function sorted(a){return [...a].sort((x,y)=>x-y)}

test("arcade offers 24 uniquely routed games",()=>{
 assert.equal(core.CATALOG.length,24);
 assert.equal(new Set(core.CATALOG.map(g=>g.id)).size,24);
 for(const g of core.CATALOG){
  assert.ok(g.name&&g.description&&g.category);
  assert.match(g.link,/^#\//);
 }
});

test("every new game module registers its game",()=>{
 const entries=new Map();
 const sandbox={window:{ArcadeCore:core,PixelArcade:{register(id,fn){assert.equal(typeof fn,"function");assert.equal(entries.has(id),false,id);entries.set(id,fn)}}}};
 for(const file of ["puzzles.js","quick.js","action.js"]){
  const source=fs.readFileSync(path.join(__dirname,"..","arcade",file),"utf8");
  vm.runInNewContext(source,sandbox,{filename:file});
 }
 const native=new Set(["hangman","memory"]);
 assert.deepEqual(sortedNames(entries.keys()),sortedNames(core.CATALOG.filter(g=>!native.has(g.id)).map(g=>g.id)));
});
function sortedNames(iter){return [...iter].sort()}

test("tic-tac-toe checks rows, columns, diagonals and draws",()=>{
 assert.equal(core.tttWinner(["X","X","X",null,null,null,null,null,null]),"X");
 assert.equal(core.tttWinner(["O",null,null,"O",null,null,"O",null,null]),"O");
 assert.equal(core.tttWinner(["X",null,null,null,"X",null,null,null,"X"]),"X");
 assert.equal(core.tttWinner(["X","O","X","X","O","O","O","X","X"]),"draw");
 assert.equal(core.tttWinner(Array(9).fill(null)),null);
 const board=["X","X",null,null,"O",null,null,null,null];
 assert.equal(core.tttCpu(board),2);
 assert.equal(board[2],null,"AI search does not mutate state");
});

test("connect four drops to lowest empty square and spots wins",()=>{
 let board=Array(42).fill(null);
 for(let i=0;i<4;i++)board=core.connectDrop(board,i,"X");
 assert.equal(core.connectWinner(board),"X");
 const vertical=Array(42).fill(null);
 for(let i=0;i<4;i++)vertical[(5-i)*7+3]="O";
 assert.equal(core.connectWinner(vertical),"O");
 assert.equal(core.connectDrop(Array(42).fill("X"),0,"O"),null);
 const next=core.connectDrop(Array(42).fill(null),4,"X");
 assert.equal(next[39],"X");
 assert.equal(core.connectWinner(Array(42).fill(null)),null);
});

test("connect four AI takes a win and blocks immediate threat",()=>{
 let board=Array(42).fill(null);
 board[35]="O";board[36]="O";board[37]="O";
 assert.equal(core.cpuConnect(board),3);
 board=Array(42).fill(null);
 board[35]="X";board[36]="X";board[37]="X";
 assert.equal(core.cpuConnect(board),3);
});

test("2048 compresses, merges only once, and awards score",()=>{
 const board=[2,2,2,2,...Array(12).fill(0)];
 const value=core.slide2048(board,"left");
 assert.deepEqual(value.board.slice(0,4),[4,4,0,0]);
 assert.equal(value.points,8);
 assert.equal(value.moved,true);
 assert.deepEqual(board.slice(0,4),[2,2,2,2]);
 const right=core.slide2048([4,0,4,0,...Array(12).fill(0)],"right");
 assert.deepEqual(right.board.slice(0,4),[0,0,0,8]);
 assert.equal(right.points,8);
 assert.equal(core.canMove2048(Array(16).fill(2)),true);
 assert.equal(core.canMove2048([2,4,2,4,4,2,4,2,2,4,2,4,4,2,4,2]),false);
});

test("minesweeper protects the first click and neighbors",()=>{
 const i=27,board=core.createMines(8,10,i);
 assert.equal(board.mines.size,10);
 assert.equal(board.mines.has(i),false);
 for(const n of board.neighbors(i))assert.equal(board.mines.has(n),false);
 assert.equal(board.counts[i],0);
 for(let j=0;j<64;j++)assert.equal(board.counts[j],board.neighbors(j).filter(n=>board.mines.has(n)).length);
 const opened=core.floodMines(board,i,new Set(),new Set());
 assert.ok(opened.has(i));
 for(const n of opened)assert.equal(board.mines.has(n),false);
});

test("sudoku generates valid full solution with consistent given numbers",()=>{
 for(let attempt=0;attempt<5;attempt++){
  const {solution,givens}=core.sudokuGame(Math.random,42);
  assert.equal(solution.length,81);
  assert.equal(givens.filter(Boolean).length,42);
  for(let r=0;r<9;r++){
   assert.deepEqual(sorted(solution.slice(r*9,r*9+9)),range);
   assert.deepEqual(sorted(Array.from({length:9},(_,c)=>solution[c*9+r])),range);
  }
  for(let r=0;r<9;r+=3)for(let c=0;c<9;c+=3){
   const box=[];
   for(let dr=0;dr<3;dr++)for(let dc=0;dc<3;dc++)box.push(solution[(r+dr)*9+c+dc]);
   assert.deepEqual(sorted(box),range);
  }
  givens.forEach((n,i)=>{if(n)assert.equal(n,solution[i])});
 }
});

test("trivia answer indices all point to one of four choices",()=>{
 assert.ok(core.QUESTIONS.length>=20);
 for(const [question,options,answer] of core.QUESTIONS){
  assert.ok(question.length>=10);
  assert.equal(options.length,4);
  assert.ok(Number.isInteger(answer)&&answer>=0&&answer<4);
 }
});
