/* Beyond Relics — interactive first-screen mission object selector */
(function(){
 "use strict";
 const labels={
  "lunar-module":"APOLLO LUNAR MODULE","apollo-12-alsep":"APOLLO 12 ALSEP","pathfinder-sojourner":"PATHFINDER / SOJOURNER",
  "spirit":"SPIRIT ROVER","opportunity":"OPPORTUNITY","phoenix":"PHOENIX LANDER","insight":"INSIGHT LANDER",
  "curiosity":"CURIOSITY ROVER","voyager":"VOYAGER PROBE","space-telescope":"SPITZER TELESCOPE","pioneer-10-11":"PIONEER 10 / 11"
 };
 const official=new Set(["lunar-module","voyager","insight","opportunity","space-telescope","pioneer-10-11"]);
 const selector=document.getElementById("home-3d-selector");
 const initial=document.getElementById("home-artifact-viewer");
 if(!selector||!initial)return;
 let records=[];
 const stageMarkup='<div class="artifact-3d-topline"><span data-home-object-kicker></span><span>DRAG TO EXPLORE</span></div><div class="artifact-3d-canvas-wrap"><canvas class="artifact-3d-canvas" aria-label="Interactive 3D mission object. Drag to rotate, use zoom controls to change distance."></canvas><div class="artifact-3d-loading">Preparing the 3D mission object…</div><div class="artifact-3d-callout" aria-live="polite"><small>COMPONENT 01</small><strong>Explore this mission object</strong><p>Drag to rotate the model. Select a component to learn what it does.</p></div></div><div class="artifact-3d-toolbar"><div class="artifact-3d-parts" role="group" aria-label="Mission object components"><button type="button" data-part="0" aria-pressed="true">Main structure</button><button type="button" data-part="1" aria-pressed="false">Science system</button><button type="button" data-part="2" aria-pressed="false">Power system</button><button type="button" data-part="3" aria-pressed="false">Communications</button></div><div class="artifact-3d-actions"><button type="button" data-view-zoom-in aria-label="Zoom in">＋</button><button type="button" data-view-zoom-out aria-label="Zoom out">−</button><button type="button" data-view-rotate aria-pressed="true">Pause rotation</button><button type="button" data-view-explode aria-pressed="false">Separate stages</button><button type="button" data-view-reset>Reset</button></div></div><div class="artifact-3d-foot"><span data-home-fidelity></span><span>Drag · Zoom · Explore</span></div>';
 function makeViewer(item){
  const old=document.getElementById("home-artifact-viewer");
  const root=document.createElement("div");
  root.className="artifact-3d-stage home-featured-stage";
  root.id="home-artifact-viewer";
  root.dataset.artifactId=item.id;
  root.setAttribute("aria-label","Interactive three-dimensional exhibit: "+item.title);
  root.innerHTML=stageMarkup;
  old.replaceWith(root);
  const kicker=root.querySelector("[data-home-object-kicker]");
  kicker.textContent=(item.region||"MISSION")+" · "+(labels[item.id]||item.title);
  const fidelity=root.querySelector("[data-home-fidelity]");
  fidelity.textContent=official.has(item.id)?"OFFICIAL NASA 3D MODEL":"ARTISTIC VISUALIZATION · NOT AN OFFICIAL NASA MODEL";
  if(window.BeyondRelicsArtifact3D)window.BeyondRelicsArtifact3D.mount(root,item);
  else root.querySelector(".artifact-3d-loading").textContent="The 3D viewer is unavailable. Open the archive to explore this record.";
  return root;
 }
 function drawSelector(){
  selector.replaceChildren();
  records.forEach(item=>{
   const button=document.createElement("button");
   button.type="button";button.className="home-3d-choice";button.dataset.artifact=item.id;
   button.setAttribute("aria-pressed",String(item.id==="lunar-module"));
   button.append(document.createTextNode(labels[item.id]||item.title));
   const sub=document.createElement("small");sub.textContent=official.has(item.id)?"NASA 3D MODEL":"3D RECONSTRUCTION";
   button.appendChild(sub);
   button.addEventListener("click",()=>{
    selector.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
    const current=records.find(record=>record.id===item.id);
    if(current)makeViewer(current);
   });
   selector.appendChild(button);
  });
 }
 fetch("data/artifacts.json").then(response=>{if(!response.ok)throw Error("Mission records unavailable");return response.json();}).then(data=>{
  records=Array.isArray(data)?data:[];
  if(!records.length)throw Error("No mission records");
  drawSelector();
  const first=records.find(item=>item.id==="lunar-module")||records[0];
  makeViewer(first);
 }).catch(()=>{
  const fallback={id:"lunar-module",title:"Apollo 11 Lunar Module",region:"Moon"};
  makeViewer(fallback);
  selector.textContent="Mission selector is temporarily unavailable. The featured exhibit remains available.";
 });
})();
