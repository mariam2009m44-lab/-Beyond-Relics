(function(){
"use strict";
const $=id=>document.getElementById(id);
let item=null,pages=[],page=0,scale=1,tx=0,ty=0,dragging=false,moved=false,suppressClick=false,startX=0,startY=0,originX=0,originY=0,touchX=0,touchY=0;
let playbackTimer=null,playing=false,paused=false,beatIndex=0,playbackSpeed=1,beatStarted=0,beatDuration=2500;
const img=$("reader-image"),wrap=$("reader-image-wrap"),stage=$("reader-stage");
// Cinematic shot language for the existing comic artwork.
const moves=[
 {id:"pan-right",label:"Slow Pan Right",origin:"78% 50%",transform:"translate3d(-5%,0,0) scale(1.24)",duration:3200},
 {id:"zoom-in",label:"Slow Face Push-In",origin:"54% 34%",transform:"translate3d(0,2%,0) scale(1.58)",duration:3400},
 {id:"pan-down",label:"Slow Pan Down",origin:"48% 18%",transform:"translate3d(0,-7%,0) scale(1.42)",duration:3400},
 {id:"zoom-out",label:"Wide Location Reveal",origin:"50% 50%",transform:"translate3d(0,0,0) scale(1.02)",duration:3600},
 {id:"impact",label:"Fast Action Punch-In",origin:"52% 42%",transform:"translate3d(0,0,0) scale(1.92)",duration:620,cut:true},
 {id:"ending",label:"Final Slow Pull-Back",origin:"50% 50%",transform:"translate3d(0,0,0) scale(1)",duration:4800}
];
function cinematicMoveForPage(index){
 const last=index===pages.length-1;
 const caption=(pages[index]&&pages[index].caption||"").toLowerCase();
 if(last)return moves[5];
 if(/attack|impact|collision|explosion|crash|strike|battle|هجوم|انفجار|اصطدام/.test(caption))return moves[4];
 if(index===0)return moves[0];
 if(index===1)return moves[1];
 if(index===2)return moves[2];
 if(index===3)return moves[3];
 return {id:"slow-drift",label:"Slow Cinematic Drift",origin:"50% 48%",transform:"translate3d(-1.5%,0,0) scale(1.12)",duration:3000};
}
const reduceMotion=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function applyZoom(){
 stopPlayback(false);
 img.style.transition="transform .25s ease";
 img.style.transform="translate3d("+tx+"px,"+ty+"px,0) scale("+scale+")";
 img.classList.toggle("is-zoomed",scale>1);
 if(scale<=1){tx=0;ty=0;img.style.transform="translate3d(0,0,0) scale(1)";}
}
function setZoom(value){scale=Math.max(1,Math.min(4,value));if(scale===1){tx=0;ty=0;}applyZoom();}
function resetZoom(){scale=1;tx=0;ty=0;img.style.transition="transform .25s ease";img.style.transform="translate3d(0,0,0) scale(1)";img.classList.remove("is-zoomed");}
function setProgress(value,duration){const fill=$("motion-progress-fill");if(fill){fill.style.transition=duration?"width "+duration+"ms linear":"none";fill.style.width=Math.max(0,Math.min(100,value))+"%";}}
function setPlaybackControls(){
 document.body.classList.toggle("is-cinematic-playing",playing&&!paused);
 $("motion-play").disabled=playing&&!paused;
 $("motion-pause").disabled=!playing;
 $("motion-pause").textContent=paused?"▶ Resume":"Ⅱ Pause";
 $("motion-stop").disabled=!playing;
}
function applyCamera(move,duration){
 stopDragForCamera();
 img.classList.remove("is-zoomed","is-action-cut");
 img.style.transformOrigin=move.origin||"50% 50%";
 img.style.transition="transform "+duration+"ms cubic-bezier(.22,.72,.22,1), opacity 180ms ease";
 if(move.cut){
   img.classList.add("is-action-cut");
   img.style.transition="none";
   img.style.opacity=".35";
   requestAnimationFrame(()=>{img.style.transform=move.transform;img.style.opacity="1";});
 }else{
   img.style.opacity="1";
   img.style.transform=move.transform;
 }
 $("reader-help").classList.add("is-hidden");
}
function stopDragForCamera(){dragging=false;img.classList.remove("is-dragging");}
function render(){
 const current=pages[page];if(!current)return;
 resetZoom();
 img.src=current.file;img.alt=current.caption||item.title+" — page "+(page+1);
 $("reader-title").textContent=item.title;
 $("reader-subtitle").textContent=(item.region||"")+" · "+(item.years||"");
 $("reader-counter").innerHTML="<strong>"+(page+1)+"</strong> / "+pages.length;
 $("reader-caption").textContent=current.caption||"";$("reader-caption").hidden=!current.caption;
 $("reader-prev").disabled=page===0;$("reader-next").disabled=page===pages.length-1;
 document.title=item.title+" — Page "+(page+1)+" · Beyond Relics";
 document.querySelectorAll(".reader-thumb").forEach((b,i)=>b.setAttribute("aria-current",String(i===page)));
 const active=$("reader-thumbs").children[page];if(active)active.scrollIntoView({block:"nearest",inline:"center",behavior:reduceMotion?"auto":"smooth"});
}
function changePage(next){if(next<0||next>=pages.length)return false;page=next;render();return true;}
function buildThumbs(){
 const root=$("reader-thumbs");root.replaceChildren();
 pages.forEach((p,i)=>{const b=document.createElement("button");b.className="reader-thumb";b.type="button";b.setAttribute("aria-label","Go to page "+(i+1));const t=document.createElement("img");t.src=p.file;t.alt="";t.loading="lazy";b.append(t);b.addEventListener("click",()=>{stopPlayback(true);changePage(i);});root.append(b);});
}
function showError(){stage.innerHTML='<div class="reader-error">This comic could not be opened. The selected chapter may not have uploaded pages.<br><a href="index.html">Return to the comic collection</a></div>';}
function durationForBeat(){const move=currentMove();return Math.round((move.duration||3000)/playbackSpeed);}
function currentMove(){return cinematicMoveForPage(page);}
function runBeat(){
 if(!playing||paused)return;
 const move=currentMove();beatDuration=durationForBeat();beatStarted=performance.now();
 applyCamera(move,beatDuration);setProgress(0,0);
 requestAnimationFrame(()=>setProgress(100,beatDuration));
 playbackTimer=window.setTimeout(()=>{
   if(!playing||paused)return;
   if(page===pages.length-1){stopPlayback(true);return;}
   beatIndex++;changePage(page+1);runBeat();
 },beatDuration);
}
function startPlayback(){
 if(!pages.length||reduceMotion)return;
 if(playing&&paused){paused=false;setPlaybackControls();runBeat();return;}
 stopPlayback(false);playing=true;paused=false;beatIndex=0;page=0;render();setPlaybackControls();runBeat();
}
function pausePlayback(){
 if(!playing||paused)return;
 paused=true;window.clearTimeout(playbackTimer);playbackTimer=null;
 img.style.transition="none";setPlaybackControls();
}
function stopPlayback(reset){
 window.clearTimeout(playbackTimer);playbackTimer=null;playing=false;paused=false;
 if(reset){beatIndex=0;resetZoom();setProgress(0);}
 setPlaybackControls();
}
function applySelectedMove(){
 const id=$("motion-preset").value;const move=moves.find(m=>m.id===id)||cinematicMoveForPage(page);
 stopPlayback(false);applyCamera(move,reduceMotion?0:durationForBeat());
}
fetch("data/artifacts.json").then(r=>{if(!r.ok)throw Error();return r.json();}).then(records=>{
 const id=new URLSearchParams(location.search).get("chapter");
 item=records.find(x=>x.id===id&&Array.isArray(x.story_artwork)&&x.story_artwork.length);
 if(!item){showError();return;}pages=item.story_artwork;buildThumbs();render();
 if(reduceMotion){$("motion-play").disabled=true;$("motion-play").textContent="Motion reduced by device settings";}
}).catch(showError);
$("reader-prev").addEventListener("click",()=>{stopPlayback(true);changePage(page-1);});
$("reader-next").addEventListener("click",()=>{stopPlayback(true);changePage(page+1);});
document.querySelectorAll("[data-action]").forEach(button=>button.addEventListener("click",()=>{
 const action=button.dataset.action;
 if(action==="zoom-in")setZoom(scale+.5);
 if(action==="zoom-out")setZoom(scale-.5);
 if(action==="reset"){stopPlayback(true);resetZoom();}
 if(action==="fullscreen"){const target=document.documentElement;if(!document.fullscreenElement){if(target.requestFullscreen)target.requestFullscreen().catch(()=>{});}else if(document.exitFullscreen)document.exitFullscreen();}
}));
$("motion-play").addEventListener("click",startPlayback);
$("motion-pause").addEventListener("click",()=>paused?startPlayback():pausePlayback());
$("motion-stop").addEventListener("click",()=>stopPlayback(true));
$("motion-apply").addEventListener("click",applySelectedMove);
$("motion-speed").addEventListener("change",event=>{playbackSpeed=Number(event.target.value)||1;if(playing&&!paused){window.clearTimeout(playbackTimer);runBeat();}});
document.addEventListener("fullscreenchange",()=>document.body.classList.toggle("is-fullscreen",!!document.fullscreenElement));
img.addEventListener("click",()=>{if(suppressClick){suppressClick=false;return;}if(moved){moved=false;return;}setZoom(scale===1?2:1);$("reader-help").classList.add("is-hidden");});
img.addEventListener("dblclick",event=>{event.preventDefault();setZoom(scale===1?2.5:1);});
img.addEventListener("pointerdown",event=>{if(scale<=1||playing&&!paused)return;dragging=true;moved=false;startX=event.clientX;startY=event.clientY;originX=tx;originY=ty;img.classList.add("is-dragging");img.setPointerCapture(event.pointerId);});
img.addEventListener("pointermove",event=>{if(!dragging)return;if(Math.abs(event.clientX-startX)+Math.abs(event.clientY-startY)>5)moved=true;tx=originX+event.clientX-startX;ty=originY+event.clientY-startY;img.style.transition="none";applyZoom();});
function endDrag(){dragging=false;img.classList.remove("is-dragging");}
img.addEventListener("pointerup",endDrag);img.addEventListener("pointercancel",endDrag);
stage.addEventListener("touchstart",event=>{if(event.touches.length===1){touchX=event.touches[0].clientX;touchY=event.touches[0].clientY;}},{passive:true});
stage.addEventListener("touchend",event=>{if(scale>1||playing||!event.changedTouches.length)return;const dx=event.changedTouches[0].clientX-touchX,dy=event.changedTouches[0].clientY-touchY;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2){suppressClick=true;changePage(page+(dx<0?1:-1));window.setTimeout(()=>{suppressClick=false;},450);}},{passive:true});
document.addEventListener("keydown",event=>{
 if(event.key==="ArrowRight"||event.key==="PageDown"){event.preventDefault();stopPlayback(true);changePage(page+1);}
 if(event.key==="ArrowLeft"||event.key==="PageUp"){event.preventDefault();stopPlayback(true);changePage(page-1);}
 if(event.key==="Escape"&&scale>1)resetZoom();
 if(event.key==="+"||event.key==="=")setZoom(scale+.5);
 if(event.key==="-")setZoom(scale-.5);
});
img.addEventListener("load",()=>{img.classList.remove("is-zoomed");});
setPlaybackControls();
})();