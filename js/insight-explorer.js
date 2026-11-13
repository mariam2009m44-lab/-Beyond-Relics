(function(){
 "use strict";
 var root=document.getElementById("insight-explorer");
 if(!root)return;
 var tabs=root.querySelector("[data-insight-tabs]");
 var visual=root.querySelector("[data-insight-visual]");
 var detail=root.querySelector("[data-insight-detail]");
 var status=root.querySelector("[data-insight-status]");
 var sources=root.querySelector("[data-insight-sources]");
 function el(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
 function link(url,label){var a=el("a","",label);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;}
 function draw(instrument){
  tabs.querySelectorAll("button").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.instrument===instrument.id));});
  detail.replaceChildren();
  detail.append(el("p","eyebrow","INSTRUMENT PROFILE"),el("h3","insight-instrument-title",instrument.name+" · "+instrument.fullName),el("p","insight-role",instrument.role),el("p","",instrument.description),el("p","insight-question","THE SCIENCE QUESTION: "+instrument.question));
  var facts=el("div","insight-facts");
  instrument.facts.forEach(function(pair){var item=el("div","insight-fact");item.append(el("span","",pair[0]),el("strong","",pair[1]));facts.append(item);});
  detail.append(facts);
  var outcome=el("div","insight-outcome");
  outcome.append(el("span","eyebrow","WHAT THE MISSION ACHIEVED"),el("p","",instrument.outcome),el("span","insight-status",instrument.status));
  detail.append(outcome,link(instrument.source,"Read NASA instrument documentation ↗"));
  visual.querySelectorAll("[data-instrument]").forEach(function(node){node.classList.toggle("is-active",node.dataset.instrument===instrument.id);});
  status.textContent=instrument.name+" selected. "+instrument.status+".";
 }
 function buildDiagram(){
  var ns="http://www.w3.org/2000/svg";
  var svg=document.createElementNS(ns,"svg");
  svg.setAttribute("viewBox","0 0 680 390");svg.setAttribute("role","img");svg.setAttribute("aria-label","Original schematic showing the InSight lander and three science instruments, not to scale.");
  function shape(tag,attrs,text){var n=document.createElementNS(ns,tag);Object.keys(attrs||{}).forEach(function(k){n.setAttribute(k,attrs[k]);});if(text)n.textContent=text;svg.appendChild(n);return n;}
  shape("circle",{cx:560,cy:85,r:40,class:"insight-sun"});
  shape("path",{d:"M0 275 Q130 235 270 270 T680 255 V390 H0Z",class:"insight-ground"});
  shape("path",{d:"M0 305 Q150 275 310 310 T680 292",class:"insight-ground-line"});
  shape("path",{d:"M250 185 L430 185 L460 220 L220 220 Z",class:"insight-deck"});
  shape("rect",{x:282,y:130,width:115,height:58,rx:8,class:"insight-body"});
  shape("path",{d:"M282 142 L190 115 L165 130 L260 170 Z",class:"insight-panel"});
  shape("path",{d:"M397 142 L490 115 L515 130 L420 170 Z",class:"insight-panel"});
  shape("path",{d:"M300 220 L265 280 M385 220 L420 280 M325 220 L325 275 M365 220 L365 275",class:"insight-leg"});
  shape("path",{d:"M300 275 H245 M420 275 H475",class:"insight-leg"});
  shape("circle",{cx:340,cy:160,r:15,class:"insight-lens"});
  shape("path",{d:"M340 188 L340 230",class:"insight-cable"});
  shape("path",{d:"M340 230 L145 300",class:"insight-cable"});
  shape("rect",{x:120,y:295,width:52,height:22,rx:8,class:"insight-seis","data-instrument":"seis"});
  shape("path",{d:"M430 220 L510 295 L510 335",class:"insight-cable"});
  shape("rect",{x:490,y:325,width:38,height:60,rx:8,class:"insight-hp3","data-instrument":"hp3"});
  shape("path",{d:"M397 155 L555 190",class:"insight-cable"});
  shape("path",{d:"M555 190 L590 190",class:"insight-cable"});
  shape("circle",{cx:600,cy:190,r:15,class:"insight-rise","data-instrument":"rise"});
  shape("text",{x:145,y:288,class:"insight-label","text-anchor":"middle"},"SEIS");
  shape("text",{x:510,y:315,class:"insight-label","text-anchor":"middle"},"HP³");
  shape("text",{x:600,y:165,class:"insight-label","text-anchor":"middle"},"RISE");
  shape("text",{x:340,y:35,class:"insight-map-caption","text-anchor":"middle"},"INSIGHT · ORIGINAL SCHEMATIC · NOT TO SCALE");
  visual.replaceChildren(svg);
 }
 fetch("data/insight-instruments.json").then(function(r){if(!r.ok)throw new Error("InSight data unavailable");return r.json();}).then(function(data){
  buildDiagram();
  data.instruments.forEach(function(instrument){
   var button=el("button","insight-tab",instrument.id==="seis"?"SEIS":instrument.name);
   button.type="button";button.dataset.instrument=instrument.id;button.setAttribute("aria-pressed","false");
   button.addEventListener("click",function(){draw(instrument);});
   tabs.append(button);
  });
  draw(data.instruments[0]);
  sources.replaceChildren(el("p","eyebrow","PRIMARY NASA SOURCES"));
  data.sources.forEach(function(source){sources.append(link(source.url,source.label+" ↗"));});
  var mission=el("p","insight-mission-dates","Landing: "+data.mission.landing+" · Final communication: "+data.mission.finalCommunication);
  sources.append(mission);
 }).catch(function(){status.textContent="The InSight instrument record could not be loaded. Please use the NASA sources below.";});
})();