/* Beyond Relics — lightweight motion orchestration */
(function () {
  "use strict";
  var doc=document,root=doc.documentElement;
  var reduceMotion=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isReader=doc.body&&doc.body.classList.contains("reader-page");
  var progress=doc.createElement("div");
  progress.className="br-motion-progress";progress.setAttribute("aria-hidden","true");doc.body.appendChild(progress);
  var ticking=false;
  function updateProgress(){
    var max=Math.max(1,root.scrollHeight-window.innerHeight);
    progress.style.setProperty("--br-scroll-progress",Math.min(1,Math.max(0,window.scrollY/max)));
    ticking=false;
  }
  function onScroll(){if(ticking)return;ticking=true;window.requestAnimationFrame(updateProgress);}
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",onScroll,{passive:true});updateProgress();
  if(isReader)doc.body.classList.add("br-motion-reader-ready");
  if(reduceMotion||!("IntersectionObserver" in window))return;
  var selectors=[
    "main > .eyebrow","main > .page-title","main > .page-lead","main > section",
    "main > .panel","main > .panel-grid",".story-worlds-heading",".story-world-card",
    ".chronicle-card",".brief-copy",".brief-stats > div",".detective-heading",
    ".detective-console",".science-card",".mission-frame",".release-card",
    ".insight-card",".judge-pillars article",".timeline-item",".timeline-event",
    ".artifact-card",".data-panel",".data-card",".reader-title"
  ].join(",");
  root.classList.add("motion-ready");
  var seen=new WeakSet(),sequence=0;
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting)return;
      entry.target.classList.add("is-motion-visible");observer.unobserve(entry.target);
    });
  },{threshold:0.12,rootMargin:"0px 0px -6% 0px"});
  function prepare(element){
    if(seen.has(element)||element.closest("[hidden]"))return;
    seen.add(element);element.setAttribute("data-motion-reveal","");
    if(element.matches(".brief-stats > div,.story-world-card,.chronicle-card,.science-card,.mission-frame,.release-card,.insight-card,.judge-pillars article")){
      element.style.setProperty("--br-motion-delay",Math.min(sequence%4,3)*65+"ms");
    }
    sequence++;observer.observe(element);
  }
  function scan(scope){
    if(scope.nodeType!==1&&scope!==doc)return;
    if(scope.matches&&scope.matches(selectors))prepare(scope);
    if(scope.querySelectorAll)scope.querySelectorAll(selectors).forEach(prepare);
  }
  scan(doc);
  var mutationObserver=new MutationObserver(function(records){
    records.forEach(function(record){
      record.addedNodes.forEach(function(node){if(node.nodeType===1)scan(node);});
    });
  });
  mutationObserver.observe(doc.body,{childList:true,subtree:true});
})();