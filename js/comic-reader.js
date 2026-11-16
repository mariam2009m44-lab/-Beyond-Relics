(function(){
"use strict";
const $=id=>document.getElementById(id);
let item=null,pages=[],page=0,scale=1,tx=0,ty=0,dragging=false,moved=false,suppressClick=false,startX=0,startY=0,originX=0,originY=0,touchX=0,touchY=0;
let playbackTimer=null,playing=false,paused=false,autoplayStarted=false,musicContext=null,musicOn=false;
const img=$("reader-image"),stage=$("reader-stage");
const moves=[
 {id:"pan-right",label:"Slow Pan Right",origin:"78% 50%",transform:"translate3d(-5%,0,0) scale(1.24)",duration:3200},
 {id:"zoom-in",label:"Slow Face Push-In",origin:"54% 34%",transform:"translate3d(0,2%,0) scale(1.58)",duration:3400},
 {id:"pan-down",label:"Slow Pan Down",origin:"48% 18%",transform:"translate3d(0,-7%,0) scale(1.42)",duration:3400},
 {id:"zoom-out",label:"Wide Location Reveal",origin:"50% 50%",transform:"translate3d(0,0,0) scale(1.02)",duration:3600},
 {id:"impact",label:"Fast Action Punch-In",origin:"52% 42%",transform:"translate3d(0,0,0) scale(1.92)",duration:620,cut:true},
 {id:"ending",label:"Final Slow Pull-Back",origin:"50% 50%",transform:"translate3d(0,0,0) scale(1)",duration:5200}
];
const reduceMotion=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function cinematicMoveForPage(index){
 const last=index===pages.length-1;
 const caption=(pages[index]&&pages[index].caption||"").toLowerCase();
 if(last)return moves[5];
 if(/attack|impact|collision|explosion|crash|strike|battle|هجوم|انفجار|اصطدام/.test(caption))return moves[4];
 if(index===0)return moves[0];
 if(index===1)return moves[1];
 if(index===2)return moves[2];
 if(index===3)return moves[3];
 return {id:"slow-drift",label:"Slow Cinematic Drift",origin:"50% 48%",transform:"translate3d(-1.5%,0,0) scale(1.12)",duration:3600};
}
function resetZoom(){
 scale=1;tx=0;ty=0;
 img.style.transition="transform .25s ease";
 img.style.transform="translate3d(0,0,0) scale(1)";
 img.style.transformOrigin="50% 50%";
 img.classList.remove("is-zoomed");
}
function setZoom(value){
 stopPlayback(false);
 scale=Math.max(1,Math.min(4,value));
 if(scale===1){tx=0;ty=0;}
 img.style.transition="transform .25s ease";
 img.style.transform="translate3d("+tx+"px,"+ty+"px,0) scale("+scale+")";
 img.classList.toggle("is-zoomed",scale>1);
}
function setPlaybackState(){
 document.body.classList.toggle("is-cinematic-playing",playing&&!paused);
 $("cinema-toggle").textContent=paused?"▶":"Ⅱ";
}
function applyCamera(move,duration){
 dragging=false;img.classList.remove("is-dragging","is-zoomed","is-action-cut");
 img.style.transformOrigin=move.origin||"50% 50%";
 img.style.transition="transform "+duration+"ms cubic-bezier(.22,.72,.22,1), opacity 180ms ease";
 if(move.cut){
  img.classList.add("is-action-cut");
  img.style.transition="none";img.style.opacity=".35";
  requestAnimationFrame(()=>{img.style.transform=move.transform;img.style.opacity="1";});
 }else{
  img.style.opacity="1";img.style.transform=move.transform;
 }
}
function render(){
 const current=pages[page];if(!current)return;
 if(!reduceMotion){wrap.classList.remove("cinema-enter");void wrap.offsetWidth;wrap.classList.add("cinema-enter");}
 resetZoom();
 img.src=current.file;img.alt=current.caption||item.title+" — page "+(page+1);
 $("reader-title").textContent=item.title;
 $("reader-subtitle").textContent=(item.region||"")+" · "+(item.years||"");
 $("reader-counter").innerHTML="<strong>"+(page+1)+"</strong> / "+pages.length;
 $("reader-caption").textContent=current.caption||"";$("reader-caption").hidden=!current.caption;
 $("reader-prev").disabled=page===0;$("reader-next").disabled=page===pages.length-1;
 document.title=item.title+" — Page "+(page+1)+" · Beyond Relics";
 document.querySelectorAll(".reader-thumb").forEach((b,i)=>b.setAttribute("aria-current",String(i===page)));
 const active=$("reader-thumbs").children[page];
 if(active)active.scrollIntoView({block:"nearest",inline:"center",behavior:reduceMotion?"auto":"smooth"});
}
function changePage(next){if(next<0||next>=pages.length)return false;page=next;render();return true;}
function buildThumbs(){
 const root=$("reader-thumbs");root.replaceChildren();
 pages.forEach((p,i)=>{
  const b=document.createElement("button");b.className="reader-thumb";b.type="button";
  b.setAttribute("aria-label","Go to page "+(i+1));
  const t=document.createElement("img");t.src=p.file;t.alt="";t.loading="lazy";b.append(t);
  b.addEventListener("click",()=>{stopPlayback(true);changePage(i);});root.append(b);
 });
}
function showError(){
 stage.innerHTML='<div class="reader-error">This comic could not be opened. The selected chapter may not have uploaded pages.<br><a href="index.html">Return to the comic collection</a></div>';
}
function stopPlayback(reset){
 window.clearTimeout(playbackTimer);playbackTimer=null;playing=false;paused=false;
 if(reset)resetZoom();
 setPlaybackState();
}
function runBeat(){
 if(!playing||paused)return;
 const move=cinematicMoveForPage(page),duration=move.duration||3600;
 applyCamera(move,reduceMotion?0:duration);
 playbackTimer=window.setTimeout(()=>{
  if(!playing||paused)return;
  if(page===pages.length-1){stopPlayback(false);return;}
  changePage(page+1);runBeat();
 },reduceMotion?40:duration);
}
function startPlayback(){
 if(!pages.length||playing)return;
 playing=true;paused=false;setPlaybackState();runBeat();
}
function toggleFilm(){if(!playing){startPlayback();return;}if(!paused){clearTimeout(playbackTimer);playbackTimer=null;const m=getComputedStyle(img).transform;img.style.transition="none";img.style.transform=m;paused=true;}else{paused=false;runBeat();}setPlaybackState();}
function nextFilmPage(){if(page<pages.length-1){if(!playing)playing=true;paused=false;changePage(page+1);setPlaybackState();runBeat();}}
function toggleMusic(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!musicContext)musicContext=new AC();if(musicOn){musicContext.suspend();musicOn=false;$("cinema-sound").textContent="♫ SOUND";return;}musicContext.resume();const ctx=musicContext,master=ctx.createGain();master.gain.value=.10;master.connect(ctx.destination);[55,82.4,110].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=i?"triangle":"sine";o.frequency.value=f;g.gain.value=i?.09:.24;o.connect(g);g.connect(master);o.start();});musicOn=true;$("cinema-sound").textContent="♫ MUSIC ON";}
function beginAutomaticCinema(){
 if(autoplayStarted)return;
 autoplayStarted=true;
 if(img.complete&&img.naturalWidth){startPlayback();return;}
 img.addEventListener("load",startPlayback,{once:true});
}
fetch("data/artifacts.json").then(r=>{if(!r.ok)throw Error();return r.json();}).then(records=>{
 const id=new URLSearchParams(location.search).get("chapter");
 item=records.find(x=>x.id===id&&Array.isArray(x.story_artwork)&&x.story_artwork.length);
 if(!item){showError();return;}
 pages=item.story_artwork;buildThumbs();render();
 beginAutomaticCinema();
}).catch(showError);
$("reader-prev").addEventListener("click",()=>{stopPlayback(true);changePage(page-1);});
$("reader-next").addEventListener("click",()=>{stopPlayback(true);changePage(page+1);});
document.querySelectorAll("[data-action]").forEach(button=>button.addEventListener("click",()=>{
 const action=button.dataset.action;
 if(action==="zoom-in")setZoom(scale+.5);
 if(action==="zoom-out")setZoom(scale-.5);
 if(action==="reset"){stopPlayback(true);resetZoom();}
 if(action==="fullscreen"){
  const target=document.documentElement;
  if(!document.fullscreenElement){if(target.requestFullscreen)target.requestFullscreen().catch(()=>{});}
  else if(document.exitFullscreen)document.exitFullscreen();
 }
}));
document.addEventListener("fullscreenchange",()=>document.body.classList.toggle("is-fullscreen",!!document.fullscreenElement));
img.addEventListener("click",()=>{
 if(playing)return;
 if(suppressClick){suppressClick=false;return;}
 if(moved){moved=false;return;}
 setZoom(scale===1?2:1);
});
img.addEventListener("dblclick",event=>{event.preventDefault();if(!playing)setZoom(scale===1?2.5:1);});
img.addEventListener("pointerdown",event=>{
 if(scale<=1||playing)return;
 dragging=true;moved=false;startX=event.clientX;startY=event.clientY;originX=tx;originY=ty;
 img.classList.add("is-dragging");img.setPointerCapture(event.pointerId);
});
img.addEventListener("pointermove",event=>{
 if(!dragging)return;
 if(Math.abs(event.clientX-startX)+Math.abs(event.clientY-startY)>5)moved=true;
 tx=originX+event.clientX-startX;ty=originY+event.clientY-startY;
 img.style.transition="none";
 img.style.transform="translate3d("+tx+"px,"+ty+"px,0) scale("+scale+")";
});
function endDrag(){dragging=false;img.classList.remove("is-dragging");}
img.addEventListener("pointerup",endDrag);img.addEventListener("pointercancel",endDrag);
stage.addEventListener("touchstart",event=>{
 if(event.touches.length===1){touchX=event.touches[0].clientX;touchY=event.touches[0].clientY;}
},{passive:true});
stage.addEventListener("touchend",event=>{
 if(scale>1||playing||!event.changedTouches.length)return;
 const dx=event.changedTouches[0].clientX-touchX,dy=event.changedTouches[0].clientY-touchY;
 if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2){
  suppressClick=true;changePage(page+(dx<0?1:-1));window.setTimeout(()=>{suppressClick=false;},450);
 }
},{passive:true});
document.addEventListener("keydown",event=>{
 if(event.key==="ArrowRight"||event.key==="PageDown"){event.preventDefault();stopPlayback(true);changePage(page+1);}
 if(event.key==="ArrowLeft"||event.key==="PageUp"){event.preventDefault();stopPlayback(true);changePage(page-1);}
 if(event.key==="Escape"&&scale>1)resetZoom();
 if(event.key==="+"||event.key==="=")setZoom(scale+.5);
 if(event.key==="-")setZoom(scale-.5);
});
$("cinema-toggle").addEventListener("click",toggleFilm);
$("cinema-next").addEventListener("click",nextFilmPage);
$("cinema-sound").addEventListener("click",toggleMusic);
setPlaybackState();
})();