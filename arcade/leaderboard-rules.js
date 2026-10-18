(function(root){
"use strict";
// id: label, smaller-is-better, wins-only, maximum accepted score
const specs={
 hangman:["seconds",true,true,86400],memory:["moves",true,true,100000],
 snake:["apples",false,false,15],tetris:["points",false,false,1000000],
 "2048":["points",false,false,10000000],minesweeper:["seconds",true,true,86400],
 tictactoe:["seconds",true,true,86400],connect4:["seconds",true,true,86400],
 pong:["points",false,false,5],breakout:["bricks",false,false,36],flappy:["gaps",false,false,8],
 sudoku:["mistakes",true,true,100000],sliding:["moves",true,true,100000],lights:["moves",true,true,100000],
 scramble:["words",false,false,5],typing:["WPM",false,false,1000],trivia:["correct",false,false,10],
 math:["correct",false,false,10],colors:["correct",false,false,12],simon:["levels",false,false,5],
 reaction:["ms",true,true,10000],whack:["hits",false,false,12],rps:["points",false,false,5],guess:["guesses",true,true,7]
};
function rules(id){const s=specs[id];return s?{unit:s[0],ascending:s[1],winsOnly:s[2],max:s[3]}:null}
function result(id,won,value,duration,mode="standard"){
 const r=rules(id);if(!r||r.winsOnly&&!won)return null;
 if(!Number.isFinite(duration)||duration<=0||duration>86400000)return null;
 const score=value==null?Math.round(duration)/1000:value;
 if(!Number.isFinite(score)||score<0||score>r.max)return null;
 if(r.unit!=="seconds"&&!Number.isInteger(score))return null;
 if(["memory","sliding","lights","guess","reaction"].includes(id)&&score<1)return null;
 if(["hangman","memory"].includes(id)?!["easy","medium","hard"].includes(mode):mode!=="standard")return null;
 return {game_id:id,mode,score,duration_ms:Math.round(duration)};
}
const api={specs,rules,result};root.PixelLeaderboardRules=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
