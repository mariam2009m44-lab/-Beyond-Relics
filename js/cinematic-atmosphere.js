/* Beyond Relics — pointer-responsive cinematic atmosphere */
(function(){
 "use strict";
 var root=document.querySelector(".hero");
 if(!root||!window.matchMedia||!window.matchMedia("(hover:hover) and (pointer:fine)").matches||window.matchMedia("(prefers-reduced-motion:reduce)").matches)return;
 var earth=root.querySelector(".earth"),astro=root.querySelector(".astro"),ground=root.querySelector(".ground");
 var lens=document.createElement("span");lens.className="br-lens-glow";lens.setAttribute("aria-hidden","true");root.appendChild(lens);
 var shooting=document.createElement("span");shooting.className="br-shooting-star";shooting.setAttribute("aria-hidden","true");root.appendChild(shooting);
 var frame=0,px=0,py=0;
 root.addEventListener("pointermove",function(e){
  var r=root.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  px=(x-.5)*13;py=(y-.5)*10;
  lens.style.setProperty("--br-lens-x",(x*100).toFixed(1)+"%");
  lens.style.setProperty("--br-lens-y",(y*100).toFixed(1)+"%");
  if(frame)return;
  frame=requestAnimationFrame(function(){
   if(earth){earth.style.setProperty("--br-earth-x",(px*.8).toFixed(2)+"px");earth.style.setProperty("--br-earth-y",(py*.8).toFixed(2)+"px")}
   if(astro){astro.style.setProperty("--br-astro-x",(px*-1.1).toFixed(2)+"px");astro.style.setProperty("--br-astro-y",(py*-1.1).toFixed(2)+"px")}
   if(ground)ground.style.setProperty("--br-ground-y",(py*.18).toFixed(2)+"px");
   frame=0;
  });
 },{passive:true});
 root.addEventListener("pointerleave",function(){
  [earth,astro,ground].forEach(function(el){if(el){el.style.removeProperty("--br-earth-x");el.style.removeProperty("--br-earth-y");el.style.removeProperty("--br-astro-x");el.style.removeProperty("--br-astro-y");el.style.removeProperty("--br-ground-y")}});
 },{passive:true});
 document.querySelectorAll(".story-world-card,.chronicle-card,.mission-frame").forEach(function(card){
  card.addEventListener("pointermove",function(e){
   var r=card.getBoundingClientRect();
   card.style.setProperty("--br-spot-x",((e.clientX-r.left)/r.width*100).toFixed(1)+"%");
   card.style.setProperty("--br-spot-y",((e.clientY-r.top)/r.height*100).toFixed(1)+"%");
  },{passive:true});
 });
})();
