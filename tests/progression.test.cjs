const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../arcade/core.js');
const R=require('../arcade/leaderboard-rules.js');

test('active-play clock excludes pauses, handles repeated pause and resets cleanly',()=>{
 let time=1000;const clock=new C.PlayClock(()=>time);
 time+=500;assert.equal(clock.elapsed(),500);clock.pause();time+=2000;clock.pause();assert.equal(clock.elapsed(),500);
 clock.resume();time+=250;assert.equal(clock.elapsed(),750);clock.resume();assert.equal(clock.elapsed(),750);
 clock.reset();assert.equal(clock.elapsed(),0);assert.equal(clock.paused,false);
});
test('Snake continues beyond fifteen apples and progresses to the full-grid limit',()=>{
 assert.equal(C.snakeStage(0).level,1);
 assert.equal(C.snakeStage(15).level,2);
 assert.equal(C.snakeStage(300).level,7);
 assert.equal(C.snakeStage(396).next,397);
 assert.ok(C.snakeStage(300).interval<C.snakeStage(15).interval);
 const entry=R.result('snake',true,397,200000,'marathon');assert.equal(entry.score,397);
 assert.equal(R.result('snake',true,398,200000,'marathon'),null);
});
test('Snake fills its final square without spawning food on its body',()=>{
 const body=[{x:1,y:0},{x:0,y:0},{x:0,y:1}];
 const final=C.snakeStep(body,{x:0,y:1},{x:1,y:1},2);
 assert.equal(final.crashed,false);assert.equal(final.eating,true);assert.equal(final.complete,true);assert.equal(final.body.length,4);
 assert.equal(C.snakeFood(final.body,2),null);
});
test('Snake tail movement is legal while walls and occupied body squares remain collisions',()=>{
 const body=[{x:0,y:0},{x:0,y:1},{x:1,y:1},{x:1,y:0}];
 assert.equal(C.snakeStep(body,{x:1,y:0},null,3).crashed,false);
 assert.equal(C.snakeStep(body,{x:-1,y:0},null,3).crashed,true);
 assert.equal(C.snakeStep(body,{x:0,y:1},null,3).crashed,true);
 const food=C.snakeFood(body,3,()=>0);assert.ok(!body.some(p=>p.x===food.x&&p.y===food.y));
});
test('Snake buffers two legal turns without allowing a reverse or an unbounded queue',()=>{
 const right={x:1,y:0},up={x:0,y:-1},left={x:-1,y:0},down={x:0,y:1};
 assert.deepEqual(C.queueSnakeTurn([],right,left),[]);
 const first=C.queueSnakeTurn([],right,up);const second=C.queueSnakeTurn(first,right,left);
 assert.deepEqual(second,[up,left]);assert.deepEqual(C.queueSnakeTurn(second,right,down),second);
 assert.deepEqual(C.queueSnakeTurn(first,right,down),first);
});
test('new rule sets have distinct leaderboards while old modes remain selectable',()=>{
 for(const id of ['snake','tetris','2048','breakout','flappy','simon','whack','math','typing','tictactoe']){
  assert.notEqual(R.defaultMode(id),'standard');assert.ok(R.modes(id).some(m=>m.value==='standard'));
  assert.ok(R.result(id,true,1,1000,R.defaultMode(id)));assert.ok(R.result(id,true,1,1000,'standard'));
 }
 assert.equal(R.result('snake',true,1,1000,'sprint'),null);
 assert.ok(R.result('flappy',false,20,10000,'endless'));
 assert.ok(R.result('math',false,30,45000,'sprint'));
});
test('generated Sudoku puzzles have exactly one solution across different seeds',()=>{
 for(let seed=1;seed<=8;seed++){
  let state=seed;const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296};
  const puzzle=C.sudokuGame(random,43);assert.equal(C.sudokuSolutions(puzzle.givens),1);
  assert.ok(puzzle.givens.filter(Boolean).length>=43);
 }
});
