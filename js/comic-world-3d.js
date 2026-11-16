/* Beyond Relics — interactive 3D comic environment.
   Comic panels remain original 2D artwork; the surrounding worlds and mission hardware are
   explicitly labelled artistic reconstructions, not official scans or engineering models. */
(function(){
"use strict";
const stage=document.getElementById("reader-stage");
if(!stage)return;
if(!window.THREE){const fallback=document.createElement("p");fallback.className="comic-world-fallback";fallback.textContent="3D exploration is unavailable right now. The original comic story remains ready to read.";stage.append(fallback);return;}
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const chapter=new URLSearchParams(location.search).get("chapter")||"";
const mars=chapter==="pathfinder-sojourner",lunar=chapter==="lunar-module";
const label=mars?"MARS · PATHFINDER / SOJOURNER":lunar?"THE MOON · APOLLO LUNAR MODULE":"DEEP SPACE · PIONEER 10 / 11";
let renderer,scene,camera,raf=0,observer,active=true,drag=false,lastX=0,lastY=0,downX=0,downY=0,rotX=0,rotY=0,targetX=0,targetY=0,zoom=1,selected=null;
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),pickables=[];
const canvas=document.createElement("canvas");
canvas.className="comic-world-canvas";canvas.setAttribute("aria-label","Interactive 3D mission environment. Drag to rotate; use the mouse wheel to zoom.");
canvas.tabIndex=0;stage.prepend(canvas);
const hud=document.createElement("div");hud.className="comic-world-hud";
hud.innerHTML='<span class="comic-world-kicker">INTERACTIVE 3D ENVIRONMENT</span><strong>'+label+'</strong><small>ARTISTIC RECONSTRUCTION · NOT AN OFFICIAL SCAN</small><span class="comic-world-help">Drag to orbit · Scroll to zoom · Select a 3D object</span>';
stage.append(hud);
const cinemaControls=stage.querySelector(".cinema-controls");
if(cinemaControls){
 const explore=document.createElement("button");explore.type="button";explore.className="comic-world-toggle";explore.textContent="EXPLORE 3D";explore.setAttribute("aria-pressed","false");explore.setAttribute("aria-label","Enter interactive 3D world");
 explore.addEventListener("click",()=>{
  if(document.body.classList.contains("is-cinematic-playing")){const pause=document.getElementById("cinema-toggle");if(pause)pause.click();}
  const on=stage.classList.toggle("is-world-mode");explore.setAttribute("aria-pressed",String(on));explore.textContent=on?"BACK TO STORY":"EXPLORE 3D";explore.setAttribute("aria-label",on?"Return to comic story":"Enter interactive 3D world");if(on){active=true;if(!raf)tick();}else{active=false;cancelAnimationFrame(raf);raf=0;}
 });
 cinemaControls.append(explore);
}
const detail=document.createElement("div");detail.className="comic-world-detail";detail.hidden=true;detail.setAttribute("aria-live","polite");stage.append(detail);
function material(color,metalness=.1,roughness=.75){return new THREE.MeshStandardMaterial({color,metalness,roughness});}
function addMesh(parent,geo,mat,pos=[0,0,0],rot=[0,0,0],name=""){
 const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.rotation.set(...rot);m.userData.label=name;parent.add(m);if(name)pickables.push(m);return m;
}
function group(parent,pos=[0,0,0],name=""){const g=new THREE.Group();g.position.set(...pos);g.userData.label=name;parent.add(g);if(name)pickables.push(g);return g;}
function buildRover(){
 const g=group(scene,[mars?3.7:-3.7,-1.9,1.5],"Sojourner rover · artistic reconstruction");
 const gold=material(0xb58c55,.65,.4),dark=material(0x202a32,.45,.65),foil=material(0xc4bba5,.6,.35),blue=material(0x244d75,.55,.3);
 addMesh(g,new THREE.BoxGeometry(1.65,.55,1.05),gold,[0,0,0]);
 addMesh(g,new THREE.BoxGeometry(1.1,.07,.72),blue,[0,.32,0]);
 const mast=group(g,[0,.38,0]);addMesh(mast,new THREE.CylinderGeometry(.045,.055,.62,10),foil,[0,.3,0]);addMesh(mast,new THREE.BoxGeometry(.34,.24,.3),dark,[0,.68,0],"Sojourner camera mast");
 for(const z of [-.53,.53])for(const x of [-.57,0,.57]){
  addMesh(g,new THREE.CylinderGeometry(.22,.22,.15,20),dark,[x,-.31,z],[0,0,Math.PI/2],"Six-wheel mobility system");
  addMesh(g,new THREE.TorusGeometry(.17,.035,8,20),foil,[x,-.31,z],[0,Math.PI/2,0]);
 }
 const arm=group(g,[.7,.08,.15],"Instrument deployment arm");addMesh(arm,new THREE.CylinderGeometry(.045,.045,.68,8),foil,[.22,-.2,0],[0,0,-.7]);addMesh(arm,new THREE.BoxGeometry(.2,.14,.18),gold,[.46,-.46,0]);
 return g;
}
function buildLander(){
 const g=group(scene,[-3.5,-1.5,-1],"Pathfinder lander · artistic reconstruction");
 const foil=material(0xb6a98c,.55,.42),gold=material(0xb58a50,.65,.4),dark=material(0x292e34,.35,.65);
 addMesh(g,new THREE.BoxGeometry(1.6,.45,1.45),foil,[0,0,0]);
 addMesh(g,new THREE.BoxGeometry(1.1,.08,1.05),gold,[0,.27,0]);
 for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a),z=Math.sin(a);const leg=group(g,[x*.62,-.12,z*.62]);addMesh(leg,new THREE.CylinderGeometry(.035,.055,.95,8),dark,[x*.15,-.45,z*.15],[z*.35,0,-x*.35]);addMesh(leg,new THREE.BoxGeometry(.4,.08,.32),foil,[x*.28,-.92,z*.28]);}
 addMesh(g,new THREE.CylinderGeometry(.07,.07,.9,10),dark,[-.25,.7,0]);addMesh(g,new THREE.BoxGeometry(.38,.25,.32),gold,[-.25,1.2,0],"Pathfinder camera mast");
 return g;
}
function buildLunarModule(){
 const g=group(scene,[-3.4,-1.35,0],"Apollo Lunar Module · artistic reconstruction");
 const gold=material(0xc3a36b,.68,.36),foil=material(0xb6b5a9,.62,.42),dark=material(0x252b34,.5,.58),glass=material(0x263f55,.7,.22);
 const ascent=group(g,[0,.75,0],"Ascent stage");
 addMesh(ascent,new THREE.CylinderGeometry(.48,.68,.9,6),gold,[0,.1,0],[0,.2,0]);
 addMesh(ascent,new THREE.CylinderGeometry(.42,.52,.28,6),foil,[0,.68,0],[0,.2,0]);
 addMesh(ascent,new THREE.BoxGeometry(.44,.35,.38),dark,[0,.22,.48]);
 addMesh(ascent,new THREE.BoxGeometry(.3,.24,.05),glass,[0,.26,.68]);
 addMesh(g,new THREE.CylinderGeometry(.72,.9,.55,8),foil,[0,-.25,0]);
 addMesh(g,new THREE.CylinderGeometry(.18,.24,.6,12),dark,[0,-.8,0]);
 for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a),z=Math.sin(a);const leg=group(g,[x*.58,-.35,z*.58]);addMesh(leg,new THREE.CylinderGeometry(.035,.05,.95,8),dark,[x*.18,-.45,z*.18],[z*.3,0,-x*.3]);addMesh(leg,new THREE.BoxGeometry(.4,.07,.3),gold,[x*.3,-.92,z*.3]);}
 return g;
}
function buildProbe(){
 const g=group(scene,[-3.6,.1,0],"Pioneer spacecraft · artistic reconstruction");
 const metal=material(0xc2cbd1,.75,.32),gold=material(0xc19a57,.7,.35),panel=material(0x244f7c,.55,.3);
 addMesh(g,new THREE.BoxGeometry(.7,.9,.65),gold);
 addMesh(g,new THREE.CylinderGeometry(.04,.04,1.9,10),metal,[0,.1,0],[0,0,Math.PI/2]);
 addMesh(g,new THREE.CylinderGeometry(.95,.95,.055,40),metal,[0,.45,.65],[Math.PI/2,0,0],"High-gain antenna dish");
 for(const x of [-1.65,1.65])addMesh(g,new THREE.BoxGeometry(1.45,.06,.8),panel,[x,-.05,0],"Spacecraft instrument panel");
 addMesh(g,new THREE.CylinderGeometry(.035,.035,1.5,8),metal,[0,-.8,0]);
 return g;
}
function build(){
 scene=new THREE.Scene();scene.background=null;scene.fog=new THREE.FogExp2(mars?0x160b09:lunar?0x030711:0x030914,.035);
 camera=new THREE.PerspectiveCamera(42,1,.1,120);camera.position.set(0,1.5,12);
 scene.add(new THREE.HemisphereLight(0xb8d9f0,0x30211c,1.6));
 const key=new THREE.DirectionalLight(mars?0xffad7c:0x9acbff,2.1);key.position.set(-5,8,7);scene.add(key);
 const terrainGeo=new THREE.PlaneGeometry(90,58,120,90);
 const vertices=terrainGeo.attributes.position;
 for(let i=0;i<vertices.count;i++){
  const x=vertices.getX(i),y=vertices.getY(i);
  let h=Math.sin(x*.16+y*.12)*.18+Math.cos(y*.3)*.08;
  if(mars)h+=Math.sin(x*.09)*.34+Math.sin((x+y)*.2)*.11;else if(lunar)h+=Math.sin(x*.07)*.42+Math.cos((x-y)*.11)*.2;
  vertices.setZ(i,h);
 }
 terrainGeo.computeVertexNormals();
 const ground=new THREE.Mesh(terrainGeo,material(mars?0x743b2b:lunar?0x666b73:0x111f2d,0,.98));
 ground.rotation.x=-Math.PI/2;ground.position.set(0,-3.2,-8);scene.add(ground);
 const rockMat=material(mars?0x9a5a42:lunar?0x858991:0x34414c,0,.98);
 let terrainSeed=29;const terrainRand=()=>{terrainSeed=(terrainSeed*16807)%2147483647;return(terrainSeed-1)/2147483646;};
 for(let i=0;i<145;i++){
  const x=(terrainRand()-.5)*72,z=(terrainRand()-.5)*45-8,size=.08+terrainRand()*.32;
  const rock=addMesh(scene,new THREE.DodecahedronGeometry(size,0),rockMat,[x,-3.05+terrainRand()*.15,z],[terrainRand(),terrainRand()*3,terrainRand()]);
  rock.scale.y=.4+terrainRand()*.5;
 }
 if(mars){
  const planet=addMesh(scene,new THREE.SphereGeometry(3.6,48,36),material(0x9c4d35,0,.98),[6,1,-8]);
  addMesh(scene,new THREE.SphereGeometry(3.72,40,32),new THREE.MeshBasicMaterial({color:0xd77b58,transparent:true,opacity:.09,side:THREE.BackSide}),[6,1,-8]);
  buildLander();buildRover();
 }else if(lunar){buildLunarModule();
  addMesh(scene,new THREE.SphereGeometry(1.15,36,28),material(0x315f94,.05,.9),[6,2,-11]);
 }else{
  const giant=addMesh(scene,new THREE.SphereGeometry(4.4,48,36),material(0x1d4265,0,.95),[6,1,-10]);
  addMesh(scene,new THREE.TorusGeometry(5.1,.025,6,100),new THREE.MeshBasicMaterial({color:0x7bc9e8,transparent:true,opacity:.4}),[6,1,-10],[1.2,.2,.1]);
  buildProbe();
 }
 const starGeo=new THREE.BufferGeometry(),positions=[];
 let starSeed=9187;const starRandom=()=>{starSeed=(starSeed*16807)%2147483647;return(starSeed-1)/2147483646;};
 for(let i=0;i<950;i++)positions.push((starRandom()-.5)*65,(starRandom()-.5)*32,-starRandom()*45-4);
 starGeo.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
 scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xe0edff,size:.055,transparent:true,opacity:.85})));
}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
function selectAt(e){
 const r=canvas.getBoundingClientRect();pointer.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);raycaster.setFromCamera(pointer,camera);
 const hits=raycaster.intersectObjects(pickables,true);let obj=hits[0]&&hits[0].object;while(obj&&!obj.userData.label)obj=obj.parent;
 if(obj&&obj.userData.label){
 selected=obj;detail.hidden=false;detail.replaceChildren();
 const title=document.createElement("strong");title.textContent=obj.userData.label;
 const note=document.createElement("span");note.textContent="ARTISTIC RECONSTRUCTION · NOT AN OFFICIAL NASA MODEL";
 const map=mars?"pathfinder-sojourner":lunar?"lunar-module":"pioneer-10-11";
 const action=document.createElement("a");action.href="artifact-details.html?id="+map;action.textContent="ENTER 3D ARTIFACT EXHIBIT ↗";
 action.setAttribute("aria-label","Open the interactive 3D exhibit for "+(mars?"Mars Pathfinder and Sojourner":lunar?"Apollo Lunar Module":"Pioneer 10 and 11"));
 detail.append(title,note,action);
 }
}
canvas.addEventListener("pointerdown",e=>{drag=true;lastX=downX=e.clientX;lastY=downY=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener("pointermove",e=>{if(!drag)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;targetY+=dx*.004;targetX=Math.max(-.5,Math.min(.5,targetX+dy*.003));lastX=e.clientX;lastY=e.clientY;});
canvas.addEventListener("pointerup",e=>{const wasDrag=Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)>6;drag=false;if(!wasDrag)selectAt(e);});
canvas.addEventListener("pointercancel",()=>drag=false);
canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(.72,Math.min(1.5,zoom+e.deltaY*.001));},{passive:false});
let pinchDistance=0;
canvas.addEventListener("touchstart",e=>{if(e.touches.length===2){pinchDistance=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}},{passive:true});
canvas.addEventListener("touchmove",e=>{if(e.touches.length===2){const next=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinchDistance){zoom=Math.max(.72,Math.min(1.5,zoom+(pinchDistance-next)*.003));}pinchDistance=next;}},{passive:true});
canvas.addEventListener("touchend",()=>{pinchDistance=0;},{passive:true});
canvas.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")targetY-=.12;else if(e.key==="ArrowRight")targetY+=.12;else if(e.key==="ArrowUp")targetX=Math.max(-.5,targetX-.1);else if(e.key==="ArrowDown")targetX=Math.min(.5,targetX+.1);else if(e.key==="+"||e.key==="=")zoom=Math.max(.72,zoom-.08);else if(e.key==="-")zoom=Math.min(1.5,zoom+.08);else if(e.key==="0"){targetX=targetY=0;zoom=1;}else return;e.preventDefault();});
function tick(){if(!active||document.hidden||!stage.classList.contains("is-world-mode")){raf=0;return;}raf=requestAnimationFrame(tick);if(!reduced&&document.body.classList.contains("is-cinematic-playing"))targetY+=.00035;rotX+=(targetX-rotX)*(reduced?1:.06);rotY+=(targetY-rotY)*(reduced?1:.06);camera.position.set(Math.sin(rotY)*1.2,1.5+rotX*2,12*zoom);camera.lookAt(0,-.5,-2);renderer.render(scene,camera);}
try{
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});renderer.setClearColor(0x000000,0);
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 build();resize();observer=new ResizeObserver(resize);observer.observe(stage);active=false;stage.classList.add("has-3d-world");
}catch(error){canvas.remove();hud.remove();detail.remove();const toggle=stage.querySelector(".comic-world-toggle");if(toggle)toggle.remove();const note=document.createElement("p");note.className="comic-world-fallback";note.textContent="Interactive 3D is unavailable on this device. The original comic artwork remains available.";stage.prepend(note);}
document.addEventListener("visibilitychange",()=>{active=!document.hidden;if(active&&!raf&&renderer&&stage.classList.contains("is-world-mode"))tick();else if(!active){cancelAnimationFrame(raf);raf=0;}});
window.addEventListener("pagehide",()=>{active=false;cancelAnimationFrame(raf);if(observer)observer.disconnect();if(scene)scene.traverse(object=>{if(object.geometry)object.geometry.dispose();if(object.material){const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>{if(material.map)material.map.dispose();material.dispose();});}});if(renderer)renderer.dispose();},{once:true});
})();