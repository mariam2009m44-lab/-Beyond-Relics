(function(){
  "use strict";
  var root=document.querySelector("[data-provenance-register]");
  if(!root)return;
  function element(tag,className,value){
    var node=document.createElement(tag);
    if(className)node.className=className;
    if(value!==undefined)node.textContent=value;
    return node;
  }
  function safeLink(item){
    var a=element("a","provenance-source",item.label+" ↗");
    a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";
    return a;
  }
  function render(data){
    var fragment=document.createDocumentFragment();
    data.entries.forEach(function(entry,index){
      var card=element("article","provenance-card");
      var head=element("div","provenance-card-head");
      var title=element("h3","",entry.title);
      var status=element("span","provenance-status",entry.status);
      var toggle=element("button","provenance-toggle", "View methodology");
      toggle.type="button";toggle.setAttribute("aria-expanded","false");
      var panel=element("div","provenance-details");
      panel.hidden=true;
      var summary=element("p","provenance-kind",entry.kind);
      head.append(title,status);
      var facts=element("dl","provenance-facts");
      [["Mission / scope",entry.mission],["Instrument / product",entry.instrument],["Collection period",entry.period],["Units",entry.units],["Processing method",entry.processing],["Limitations",entry.limitations]].forEach(function(pair){
        var group=element("div","provenance-fact");
        group.append(element("dt","",pair[0]),element("dd","",pair[1]));
        facts.append(group);
      });
      var sources=element("div","provenance-sources");
      sources.append(element("p","provenance-sources-title","PRIMARY SOURCE"));
      sources.append(safeLink({label:entry.sourceLabel,url:entry.source}));
      (entry.additionalSources||[]).forEach(function(source){sources.append(safeLink(source));});
      panel.append(summary,facts,sources);
      toggle.addEventListener("click",function(){
        var open=toggle.getAttribute("aria-expanded")!=="true";
        toggle.setAttribute("aria-expanded",String(open));
        toggle.textContent=open?"Hide methodology":"View methodology";
        panel.hidden=!open;
      });
      card.append(head,toggle,panel);
      fragment.append(card);
    });
    root.replaceChildren(fragment);
    var status=root.querySelector("[data-provenance-status]");
    if(status)status.textContent=data.entries.length+" provenance records loaded.";
  }
  var status=root.querySelector("[data-provenance-status]");
  fetch("data/data-provenance.json").then(function(response){
    if(!response.ok)throw new Error("Provenance register unavailable");
    return response.json();
  }).then(render).catch(function(){
    if(status)status.textContent="The provenance register could not load. Existing source links in each exhibit remain available.";
  });
})();