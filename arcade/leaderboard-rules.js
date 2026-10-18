(function(root){
"use strict";
// id: label, smaller-is-better, wins-only, maximum accepted score
const specs={
 hangman:["seconds",true,true,86400],memory:["moves",true,true,100000],
 snake:["apples",false,false,397],tetris:["points",false,false,1000000000],
 "2048":["points",false,false,10000000],minesweeper:["seconds",true,true,86400],
 tictactoe:["seconds",true,true,86400],connect4:["seconds",true,true,86400],
 pong:["points",false,false,5],breakout:["bricks",false,false,1000000],flappy:["gaps",false,false,1000000],
 sudoku:["mistakes",true,true,100000],sliding:["moves",true,true,100000],lights:["moves",true,true,100000],
 scramble:["words",false,false,5],typing:["WPM",false,false,1000],trivia:["correct",false,false,10],
 math:["correct",false,false,10000],colors:["correct",false,false,12],simon:["levels",false,false,1000],
 reaction:["ms",true,true,10000],whack:["hits",false,false,500],rps:["points",false,false,5],guess:["guesses",true,true,7]
};
const CURRENT_MODES={snake:"marathon",tetris:"marathon","2048":"endless",breakout:"waves",flappy:"endless",simon:"endless",whack:"sprint",math:"sprint",typing:"sprint",tictactoe:"casual"};
function modes(id){
 if(["hangman","memory"].includes(id))return ["easy","medium","hard"].map(value=>({value,label:value[0].toUpperCase()+value.slice(1)}));
 const current=CURRENT_MODES[id];return current?[{value:current,label:current[0].toUpperCase()+current.slice(1)},{value:"standard",label:"Classic (previous rules)"}]:[{value:"standard",label:"Standard"}];
}
function defaultMode(id){return modes(id)[0].value}
function rules(id){const s=specs[id];return s?{unit:s[0],ascending:s[1],winsOnly:s[2],max:s[3]}:null}
function result(id,won,value,duration,mode=defaultMode(id)){
 const r=rules(id);if(!r||r.winsOnly&&!won)return null;
 if(!Number.isFinite(duration)||duration<=0||duration>86400000)return null;
 const score=value==null?Math.round(duration)/1000:value;
 if(!Number.isFinite(score)||score<0||score>r.max)return null;
 if(r.unit!=="seconds"&&!Number.isInteger(score))return null;
 if(["memory","sliding","lights","guess","reaction"].includes(id)&&score<1)return null;
 if(!modes(id).some(item=>item.value===mode))return null;
 return {game_id:id,mode,score,duration_ms:Math.round(duration)};
}
const api={specs,rules,result,modes,defaultMode,CURRENT_MODES};root.PixelLeaderboardRules=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);

