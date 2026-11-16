(function(){
"use strict";
const $=id=>document.getElementById(id);
let item=null,pages=[],page=0,scale=1,tx=0,ty=0,dragging=false,startX=0,startY=0,originX=0,originY=0,touchX=0,touchY=0;
const img=$("reader-image"),wrap=$("reader-image-wrap"),stage=$("reader-stage");
function applyZoom(){img.style.transform="translate3d("+tx+"px,"+ty+"px,0) scale("+scale+")";img.classList.toggle("is-zoomed",scale>1);if(scale<=1){tx=0;ty=0;img.style.transform="translate3d(0,0,0) scale(1)";}}
function setZoom(value){scale=Math.max(1,Math.min(4,value));if(scale===1){tx=0;ty=0;}applyZoom();}
function resetZoom(){setZoom(1);}
function changePage(next){if(next<0||next>=pages.length)return;page=next;resetZoom();render();$('reader-help').classList.remove('is-hidden');}
function render(){
 const current=pages[page];img.src=current.file;img.alt=current.caption||item.title+" — page "+(page+1);
 $("reader-title").textContent=item.title;$("reader-subtitle").textContent=(item.region||"")+" · "+(item.years||"");
 $("reader-counter").innerHTML="<strong>"+(page+1)+"</strong> / "+pages.length;
 $("reader-caption").textContent=current.caption||"";$("reader-caption").hidden=!current.caption;
 $("reader-prev").disabled=page===0;$("reader-next").disabled=page===pages.length-1;
 document.title=item.title+" — Page "+(page+1)+" · Beyond Relics";
 document.querySelectorAll(".reader-thumb").forEach((b,i)=>b.setAttribute("aria-current",String(i===page)));
 const active=$("reader-thumbs").children[page];if(active)active.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"});
}
function buildThumbs(){const root=$("reader-thumbs");root.replaceChildren();pages.forEach((p,i)=>{const b=document.createElement("button");b.className="reader-thumb";b.type="button";b.setAttribute("aria-label","Go to page "+(i+1));const t=document.createElement("img");t.src=p.file;t.alt="";t.loading="lazy";b.append(t);b.addEventListener("click",()=>changePage(i));root.append(b);});}
function showError(){stage.innerHTML='<div class="reader-error">This comic could not be opened. The selected chapter may not have uploaded pages.<br><a href="index.html">Return to the comic collection</a></div>';}
fetch("data/artifacts.json").then(r=>{if(!r.ok)throw Error();return r.json();}).then(records=>{
 const id=new URLSearchParams(location.search).get("chapter");
 item=records.find(x=>x.id===id&&Array.isArray(x.story_artwork)&&x.story_artwork.length);
 if(!item){showError();return;}pages=item.story_artwork;buildThumbs();render();
}).catch(showError);
$("reader-prev").addEventListener("click",()=>changePage(page-1));$("reader-next").addEventListener("click",()=>changePage(page+1));
document.querySelectorAll("[data-action]").forEach(button=>button.addEventListener("click",()=>{
 const action=button.dataset.action;
 if(action==="zoom-in")setZoom(scale+.5);
 if(action==="zoom-out")setZoom(scale-.5);
 if(action==="reset")resetZoom();
 if(action==="fullscreen"){const target=document.documentElement;if(!document.fullscreenElement){if(target.requestFullscreen)target.requestFullscreen().catch(()=>{});}else if(document.exitFullscreen)document.exitFullscreen();}
}));
document.addEventListener("fullscreenchange",()=>document.body.classList.toggle("is-fullscreen",!!document.fullscreenElement));
img.addEventListener("click",()=>{setZoom(scale===1?2:1);$("reader-help").classList.add("is-hidden");});
img.addEventListener("dblclick",event=>{event.preventDefault();setZoom(scale===1?2.5:1);});
img.addEventListener("pointerdown",event=>{if(scale<=1)return;dragging=true;startX=event.clientX;startY=event.clientY;originX=tx;originY=ty;img.classList.add("is-dragging");img.setPointerCapture(event.pointerId);});
img.addEventListener("pointermove",event=>{if(!dragging)return;tx=originX+event.clientX-startX;ty=originY+event.clientY-startY;applyZoom();});
function endDrag(){dragging=false;img.classList.remove("is-dragging");}
img.addEventListener("pointerup",endDrag);img.addEventListener("pointercancel",endDrag);
stage.addEventListener("touchstart",event=>{if(event.touches.length===1){touchX=event.touches[0].clientX;touchY=event.touches[0].clientY;}},{passive:true});
stage.addEventListener("touchend",event=>{if(scale>1||!event.changedTouches.length)return;const dx=event.changedTouches[0].clientX-touchX,dy=event.changedTouches[0].clientY-touchY;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2)changePage(page+(dx<0?1:-1));},{passive:true});
document.addEventListener("keydown",event=>{if(event.key==="ArrowRight"||event.key==="PageDown"){event.preventDefault();changePage(page+1);}if(event.key==="ArrowLeft"||event.key==="PageUp"){event.preventDefault();changePage(page-1);}if(event.key==="Escape"&&scale>1)resetZoom();if(event.key==="+"||event.key==="=")setZoom(scale+.5);if(event.key==="-")setZoom(scale-.5);});
img.addEventListener("load",()=>{img.classList.remove("is-zoomed");});
})();