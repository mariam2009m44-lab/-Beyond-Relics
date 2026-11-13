(function(){
 "use strict";
 var root=document.getElementById("pathfinder-explorer");
 if(!root)return;
 var data=null,index=0;
 var nav=root.querySelector("[data-pathfinder-nav]");
 var visual=root.querySelector("[data-pathfinder-visual]");
 var detail=root.querySelector("[data-pathfinder-detail]");
 var status=root.querySelector("[data-pathfinder-status]");
 var sources=root.querySelector("[data-pathfinder-sources]");
 var gallery=root.querySelector("[data-pathfinder-gallery]");
 function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
 function link(url,label){var a=el("a","",label);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;}
 function show(next){
  index=(next+data.phases.length)%data.phases.length;
  var phase=data.phases[index];
  nav.querySelectorAll("button").forEach(function(b,i){b.setAttribute("aria-pressed",String(i===index));});
  visual.querySelectorAll("[data-phase]").forEach(function(n){n.classList.toggle("is-active",n.dataset.phase===phase.id);});
  detail.replaceChildren(el("p","eyebrow",phase.label),el("h3","pathfinder-phase-title",phase.title),el("p","pathfinder-question",phase.question),el("p","",phase.body));
  var metric=el("div","pathfinder-metric");metric.append(el("span","",phase.factLabel),el("strong","",phase.fact));detail.append(metric,el("p","pathfinder-detail-note",phase.detail),link(phase.source,"Open NASA evidence ↗"));
  root.querySelector("[data-pathfinder-prev]").disabled=index===0;
  root.querySelector("[data-pathfinder-next]").disabled=index===data.phases.length-1;
  root.querySelector("[data-pathfinder-count]").textContent=(index+1)+" / "+data.phases.length;
  status.textContent="Chapter "+(index+1)+" of "+data.phases.length+": "+phase.title;
 }
 function buildVisual(){
  var ns="http://www.w3.org/2000/svg",svg=document.createElementNS(ns,"svg");
  svg.setAttribute("viewBox","0 0 640 390");svg.setAttribute("role","img");svg.setAttribute("aria-label","Original explanatory schematic of Pathfinder and Sojourner on Mars");
  function shape(tag,attrs,phase){var n=document.createElementNS(ns,tag);Object.keys(attrs).forEach(function(k){n.setAttribute(k,attrs[k]);});if(phase)n.setAttribute("data-phase",phase);svg.appendChild(n);return n;}
  shape("circle",{cx:500,cy:78,r:42,class:"pf-sun"});
  shape("path",{d:"M0 286 Q110 250 220 284 T440 270 T640 286 V390 H0Z",class:"pf-ground"});
  shape("path",{d:"M0 310 Q160 276 310 315 T640 300",class:"pf-horizon"});
  shape("path",{d:"M250 235 L250 178 L290 150 L330 178 L330 235Z",class:"pf-lander","stroke-width":"3"},"landing");
  shape("path",{d:"M250 178 L215 205 L250 235 M330 178 L365 205 L330 235",class:"pf-petal"},"deployment");
  shape("path",{d:"M250 235 L225 278 M330 235 L355 278 M278 235 L278 278 M302 235 L302 278",class:"pf-leg"},"landing");
  shape("rect",{x:268,y:185,width:44,height:35,rx:5,class:"pf-body"},"landing");
  shape("path",{d:"M290 185V143 L305 125",class:"pf-antenna"});
  shape("circle",{cx:305,cy:125,r:8,class:"pf-camera"});
  shape("path",{d:"M330 245 Q390 270 420 288",class:"pf-rover-path"},"deployment");
  shape("rect",{x:395,y:250,width:78,height:28,rx:7,class:"pf-rover"},"deployment");
  [408,434,460].forEach(function(x){shape("circle",{cx:x,cy:283,r:11,class:"pf-wheel"},"deployment");});
  shape("path",{d:"M434 250 L434 220 L450 207",class:"pf-mast"});
  shape("circle",{cx:452,cy:204,r:7,class:"pf-camera"});
  shape("path",{d:"M434 250 L434 236 L412 232",class:"pf-arm"},"science");
  shape("rect",{x:392,y:226,width:22,height:13,rx:3,class:"pf-apxs"},"science");
  shape("path",{d:"M414 229 Q365 210 350 195",class:"pf-signal"},"legacy");
  shape("text",{x:290,y:345,class:"pf-label","text-anchor":"middle"},"PATHFINDER LANDER");
  shape("text",{x:435,y:315,class:"pf-label","text-anchor":"middle"},"SOJOURNER");
  shape("text",{x:320,y:28,class:"pf-caption","text-anchor":"middle"},"ORIGINAL SCHEMATIC · NOT TO SCALE");
  visual.replaceChildren(svg);
 }
 fetch("data/pathfinder-explorer.json").then(function(r){if(!r.ok)throw new Error("Pathfinder data unavailable");return r.json();}).then(function(json){
  data=json;buildVisual();
  data.phases.forEach(function(phase,i){var b=el("button","pathfinder-step",phase.label);b.type="button";b.setAttribute("aria-pressed","false");b.addEventListener("click",function(){show(i);});nav.append(b);});
  root.querySelector("[data-pathfinder-prev]").addEventListener("click",function(){show(index-1);});
  root.querySelector("[data-pathfinder-next]").addEventListener("click",function(){show(index+1);});
  sources.replaceChildren(el("p","eyebrow","PRIMARY NASA SOURCES"));
  data.sources.forEach(function(s){sources.append(link(s.url,s.label+" ↗"));});
  show(0);
  if(window.BeyondRelicsImages){
   window.BeyondRelicsImages.search(data.imageQuery,10).then(function(images){
    if(!images.length){gallery.textContent="NASA image archive is temporarily unavailable. The original schematic and NASA source links remain available.";return;}
    var img=el("img","pathfinder-photo");img.alt=images[0].title||"NASA Mars Pathfinder and Sojourner photograph";img.loading="lazy";img.decoding="async";img.referrerPolicy="no-referrer";
    var credit=el("a","pathfinder-photo-credit","Loading NASA image credit…");
    img.addEventListener("nasaimageload",function(event){var record=event.detail;credit.href=record.detail;credit.textContent="NASA · "+record.id+" ↗";});
    img.addEventListener("nasaimageerror",function(){gallery.replaceChildren(el("p","", "NASA photograph unavailable right now; use the original NASA image records below."));});
    gallery.replaceChildren(img,credit);window.BeyondRelicsImages.mount(img,images);
   }).catch(function(){gallery.textContent="NASA image archive is temporarily unavailable; the original schematic remains available.";});
  }
 }).catch(function(){status.textContent="Pathfinder mission data could not be loaded. Please use the NASA source links.";});
})();