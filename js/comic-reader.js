(function(){
"use strict";
const $=id=>document.getElementById(id);
const img=$("reader-image"),stage=$("reader-stage"),wrap=$("reader-image-wrap");
let item=null,pages=[],page=0,playing=false,paused=false,timer=0,scale=1,tx=0,ty=0,dragging=false,moved=false,suppressClick=false,startX=0,startY=0,originX=0,originY=0,touchX=0,touchY=0,textMode=false;
let audioContext=null,audioMaster=null,audioNodes=[],musicOn=false;
const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SCENE_MS=4700, CAMERA_MS=1050, TRANSITION_MS=620;
const cameraTimers=[];
function clearCameraSequence(){cameraTimers.forEach(clearTimeout);cameraTimers.length=0;}
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
 $("cinema-toggle").innerHTML=paused||!playing?"▶ <span>PLAY FILM</span>":"Ⅱ <span>PAUSE FILM</span>";
 $("cinema-toggle").setAttribute("aria-label",paused||!playing?"Play film":"Pause film");
 $("cinema-toggle").setAttribute("aria-pressed",String(paused||!playing));
}
function animateEntry(){
 if(reduce)return;
 wrap.classList.remove("cinema-enter","enter-from-top","enter-from-bottom");
 wrap.style.setProperty("--scene-enter-y",page%2===0?"-105%":"105%");
 void wrap.offsetWidth;wrap.classList.add("cinema-enter",page%2===0?"enter-from-top":"enter-from-bottom");
}
function render(animate){
 const p=pages[page];if(!p)return;
 const oldError=stage.querySelector(".reader-image-error");if(oldError)oldError.remove();
 const textOnly=textMode||!p.file;
 if(textOnly){
  img.hidden=true;img.removeAttribute("src");wrap.classList.add("is-text-story");
  let card=wrap.querySelector(".reader-story-beat");
  if(!card){card=document.createElement("article");card.className="reader-story-beat";card.setAttribute("aria-live","polite");wrap.append(card);}
  card.dataset.tone=item.tone||"space";card.replaceChildren();
  const top=document.createElement("div");top.className="reader-story-kicker";top.textContent="MISSION JOURNAL · "+String(page+1).padStart(2,"0")+" / "+String(pages.length).padStart(2,"0");
  const rule=document.createElement("span");rule.className="reader-story-rule";rule.setAttribute("aria-hidden","true");
  const heading=document.createElement("h2");heading.textContent=p.caption||"Mission record";
  const hook=document.createElement("p");hook.className="reader-story-hook";hook.textContent=page===0&&item.story_hook?item.story_hook:"FIELD NOTE · "+(item.region||"MISSION")+" · "+(item.years||"");
  card.append(top,rule,heading,hook);
  if(p.fact&&p.fact.length===2){const fact=document.createElement("div");fact.className="reader-story-fact";const label=document.createElement("small");label.textContent=p.fact[0];const value=document.createElement("strong");value.textContent=p.fact[1];fact.append(label,value);card.append(fact);}
  const progress=document.createElement("div");progress.className="reader-story-progress";progress.setAttribute("aria-hidden","true");progress.style.setProperty("--story-progress",((page+1)/pages.length*100)+"%");card.append(progress);
  $caption.hidden=true;
 }else{
  const card=wrap.querySelector(".reader-story-beat");if(card)card.remove();
  wrap.classList.remove("is-text-story");img.hidden=false;img.src=p.file;img.alt=p.caption||item.title+" — page "+(page+1);
  $caption.textContent=p.caption||"";$caption.hidden=!p.caption;
 }
 $("reader-title").textContent=item.title;$("reader-subtitle").textContent=(item.region||"")+" · "+(item.years||"");
 $("reader-counter").innerHTML="<strong>"+(page+1)+"</strong> / "+pages.length;
 $("reader-prev").disabled=page===0;$("reader-next").disabled=page===pages.length-1;
 document.title=item.title+" — "+(textOnly?"Mission Story":"Page "+(page+1))+" · Beyond Relics";
 document.querySelectorAll(".reader-thumb").forEach((b,i)=>b.setAttribute("aria-current",String(i===page)));
 const active=$("reader-thumbs").children[page];if(active)active.scrollIntoView({block:"nearest",inline:"center",behavior:reduce?"auto":"smooth"});
 const exhibit=$("reader-exhibit-link");if(exhibit)exhibit.href="artifact-details.html?id="+encodeURIComponent(item.id);
 document.querySelectorAll('[data-action="zoom-in"],[data-action="zoom-out"]').forEach(b=>b.hidden=textOnly);
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
  const b=document.createElement("button");b.className="reader-thumb";b.type="button";b.setAttribute("aria-label","Open story step "+(i+1));
  if(p.file){const t=document.createElement("img");t.src=p.file;t.alt="";t.loading=i<5?"eager":"lazy";b.append(t);}
  else{const n=document.createElement("span");n.className="reader-thumb-number";n.textContent=String(i+1).padStart(2,"0");b.append(n);}
  b.addEventListener("click",()=>changePage(i,playing&&!paused));root.append(b);
 });
}
function applyCamera(){
 if(textMode){const card=wrap.querySelector(".reader-story-beat");if(card){card.classList.remove("story-beat-enter");void card.offsetWidth;card.classList.add("story-beat-enter");}return;}
 clearCameraSequence();
 const move=moveFor(page);
 img.classList.remove("is-action-cut","is-zoomed");
 img.style.filter=move.impact?"contrast(1.12) brightness(1.08)":"none";
 if(reduce){img.style.transition="none";img.style.transformOrigin="50% 50%";img.style.transform="translate3d(0,0,0) scale(1)";return;}
 if(move.impact){
  img.classList.add("is-action-cut");img.style.transformOrigin=move.origin;
  img.style.transition="transform 360ms cubic-bezier(.12,.82,.2,1),filter .3s ease";
  img.style.transform=move.transform;
  cameraTimers.push(setTimeout(()=>{img.style.transition="transform 850ms cubic-bezier(.2,.7,.2,1)";img.style.transform="translate3d(0,0,0) scale(1.04)";},460));
  return;
 }
 const shots=[
  {origin:"78% 50%",transform:"translate3d(-2.8%,0,0) scale(1.10)"},
  {origin:"54% 34%",transform:"translate3d(0,1.2%,0) scale(1.28)"},
  {origin:"48% 18%",transform:"translate3d(0,-4.2%,0) scale(1.24)"},
  {origin:"50% 50%",transform:"translate3d(0,0,0) scale(1.015)"}
 ];
 img.style.transition="transform 900ms cubic-bezier(.2,.65,.2,1),filter .4s ease";
 img.style.transformOrigin=shots[0].origin;img.style.transform=shots[0].transform;
 shots.slice(1).forEach((shot,index)=>{
  cameraTimers.push(setTimeout(()=>{
   if(!playing||paused)return;
   img.style.transformOrigin=shot.origin;
   img.style.transition="transform "+CAMERA_MS+"ms cubic-bezier(.2,.65,.2,1)";
   img.style.transform=shot.transform;
  },(index+1)*1050));
 });
}
function runScene(){
 clearTimeout(timer);clearCameraSequence();if(!playing||paused)return;
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
 if(!paused){clearTimeout(timer);timer=0;clearCameraSequence();paused=true;img.style.transition="none";img.style.transform=getComputedStyle(img).transform;}
 else{paused=false;updateControls();runScene();}
 updateControls();
}
function pauseForManualAction(){if(playing&&!paused){clearTimeout(timer);timer=0;clearCameraSequence();paused=true;updateControls();}}
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
 $("cinema-sound").innerHTML=musicOn?"♫ <span>SOUND ON</span>":"♫ <span>SOUND OFF</span>";
 $("cinema-sound").setAttribute("aria-label",musicOn?"Turn sound off":"Turn sound on");
 $("cinema-sound").setAttribute("aria-pressed",String(musicOn));
}
function activateTextStory(){
 if(!item||!Array.isArray(item.story_beats)||!item.story_beats.length)return false;
 textMode=true;pages=item.story_beats.map((caption,i)=>({caption:caption,fact:(item.facts||[])[i]||null}));page=0;buildThumbs();render(false);if(!reduce)startFilm();else{playing=false;paused=false;updateControls();}return true;
}
function showImageError(){if(!textMode&&activateTextStory())return;let note=stage.querySelector(".reader-image-error");if(!note){note=document.createElement("div");note.className="reader-image-error";note.setAttribute("role","status");stage.append(note);}note.textContent="This comic frame could not be loaded. You can still move to another page or return to the collection.";clearTimeout(timer);clearCameraSequence();playing=false;paused=false;updateControls();}
img.addEventListener("error",showImageError);
function showError(){stage.innerHTML='<div class="reader-error">This story could not be opened. Please return to the mission collection and select a chapter.<br><a href="index.html">Return to Beyond Relics</a></div>';}
fetch("data/artifacts.json").then(r=>{if(!r.ok)throw Error("Archive unavailable");return r.json();}).then(rows=>{
 const id=new URLSearchParams(location.search).get("chapter");item=rows.find(x=>x.id===id);
 if(!item){showError();return;}
 const artwork=Array.isArray(item.story_artwork)&&item.story_artwork.length;
 if(artwork){textMode=false;pages=item.story_artwork;}
 else if(Array.isArray(item.story_beats)&&item.story_beats.length){textMode=true;pages=item.story_beats.map((caption,i)=>({caption:caption,fact:(item.facts||[])[i]||null}));}
 else{
  window.location.replace("artifact-details.html?id="+encodeURIComponent(item.id));
  return;
 }
 buildThumbs();render(false);
 const first=textMode?Promise.resolve():(img.complete&&img.naturalWidth?Promise.resolve():new Promise((resolve,reject)=>{img.addEventListener("load",resolve,{once:true});img.addEventListener("error",reject,{once:true});}));
 first.then(()=>{if(!reduce)startFilm();else{playing=false;updateControls();}}).catch(showImageError);
}).catch(showError);
$("reader-prev").addEventListener("click",previousScene);$("reader-next").addEventListener("click",nextScene);
$("cinema-toggle").addEventListener("click",toggleFilm);
$("cinema-sound").addEventListener("click",toggleMusic);
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