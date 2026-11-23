/* Beyond Relics — restrained scroll choreography for the mission timeline. */
(function(){
 "use strict";
 var list=document.getElementById("tl");
 if(!list)return;
 var preference=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)");
 if(preference&&preference.matches)return;
 var cards=Array.prototype.slice.call(list.querySelectorAll(".tl-item"));
 if(!cards.length)return;
 list.classList.add("br-timeline-motion-ready");
 var frame=0,active=null;
 function clamp(value){return Math.max(0,Math.min(1,value));}
 function update(){
  var rect=list.getBoundingClientRect();
  var progress=clamp((window.innerHeight*.46-rect.top)/Math.max(1,rect.height));
  list.style.setProperty("--br-timeline-progress",progress.toFixed(4));
  var center=window.innerHeight*.5,best=null,distance=Infinity;
  cards.forEach(function(card){
   var box=card.getBoundingClientRect();
   if(box.bottom<=0||box.top>=window.innerHeight)return;
   var next=Math.abs((box.top+box.bottom)*.5-center);
   if(next<distance){distance=next;best=card;}
  });
  if(best!==active){
   if(active)active.classList.remove("is-timeline-active");
   active=best;
   if(active)active.classList.add("is-timeline-active");
  }
  frame=0;
 }
 function schedule(){
  if(frame)return;
  frame=window.requestAnimationFrame(update);
 }
 window.addEventListener("scroll",schedule,{passive:true});
 window.addEventListener("resize",schedule,{passive:true});
 window.addEventListener("orientationchange",schedule,{passive:true});
 if("ResizeObserver" in window){new ResizeObserver(schedule).observe(list);}
 list.addEventListener("load",schedule,true);
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(schedule).catch(function(){});
 schedule();
})();