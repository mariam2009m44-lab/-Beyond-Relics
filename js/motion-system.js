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
    ".artifact-card",".data-panel",".data-card",".reader-title",
    ".wave-lab",".alsep-explorer",".insight-explorer",".pathfinder-explorer",".mission-detective",
    ".evidence-metric",".evidence-event",".nasa-result",".provenance-card",".wave-stat",
    ".alsep-fact",".insight-fact",".pathfinder-metric",".detective-option","[data-wave-chart]"
  ].join(",");
  root.classList.add("motion-ready");
  var seen=new WeakSet(),sequence=0;
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting)return;
      entry.target.classList.add("is-motion-visible");
      if(entry.target.matches("[data-wave-chart]"))revealWaveChart(entry.target);
      observer.unobserve(entry.target);
    });
  },{threshold:0.12,rootMargin:"0px 0px -6% 0px"});
  function revealWaveChart(container){
    if(reduceMotion||!container||container.dataset.brWaveMotionReady==="true")return;
    var path=container.querySelector(".wave-line");
    if(!path)return;
    container.dataset.brWaveMotionReady="true";
    path.setAttribute("pathLength","1");
    path.classList.add("br-wave-line");
    window.requestAnimationFrame(function(){container.classList.add("is-wave-drawn");});
  }
  function prepare(element){
    if(seen.has(element)||element.closest("[hidden]"))return;
    seen.add(element);element.setAttribute("data-motion-reveal","");
    if(element.matches(".brief-stats > div,.story-world-card,.chronicle-card,.science-card,.mission-frame,.release-card,.insight-card,.judge-pillars article,.evidence-metric,.evidence-event,.nasa-result,.provenance-card,.wave-stat,.alsep-fact,.insight-fact,.pathfinder-metric,.detective-option")){
      element.style.setProperty("--br-motion-delay",Math.min(sequence%4,3)*65+"ms");
    }
    sequence++;observer.observe(element);
  }
  function scan(scope){
    if(scope.nodeType!==1&&scope!==doc)return;
    if(scope.matches&&scope.matches(selectors))prepare(scope);
    if(scope.querySelectorAll)scope.querySelectorAll(selectors).forEach(prepare);
    var chart=scope.matches&&scope.matches("[data-wave-chart]")?scope:(scope.closest?scope.closest("[data-wave-chart]"):null);
    if(chart&&chart.classList.contains("is-motion-visible"))revealWaveChart(chart);
  }
  scan(doc);
  var mutationObserver=new MutationObserver(function(records){
    records.forEach(function(record){
      record.addedNodes.forEach(function(node){if(node.nodeType===1)scan(node);});
    });
  });
  mutationObserver.observe(doc.body,{childList:true,subtree:true});
})();