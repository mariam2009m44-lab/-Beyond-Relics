(function () {
  "use strict";
  var $=function(id){return document.getElementById(id);};
  var records=[],chapter=0,page=0,activeTab="story",imageController=null,storyRender=0;
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
    item.__storyImages=window.BeyondRelicsImages?window.BeyondRelicsImages.search(item.image_query||item.title,24):Promise.resolve([]);
    return item.__storyImages;
  }
  function drawStory(item){
    var beats=pages(item)[page]||[],root=$("c-page"),token=++storyRender;
    root.className="comic l2";root.replaceChildren(el("div","scene-loading","Retrieving NASA mission imagery…"));
    fetchStoryImages(item).then(function(images){
      if(records[chapter]!==item||token!==storyRender)return;
      root.replaceChildren();
      beats.forEach(function(text,index){
        var beat=page*2+index,record=images.length?images[beat%images.length]:null;
        var panel=el("article","cp scene-panel");panel.dataset.tone=item.tone;panel.dataset.n=String(beat+1);
        if(record){
          var img=el("img","scene-image");img.alt=record.title;img.loading=index===0?"eager":"lazy";img.decoding="async";
          img.addEventListener("nasaimageerror",function(){img.remove();panel.classList.add("scene-no-image");},{once:true});
          window.BeyondRelicsImages.mount(img,images);
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
    if(!window.BeyondRelicsImages){root.replaceChildren(el("p","gallery-loading","NASA image archive is unavailable."));return;}
    window.BeyondRelicsImages.search(item.image_query||item.title,16).then(function(images){
      var fragment=document.createDocumentFragment();
      images.slice(0,6).forEach(function(record){
        var a=el("a","nasa-evidence-image");a.href=record.detail;a.target="_blank";a.rel="noopener noreferrer";
        var img=el("img","");img.alt=record.title||item.title;img.loading="lazy";img.decoding="async";img.referrerPolicy="no-referrer";
        img.addEventListener("nasaimageerror",function(){a.remove();},{once:true});
        window.BeyondRelicsImages.mount(img,[record]);
        a.append(img,el("span","",record.title||"Open NASA image ↗"));fragment.appendChild(a);
      });
      root.replaceChildren(fragment);if(!images.length)root.append(el("p","gallery-loading","No matching images were returned. Use the primary NASA sources in Mission Info."));
    }).catch(function(){root.replaceChildren(el("p","gallery-loading","NASA image search is temporarily unavailable. The story and primary sources still work."));});
  }
  function tab(name){
    activeTab=name;["story","gallery","info"].forEach(function(key){$("v-"+key).hidden=key!==name;});
    document.querySelectorAll(".tabs button").forEach(function(b){var on=b.dataset.tab===name;b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));});
    if(name==="gallery")drawGallery(records[chapter]);
  }
  function render(){
    var item=records[chapter];if(!item)return;
    document.title=item.title+" — The Story · Beyond Relics";
    window.dispatchEvent(new CustomEvent("beyondrelics:chapter",{detail:{id:item.id}}));
    $("c-title").textContent=item.title;$("c-meta").textContent=item.region+" · "+item.years;
    var introTitle=$("story-intro-title");if(introTitle)introTitle.textContent=item.title;
    $("c-quote").textContent=item.story_hook;$("c-chap").textContent="Chapter "+String(chapter+1).padStart(2,"0")+" / "+String(records.length).padStart(2,"0");
    $("c-thumb").dataset.tone=item.tone;
    drawStory(item);drawThumbs(item);drawInfo(item);
    if(activeTab==="gallery")drawGallery(item);
    try{history.replaceState(null,"","?chapter="+encodeURIComponent(item.id));}catch(e){}
  }
  function goPage(next){var max=pages(records[chapter]).length-1;if(next<0||next>max)return;page=next;drawStory(records[chapter]);drawThumbs(records[chapter]);tab("story");}
  function goChapter(next){chapter=(next+records.length)%records.length;page=0;activeTab="story";render();tab("story");}
  var enterButton=$("story-enter"),intro=$("story-intro");
  if(enterButton)enterButton.addEventListener("click",function(){
    if(window.BeyondRelicsAudio)window.BeyondRelicsAudio.playStory();
    if(intro){intro.classList.add("leaving");window.setTimeout(function(){intro.hidden=true;},850);}
  });
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