(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var DATA = [];
  function el(tag, cls, text) { var n=document.createElement(tag); if(cls)n.className=cls; if(text!==undefined)n.textContent=text; return n; }
  function link(url,label){var a=el("a","",label);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;}
  function safeURL(value){try{var u=new URL(value);return u.protocol==="https:"?u.href:"#";}catch(e){return "#";}}
  function loadData(){
    fetch("data/artifacts.json").then(function(r){if(!r.ok)throw new Error("Archive unavailable");return r.json();})
    .then(function(rows){if(!Array.isArray(rows)||!rows.length)throw new Error("Empty archive");DATA=rows;renderArchive();renderDetails();})
    .catch(function(){var grid=$("grid"),detail=$("detail");if(grid)grid.textContent="The archive could not load. Please refresh the page.";if(detail)detail.textContent="Artifact records are temporarily unavailable.";});
  }
  function renderArchive(){
    var grid=$("grid");if(!grid)return;
    var chips=$("chips"),query=$("q"),empty=$("empty");
    var region="All",status="All",term="";
    var regions=["All"].concat(Array.from(new Set(DATA.map(function(x){return x.region;}))));
    var statuses=[["All","All"],["left-behind","Left on a world"],["active","Still operating"],["retired","Retired / archived"]];
    function chip(label,value,group,selected){var b=el("button","chip",label);b.type="button";b.dataset[group]=value;b.setAttribute("aria-pressed",String(selected));return b;}
    function drawChips(){
      chips.replaceChildren();
      var regionGroup=el("div","filter-group");regionGroup.append(el("span","filter-label","Destination"));
      regions.forEach(function(r){regionGroup.appendChild(chip(r,r,"region",region===r));});
      var statusGroup=el("div","filter-group");statusGroup.append(el("span","filter-label","Mission status"));
      statuses.forEach(function(s){statusGroup.appendChild(chip(s[1],s[0],"status",status===s[0]));});
      chips.append(regionGroup,statusGroup);
    }
    function draw(){
      grid.replaceChildren();
      var rows=DATA.filter(function(x){
        var hay=[x.title,x.short,x.region,x.type,x.status,x.classification,x.science_legacy].join(" ").toLowerCase();
        return (region==="All"||x.region===region)&&(status==="All"||x.status_group===status)&&hay.indexOf(term)!==-1;
      });
      rows.forEach(function(item){
        var a=el("a","acard");a.href="artifact-details.html?id="+encodeURIComponent(item.id);
        var art=el("div","aart");art.dataset.tone=item.tone;
        art.append(el("span","artifact-stamp",item.region+" · "+item.years));
        art.append(el("span","status-stamp",item.classification));
        loadArchiveImage(item,art);
        var body=el("div","abody");body.append(el("p","eyebrow",item.type),el("h3","",item.title),el("p","",item.short),el("span","more","Explore evidence ↗"));
        a.append(art,body);grid.appendChild(a);
      });
      if(empty){empty.hidden=rows.length!==0;empty.textContent=rows.length?"":"No records match these filters.";}
      var count=$("result-count");if(count)count.textContent=rows.length+" of "+DATA.length+" records";
    }
    chips.addEventListener("click",function(event){
      var b=event.target.closest("button[data-region],button[data-status]");if(!b)return;
      if(b.dataset.region!==undefined)region=b.dataset.region;
      if(b.dataset.status!==undefined)status=b.dataset.status;
      drawChips();draw();
    });
    if(query)query.addEventListener("input",function(){term=query.value.trim().toLowerCase();draw();});
    drawChips();draw();
  }
  function imageScore(record,query){
    var data=record&&record.data&&record.data[0]||{},hay=((data.title||"")+" "+(data.description||"")).toLowerCase();
    var words=String(query||"").toLowerCase().split(/[^a-z0-9]+/).filter(function(w){return w.length>3&&w!=="nasa"&&w!=="mission"&&w!=="mars"&&w!=="moon";});
    return words.reduce(function(total,word){return total+(hay.indexOf(word)!==-1?1:0);},0);
  }
  function loadArchiveImage(item,target){
    if(!item.image_query||!target)return;
    var endpoint="https://images-api.nasa.gov/search?q="+encodeURIComponent(item.image_query)+"&media_type=image&page_size=12";
    fetch(endpoint).then(function(response){
      if(!response.ok)throw new Error("NASA image search unavailable");
      return response.json();
    }).then(function(payload){
      var records=payload&&payload.collection&&payload.collection.items||[];
      records.sort(function(x,y){return imageScore(y,item.image_query)-imageScore(x,item.image_query);});
      for(var i=0;i<records.length;i++){
        var record=records[i],data=record.data&&record.data[0];
        var image=(record.links||[]).find(function(link){return link.render==="image"&&/^https:\/\//i.test(link.href||"");});
        if(!data||!data.nasa_id||!image)continue;
        var img=el("img","archive-photo");img.src=image.href;img.alt=data.title||item.title;img.loading="lazy";img.decoding="async";img.referrerPolicy="no-referrer";
        img.addEventListener("load",function(){target.classList.add("has-nasa-image");},{once:true});
        img.addEventListener("error",function(){img.remove();target.classList.remove("has-nasa-image");},{once:true});
        target.prepend(img);
        var credit=el("a","archive-photo-credit","NASA · "+data.nasa_id+" ↗");credit.href="https://images.nasa.gov/details/"+encodeURIComponent(data.nasa_id);credit.target="_blank";credit.rel="noopener noreferrer";
        target.append(credit);return;
      }
    }).catch(function(){/* Keep the original mission-colour card if NASA search is unavailable. */});
  }
  function renderDetails(){
    var root=$("detail");if(!root)return;
    var id=new URLSearchParams(location.search).get("id"),index=DATA.findIndex(function(x){return x.id===id;});
    if(index<0){root.textContent="Artifact not found. Return to the archive and choose a record.";return;}
    var item=DATA[index];document.title=item.title+" — Beyond Relics";
    var visual=el("div","dart");visual.dataset.tone=item.tone;visual.append(el("span","",item.region+" · "+item.years));
    var content=el("div","artifact-content");
    content.append(el("p","eyebrow",item.type+" · "+item.classification),el("h1","page-title",item.title),el("p","body",item.body));
    var state=el("div","mission-state");state.append(el("span","state-label","Mission status"),el("strong","",item.status));content.appendChild(state);
    var blocks=[["The mission goal",item.mission_goal],["What stayed behind",item.what_stayed],["What science gained",item.science_legacy],["Why it still matters",item.why_it_matters]];
    var story=el("section","insight-grid");blocks.forEach(function(pair){var card=el("article","insight-card");card.append(el("h2","",pair[0]),el("p","",pair[1]));story.appendChild(card);});content.appendChild(story);
    var facts=el("dl","facts");(item.facts||[]).forEach(function(pair){facts.append(el("dt","",pair[0]),el("dd","",pair[1]));});content.appendChild(facts);
    var duration=el("section","duration-panel");duration.append(el("h2","","Mission design vs reality"),el("div","duration-columns"));
    duration.querySelector(".duration-columns").append(el("div","", "Designed for: "+item.design_life),el("div","", "Actual outcome: "+item.actual_life));content.appendChild(duration);
    var gallery=el("section","artifact-gallery");gallery.append(el("div","gallery-heading"),el("div","nasa-artifact-images"));gallery.querySelector(".gallery-heading").append(el("p","eyebrow","NASA visual evidence"),el("h2","","See the mission"));gallery.querySelector(".nasa-artifact-images").append(el("p","gallery-loading","Loading NASA archive images…"));content.appendChild(gallery);
    var sources=el("section","source-list");sources.append(el("h2","","Primary mission sources"),el("p","","Use these NASA records to verify the mission history and science described here."));var ul=el("ul","");item.sources.forEach(function(s){var li=el("li","");li.appendChild(link(s.url,s.label+" ↗"));ul.appendChild(li);});sources.appendChild(ul);content.appendChild(sources);
    var actions=el("div","actions");var storyLink=el("a","btn","Enter the story →");storyLink.href="comic.html?chapter="+encodeURIComponent(item.id);var archiveLink=el("a","btn ghost","Back to archive");archiveLink.href="artifacts.html";actions.append(storyLink,archiveLink);content.appendChild(actions);
    root.replaceChildren(visual,content);
    var prev=DATA[(index+DATA.length-1)%DATA.length],next=DATA[(index+1)%DATA.length],pn=$("pn");
    if(pn){pn.replaceChildren();var p=el("a","","← "+prev.title);p.href="artifact-details.html?id="+prev.id;var n=el("a","",next.title+" →");n.href="artifact-details.html?id="+next.id;pn.append(p,n);}
    loadNASAImages(item,gallery.querySelector(".nasa-artifact-images"));
  }
  function loadNASAImages(item,target){
    if(!target||!window.BeyondRelicsImages)return;
    window.BeyondRelicsImages.search(item.image_query||item.title,16).then(function(images){
      var fragment=document.createDocumentFragment();
      images.slice(0,4).forEach(function(record){
        var card=el("a","nasa-evidence-image");card.href=record.detail;card.target="_blank";card.rel="noopener noreferrer";
        var img=el("img","");img.alt=record.title||item.title;img.loading="lazy";img.decoding="async";img.referrerPolicy="no-referrer";
        img.addEventListener("nasaimageerror",function(){card.remove();},{once:true});
        window.BeyondRelicsImages.mount(img,[record]);
        card.append(img,el("span","",record.title||"Open NASA image record ↗"));fragment.appendChild(card);
      });
      target.replaceChildren(fragment);
      if(!images.length)target.append(el("p","gallery-loading","No matching NASA images were returned. Open the primary mission sources for verified records."));
    }).catch(function(){target.replaceChildren(el("p","gallery-loading","NASA’s image service is temporarily unavailable. The primary mission sources remain available below."));});
  }
  loadData();
})();