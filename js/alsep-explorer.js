(function(){
  "use strict";
  var root=document.getElementById("alsep-explorer");
  if(!root)return;
  var map=root.querySelector("[data-alsep-map]");
  var controls=root.querySelector("[data-alsep-controls]");
  var detail=root.querySelector("[data-alsep-detail]");
  var instrumentPanel=root.querySelector("[data-alsep-instrument]");
  var status=root.querySelector("[data-alsep-status]");
  function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  function external(url,label){var a=el("a","",label);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;}
  function project(station){return {x:70+(station.longitude+30)*8.1,y:55+(30-station.latitude)*7.0};}
  function selectStation(data,station){
    controls.querySelectorAll("button").forEach(function(button){var active=button.dataset.station===station.id;button.setAttribute("aria-pressed",String(active));});
    map.querySelectorAll("[data-station]").forEach(function(point){var active=point.dataset.station===station.id;point.classList.toggle("is-active",active);point.setAttribute("aria-pressed",String(active));});
    detail.replaceChildren();
    var top=el("div","alsep-detail-top");
    top.append(el("p","eyebrow","SELECTED LISTENING STATION"),el("h3","",station.mission));
    detail.append(top,el("p","alsep-site",station.site+" · "+station.latitude.toFixed(1)+"° "+(station.latitude<0?"S":"N")+", "+Math.abs(station.longitude).toFixed(1)+"° "+(station.longitude<0?"W":"E")),el("p","",station.note));
    var meta=el("div","alsep-facts");
    [[ "Deployment",station.deployed ],["Instrument","Passive Seismic Experiment"],["Network","4 PSE stations"]].forEach(function(pair){var item=el("div","alsep-fact");item.append(el("span","",pair[0]),el("strong","",pair[1]));meta.append(item);});
    detail.append(meta);
    status.textContent=station.mission+" selected. Coordinates and instrument metadata are shown.";
  }
  fetch("data/alsep-network.json").then(function(response){if(!response.ok)throw new Error("ALSEP record unavailable");return response.json();}).then(function(data){
    map.replaceChildren();
    var ns="http://www.w3.org/2000/svg";
    function svg(tag,attrs){var n=document.createElementNS(ns,tag);Object.keys(attrs||{}).forEach(function(k){n.setAttribute(k,attrs[k]);});map.appendChild(n);return n;}
    svg("circle",{cx:300,cy:180,r:160,class:"alsep-moon-disc"});
    [0,1,2,3,4].forEach(function(i){svg("path",{d:"M"+(105+i*38)+" "+(90+i*23)+" q20 -15 38 2",class:"alsep-grid-line"});});
    svg("path",{d:"M65 180H535 M300 25V335",class:"alsep-grid-line"});
    svg("text",{x:300,y:24,class:"alsep-map-label","text-anchor":"middle"}).textContent="LUNAR NEAR-SIDE · SIMPLIFIED LOCATOR";
    data.stations.forEach(function(station){
      var p=project(station),g=document.createElementNS(ns,"g");g.setAttribute("class","alsep-map-point");g.setAttribute("data-station",station.id);g.setAttribute("role","button");g.setAttribute("tabindex","0");g.setAttribute("aria-label",station.mission+" at "+station.site);
      var circle=document.createElementNS(ns,"circle");circle.setAttribute("cx",p.x);circle.setAttribute("cy",p.y);circle.setAttribute("r","9");circle.setAttribute("class","alsep-map-dot");
      var label=document.createElementNS(ns,"text");label.setAttribute("x",p.x+13);label.setAttribute("y",p.y-10);label.setAttribute("class","alsep-map-label");label.textContent=station.mission.replace("Apollo ","A");
      g.append(circle,label);map.appendChild(g);
      function activate(){selectStation(data,station);}
      g.addEventListener("click",activate);g.addEventListener("keydown",function(event){if(event.key==="Enter"||event.key===" "){event.preventDefault();activate();}});
      var button=el("button","alsep-station-button",station.mission+" · "+station.site);button.type="button";button.dataset.station=station.id;button.addEventListener("click",activate);controls.appendChild(button);
    });
    var instrument=el("div","alsep-instrument-card");
    instrument.append(el("p","eyebrow","WHAT THE INSTRUMENT ACTUALLY RECORDED"),el("h3","",data.instrument.name),el("p","",data.instrument.description));
    var rates=el("div","alsep-rate-grid");
    [[data.instrument.longPeriodSampleRateHz,"Long-period · 3 axes"],[data.instrument.shortPeriodSampleRateHz,"Short-period · vertical axis"]].forEach(function(pair){
      var item=el("div","alsep-rate");item.append(el("strong","",pair[0]+" Hz"),el("span","",pair[1]));rates.append(item);
    });
    instrument.append(rates,el("p","alsep-caveat","These are instrument metadata and sampling rates, not a replay of a lunar earthquake. The chart compares the documented sampling rates only."));
    instrumentPanel.replaceChildren(instrument);
    var sourceList=el("div","alsep-sources");sourceList.append(el("p","eyebrow","FOLLOW THE ORIGINAL EVIDENCE"));
    data.sources.forEach(function(source){sourceList.append(external(source.url,source.label+" ↗"));});
    root.querySelector("[data-alsep-sources]").replaceChildren(sourceList);
    selectStation(data,data.stations[0]);
  }).catch(function(){status.textContent="The NASA-derived station record could not be loaded. Open the original sources below.";});
})();