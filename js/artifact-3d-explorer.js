/* Beyond Relics — shared interactive artifact viewer.
   All procedural geometry is an artistic educational visualization, not an official scan. */
(function(){
"use strict";
const THREE_URL="https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js";
let enginePromise;
function engine(){if(window.THREE)return Promise.resolve(window.THREE);if(enginePromise)return enginePromise;enginePromise=new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=THREE_URL;s.async=true;s.onload=()=>window.THREE?resolve(window.THREE):reject(Error("3D engine unavailable"));s.onerror=()=>reject(Error("3D engine unavailable"));document.head.append(s);});return enginePromise;}
const copy={
 "lunar-module":[["Descent stage","The lower stage supported landing and remained at Tranquility Base."],["Ascent stage","The upper crew cabin returned the astronauts to lunar orbit."],["Landing gear","Four landing legs supported the Lunar Module at touchdown."],["Descent engine","The descent propulsion system slowed the spacecraft for landing."]],
 "apollo-12-alsep":[["Central station","The ALSEP package connected instruments and supported long-running lunar measurements."],["Seismic instrument","Seismic experiments recorded lunar vibrations."],["Antenna","The station communicated instrument data to Earth."],["Power unit","The package used a radioisotope thermoelectric generator for electrical power."]],
 "pathfinder-sojourner":[["Lander","Pathfinder delivered the rover and relayed its observations to Earth."],["Rover body","Sojourner carried cameras and scientific instruments."],["Wheels","Six wheels helped the rover move across uneven Martian terrain."],["Solar panel","Solar cells supplied electrical power to the rover."]],
 "spirit":[["Rover body","Spirit was a mobile robotic laboratory designed to study Martian rocks and soil."],["Rock abrasion tool","The rover could expose fresh rock surfaces for close study."],["Wheels","Its mobility system enabled traverses across the Martian surface."],["Solar array","Solar panels supplied electrical power."]],
 "opportunity":[["Rover body","Opportunity investigated rocks and soil on Mars over an extended mission."],["Panoramic cameras","The camera system documented terrain and geological context."],["Wheels","The rover travelled across the Meridiani Planum region."],["Solar array","Solar panels supplied electrical power."]],
 "phoenix":[["Lander deck","Phoenix was a stationary lander that studied soil and water ice in the Martian arctic."],["Robotic arm","The arm collected soil and ice-rich samples for onboard analysis."],["Solar panels","The arrays generated electrical power on the surface."],["Landing legs","The legs supported the lander after touchdown."]],
 "insight":[["Lander platform","InSight studied the deep interior of Mars from a stationary landing site."],["SEIS","The seismometer measured seismic waves and helped investigate the Martian interior."],["Solar arrays","The solar panels supplied electrical power."],["Robotic arm","The arm placed scientific instruments on the surface."]],
 "curiosity":[["Rover body","Curiosity is a mobile laboratory investigating the geology and habitability of Gale Crater."],["Mast","The mast carries remote-sensing cameras and instruments."],["Wheels","Six wheels provide mobility across the Martian terrain."],["Robotic arm","The arm carries tools for close-up study of rocks and soil."]],
 "voyager":[["Main bus","The spacecraft bus houses key spacecraft systems."],["High-gain antenna","The dish antenna supports long-distance communication with Earth."],["Instrument boom","The boom carries scientific instruments away from the spacecraft body."],["RTG booms","Radioisotope power systems supplied electricity during the long mission."]],
 "space-telescope":[["Primary mirror","The telescope's primary mirror collects incoming light."],["Instrument section","Scientific instruments analyze collected light."],["Solar arrays","Solar arrays provide electrical power."],["Antenna","Communications hardware links the observatory with mission operations."]],
 "pioneer-10-11":[["High-gain antenna","The dish antenna maintained communication across immense distances."],["Instrument section","Scientific instruments studied the interplanetary and outer-planet environment."],["RTG power","Radioisotope thermoelectric generators supplied electrical power."],["Booms","Instrument booms helped position sensors away from spacecraft interference."]]
};
function makeStudioEnvironment(T){
 const faces=[];
 for(let face=0;face<6;face++){
  const canvas=document.createElement("canvas");canvas.width=256;canvas.height=256;
  const ctx=canvas.getContext("2d");
  const gradient=ctx.createLinearGradient(0,0,256,256);
  gradient.addColorStop(0,face%2?"#6e8798":"#9aabb7");gradient.addColorStop(.48,"#24384b");gradient.addColorStop(1,"#07111e");
  ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);
  ctx.fillStyle="rgba(210,235,246,.72)";ctx.fillRect(34+(face%3)*48,28,54,7);
  ctx.fillStyle="rgba(125,207,229,.32)";ctx.fillRect(20,112+(face%2)*24,12,86);
  ctx.fillStyle="rgba(236,207,158,.24)";ctx.fillRect(194,74,28,112);
  faces.push(canvas);
 }
 const environment=new T.CubeTexture(faces);environment.mapping=T.CubeReflectionMapping;environment.colorSpace=T.SRGBColorSpace;environment.needsUpdate=true;
 return environment;
}
function makeScene(T,id,root){
 const scene=new T.Scene();scene.background=new T.Color(0x07111e);scene.fog=new T.Fog(0x07111e,19,42);scene.environment=makeStudioEnvironment(T);
 const camera=new T.PerspectiveCamera(36,1,.1,100);camera.position.set(7,5,13);
 scene.add(new T.HemisphereLight(0xc4e2ff,0x3b2b25,1.35));
 const key=new T.DirectionalLight(0xffdfb2,3.8);key.position.set(-6,9,8);scene.add(key);
 const rim=new T.DirectionalLight(0x68c9ee,3.1);rim.position.set(7,4,-8);scene.add(rim);
 const fill=new T.DirectionalLight(0x9ebce8,1.25);fill.position.set(3,1,9);scene.add(fill);
 const accent=new T.PointLight(0x55c9e8,15,22,2);accent.position.set(-5,1,-3);scene.add(accent);
 const lunar=id==="lunar-module"||id==="apollo-12-alsep";
 const mars=["pathfinder-sojourner","spirit","opportunity","phoenix","insight","curiosity"].includes(id);
 const compactRender=window.innerWidth<700||(navigator.hardwareConcurrency||8)<=4;
 const terrainY=lunar?-2.25:(id==="pathfinder-sojourner"?-1.95:-1.78);
 if(lunar||mars){
 const terrainSegments=compactRender?44:84;
 const terrainGeo=new T.PlaneGeometry(54,54,terrainSegments,terrainSegments);
 const pos=terrainGeo.attributes.position;
 const craters=[[-7,-5,2.5],[-1,8,1.5],[8,3,3.2],[5,-9,1.7],[-11,10,1.2]];
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),y=pos.getY(i);
  let h=(Math.sin(x*.31)*Math.cos(y*.27)+Math.sin((x+y)*.18)*.6)*.11;
  if(mars)h+=Math.sin(x*.13+y*.21)*.22+Math.sin(y*.42)*.06;
  if(lunar)craters.forEach(([cx,cy,r])=>{const d=Math.hypot(x-cx,y-cy);h-=Math.exp(-Math.pow(d/(r*.72),2))*.48;h+=Math.exp(-Math.pow((d-r)/(r*.16),2))*.12;});
  pos.setZ(i,h);
 }
 terrainGeo.computeVertexNormals();
 const terrain=new T.Mesh(terrainGeo,new T.MeshStandardMaterial({color:lunar?0x555962:mars?0x794435:0x283441,roughness:.98,metalness:0}));
 terrain.rotation.x=-Math.PI/2;terrain.position.y=terrainY;scene.add(terrain);
 const shadowCanvas=document.createElement("canvas");shadowCanvas.width=256;shadowCanvas.height=256;
 const shadowContext=shadowCanvas.getContext("2d");const shadowGradient=shadowContext.createRadialGradient(128,128,8,128,128,122);
 shadowGradient.addColorStop(0,"rgba(0,0,0,.48)");shadowGradient.addColorStop(.48,"rgba(0,0,0,.22)");shadowGradient.addColorStop(1,"rgba(0,0,0,0)");
 shadowContext.fillStyle=shadowGradient;shadowContext.fillRect(0,0,256,256);
 const shadowTexture=new T.CanvasTexture(shadowCanvas);shadowTexture.colorSpace=T.SRGBColorSpace;
 const contactShadow=new T.Mesh(new T.PlaneGeometry(7,5),new T.MeshBasicMaterial({map:shadowTexture,transparent:true,opacity:.48,depthWrite:false}));
 contactShadow.rotation.x=-Math.PI/2;contactShadow.position.set(0,terrainY+.035,0);scene.add(contactShadow);
 const rockMat=new T.MeshStandardMaterial({color:lunar?0x777b80:0x9b5d45,roughness:1});
 let seed=17;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 const rockCount=compactRender?30:72;
 for(let i=0;i<rockCount;i++){
  const x=(rand()-.5)*34,z=(rand()-.5)*34;
  if(Math.abs(x)<2.4&&Math.abs(z)<2.4)continue;
  const size=.08+rand()*.28;
  const rock=new T.Mesh(new T.DodecahedronGeometry(size,0),rockMat);
  rock.position.set(x,terrainY+.06+rand()*.05,z);rock.rotation.set(rand(),rand()*Math.PI,rand());rock.scale.y=.45+rand()*.7;scene.add(rock);
 }
 }
 if(lunar){
  const horizon=new T.Mesh(new T.SphereGeometry(42,32,20),new T.MeshBasicMaterial({color:0x070b12,side:T.BackSide}));horizon.position.y=-2.5;scene.add(horizon);
 }
 let starSeed=90210;const starRand=()=>{starSeed=(starSeed*16807)%2147483647;return(starSeed-1)/2147483646;};
 const starGeo=new T.BufferGeometry(),stars=[];for(let i=0;i<compactRender?220:450;i++)stars.push((starRand()-.5)*40,starRand()*20-1,(starRand()-.5)*35);starGeo.setAttribute("position",new T.Float32BufferAttribute(stars,3));scene.add(new T.Points(starGeo,new T.PointsMaterial({color:0xcce6ff,size:compactRender?.035:.045,transparent:true,opacity:.82,depthWrite:false})));
 const rootObj=new T.Group();scene.add(rootObj);
 const metal=new T.MeshStandardMaterial({color:0xb9a17b,metalness:.78,roughness:.27,envMapIntensity:1.25}),foil=new T.MeshStandardMaterial({color:0xb9c5c8,metalness:.82,roughness:.24,envMapIntensity:1.3}),dark=new T.MeshStandardMaterial({color:0x343e48,metalness:.55,roughness:.36,envMapIntensity:1.05}),black=new T.MeshStandardMaterial({color:0x101a26,metalness:.38,roughness:.3,envMapIntensity:.9}),blue=new T.MeshStandardMaterial({color:0x254c70,metalness:.58,roughness:.24,envMapIntensity:1.15}),solar=new T.MeshStandardMaterial({color:0x173d65,metalness:.62,roughness:.3,emissive:0x07182c,envMapIntensity:1.05});
 const groups={};
 const group=(name)=>{const g=new T.Group();groups[name]=g;rootObj.add(g);return g;};
 const mesh=(parent,geo,mat,pos=[0,0,0],rot=[0,0,0])=>{const m=new T.Mesh(geo,mat);m.position.set(...pos);m.rotation.set(...rot);parent.add(m);return m;};
 const box=(p,s,m,pos,rot)=>mesh(p,new T.BoxGeometry(...s),m,pos,rot);
 const cyl=(p,a,b,h,m,pos,segments=12,rot=[0,0,0])=>mesh(p,new T.CylinderGeometry(a,b,h,segments),m,pos,rot);
 const wheel=(p,x,z,r=.38)=>{const w=mesh(p,new T.CylinderGeometry(r,r,.22,16),black,[x,-1.65,z],[0,0,Math.PI/2]);mesh(p,new T.TorusGeometry(r*.72,.045,8,20),foil,[x,-1.65,z],[0,Math.PI/2,0]);return w;};
 function rover(curiosity=false,name="body"){
  const body=group(name);box(body,curiosity?[2.1,.85,1.55]:[1.75,.68,1.25],metal,[0,-.42,0]);
  box(body,[.8,.48,.7],foil,[0,.22,0]);box(body,[.25,.12,.25],dark,[0,.55,0]);
  const mast=new T.Group();mast.position.set(0,.45,0);body.add(mast);cyl(mast,.07,.07,.85,foil,[0,.42,0]);mesh(mast,new T.SphereGeometry(.27,16,12),blue,[0,.9,0]);for(let x of [-.12,.12])box(mast,[.12,.09,.08],dark,[x,.9,.2]);
  if(curiosity){const arm=new T.Group();arm.position.set(.9,-.35,.1);body.add(arm);cyl(arm,.07,.07,.8,foil,[.2,-.2,.2],12,[0,0,.7]);}
  for(let z of [-.7,.7])for(let x of [-.85,0,.85])wheel(body,x,z,.35);
  const panel=box(body,[2,.07,1.05],solar,[0,.15,-.95]);panel.rotation.x=-.12;
  const cellGrid=new T.Group();cellGrid.position.copy(panel.position);cellGrid.rotation.copy(panel.rotation);body.add(cellGrid);
  const gridMat=new T.MeshStandardMaterial({color:0x8caebe,metalness:.52,roughness:.38,envMapIntensity:.8});
  for(let x=-.8;x<=.81;x+=.4)box(cellGrid,[.014,.012,.98],gridMat,[x,.041,0]);
  for(let z=-.36;z<=.37;z+=.36)box(cellGrid,[1.94,.012,.014],gridMat,[0,.041,z]);
  return body;
 }
 function lander(name="body"){
  const base=group(name);cyl(base,1.15,1.2,.38,metal,[0,-.45,0],8);cyl(base,.75,.8,.7,foil,[0,.05,0],8);cyl(base,.42,.48,.45,dark,[0,.58,0],8);
  for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a),z=Math.sin(a);const leg=new T.Group();leg.position.set(x*.8,-.55,z*.8);leg.rotation.z=-x*.45;leg.rotation.x=z*.45;base.add(leg);cyl(leg,.045,.065,1.25,foil,[0,-.55,0]);box(leg,[.48,.07,.3],metal,[x*.2,-1.12,z*.2]);}
  return base;
 }
 if(id==="lunar-module"){
  const lower=group("body");cyl(lower,1.5,1.65,.42,metal,[0,-.55,0],8);cyl(lower,1.2,1.25,.7,foil,[0,-1.1,0],8);cyl(lower,.42,.5,.55,dark,[0,-1.68,0]);
  for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a),z=Math.sin(a),leg=new T.Group();leg.position.set(x*1,-.9,z*1);leg.rotation.z=-x*.4;leg.rotation.x=z*.4;lower.add(leg);cyl(leg,.055,.075,1.45,foil,[0,-.62,0]);box(leg,[.58,.08,.38],metal,[x*.18,-1.35,z*.18]);}
  const upper=group("upper");cyl(upper,.78,.9,1.05,metal,[0,.2,0],6);cyl(upper,.32,.32,.45,dark,[0,.9,0]);for(let i=0;i<3;i++){const a=i*2.094;box(upper,[.38,.3,.06],blue,[Math.cos(a)*.72,.25,Math.sin(a)*.72]);}
 }else if(id==="apollo-12-alsep"){
  const station=group("body");station.position.y=-1.55;box(station,[1.1,.65,.85],metal,[0,-.55,0]);cyl(station,.13,.13,1.25,foil,[0,.3,0]);for(let i=0;i<3;i++){const a=i*2.094;box(station,[.9,.06,.6],solar,[Math.cos(a)*1.25,-.48,Math.sin(a)*1.25],[0,-a,0]);}cyl(station,.28,.28,.15,foil,[0,.85,0]);
 }else if(id==="pathfinder-sojourner"){
  const pathfinder=lander("lander");pathfinder.position.set(-2.05,-.2,0);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;box(pathfinder,[.95,.07,.42],solar,[Math.cos(a)*1.18,.18,Math.sin(a)*1.18],[0,-a,0]);}
  const sojourner=rover(false,"rover");sojourner.position.x=2.05;sojourner.scale.set(.72,.72,.72);
 }else if(["spirit","opportunity","curiosity"].includes(id)){rover(id==="curiosity");}
 else if(["phoenix","insight"].includes(id)){lander();const p=groups.body;box(p,[1.4,.12,.9],solar,[0,.3,0]);if(id==="insight"){const arm=new T.Group();arm.position.set(.8,.1,0);p.add(arm);cyl(arm,.06,.06,1,foil,[.25,-.1,0],12,[0,0,.65]);}else{const arm=new T.Group();arm.position.set(.7,.1,0);p.add(arm);cyl(arm,.055,.055,1.15,foil,[.2,-.25,0],12,[0,0,.6]);}}
 else if(id==="voyager"||id==="pioneer-10-11"){
  const craft=group("body");cyl(craft,.5,.5,.9,foil,[0,0,0]);mesh(craft,new T.SphereGeometry(.82,24,18),metal,[0,.1,0]);cyl(craft,.95,.95,.08,foil,[0,.05,0],48).rotation.x=Math.PI/2;box(craft,[.12,3,.12],foil,[0,0,0]);for(let x of [-1.5,1.5])box(craft,[1.5,.06,.8],solar,[x,0,0]);cyl(craft,.08,.08,2.5,foil,[0,-.1,0]);const dish=mesh(craft,new T.SphereGeometry(.95,24,16,0,Math.PI*2,0,Math.PI/2),foil,[0,.5,1.3]);dish.rotation.x=Math.PI;
 }else{
  const telescope=group("body");cyl(telescope,.95,1.05,2.6,foil,[0,0,0],16);cyl(telescope,.7,.8,.22,dark,[0,1.4,0],16);mesh(telescope,new T.CylinderGeometry(.7,.7,.05,32),blue,[0,1.53,0]);for(let x of [-1.55,1.55])box(telescope,[1.2,.06,2.2],solar,[x,0,0]);
 }
 return {scene,camera,rootObj,groups};
}
const OFFICIAL_MODELS={
 "voyager":{src:"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/voyager-probe-%28b%29/Voyager%20Probe%20%28B%29.glb",source:"NASA / Michael D. Carbajal",page:"https://science.nasa.gov/3d-resources/voyager-probe-b/",label:"OFFICIAL NASA 3D MODEL"},
 "lunar-module":{src:"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/apollo-lunar-module/Apollo%20Lunar%20Module.glb",source:"NASA / Michael D. Carbajal",page:"https://science.nasa.gov/3d-resources/apollo-lunar-module/",label:"OFFICIAL NASA 3D MODEL"},
 "insight":{src:"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/insight-cruise-lander/InSight%20Cruise%20Lander%20%28arm%20deployed%29.glb",source:"NASA / Brian E. Kumanchik",page:"https://science.nasa.gov/3d-resources/insight-cruise-lander/",label:"OFFICIAL NASA 3D MODEL"},
 "opportunity":{src:"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-exploration-rover---opportunity-%28mer-b%29/Mars%20Exploration%20Rover%20-%20Opportunity%20%28MER-B%29.glb",source:"NASA / Ames Research Center",page:"https://science.nasa.gov/3d-resources/mars-exploration-rover-opportunity-mer-b/",label:"OFFICIAL NASA 3D MODEL"},
 "space-telescope":{src:"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/spitzer-space-telescope/Spitzer%20Space%20Telescope.glb",source:"NASA / Janice C. Lee; NASA / Robert L. Hurt",page:"https://science.nasa.gov/3d-resources/spitzer-space-telescope/",label:"OFFICIAL NASA 3D MODEL"},
 "pioneer-10-11":{src:"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/pioneer-10/Pioneer%2010.glb",source:"NASA / JPL / Eyes on the Solar System",page:"https://science.nasa.gov/3d-resources/pioneer/",label:"OFFICIAL PIONEER 10 MODEL · PIONEER 11 NOT SHOWN",displayTitle:"Pioneer 10"}
};
function loadModelViewer(){
 if(customElements.get("model-viewer"))return Promise.resolve();
 if(window.__brModelViewerPromise)return window.__brModelViewerPromise;
 window.__brModelViewerPromise=new Promise((resolve,reject)=>{
  const script=document.createElement("script");
  script.type="module";
  script.src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
  script.onload=()=>customElements.whenDefined("model-viewer").then(resolve,reject);
  script.onerror=()=>reject(Error("3D model viewer unavailable"));
  document.head.append(script);
 });
 return window.__brModelViewerPromise;
}
async function mountOfficialModel(root,item,loading,canvas){
 const model=OFFICIAL_MODELS[item.id];if(!model)return false;
 try{await loadModelViewer();}catch(error){return false;}
 if(!canvas.isConnected)return true;
 const viewer=document.createElement("model-viewer");
 viewer.setAttribute("src",model.src);
 viewer.setAttribute("alt",(model.displayTitle||item.title)+" — official NASA 3D model");
 viewer.setAttribute("camera-controls","");
 viewer.setAttribute("camera-orbit","0deg 72deg auto");
 viewer.setAttribute("min-camera-orbit","auto 15deg 2m");
 viewer.setAttribute("max-camera-orbit","auto 165deg 18m");
 viewer.setAttribute("touch-action","pan-y");
 viewer.setAttribute("auto-rotate","");
 viewer.setAttribute("rotation-per-second","7deg");
 viewer.setAttribute("shadow-intensity","1");
 viewer.setAttribute("environment-image","neutral");
 viewer.setAttribute("exposure","1.08");
 viewer.setAttribute("interaction-prompt","auto");
 viewer.setAttribute("interaction-prompt-threshold","1200");
 viewer.setAttribute("reveal","auto");
 viewer.setAttribute("ar","");viewer.setAttribute("loading","eager");
 viewer.className="artifact-model-viewer";
 viewer.addEventListener("progress",event=>{const pct=Math.round((event.detail.totalProgress||0)*100);loading.hidden=false;loading.textContent="Loading official NASA 3D model · "+pct+"%";});
 viewer.addEventListener("load",()=>{loading.hidden=true;},{once:true});
 viewer.addEventListener("error",()=>{loading.hidden=false;loading.textContent="The NASA model could not load. Open its official source page below.";},{once:true});
 canvas.replaceWith(viewer);
 const badge=document.createElement("a");
 badge.className="artifact-model-credit";
 badge.href=model.page;badge.target="_blank";badge.rel="noopener noreferrer";
 badge.textContent=model.label+" · SOURCE: "+model.source;
 root.appendChild(badge);
 loading.hidden=false;loading.textContent="Loading official NASA 3D model…";
 const fidelity=root.querySelector(".artifact-3d-foot span:first-child");if(fidelity)fidelity.textContent=model.label+" · NOT A PHYSICAL SCAN";
 const instructions=root.querySelector(".artifact-3d-foot span:last-child");if(instructions)instructions.textContent="Drag to orbit · Pinch or scroll to zoom";
 const parts=root.querySelector(".artifact-3d-parts");if(parts)parts.setAttribute("aria-label","Voyager component guide");
 const explode=root.querySelector("[data-view-explode]");if(explode)explode.hidden=true;
 const reset=root.querySelector("[data-view-reset]");if(reset)reset.addEventListener("click",()=>{viewer.cameraOrbit="0deg 75deg auto";viewer.cameraTarget="auto";viewer.fieldOfView="auto";modelFov=45;viewer.jumpCameraToGoal();});
 const rotate=root.querySelector("[data-view-rotate]");if(rotate){rotate.setAttribute("aria-pressed","true");rotate.textContent="Pause rotation";}
 const zoomIn=root.querySelector("[data-view-zoom-in]"),zoomOut=root.querySelector("[data-view-zoom-out]");let modelFov=45;
 if(zoomIn)zoomIn.addEventListener("click",()=>{modelFov=Math.max(20,modelFov-5);viewer.fieldOfView=modelFov+"deg";});
 if(zoomOut)zoomOut.addEventListener("click",()=>{modelFov=Math.min(65,modelFov+5);viewer.fieldOfView=modelFov+"deg";});
 return true;
}
function mount(root,item){
 if(!root||root.dataset.viewerMounted==="true")return;root.dataset.viewerMounted="true";
 const canvas=root.querySelector("canvas"),loading=root.querySelector(".artifact-3d-loading"),panel=root.querySelector(".artifact-3d-callout");
 const info=copy[item.id]||[["Mission hardware","Explore the shape and role of this mission system."]];
 const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");const buttons=[...root.querySelectorAll("[data-part]")];let renderer,world,raf=0,resumeFrame=null,active=!document.hidden,observer,drag=false,lastX=0,lastY=0,rotX=-.12,rotY=.45,targetX=rotX,targetY=rotY,zoom=1,pinch=0,exploded=false,autoRotate=!reducedMotion.matches;
 const rotateButton=root.querySelector("[data-view-rotate]");
 if(rotateButton)rotateButton.addEventListener("click",()=>{const officialViewer=root.querySelector(".artifact-model-viewer");if(officialViewer){const on=!officialViewer.hasAttribute("auto-rotate");if(on)officialViewer.setAttribute("auto-rotate","");else officialViewer.removeAttribute("auto-rotate");rotateButton.setAttribute("aria-pressed",String(on));rotateButton.textContent=on?"Pause rotation":"Auto rotate";return;}autoRotate=!autoRotate;rotateButton.setAttribute("aria-pressed",String(autoRotate));rotateButton.textContent=autoRotate?"Pause rotation":"Auto rotate";});
 function setInfo(i,show){const d=info[i]||info[0];panel.querySelector("small").textContent="COMPONENT GUIDE · "+String(i+1).padStart(2,"0");panel.querySelector("strong").textContent=d[0];panel.querySelector("p").textContent=d[1];panel.hidden=!show;panel.classList.toggle("is-visible",!!show);buttons.forEach((b,n)=>{b.setAttribute("aria-pressed",String(n===i));if(info[n])b.textContent=info[n][0];});}
 mountOfficialModel(root,item,loading,canvas).then(official=>{if(official)return;return engine().then(T=>{if(!canvas.isConnected)return;world=makeScene(T,item.id,root);if(!world.groups.upper)root.querySelector("[data-view-explode]").hidden=true;renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:"low-power"});renderer.setPixelRatio(Math.min(devicePixelRatio||1,window.innerWidth<700?1.15:1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);observer=new ResizeObserver(()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setPixelRatio(Math.min(devicePixelRatio||1,window.innerWidth<700?1.15:1.5));renderer.setSize(w,h,false);world.camera.aspect=w/h;world.camera.updateProjectionMatrix();});observer.observe(canvas);
 loading.hidden=true;
 function frame(now=performance.now()){if(!active||!renderer)return;raf=requestAnimationFrame(frame);const delta=frame.lastTime?Math.min((now-frame.lastTime)/16.667,2):1;frame.lastTime=now;if(autoRotate&&!reducedMotion.matches&&!drag)targetY+=.0012*delta;const easing=reducedMotion.matches?1:1-Math.pow(.92,delta);rotX+=(targetX-rotX)*easing;rotY+=(targetY-rotY)*easing;world.rootObj.rotation.set(rotX,rotY,0);world.camera.position.set(7*zoom,5*zoom,13*zoom);world.camera.lookAt(0,-.1,0);renderer.render(world.scene,world.camera);}resumeFrame=()=>frame();frame();
 });}).catch(()=>{loading.textContent="3D preview is unavailable here. The verified mission record and source links remain below.";loading.classList.add("is-error");});
 buttons.forEach((b,i)=>b.addEventListener("click",()=>setInfo(i,true)));
 canvas.addEventListener("webglcontextlost",event=>{event.preventDefault();active=false;cancelAnimationFrame(raf);raf=0;loading.hidden=false;loading.textContent="The 3D graphics context was interrupted. If it does not recover, reload this exhibit.";loading.classList.add("is-error");});
 canvas.addEventListener("webglcontextrestored",()=>{if(renderer)renderer.resetState();loading.hidden=true;loading.classList.remove("is-error");active=!document.hidden;if(active&&resumeFrame)resumeFrame();});
 const closeInfo=panel.querySelector(".artifact-3d-callout-close");if(closeInfo)closeInfo.addEventListener("click",()=>{panel.hidden=true;panel.classList.remove("is-visible");});
 root.querySelector("[data-view-zoom-in]").addEventListener("click",()=>{zoom=Math.max(.7,zoom-.12);});
 root.querySelector("[data-view-zoom-out]").addEventListener("click",()=>{zoom=Math.min(1.6,zoom+.12);});
 root.querySelector("[data-view-reset]").addEventListener("click",()=>{targetX=-.12;targetY=.45;zoom=1;autoRotate=!reducedMotion.matches;if(rotateButton){rotateButton.setAttribute("aria-pressed",String(autoRotate));rotateButton.textContent=autoRotate?"Pause rotation":"Auto rotate";}setInfo(0,false);});
 root.querySelector("[data-view-explode]").addEventListener("click",()=>{if(!world)return;exploded=!exploded;const g=world.groups.upper;if(g){g.position.y=exploded?2.1:0;}const b=root.querySelector("[data-view-explode]");b.setAttribute("aria-pressed",String(exploded));b.textContent=exploded?"Reassemble":"Separate components";});
 canvas.addEventListener("pointerdown",e=>{drag=true;autoRotate=false;if(rotateButton){rotateButton.setAttribute("aria-pressed","false");rotateButton.textContent="Auto rotate";}lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener("pointermove",e=>{if(!drag)return;targetY+=(e.clientX-lastX)*.008;targetX=Math.max(-.65,Math.min(.65,targetX+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;});
 ["pointerup","pointercancel"].forEach(ev=>canvas.addEventListener(ev,()=>drag=false));
 canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(.7,Math.min(1.6,zoom+e.deltaY*.001));},{passive:false});
 canvas.tabIndex=0;
 canvas.addEventListener("keydown",e=>{
  if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-"].includes(e.key)){autoRotate=false;if(rotateButton){rotateButton.setAttribute("aria-pressed","false");rotateButton.textContent="Auto rotate";}}
  if(e.key==="ArrowLeft"){targetY-=.16;e.preventDefault();}
  else if(e.key==="ArrowRight"){targetY+=.16;e.preventDefault();}
  else if(e.key==="ArrowUp"){targetX=Math.max(-.65,targetX-.12);e.preventDefault();}
  else if(e.key==="ArrowDown"){targetX=Math.min(.65,targetX+.12);e.preventDefault();}
  else if(e.key==="+"||e.key==="="){zoom=Math.max(.7,zoom-.1);e.preventDefault();}
  else if(e.key==="-"){zoom=Math.min(1.6,zoom+.1);e.preventDefault();}
  else if(e.key==="0"){targetX=-.12;targetY=.45;zoom=1;e.preventDefault();}
 });
 canvas.addEventListener("touchstart",e=>{if(e.touches.length===2)pinch=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);},{passive:true});
 canvas.addEventListener("touchmove",e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch){zoom=Math.max(.7,Math.min(1.6,zoom+(pinch-d)*.003));}pinch=d;}},{passive:true});
 canvas.addEventListener("touchend",()=>pinch=0,{passive:true});
 document.addEventListener("visibilitychange",()=>{if(document.hidden){active=false;cancelAnimationFrame(raf);raf=0;}else{active=true;if(renderer&&resumeFrame)resumeFrame();}});
 window.addEventListener("pagehide",()=>{active=false;cancelAnimationFrame(raf);if(observer)observer.disconnect();if(world){const geometries=new Set(),materials=new Set(),textures=new Set();world.scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material){for(const material of (Array.isArray(object.material)?object.material:[object.material])){materials.add(material);for(const value of Object.values(material)){if(value&&value.isTexture)textures.add(value);}}}});textures.forEach(texture=>texture.dispose());if(world.scene.environment)world.scene.environment.dispose();geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());}if(renderer)renderer.dispose();},{once:true});
 setInfo(0);
}
window.BeyondRelicsArtifact3D={mount};
})();