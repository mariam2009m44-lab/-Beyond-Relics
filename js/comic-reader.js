(function(){
"use strict";
const $=id=>document.getElementById(id);
const img=$("reader-image"),stage=$("reader-stage"),wrap=$("reader-image-wrap");
let item=null,pages=[],page=0,playing=false,paused=false,timer=0,scale=1,tx=0,ty=0,dragging=false,moved=false,suppressClick=false,startX=0,startY=0,originX=0,originY=0,touchX=0,touchY=0;
let audioContext=null,audioMaster=null,audioNodes=[],musicOn=false;
const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SCENE_MS=2100, CAMERA_MS=1750, TRANSITION_MS=620;
const $caption=$("reader-caption");
const moves=[
 {origin:"78% 50%",transform:"translate3d(-3.2%,0,0) scale(1.18)"},
 {origin:"54% 34%",transform:"translate3d(0,1.5%,0) scale(1.34)"},
 {origin:"48% 18%",transform:"translate3d(0,-5%,0) scale(1.28)"},
 {origin:"50% 50%",transform:"translate3d(0,0,0) scale(1.015)"},
 {origin:"52% 42%",transform:"translate3d(0,0,0) scale(1.58)",impact:true},
 {origin:"50% 50%",transform:"translate3d(0,0,0) scale(1)"}
];
function moveFor(i){
 const caption=(pages[i]&&pages[i].caption||"").toLowerCase();
 if(i===pages.length-1)return moves[5];
 if(/attack|impact|collision|explosion|crash|strike|battle|هجوم|انفجار|اصطدام/.test(caption))return moves[4];
 return moves[i%4];
}
function resetZoom(){
 scale=1;tx=0;ty=0;img.style.transition="transform .2s ease";img.style.transform="translate3d(0,0,0) scale(1)";
 img.style.transformOrigin="50% 50%";img.classList.remove("is-zoomed");
}
function setZoom(value){
 pauseForManualAction();scale=Math.max(1,Math.min(4,value));if(scale===1){tx=0;ty=0;}
 img.style.transition="transform .25s ease";img.style.transform="translate3d("+tx+"px,"+ty+"px,0) scale("+scale+")";img.classList.toggle("is-zoomed",scale>1);
}
function updateControls(){
 document.body.classList.toggle("is-cinematic-playing",playing&&!paused);
 $("cinema-toggle").textContent=paused||!playing?"▶":"Ⅱ";
 $("cinema-toggle").setAttribute("aria-label",paused||!playing?"Play film":"Pause film");
 $("cinema-toggle").setAttribute("aria-pressed",String(paused||!playing));
 $("cinema-next").disabled=page>=pages.length-1;
}
function animateEntry(){
 if(reduce)return;
 wrap.classList.remove("cinema-enter","enter-from-top","enter-from-bottom");
 wrap.style.setProperty("--scene-enter-y",page%2===0?"-105%":"105%");
 void wrap.offsetWidth;wrap.classList.add("cinema-enter",page%2===0?"enter-from-top":"enter-from-bottom");
}
function render(animate){
 const p=pages[page];if(!p)return;
 resetZoom();img.src=p.file;img.alt=p.caption||item.title+" — page "+(page+1);
 $("reader-title").textContent=item.title;$("reader-subtitle").textContent=(item.region||"")+" · "+(item.years||"");
 $("reader-counter").innerHTML="<strong>"+(page+1)+"</strong> / "+pages.length;
 $caption.textContent=p.caption||"";$caption.hidden=!p.caption;
 $("reader-prev").disabled=page===0;$("reader-next").disabled=page===pages.length-1;
 document.title=item.title+" — Page "+(page+1)+" · Beyond Relics";
 document.querySelectorAll(".reader-thumb").forEach((b,i)=>b.setAttribute("aria-current",String(i===page)));
 const active=$("reader-thumbs").children[page];if(active)active.scrollIntoView({block:"nearest",inline:"center",behavior:reduce?"auto":"smooth"});
 if(animate)animateEntry();
}
function changePage(next,keepPlayback){
 if(next<0||next>=pages.length)return false;
 const resume=keepPlayback===undefined?playing&&!paused:keepPlayback;
 clearTimeout(timer);page=next;render(true);
 if(resume){playing=true;paused=false;updateControls();runScene();}
 else updateControls();
 return true;
}
function buildThumbs(){
 const root=$("reader-thumbs");root.replaceChildren();
 pages.forEach((p,i)=>{
  const b=document.createElement("button");b.className="reader-thumb";b.type="button";b.setAttribute("aria-label","Open scene "+(i+1));
  const t=document.createElement("img");t.src=p.file;t.alt="";t.loading=i<5?"eager":"lazy";b.append(t);
  b.addEventListener("click",()=>changePage(i,playing&&!paused));root.append(b);
 });
}
function applyCamera(){
 const move=moveFor(page);
 img.classList.remove("is-action-cut","is-zoomed");
 img.style.transformOrigin=move.origin;
 img.style.transition="transform "+(reduce?0:CAMERA_MS)+"ms cubic-bezier(.18,.7,.2,1),filter .4s ease";
 if(move.impact){img.classList.add("is-action-cut");img.style.filter="contrast(1.12) brightness(1.08)";}
 else img.style.filter="none";
 img.style.transform=move.transform;
}
function runScene(){
 clearTimeout(timer);if(!playing||paused)return;
 applyCamera();
 timer=setTimeout(()=>{
  if(!playing||paused)return;
  if(page===pages.length-1){playing=false;paused=false;updateControls();return;}
  page++;render(true);runScene();
 },SCENE_MS);
}
function startFilm(){if(!pages.length)return;if(page>=pages.length-1){page=0;render(true);}playing=true;paused=false;updateControls();runScene();}
function toggleFilm(){
 if(!playing){startFilm();return;}
 if(!paused){clearTimeout(timer);timer=0;paused=true;img.style.transition="none";img.style.transform=getComputedStyle(img).transform;}
 else{paused=false;updateControls();runScene();}
 updateControls();
}
function pauseForManualAction(){if(playing&&!paused){clearTimeout(timer);timer=0;paused=true;updateControls();}}
function nextScene(){if(page<pages.length-1)changePage(page+1,playing&&!paused);}
function previousScene(){if(page>0)changePage(page-1,playing&&!paused);}
function createScore(){
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
 if(!audioContext){
  audioContext=new AC();audioMaster=audioContext.createGain();audioMaster.gain.value=0;audioMaster.connect(audioContext.destination);
  const filter=audioContext.createBiquadFilter();filter.type="lowpass";filter.frequency.value=390;filter.Q.value=.7;
  const shimmer=audioContext.createBiquadFilter();shimmer.type="lowpass";shimmer.frequency.value=1050;shimmer.Q.value=.5;
  filter.connect(shimmer);shimmer.connect(audioMaster);
  [55,82.41,110,164.81].forEach((freq,i)=>{
   const osc=audioContext.createOscillator(),gain=audioContext.createGain();
   osc.type=i===0?"sine":i===3?"triangle":"sawtooth";osc.frequency.value=freq;gain.gain.value=[.3,.075,.045,.018][i];
   osc.connect(gain);gain.connect(filter);osc.start();audioNodes.push(osc,gain);
  });
  const lfo=audioContext.createOscillator(),lfoGain=audioContext.createGain();lfo.frequency.value=.075;lfoGain.gain.value=150;lfo.connect(lfoGain);lfoGain.connect(filter.frequency);lfo.start();audioNodes.push(lfo,lfoGain,filter,shimmer);
 }
 return true;
}
function toggleMusic(){
 if(!createScore())return;
 if(audioContext.state==="suspended")audioContext.resume();
 musicOn=!musicOn;
 const now=audioContext.currentTime;audioMaster.gain.cancelScheduledValues(now);audioMaster.gain.setTargetAtTime(musicOn?.13:0,now,.7);
 $("cinema-sound").textContent=musicOn?"♫ SOUND ON":"♫ SOUND";
 $("cinema-sound").setAttribute("aria-pressed",String(musicOn));
}
function showError(){stage.innerHTML='<div class="reader-error">This story could not be opened. Please return to the mission collection and select a chapter.<br><a href="index.html">Return to Beyond Relics</a></div>';}
fetch("data/artifacts.json").then(r=>{if(!r.ok)throw Error("Archive unavailable");return r.json();}).then(rows=>{
 const id=new URLSearchParams(location.search).get("chapter");item=rows.find(x=>x.id===id&&Array.isArray(x.story_artwork)&&x.story_artwork.length);
 if(!item){showError();return;}pages=item.story_artwork;buildThumbs();render(false);
 const first=img.complete&&img.naturalWidth?Promise.resolve():new Promise(resolve=>img.addEventListener("load",resolve,{once:true}));
 first.then(()=>{if(!reduce)startFilm();else{playing=false;updateControls();}});
}).catch(showError);
$("reader-prev").addEventListener("click",previousScene);$("reader-next").addEventListener("click",nextScene);
$("cinema-toggle").addEventListener("click",()=>{toggleFilm();if(!musicOn)toggleMusic();});
$("cinema-next").addEventListener("click",nextScene);$("cinema-sound").addEventListener("click",toggleMusic);
document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>{
 const action=b.dataset.action;
 if(action==="zoom-in")setZoom(scale+.5);if(action==="zoom-out")setZoom(scale-.5);if(action==="reset")resetZoom();
 if(action==="fullscreen"){const el=document.documentElement;if(!document.fullscreenElement){if(el.requestFullscreen)el.requestFullscreen().catch(()=>{});}else if(document.exitFullscreen)document.exitFullscreen();}
}));
document.addEventListener("fullscreenchange",()=>document.body.classList.toggle("is-fullscreen",!!document.fullscreenElement));
img.addEventListener("click",()=>{if(playing&&!paused)return;if(suppressClick){suppressClick=false;return;}if(moved){moved=false;return;}setZoom(scale===1?2:1);});
img.addEventListener("dblclick",e=>{e.preventDefault();if(!playing||paused)setZoom(scale===1?2.4:1);});
img.addEventListener("pointerdown",e=>{if(scale<=1||playing&&!paused)return;dragging=true;moved=false;startX=e.clientX;startY=e.clientY;originX=tx;originY=ty;img.classList.add("is-dragging");img.setPointerCapture(e.pointerId);});
img.addEventListener("pointermove",e=>{if(!dragging)return;if(Math.abs(e.clientX-startX)+Math.abs(e.clientY-startY)>5)moved=true;tx=originX+e.clientX-startX;ty=originY+e.clientY-startY;img.style.transition="none";img.style.transform="translate3d("+tx+"px,"+ty+"px,0) scale("+scale+")";});
function endDrag(){dragging=false;img.classList.remove("is-dragging");}img.addEventListener("pointerup",endDrag);img.addEventListener("pointercancel",endDrag);
stage.addEventListener("touchstart",e=>{if(e.touches.length===1){touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;}},{passive:true});
stage.addEventListener("touchend",e=>{if(scale>1||playing&&!paused||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2){suppressClick=true;changePage(page+(dx<0?1:-1),playing&&!paused);setTimeout(()=>suppressClick=false,450);}},{passive:true});
document.addEventListener("keydown",e=>{
 if(e.key==="ArrowRight"||e.key==="PageDown"){e.preventDefault();nextScene();}
 if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();previousScene();}
 if(e.code==="Space"&&e.target.tagName!=="BUTTON"){e.preventDefault();toggleFilm();}
 if(e.key==="Escape"&&scale>1)resetZoom();
 if(e.key==="+"||e.key==="=")setZoom(scale+.5);if(e.key==="-")setZoom(scale-.5);
});
updateControls();
})();