(function () {
  "use strict";
  var $=function(id){return document.getElementById(id);};
  var records=[],chapter=0,page=0,activeTab="story",imageController=null;
  function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  function external(url,label){var a=el("a","",label);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;}
  function load(){
    fetch("data/artifacts.json").then(function(r){if(!r.ok)throw new Error("Archive unavailable");return r.json();})
    .then(function(data){records=data;var wanted=new URLSearchParams(location.search).get("chapter");var found=records.findIndex(function(x){return x.id===wanted;});chapter=found<0?0:found;render();})
    .catch(function(){ $("c-title").textContent="Story archive unavailable";$("c-quote").textContent="Please refresh the page or return to the artifact archive.";});
  }
  function pages(item){var beats=item.story_beats||[item.short,item.body,item.science_legacy,item.why_it_matters];return [beats.slice(0,2),beats.slice(2,4)];}
  function fetchStoryImages(item){
    if(item.__storyImages) return item.__storyImages;
    item.__storyImages=fetch("https://images-api.nasa.gov/search?q="+encodeURIComponent(item.image_query||item.title)+"&media_type=image&page_size=24")
      .then(function(r){if(!r.ok)throw new Error("NASA image search unavailable");return r.json();})
      .then(function(payload){
        var rows=payload&&payload.collection&&Array.isArray(payload.collection.items)?payload.collection.items:[];
        var seen=Object.create(null);
        return rows.map(function(record){
          var d=record.data&&record.data[0]||{};
          var im=(record.links||[]).find(function(x){return x.render==="image"&&/^https:\/\//i.test(x.href||"");});
          if(!im||!d.nasa_id||seen[d.nasa_id])return null;
          seen[d.nasa_id]=true;
          return {id:d.nasa_id,title:d.title||item.title,image:im.href,detail:"https://images.nasa.gov/details/"+encodeURIComponent(d.nasa_id)};
        }).filter(Boolean);
      }).catch(function(){item.__storyImages=[];return [];});
    return item.__storyImages;
  }
  function drawStory(item){
    var beats=pages(item)[page]||[],root=$("c-page");
    root.className="comic l2";root.replaceChildren(el("div","scene-loading","Retrieving NASA mission imagery…"));
    fetchStoryImages(item).then(function(images){
      if(records[chapter]!==item)return;
      root.replaceChildren();
      beats.forEach(function(text,index){
        var beat=page*2+index,record=images.length?images[beat%images.length]:null;
        var panel=el("article","cp scene-panel");panel.dataset.tone=item.tone;panel.dataset.n=String(beat+1);
        if(record){
          var img=el("img","scene-image");img.src=record.image;img.alt=record.title;img.loading=index===0?"eager":"lazy";img.decoding="async";
          img.addEventListener("error",function(){img.remove();panel.classList.add("scene-no-image");});
          panel.appendChild(img);
          var credit=el("a","scene-credit","NASA · "+record.id+" ↗");credit.href=record.detail;credit.target="_blank";credit.rel="noopener noreferrer";panel.appendChild(credit);
        }else panel.classList.add("scene-no-image");
        panel.appendChild(el("span","scene-number","SCENE "+String(beat+1).padStart(2,"0")));
        panel.appendChild(el("span","cap tl",text));root.appendChild(panel);
      });
    });
    $("c-closing").textContent=page===1?item.story_hook:item.short;
  }
  function drawThumbs(item){
    var root=$("c-thumbs");root.replaceChildren();
    pages(item).forEach(function(beats,index){var b=el("button","th");b.type="button";b.dataset.i=String(index);b.dataset.tone=item.tone;b.setAttribute("aria-label","Story page "+(index+1));b.setAttribute("aria-current",String(index===page));b.appendChild(el("span","",String(index+1)));root.appendChild(b);});
    $("c-count").textContent=(page+1)+" / "+pages(item).length;
    $("prev").disabled=page===0;$("next").disabled=page===pages(item).length-1;
  }
  function drawInfo(item){
    var root=$("v-info");root.replaceChildren();
    var panel=el("div","panel");panel.append(el("h2","","Mission information"),el("p","",item.status));
    var dl=el("dl","facts");(item.facts||[]).forEach(function(pair){dl.append(el("dt","",pair[0]),el("dd","",pair[1]));});panel.appendChild(dl);
    panel.append(el("h3","","Primary sources"));var ul=el("ul","source-list-links");
    (item.sources||[]).forEach(function(s){var li=el("li","");li.appendChild(external(s.url,s.label+" ↗"));ul.appendChild(li);});panel.appendChild(ul);
    var a=el("a","btn ghost","Open artifact record →");a.href="artifact-details.html?id="+encodeURIComponent(item.id);panel.appendChild(a);root.appendChild(panel);
  }
  function drawGallery(item){
    var root=$("v-gallery");root.replaceChildren(el("p","gallery-loading","Loading NASA image records…"));
    if(imageController)imageController.abort();imageController=new AbortController();
    var url="https://images-api.nasa.gov/search?q="+encodeURIComponent(item.image_query||item.title)+"&media_type=image&page_size=8";
    fetch(url,{signal:imageController.signal}).then(function(r){if(!r.ok)throw new Error("NASA image API unavailable");return r.json();})
    .then(function(payload){
      var items=payload&&payload.collection&&Array.isArray(payload.collection.items)?payload.collection.items:[],fragment=document.createDocumentFragment(),seen=Object.create(null),count=0;
      items.forEach(function(record){if(count>=6)return;var d=record.data&&record.data[0]||{},im=(record.links||[]).find(function(x){return x.render==="image"&&/^https:\/\//i.test(x.href||"");});if(!im||!d.nasa_id||seen[d.nasa_id])return;seen[d.nasa_id]=true;
        var a=el("a","nasa-evidence-image");a.href="https://images.nasa.gov/details/"+encodeURIComponent(d.nasa_id);a.target="_blank";a.rel="noopener noreferrer";
        var img=el("img","");img.src=im.href;img.alt=d.title||item.title;img.loading="lazy";img.decoding="async";a.append(img,el("span","",d.title||"Open NASA image ↗"));fragment.appendChild(a);count++;});
      root.replaceChildren(fragment);if(!count)root.append(el("p","gallery-loading","No matching images were returned. Use the primary NASA sources in Mission Info."));
    }).catch(function(error){if(error.name!=="AbortError")root.replaceChildren(el("p","gallery-loading","NASA image search is temporarily unavailable. The story and primary sources still work."));});
  }
  function tab(name){
    activeTab=name;["story","gallery","info"].forEach(function(key){$("v-"+key).hidden=key!==name;});
    document.querySelectorAll(".tabs button").forEach(function(b){var on=b.dataset.tab===name;b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));});
    if(name==="gallery")drawGallery(records[chapter]);
  }
  function render(){
    var item=records[chapter];if(!item)return;
    document.title=item.title+" — The Story · Beyond Relics";
    $("c-title").textContent=item.title;$("c-meta").textContent=item.region+" · "+item.years;
    $("c-quote").textContent=item.story_hook;$("c-chap").textContent="Chapter "+String(chapter+1).padStart(2,"0")+" / "+String(records.length).padStart(2,"0");
    $("c-thumb").dataset.tone=item.tone;
    drawStory(item);drawThumbs(item);drawInfo(item);
    if(activeTab==="gallery")drawGallery(item);
    try{history.replaceState(null,"","?chapter="+encodeURIComponent(item.id));}catch(e){}
  }
  function goPage(next){var max=pages(records[chapter]).length-1;if(next<0||next>max)return;page=next;drawStory(records[chapter]);drawThumbs(records[chapter]);tab("story");}
  function goChapter(next){chapter=(next+records.length)%records.length;page=0;activeTab="story";render();tab("story");}
  $("prev").addEventListener("click",function(){goPage(page-1);});
  $("next").addEventListener("click",function(){goPage(page+1);});
  $("nextch").addEventListener("click",function(){goChapter(chapter+1);});
  document.addEventListener("click",function(event){
    var thumb=event.target.closest(".th");if(thumb){goPage(Number(thumb.dataset.i));return;}
    var button=event.target.closest("[data-tab]");if(button)tab(button.dataset.tab);
  });
  document.addEventListener("keydown",function(event){
    if(event.target.closest("input,textarea,button,a"))return;
    if(event.key==="ArrowLeft")goPage(page-1);
    if(event.key==="ArrowRight")goPage(page+1);
  });
  load();
})();