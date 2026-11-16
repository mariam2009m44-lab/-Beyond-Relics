/* Beyond Relics — lightweight animated nebula and celestial backdrop.
   Original procedural artwork; no NASA imagery or factual scale is implied. */
(function(){
 "use strict";
 if(document.getElementById("br-cosmic-canvas"))return;
 const canvas=document.createElement("canvas");canvas.id="br-cosmic-canvas";
 canvas.setAttribute("aria-hidden","true");document.body.prepend(canvas);
 const ctx=canvas.getContext("2d",{alpha:true,desynchronized:true});if(!ctx)return;
 const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 const coarse=window.matchMedia&&window.matchMedia("(pointer:coarse)").matches;
 const mobile=window.innerWidth<700;
 let w=0,h=0,dpr=1,stars=[],galaxies=[],raf=0,last=0,elapsed=0,paused=reduced;
 let pointerX=0,pointerY=0,targetX=0,targetY=0;
 const rand=(seed)=>{let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}};
 function resize(){
  w=window.innerWidth;h=window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,mobile?1.1:1.35);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+"px";canvas.style.height=h+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const r=rand(47291);stars=Array.from({length:mobile?360:850},()=>({x:r()*w,y:r()*h,z:.25+r()*.75,size:.35+r()*1.15,phase:r()*Math.PI*2,speed:.35+r()*1.2,tint:r()}));
  galaxies=[
   {x:w*.18,y:h*.26,scale:Math.min(w,h)*.18,rot:-.3,arms:2,color:"70,112,255",phase:.2},
   {x:w*.82,y:h*.68,scale:Math.min(w,h)*.13,rot:.5,arms:3,color:"160,105,255",phase:2.1}
  ];
 }
 function nebula(x,y,rx,ry,color,alpha,rotation){
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(1,ry/rx);
  const g=ctx.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,"rgba("+color+","+alpha+")");g.addColorStop(.34,"rgba("+color+","+(alpha*.52)+")");g.addColorStop(1,"rgba("+color+",0)");
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 function galaxy(g,t){
  ctx.save();ctx.translate(g.x+pointerX*.22,g.y+pointerY*.22);ctx.rotate(g.rot+Math.sin(t*.035+g.phase)*.025);
  const glow=ctx.createRadialGradient(0,0,0,0,0,g.scale);
  glow.addColorStop(0,"rgba(255,218,174,.17)");glow.addColorStop(.12,"rgba("+g.color+",.13)");glow.addColorStop(1,"rgba("+g.color+",0)");
  ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(0,0,g.scale,g.scale*.38,0,0,Math.PI*2);ctx.fill();
  ctx.globalCompositeOperation="screen";
  for(let arm=0;arm<g.arms;arm++){
   ctx.beginPath();
   for(let i=0;i<95;i++){
    const p=i/94,a=p*Math.PI*3.4+arm*Math.PI*2/g.arms+t*.012;
    const radius=g.scale*(.08+p*.91),x=Math.cos(a)*radius,y=Math.sin(a)*radius*.34;
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
   }
   ctx.strokeStyle="rgba("+g.color+",.15)";ctx.lineWidth=Math.max(1,g.scale*.025);ctx.shadowBlur=16;ctx.shadowColor="rgba("+g.color+",.35)";ctx.stroke();
  }
  const core=ctx.createRadialGradient(0,0,0,0,0,g.scale*.2);core.addColorStop(0,"rgba(255,236,204,.52)");core.addColorStop(.18,"rgba(255,178,125,.18)");core.addColorStop(1,"rgba(255,178,125,0)");
  ctx.fillStyle=core;ctx.beginPath();ctx.arc(0,0,g.scale*.2,0,Math.PI*2);ctx.fill();
  ctx.restore();
 }
 function planet(x,y,r,base,ring,t){
  ctx.save();ctx.translate(x+pointerX*.12,y+pointerY*.12);
  const halo=ctx.createRadialGradient(0,0,r*.7,0,0,r*2.8);halo.addColorStop(0,"rgba("+ring+",.13)");halo.addColorStop(1,"rgba("+ring+",0)");
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(0,0,r*2.8,0,Math.PI*2);ctx.fill();
  const g=ctx.createRadialGradient(-r*.35,-r*.42,r*.08,0,0,r*1.2);g.addColorStop(0,"#e8d9c8");g.addColorStop(.24,base);g.addColorStop(.72,"#25314e");g.addColorStop(1,"#070b18");
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="rgba("+ring+",.36)";ctx.lineWidth=Math.max(1,r*.07);ctx.beginPath();ctx.ellipse(0,0,r*1.65,r*.48,-.22+Math.sin(t*.08)*.025,0,Math.PI*2);ctx.stroke();
  ctx.restore();
 }
 function draw(t){
  ctx.clearRect(0,0,w,h);
  nebula(w*.2,h*.28,Math.max(w,h)*.48,Math.max(w,h)*.24,"34,91,205",.105,-.35);
  nebula(w*.83,h*.2,Math.max(w,h)*.4,Math.max(w,h)*.2,"117,65,207",.095,.42);
  nebula(w*.68,h*.86,Math.max(w,h)*.32,Math.max(w,h)*.18,"202,92,58",.055,-.2);
  galaxies.forEach(g=>galaxy(g,t));
  stars.forEach(s=>{
   const twinkle=.55+.45*Math.sin(t*.001*s.speed+s.phase);
   ctx.globalAlpha=(.22+twinkle*.58)*s.z;ctx.fillStyle=s.tint>.82?"#ffc88b":s.tint>.52?"#a9c8ff":"#e8f4ff";
   const x=(s.x+pointerX*s.z*.16+w)%w,y=(s.y+pointerY*s.z*.16+h)%h;
   ctx.beginPath();ctx.arc(x,y,s.size*(.7+twinkle*.35),0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;
  const orbitY=h*.53;
  if(w>540){planet(w*.91,orbitY,Math.max(9,Math.min(w,h)*.018),"#8d9fc4","130,190,255",t);planet(w*.075,h*.76,Math.max(6,Math.min(w,h)*.012),"#c28c70","255,180,130",t);}
 }
 function frame(now){
  raf=0;if(paused||document.hidden)return;
  if(now-last<30){raf=requestAnimationFrame(frame);return;}
  const dt=Math.min(48,now-last||16);last=now;elapsed+=dt;
  pointerX+=(targetX-pointerX)*.035;pointerY+=(targetY-pointerY)*.035;draw(elapsed);raf=requestAnimationFrame(frame);
 }
 function start(){if(!paused&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(frame)}}
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0}
 resize();draw(0);
 if(!reduced)start();
 if(!coarse&&!reduced)window.addEventListener("pointermove",e=>{targetX=(e.clientX/w-.5)*22;targetY=(e.clientY/h-.5)*18},{passive:true});
 window.addEventListener("resize",()=>{resize();draw(elapsed)},{passive:true});
 document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();else if(!reduced)start()});
 const dock=document.createElement("div");dock.className="br-cosmic-dock";dock.setAttribute("aria-label","Cosmic background controls");
 const pause=document.createElement("button");pause.type="button";pause.className="br-cosmic-pause";pause.setAttribute("aria-pressed",String(paused));pause.innerHTML='<i class="br-cosmic-dot" aria-hidden="true"></i><span></span>';
 const label=pause.querySelector("span");
 function sync(){label.textContent=paused?"Resume cosmos":"Pause motion";pause.setAttribute("aria-pressed",String(paused));}
 sync();pause.addEventListener("click",()=>{paused=!paused;sync();if(paused){draw(elapsed);stop()}else start()});
 const explore=document.createElement("a");explore.href="artifacts.html#br-universe-launcher";explore.innerHTML='Explore orbits <span aria-hidden="true">↗</span>';explore.setAttribute("aria-label","Open the interactive 3D Solar System explorer");
 dock.append(pause,explore);document.body.append(dock);
 if(reduced){pause.disabled=true;pause.setAttribute("aria-label","Cosmic motion is reduced by your device settings");label.textContent="Motion reduced";pause.title="Your device requests reduced motion. The background remains still.";}
})();
