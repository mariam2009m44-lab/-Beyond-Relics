/* Beyond Relics — gentle pointer depth for desktop; no work on touch screens. */
(function(){
  "use strict";
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine=window.matchMedia&&window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if(reduce||!fine)return;
  var cards=document.querySelectorAll(".chronicle-card,.science-card,.acard,.release-card,.insight-card,.mission-frame,.story-world-card,.judge-pillars article");
  cards.forEach(function(card){
    var raf=0;
    card.addEventListener("pointermove",function(event){
      var rect=card.getBoundingClientRect();
      var x=(event.clientX-rect.left)/rect.width;
      var y=(event.clientY-rect.top)/rect.height;
      var rx=((.5-y)*2.2).toFixed(2);
      var ry=((x-.5)*2.8).toFixed(2);
      if(raf)return;
      raf=requestAnimationFrame(function(){
        card.style.transform="perspective(1100px) translate3d(0,-4px,0) rotateX("+rx+"deg) rotateY("+ry+"deg)";
        card.style.setProperty("--br-pointer-x",(x*100).toFixed(1)+"%");
        card.style.setProperty("--br-pointer-y",(y*100).toFixed(1)+"%");
        raf=0;
      });
    },{passive:true});
    card.addEventListener("pointerleave",function(){
      if(raf)cancelAnimationFrame(raf);
      raf=0;card.style.transform="";
    },{passive:true});
  });
})();
