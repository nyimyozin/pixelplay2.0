(function(){
"use strict";
const A=window.PixelArcade;
const $=(ctx,s)=>ctx.body.querySelector(s);
const rand=n=>Math.floor(Math.random()*n);
function shell(ctx,width,height,details,controls=""){
 ctx.screen('<div class="arcade-center"><div class="arcade-scoreline"><span id="arcadeLiveScore">Score: 0</span><span id="arcadeLiveExtra"></span></div><canvas class="arcade-canvas" id="playCanvas" width="'+width+'" height="'+height+'" role="img" aria-label="'+ctx.info.name+' game area"></canvas>'+controls+'<p class="arcade-status" role="status" aria-live="polite">'+details+'</p></div>');
 const el=$(ctx,"#playCanvas"),g=el.getContext("2d");if(!g){ctx.notice("This browser does not support canvas.");return null}
 return {el,g,score:t=>$(ctx,"#arcadeLiveScore").textContent=t,extra:t=>$(ctx,"#arcadeLiveExtra").textContent=t};
}
function pad(directions,layout=""){return '<div class="arcade-choices arcade-touch-controls '+layout+'" role="group" aria-label="Game controls">'+directions.map(([text,id])=>'<button class="arcade-choice" type="button" data-control="'+id+'" aria-label="'+id+'">'+text+'</button>').join("")+'</div>'}
function rounded(g,x,y,w,h,fill,r=6){g.fillStyle=fill;g.beginPath();g.roundRect(x,y,w,h,r);g.fill()}
function snake(ctx){
 const c=shell(ctx,400,400,"Arrow keys, swipe, or use the controls. Reach 15 apples to win.",pad([["↑","up"],["←","left"],["↓","down"],["→","right"]],"snake-arrow-pad"));
 if(!c)return;const {g,el}=c;const size=20;let snake=[{x:9,y:10},{x:8,y:10},{x:7,y:10}],dir={x:1,y:0},next={x:1,y:0},food,score=0,previous=0,acc=0;
 function newFood(){const free=[];for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!snake.some(s=>s.x===x&&s.y===y))free.push({x,y});food=free[rand(free.length)]}
 function change(v){const dirs={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};const d=dirs[v];if(d&&!(d.x===-dir.x&&d.y===-dir.y))next=d}
 function step(){dir=next;const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y},eating=head.x===food.x&&head.y===food.y,body=eating?snake:snake.slice(0,-1);
 if(head.x<0||head.y<0||head.x>=size||head.y>=size||body.some(p=>p.x===head.x&&p.y===head.y)){ctx.finish(false,"Snake crashed!","You collected "+score+" apples. Avoid walls and your own tail.",score);return}
 snake.unshift(head);if(eating){score++;c.score("Apples: "+score+" / 15");if(score>=15){ctx.finish(true,"Snake master!","You collected all 15 apples. Great control!",score);return}newFood()}else snake.pop()}
 function render(){g.fillStyle="#10182d";g.fillRect(0,0,400,400);g.strokeStyle="rgba(147,174,220,.07)";g.lineWidth=1;for(let n=0;n<=20;n++){g.beginPath();g.moveTo(n*20,0);g.lineTo(n*20,400);g.moveTo(0,n*20);g.lineTo(400,n*20);g.stroke()}
 if(food)rounded(g,food.x*20+3,food.y*20+3,14,14,"#fa8da4",6);
 snake.forEach((part,i)=>rounded(g,part.x*20+1,part.y*20+1,18,18,i?"#6bd3d0":"#a994ff",5))}
 ctx.on(document,"keydown",e=>{const k={ArrowUp:"up",ArrowLeft:"left",ArrowDown:"down",ArrowRight:"right"}[e.key];if(k){e.preventDefault();change(k)}});
 ctx.on(ctx.body,"click",e=>{const b=e.target.closest("[data-control]");if(b)change(b.dataset.control)});
 let sx=0,sy=0;ctx.on(el,"touchstart",e=>{sx=e.changedTouches[0].clientX;sy=e.changedTouches[0].clientY},{passive:true});
 ctx.on(el,"touchend",e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))>14)change(Math.abs(dx)>Math.abs(dy)?dx>0?"right":"left":dy>0?"down":"up")},{passive:true});
 newFood();c.score("Apples: 0 / 15");
 ctx.loop(t=>{const delta=previous?Math.min(60,t-previous):0;previous=t;acc+=delta;if(acc>110){acc=0;step()}render()});
}
const SHAPES=[
 [[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],
 [[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]
],COLORS=["#65d8eb","#ecca7c","#b399fc","#779eff","#ffad85","#78dfbc","#f08fb5"];
function blockdrop(ctx){
 const c=shell(ctx,300,600,"Clear 6 lines to win! Arrow keys to move, ↑ to rotate, Space to drop.",pad([["◀","left"],["⟳","rotate"],["▼","down"],["▶","right"],["⤓ Drop","drop"]]));
 if(!c)return;const {el,g}=c,board=Array.from({length:20},()=>Array(10).fill(0));let piece=null,lines=0,points=0,last=0,elapsed=0;
 function spawn(){const id=rand(7),shape=SHAPES[id].map(r=>[...r]);piece={shape,x:Math.floor((10-shape[0].length)/2),y:0,id};if(collides(piece.x,piece.y,piece.shape))ctx.finish(false,"Stack reached the top","You cleared "+lines+" lines. Keep stacking!",points)}
 function collides(x,y,s){return s.some((row,r)=>row.some((v,col)=>v&&(x+col<0||x+col>=10||y+r>=20||(y+r>=0&&board[y+r][x+col]))))}
 function lock(){piece.shape.forEach((row,r)=>row.forEach((v,col)=>{if(v&&piece.y+r>=0)board[piece.y+r][piece.x+col]=piece.id+1}));let cleared=0;for(let y=19;y>=0;y--)if(board[y].every(Boolean)){board.splice(y,1);board.unshift(Array(10).fill(0));cleared++;y++}lines+=cleared;points+=([0,100,250,450,700][cleared]||0)+10;c.score("Lines: "+lines+" / 6");c.extra("Points: "+points);if(lines>=6){ctx.finish(true,"Line clear legend!","You cleared six lines and earned "+points+" points.",points);return}spawn()}
 function dropOne(){if(!piece)return;if(!collides(piece.x,piece.y+1,piece.shape))piece.y++;else lock()}
 function move(cmd){if(ctx.finished||!piece)return;if(cmd==="left"&&!collides(piece.x-1,piece.y,piece.shape))piece.x--;if(cmd==="right"&&!collides(piece.x+1,piece.y,piece.shape))piece.x++;if(cmd==="down")dropOne();if(cmd==="rotate"){const rot=piece.shape[0].map((_,i)=>piece.shape.map(row=>row[i]).reverse());for(const dx of [0,-1,1,-2,2])if(!collides(piece.x+dx,piece.y,rot)){piece.x+=dx;piece.shape=rot;break}}if(cmd==="drop"){while(!collides(piece.x,piece.y+1,piece.shape))piece.y++;lock()}render()}
 function render(){g.fillStyle="#0d162b";g.fillRect(0,0,300,600);g.strokeStyle="rgba(255,255,255,.07)";for(let y=0;y<20;y++)for(let x=0;x<10;x++){g.strokeRect(x*30,y*30,30,30);const id=board[y][x];if(id)rounded(g,x*30+2,y*30+2,26,26,COLORS[id-1],4)}if(piece)piece.shape.forEach((row,y)=>row.forEach((v,x)=>{if(v)rounded(g,(piece.x+x)*30+2,(piece.y+y)*30+2,26,26,COLORS[piece.id],4)}))}
 ctx.on(document,"keydown",e=>{const cmd={ArrowLeft:"left",ArrowRight:"right",ArrowDown:"down",ArrowUp:"rotate"," ":"drop"}[e.key];if(cmd){e.preventDefault();move(cmd)}});
 ctx.on(ctx.body,"click",e=>{const b=e.target.closest("[data-control]");if(b)move(b.dataset.control)});
 spawn();c.score("Lines: 0 / 6");c.extra("Points: 0");render();
 ctx.loop(t=>{let dt=last?Math.min(70,t-last):0;last=t;elapsed+=dt;if(elapsed>=Math.max(160,650-lines*45)){elapsed=0;dropOne()}render()});
}
function pong(ctx){
 const c=shell(ctx,560,340,"Move your mouse, drag a finger, or use ↑/↓. First to 5 wins.");
 if(!c)return;const {g,el}=c;let paddle=134,cpu=134,ball={x:280,y:170,vx:-4.1,vy:2.7},you=0,ai=0,last=0,up=false,down=false;
 function serve(direction){ball={x:280,y:170,vx:4.1*direction,vy:(Math.random()>.5?1:-1)*(2+Math.random()*2)}}
 function tick(dt){if(up)paddle-=7*dt;if(down)paddle+=7*dt;paddle=Math.min(264,Math.max(0,paddle));cpu+=Math.max(-3.2*dt,Math.min(3.2*dt,ball.y-38-cpu));cpu=Math.max(0,Math.min(264,cpu));ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.y<9||ball.y>331)ball.vy*=-1;
 if(ball.x<31&&ball.x>17&&ball.vx<0&&ball.y>paddle&&ball.y<paddle+76){ball.vx=Math.abs(ball.vx)*1.06;ball.vy+=(ball.y-(paddle+38))*.065;ball.x=31}
 if(ball.x>529&&ball.x<543&&ball.vx>0&&ball.y>cpu&&ball.y<cpu+76){ball.vx=-Math.abs(ball.vx)*1.06;ball.vy+=(ball.y-(cpu+38))*.065;ball.x=529}
 if(ball.x<-10||ball.x>570){if(ball.x<0)ai++;else you++;c.score("You: "+you);c.extra("CPU: "+ai);if(you>=5||ai>=5){ctx.finish(you>=5,you>=5?"Pong champion!":"Computer wins","Final score: "+you+"–"+ai+".",you);return}serve(ball.x<0?-1:1)}}
 function draw(){g.fillStyle="#0e182d";g.fillRect(0,0,560,340);g.setLineDash([10,12]);g.strokeStyle="rgba(255,255,255,.27)";g.beginPath();g.moveTo(280,0);g.lineTo(280,340);g.stroke();g.setLineDash([]);rounded(g,16,paddle,12,76,"#a795ff",6);rounded(g,532,cpu,12,76,"#70d7e5",6);g.beginPath();g.arc(ball.x,ball.y,8,0,Math.PI*2);g.fillStyle="#fff";g.fill()}
 function point(e){const r=el.getBoundingClientRect();paddle=Math.max(0,Math.min(264,(e.clientY-r.top)*340/r.height-38))}
 ctx.on(el,"pointermove",point);ctx.on(el,"pointerdown",point);
 ctx.on(document,"keydown",e=>{if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();if(e.key==="ArrowUp")up=true;else down=true}});
 ctx.on(document,"keyup",e=>{if(e.key==="ArrowUp")up=false;if(e.key==="ArrowDown")down=false});
 c.score("You: 0");c.extra("CPU: 0");
 ctx.loop(t=>{let dt=last?Math.min(2,(t-last)/16.67):1;last=t;tick(dt);draw()});
}
function breakout(ctx){
 const c=shell(ctx,560,400,"Move your mouse or finger to control the paddle. Clear all 36 bricks.",pad([["◀","left"],["▶","right"]]));
 if(!c)return;const {g,el}=c;let paddle=240,ball={x:280,y:315,vx:2.7,vy:-3.4},lives=3,hits=0,last=0,keys=new Set();
 const bricks=Array.from({length:4},(_,r)=>Array.from({length:9},(_,col)=>({x:13+col*61,y:35+r*29,live:true,color:["#a995ff","#8baeff","#72d8e2","#83deb9"][r]}))).flat();
 function tick(dt){if(keys.has("left"))paddle-=6*dt;if(keys.has("right"))paddle+=6*dt;paddle=Math.min(460,Math.max(0,paddle));ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.x<8||ball.x>552)ball.vx*=-1;if(ball.y<8)ball.vy=Math.abs(ball.vy);if(ball.vy>0&&ball.y>=360&&ball.y<=374&&ball.x>=paddle-6&&ball.x<=paddle+106){ball.y=359;ball.vy=-Math.abs(ball.vy);ball.vx=(ball.x-(paddle+50))*.09}
 for(const b of bricks)if(b.live&&ball.x+6>b.x&&ball.x-6<b.x+54&&ball.y+6>b.y&&ball.y-6<b.y+21){b.live=false;ball.vy*=-1;hits++;c.score("Bricks: "+hits+" / 36");if(hits===bricks.length){ctx.finish(true,"Board cleared!","You broke all 36 bricks with "+lives+" lives left.",hits);return}break}
 if(ball.y>405){lives--;c.extra("Lives: "+lives);if(!lives){ctx.finish(false,"Out of lives","You cleared "+hits+" bricks. Try again!",hits);return}ball={x:280,y:315,vx:2.7*(Math.random()>.5?1:-1),vy:-3.4}}}
 function render(){g.fillStyle="#10172d";g.fillRect(0,0,560,400);bricks.forEach(b=>{if(b.live)rounded(g,b.x,b.y,54,21,b.color,4)});rounded(g,paddle,367,100,12,"#efefff",6);g.beginPath();g.arc(ball.x,ball.y,7,0,Math.PI*2);g.fillStyle="#fefefe";g.fill()}
 const pointer=e=>{const r=el.getBoundingClientRect();paddle=Math.max(0,Math.min(460,(e.clientX-r.left)*560/r.width-50))};
 ctx.on(el,"pointermove",pointer);ctx.on(el,"pointerdown",pointer);
 ctx.on(document,"keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();keys.add(e.key==="ArrowLeft"?"left":"right")}});
 ctx.on(document,"keyup",e=>{if(e.key==="ArrowLeft")keys.delete("left");if(e.key==="ArrowRight")keys.delete("right")});
 ctx.on(ctx.body,"pointerdown",e=>{const b=e.target.closest("[data-control]");if(b)keys.add(b.dataset.control)});
 ctx.on(document,"pointerup",()=>keys.clear());
 c.score("Bricks: 0 / 36");c.extra("Lives: 3");ctx.loop(t=>{const dt=last?Math.min(2,(t-last)/16.67):1;last=t;tick(dt);render()});
}
function flappy(ctx){
 const c=shell(ctx,360,500,"Tap the screen or press Space to flap. Fly through 8 gaps!",'<div class="arcade-choices arcade-touch-controls"><button class="arcade-choice" id="flapButton" type="button">↑ Flap</button></div>');
 if(!c)return;const {g,el}=c;let y=210,velocity=0,pipes=[],points=0,playing=false,last=0,spawn=0;
 function flap(){if(ctx.finished)return;if(!playing){playing=true;ctx.notice("Stay between the pipes!")}velocity=-5.8}
 function tick(dt){if(!playing)return;velocity+=.32*dt;y+=velocity*dt;spawn+=dt*16.67;if(spawn>=1450){spawn=0;pipes.push({x:370,top:85+rand(190),scored:false})}
 for(const p of pipes){p.x-=2.55*dt;if(!p.scored&&p.x+52<85){p.scored=true;points++;c.score("Gaps: "+points+" / 8");if(points>=8){ctx.finish(true,"You can fly!","Eight gaps cleared. Excellent timing.",points);return}}
 if(85+14>p.x&&85-14<p.x+52&&(y-14<p.top||y+14>p.top+150)){ctx.finish(false,"Ouch!","You passed "+points+" gaps. Keep flapping!",points);return}}
 pipes=pipes.filter(p=>p.x>-60);if(y<13||y>487)ctx.finish(false,"Bird down!","You passed "+points+" gaps. Try a gentler rhythm.",points)}
 function render(t){g.fillStyle="#152743";g.fillRect(0,0,360,500);g.fillStyle="rgba(129,206,233,.08)";for(let i=0;i<14;i++){g.beginPath();g.arc((i*53+20)%360,(i*91+45)%500,3,0,Math.PI*2);g.fill()}
 pipes.forEach(p=>{rounded(g,p.x,0,52,p.top,"#66d6c7",4);rounded(g,p.x,p.top+150,52,500-p.top-150,"#66d6c7",4)});
 g.save();g.translate(85,y);g.rotate(Math.max(-.4,Math.min(.9,velocity*.07)));g.fillStyle="#f5b67b";g.beginPath();g.arc(0,0,14,0,Math.PI*2);g.fill();rounded(g,7,-2,12,6,"#f5e7a5",2);g.fillStyle="#1c1a31";g.beginPath();g.arc(4,-5,2.6,0,Math.PI*2);g.fill();g.restore();
 if(!playing){g.fillStyle="rgba(10,18,36,.66)";g.fillRect(0,190,360,80);g.fillStyle="#fff";g.font="bold 24px system-ui";g.textAlign="center";g.fillText("Tap to fly",180,239)}}
 ctx.on(el,"pointerdown",flap);ctx.on($(ctx,"#flapButton"),"click",flap);ctx.on(document,"keydown",e=>{if(e.code==="Space"){e.preventDefault();flap()}});
 c.score("Gaps: 0 / 8");ctx.loop(t=>{const dt=last?Math.min(2,(t-last)/16.67):1;last=t;tick(dt);render(t)});
}
A.register("snake",snake);A.register("tetris",blockdrop);A.register("pong",pong);A.register("breakout",breakout);A.register("flappy",flappy);
})();

