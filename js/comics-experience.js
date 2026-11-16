(function(){ "use strict";
const grid=document.getElementById("comic-grid");
fetch("data/artifacts.json").then(r=>{if(!r.ok)throw Error("Comic data unavailable");return r.json();}).then(records=>{
 const comics=records.filter(item=>Array.isArray(item.story_artwork)&&item.story_artwork.length);
 const pages=comics.reduce((sum,item)=>sum+item.story_artwork.length,0);
 document.getElementById("comic-count").textContent=String(comics.length).padStart(2,"0");
 document.getElementById("page-count").textContent=String(pages).padStart(2,"0");
 if(!comics.length){grid.innerHTML='<div class="empty-state">No team comic pages have been added yet.</div>';return;}
 grid.replaceChildren();
 comics.forEach((item,index)=>{
  const card=document.createElement("a");card.className="comic-card";card.href="comic.html?chapter="+encodeURIComponent(item.id);
  const cover=document.createElement("div");cover.className="comic-cover";
  const img=document.createElement("img");img.src=item.story_cover||item.story_artwork[0].file;img.alt=item.title+" comic cover";img.loading=index>1?"lazy":"eager";img.decoding="async";
  const tag=document.createElement("span");tag.className="comic-index";tag.textContent=String(index+1).padStart(2,"0")+" / "+String(comics.length).padStart(2,"0");
  cover.append(img,tag);
  const copy=document.createElement("div");copy.className="comic-card-copy";
  const details=document.createElement("div");const small=document.createElement("small");small.textContent=(item.region||"MISSION")+" · "+item.story_artwork.length+" PAGES";
  const title=document.createElement("h3");title.textContent=item.title;details.append(small,title);
  const open=document.createElement("span");open.className="comic-open";open.setAttribute("aria-hidden","true");open.textContent="↗";
  copy.append(details,open);card.append(cover,copy);grid.append(card);
 });
}).catch(()=>{grid.innerHTML='<div class="empty-state">The comic collection could not load. Please refresh the page.</div>';});
})();