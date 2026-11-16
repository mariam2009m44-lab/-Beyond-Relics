/* Beyond Relics — Apollo 11 lunar module interactive artistic reconstruction.
   Geometry is interpretive and educational, not an official NASA engineering model. */
(function(){
"use strict";
const THREE_URL="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";
let threePromise=null;
function loadThree(){
 if(window.THREE)return Promise.resolve(window.THREE);
 if(threePromise)return threePromise;
 threePromise=new Promise((resolve,reject)=>{
  const s=document.createElement("script");s.src=THREE_URL;s.async=true;
  s.onload=()=>window.THREE?resolve(window.THREE):reject(Error("Three.js did not expose its API"));
  s.onerror=()=>reject(Error("Unable to load the 3D engine"));document.head.appendChild(s);
 });
 return threePromise;
}
const copy={
 descent:["DESCENT STAGE","The lower stage carried the landing gear, descent propulsion, and equipment. It remained at Tranquility Base after the crew departed in the ascent stage."],
 legs:["LANDING LEGS","Four landing legs supported the Lunar Module on the lunar surface. Their wide stance helped keep the vehicle stable after touchdown."],
 ascent:["ASCENT STAGE","The upper crew cabin lifted the astronauts from the lunar surface and returned them to lunar orbit. It did not remain with the descent stage."],
 engine:["DESCENT ENGINE","The descent propulsion system slowed the Lunar Module for landing. The engine and related equipment belonged to the lower stage."]
};
function mount(root){
 if(!root||root.dataset.apollo3dReady==="true")return;
 root.dataset.apollo3dReady="true";
 const canvas=root.querySelector("#apollo-lander-canvas"),loading=root.querySelector("#apollo-3d-loading");
 const callout=root.querySelector("#apollo-3d-callout"),partButtons=[...root.querySelectorAll("[data-part]")];
 if(!canvas)return;
 let renderer,scene,camera,raf=0,observer,active=true,drag=false,lastX=0,lastY=0,rotY=.55,rotX=-.12,targetY=.55,targetX=-.12,zoom=1,exploded=false,groups={},baseY=0,ascentHome;
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 const mat=(color,metalness=.25,roughness=.55)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const add=(parent,geometry,material,pos=[0,0,0],rot=[0,0,0])=>{const m=new THREE.Mesh(geometry,material);m.position.set(...pos);m.rotation.set(...rot);parent.add(m);return m;};
 function create(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0x070d1b);scene.fog=new THREE.Fog(0x070d1b,18,42);
  camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(8,6.2,16);
  scene.add(new THREE.HemisphereLight(0xc6e4ff,0x352a25,2.05));
  const key=new THREE.DirectionalLight(0xffd6a0,3.1);key.position.set(-7,11,8);scene.add(key);
  const rim=new THREE.DirectionalLight(0x6bc8ff,2.2);rim.position.set(8,3,-7);scene.add(rim);
  const ground=new THREE.Mesh(new THREE.CircleGeometry(8,72),new THREE.MeshStandardMaterial({color:0x343943,roughness:1,metalness:0}));ground.rotation.x=-Math.PI/2;ground.position.y=-3.35;scene.add(ground);
  const craterMat=mat(0x222936,0,.98);
  for(let i=0;i<23;i++){const a=i*2.399,r=2.8+(i%6)*.73;const crater=add(scene,new THREE.CircleGeometry(.12+(i%4)*.075,18),craterMat,[Math.cos(a)*r,-3.33,Math.sin(a)*r]);crater.rotation.x=-Math.PI/2;}
  const starsGeo=new THREE.BufferGeometry(),positions=[];for(let i=0;i<500;i++)positions.push((Math.random()-.5)*45,Math.random()*22-2,(Math.random()-.5)*35);
  starsGeo.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));scene.add(new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xc9e8ff,size:.045,transparent:true,opacity:.8})));
  const vehicle=new THREE.Group();scene.add(vehicle);
  const gold=mat(0xb99b65,.68,.38),foil=mat(0xaeb8bc,.72,.34),dark=mat(0x343b43,.55,.48),black=mat(0x111923,.3,.35),glass=new THREE.MeshPhysicalMaterial({color:0x182f45,metalness:.55,roughness:.16,clearcoat:.8});
  groups.descent=new THREE.Group();vehicle.add(groups.descent);
  // Octagonal equipment deck and lower descent stage.
  add(groups.descent,new THREE.CylinderGeometry(1.58,1.7,.42,8),gold,[0,-.68,0],[0,Math.PI/8,0]);
  add(groups.descent,new THREE.CylinderGeometry(1.24,1.32,.76,8),foil,[0,-1.23,0],[0,Math.PI/8,0]);
  add(groups.descent,new THREE.CylinderGeometry(.62,.7,.28,8),dark,[0,-1.75,0]);
  // Thermal blankets, equipment boxes, handrails and landing struts.
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const box=add(groups.descent,new THREE.BoxGeometry(.42,.36,.42),i%2?gold:foil,[Math.cos(a)*1.08,-.55,Math.sin(a)*1.08],[0,-a,0]);}
  for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a),z=Math.sin(a);const leg=new THREE.Group();leg.position.set(x*1.03,-1.05,z*1.03);leg.rotation.z=-x*.42;leg.rotation.x=z*.42;
   add(leg,new THREE.CylinderGeometry(.055,.075,1.65,8),foil,[0,-.63,0]);
   add(leg,new THREE.CylinderGeometry(.12,.12,.1,8),dark,[0,-1.45,0],[0,0,Math.PI/2]);
   add(leg,new THREE.BoxGeometry(.65,.08,.42),foil,[x*.2,-1.42,z*.2],[0,-a,0]);
   add(leg,new THREE.SphereGeometry(.12,12,8),gold,[x*.42,-.2,z*.42]);groups.descent.add(leg);
  }
  // Engine bell and nozzle under the descent deck.
  groups.engine=new THREE.Group();groups.engine.position.set(0,-1.55,0);groups.descent.add(groups.engine);
  add(groups.engine,new THREE.CylinderGeometry(.2,.48,.78,12,1,true),dark,[0,-.45,0]);
  add(groups.engine,new THREE.TorusGeometry(.47,.045,8,24),foil,[0,-.83,0]);
  // Ascent cabin: faceted cabin, windows, top docking tunnel and antennas.
  groups.ascent=new THREE.Group();groups.ascent.position.set(0,.55,0);vehicle.add(groups.ascent);
  add(groups.ascent,new THREE.CylinderGeometry(.82,.98,1.15,6),gold,[0,.05,0],[0,Math.PI/6,0]);
  add(groups.ascent,new THREE.CylinderGeometry(.78,.82,.28,6),foil,[0,.73,0],[0,Math.PI/6,0]);
  add(groups.ascent,new THREE.CylinderGeometry(.34,.34,.52,8),dark,[0,1.08,0]);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const w=add(groups.ascent,new THREE.BoxGeometry(.43,.33,.07),glass,[Math.cos(a)*.78,.12,Math.sin(a)*.78]);w.lookAt(Math.cos(a)*3,.12,Math.sin(a)*3);}
  add(groups.ascent,new THREE.BoxGeometry(.12,.75,.12),foil,[-.92,.65,0],[0,0,-.22]);
  add(groups.ascent,new THREE.BoxGeometry(.65,.06,.06),foil,[-.92,1.03,0]);
  // Front hatch and handholds.
  add(groups.ascent,new THREE.BoxGeometry(.42,.58,.08),dark,[0,-.45,.83]);
  for(let i=0;i<4;i++)add(groups.ascent,new THREE.CylinderGeometry(.018,.018,.28,6),foil,[.98,-.5+i*.16,.15],[0,0,Math.PI/2]);
  ascentHome=groups.ascent.position.clone();
  // Small scientific flag is deliberately omitted; this is not a NASA-branded replica.
  const grid=new THREE.GridHelper(18,36,0x556477,0x303b4c);grid.position.y=-3.32;grid.material.transparent=true;grid.material.opacity=.2;scene.add(grid);
  return vehicle;
 }
 function setPart(key){
  const info=copy[key];if(!info)return;
  callout.querySelector("small").textContent=info[0];callout.querySelector("strong").textContent=info[0];callout.querySelector("p").textContent=info[1];
  partButtons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.part===key)));
  Object.keys(groups).forEach(k=>{if(groups[k]&&groups[k].traverse)groups[k].traverse(o=>{if(o.isMesh&&o.material&&o.material.emissive)o.material.emissive.set(k===key?0x4b3514:0x000000);});});
  if(key==="ascent"||key==="descent"||key==="legs"||key==="engine"){targetY=key==="ascent"?-.28:.55;}
 }
 function toggleExplode(){
  exploded=!exploded;const btn=root.querySelector("#apollo-explode");btn.setAttribute("aria-pressed",String(exploded));btn.textContent=exploded?"Reassemble stages":"Separate stages";
  const target=exploded?2.15:ascentHome.y;
  const start=groups.ascent.position.y,begin=performance.now(),duration=reduced?0:750;
  function step(now){const t=Math.min(1,(now-begin)/Math.max(1,duration));const ease=1-Math.pow(1-t,3);groups.ascent.position.y=start+(target-start)*ease;if(t<1)requestAnimationFrame(step);}
  requestAnimationFrame(step);
 }
 function resize(){if(!renderer||!camera)return;const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 function animate(){if(!active||!renderer)return;raf=requestAnimationFrame(animate);rotY+=(targetY-rotY)*.08;rotX+=(targetX-rotX)*.08;vehicle.rotation.y=rotY;vehicle.rotation.x=rotX;camera.position.set(8*zoom,6.2*zoom,16*zoom);camera.lookAt(0,-.15,0);renderer.render(scene,camera);}
 let vehicle;
 loadThree().then(T=>{
  if(!canvas.isConnected)return;window.THREE=T;
  vehicle=create();renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:"low-power"});renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;resize();observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);
  loading.hidden=true;animate();
 }).catch(()=>{
  loading.textContent="3D view unavailable on this device. The mission record and NASA evidence remain available below.";
  loading.classList.add("is-error");
 });
 partButtons.forEach(b=>b.addEventListener("click",()=>setPart(b.dataset.part)));
 root.querySelector("#apollo-explode").addEventListener("click",toggleExplode);
 root.querySelector("#apollo-reset").addEventListener("click",()=>{targetX=-.12;targetY=.55;zoom=1;exploded=false;groups.ascent.position.copy(ascentHome);const b=root.querySelector("#apollo-explode");b.setAttribute("aria-pressed","false");b.textContent="Separate stages";setPart("descent");});
 canvas.addEventListener("pointerdown",e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener("pointermove",e=>{if(!drag)return;targetY+=(e.clientX-lastX)*.008;targetX=Math.max(-.65,Math.min(.65,targetX+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;});
 const stop=()=>drag=false;canvas.addEventListener("pointerup",stop);canvas.addEventListener("pointercancel",stop);
 canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(.72,Math.min(1.55,zoom+e.deltaY*.001));},{passive:false});
 document.addEventListener("visibilitychange",()=>{active=!document.hidden;if(active&&!raf)animate();else cancelAnimationFrame(raf);});
 window.addEventListener("pagehide",()=>{active=false;cancelAnimationFrame(raf);if(observer)observer.disconnect();if(renderer)renderer.dispose();});
 setPart("descent");
}
window.BeyondRelicsApollo3D={mount};
})();