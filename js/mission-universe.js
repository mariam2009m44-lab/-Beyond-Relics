/* Beyond Relics — cinematic 3D solar-system navigation.
   Celestial bodies are original artistic visualizations, not scale models or NASA scans. */
(function(){
"use strict";
if(document.getElementById("br-universe"))return;
const launcher=document.getElementById("br-universe-launcher");
if(!launcher)return;
let THREE=null,renderer=null,scene=null,camera=null,raf=0,observer=null,raycaster=null,pointer=null;
let active=false,dragging=false,moved=false,lastX=0,lastY=0,downX=0,downY=0;
let rotX=-.08,rotY=0,targetX=rotX,targetY=rotY,zoom=1,targetZoom=1,selected=null,data=[];
let focusTarget=null,cameraGoal=null,motionPaused=false,moonAngle=0;
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
const $=id=>document.getElementById(id);
const worlds={
 moon:{title:"The Moon",kicker:"LUNAR FRONTIER · APOLLO",copy:"Explore the Apollo landing legacy: the descent stage left on the lunar surface and the scientific instruments that continued studying the Moon.",ids:["lunar-module","apollo-12-alsep"],position:[-7,0,-3],zoom:1.5,tag:"LUNAR SURFACE"},
 mars:{title:"Mars",kicker:"MARTIAN FRONTIER · ROBOTIC EXPLORATION",copy:"Meet the landers and rovers that transformed our understanding of Mars, from Pathfinder and Sojourner to the InSight science station and later explorers.",ids:["pathfinder-sojourner","spirit","opportunity","phoenix","insight","curiosity"],position:[-1,0,-5],zoom:1.45,tag:"ROVERS & LANDERS"},
 jupiter:{title:"Jupiter",kicker:"OUTER PLANETS · GAS GIANT",copy:"Follow the spacecraft encounters that revealed Jupiter's atmosphere, moons and immense magnetosphere. Mission records connect the planet to Pioneer and Voyager journeys.",ids:["voyager","pioneer-10-11"],position:[7,0,-8],zoom:1.25,tag:"PIONEER & VOYAGER"},
 saturn:{title:"Saturn",kicker:"OUTER PLANETS · RINGED WORLD",copy:"Explore the historic Pioneer and Voyager encounters with Saturn and the outer Solar System. The ring system shown here is an artistic visualization.",ids:["voyager","pioneer-10-11"],position:[15,0,-11],zoom:1.2,tag:"OUTER-PLANET ENCOUNTERS"},
 earth:{title:"Earth",kicker:"HOME WORLD · OBSERVATION",copy:"Earth is the starting point for planetary exploration. Browse the archive's space-observatory record and follow its documented science mission sources.",ids:["space-telescope"],position:[-11,0,-1],zoom:1.6,tag:"SPACE OBSERVATORIES"},
 deep:{title:"Deep Space",kicker:"BEYOND THE PLANETS · DEEP-SPACE MISSIONS",copy:"Trace the long journeys of Pioneer and Voyager, and explore the observatories that expanded our view of the universe.",ids:["voyager","space-telescope","pioneer-10-11"],position:[20,0,-16],zoom:1.15,tag:"INTERPLANETARY MISSIONS"}
};
const overlay=document.createElement("section");
overlay.id="br-universe";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-hidden","true");overlay.setAttribute("aria-label","Interactive 3D solar system explorer");
overlay.innerHTML='<canvas class="br-universe-canvas" aria-label="Interactive artistic 3D visualization of the Solar System. Drag to rotate and select a planet."></canvas><div class="br-universe-vignette" aria-hidden="true"></div><header class="br-universe-top"><a class="br-universe-brand" href="artifacts.html">BEYOND RELICS <span>THE SOLAR FRONTIERS EXPLORER</span></a><div class="br-universe-top-actions"><span class="br-universe-live">3D EXPLORATION</span><button id="br-universe-motion" type="button" aria-pressed="false">Pause orbits</button><button id="br-universe-reset" type="button">Reset view</button><button id="br-universe-close" type="button" aria-label="Close 3D explorer">×</button></div></header><div class="br-universe-intro" id="br-universe-intro"><small>AN INTERACTIVE JOURNEY THROUGH OUR COSMIC NEIGHBOURHOOD</small><h2>Choose your<br><em>destination.</em></h2><p>Select a planet in the scene or use the destination navigator below. Then discover the missions connected to that world.</p><span class="br-universe-scroll-hint">DRAG TO ORBIT · SCROLL TO ZOOM</span></div><aside class="br-universe-info" id="br-universe-info" aria-live="polite" hidden><button id="br-universe-info-close" type="button" aria-label="Close destination information">×</button><small id="br-universe-kicker"></small><h2 id="br-universe-title"></h2><p id="br-universe-copy"></p><div class="br-universe-record-heading"><span>MISSION ARCHIVE</span><span id="br-universe-count"></span></div><div class="br-universe-records" id="br-universe-records"></div><p class="br-universe-fidelity">Celestial scene: artistic visualization · Not to scale. Mission records open in a separate exhibit with their own model-fidelity labels.</p></aside><nav class="br-universe-nav" aria-label="Choose a destination"><div class="br-universe-nav-heading"><span>EXPLORE THE SOLAR SYSTEM</span><span>SELECT A WORLD</span></div><div class="br-universe-stops"><button type="button" data-world="earth"><i class="br-dot earth-dot"></i><span>Earth</span></button><button type="button" data-world="moon"><i class="br-dot moon-dot"></i><span>Moon</span></button><button type="button" data-world="mars"><i class="br-dot mars-dot"></i><span>Mars</span></button><button type="button" data-world="jupiter"><i class="br-dot jupiter-dot"></i><span>Jupiter</span></button><button type="button" data-world="saturn"><i class="br-dot saturn-dot"></i><span>Saturn</span></button><button type="button" data-world="deep"><i class="br-dot deep-dot"></i><span>Deep Space</span></button></div></nav><div class="br-universe-loader" id="br-universe-loader"><span></span>Preparing the 3D universe…</div><section class="br-universe-fallback" id="br-universe-fallback" hidden><h2>Explore the mission archive</h2><p>The 3D view is unavailable on this device or browser. You can still open every mission record below.</p><div id="br-universe-fallback-links"></div></section>';
document.body.appendChild(overlay);
let returnFocus=launcher;
function texture(kind){
 const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=512;const c=canvas.getContext("2d");
 const palettes={earth:["#8cb7c6","#235a77","#12283d"],moon:["#d3d0c7","#858b8d","#3a424b"],mars:["#e9a47b","#a64d35","#51251f"],jupiter:["#dfc39b","#9b7559","#59463e"],saturn:["#e5d1a8","#b89b6e","#67533d"]};
 const p=palettes[kind]||palettes.earth,g=c.createLinearGradient(0,0,0,512);g.addColorStop(0,p[0]);g.addColorStop(.52,p[1]);g.addColorStop(1,p[2]);c.fillStyle=g;c.fillRect(0,0,1024,512);
 if(kind==="jupiter"||kind==="saturn"){
  for(let i=0;i<24;i++){const y=12+i*21;c.fillStyle=i%2?"rgba(255,226,186,.18)":"rgba(42,32,28,.14)";c.fillRect(0,y,1024,8+Math.random()*10);}
  if(kind==="jupiter"){c.beginPath();c.ellipse(690,292,76,30,-.18,0,Math.PI*2);c.fillStyle="rgba(151,69,48,.65)";c.fill();}
 }else{
  for(let i=0;i<(kind==="moon"?380:180);i++){const x=Math.random()*1024,y=Math.random()*512,r=kind==="moon"?Math.random()*15+3:Math.random()*28+5;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=kind==="moon"?"rgba(30,35,39,.20)":"rgba(30,24,25,.10)";c.fill();if(kind==="moon"){c.beginPath();c.arc(x-r*.18,y-r*.2,r*.65,0,Math.PI*2);c.strokeStyle="rgba(245,244,233,.13)";c.lineWidth=2;c.stroke();}}
  if(kind==="earth"){c.fillStyle="rgba(94,137,101,.7)";for(let i=0;i<28;i++){c.beginPath();c.ellipse(Math.random()*1024,Math.random()*512,Math.random()*45+10,Math.random()*18+5,Math.random(),0,Math.PI*2);c.fill();}}
  if(kind==="mars"){c.fillStyle="rgba(240,187,139,.17)";for(let i=0;i<90;i++){c.beginPath();c.ellipse(Math.random()*1024,Math.random()*512,Math.random()*32+5,Math.random()*8+2,Math.random(),0,Math.PI*2);c.fill();}}
 }
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const planetGroups={};
const orbitingMoons=[];
function addPlanet(key,kind,pos,radius){
 const group=new THREE.Group();group.position.set(pos[0],pos[1],pos[2]);group.userData.world=key;scene.add(group);
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,72,56),new THREE.MeshStandardMaterial({map:texture(kind),roughness:.94,metalness:.01}));mesh.userData.world=key;group.add(mesh);
 const halo=new THREE.Mesh(new THREE.SphereGeometry(radius*1.045,48,32),new THREE.MeshBasicMaterial({color:kind==="mars"?0xe18a68:kind==="moon"?0xc5d2dc:0x78b9d1,transparent:true,opacity:.055,side:THREE.BackSide}));group.add(halo);
 if(kind==="saturn"){const ring=new THREE.Mesh(new THREE.RingGeometry(radius*1.35,radius*2.25,128),new THREE.MeshStandardMaterial({color:0xcab58d,roughness:.85,metalness:.12,side:THREE.DoubleSide,transparent:true,opacity:.72}));ring.rotation.x=Math.PI/2.35;group.add(ring);}
 if(kind==="jupiter"){const band=new THREE.Mesh(new THREE.TorusGeometry(radius*1.02,.018,4,100),new THREE.MeshBasicMaterial({color:0xe2c49c,transparent:true,opacity:.18}));band.rotation.x=.35;group.add(band);}
 planetGroups[key]=group;
}
function orbit(x,z,rx,rz){
 const curve=new THREE.EllipseCurve(x,0,rx,rz,0,Math.PI*2,false,0);const pts=curve.getPoints(180).map(p=>new THREE.Vector3(p.x,0,p.y+z));
 const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x8aa9c4,transparent:true,opacity:.17}));scene.add(line);
}
function addSatellite(parentKey,radius,distance,speed,color,phase=0){
 const parent=planetGroups[parentKey];if(!parent)return;
 const center=parent.position.clone();
 const orbitCurve=new THREE.EllipseCurve(center.x,center.z,distance,distance*.82,0,Math.PI*2,false,0);
 const orbitPoints=orbitCurve.getPoints(96).map(p=>new THREE.Vector3(p.x,center.y+.02,p.y));
 const orbitLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints),new THREE.LineBasicMaterial({color:0x9bb8d0,transparent:true,opacity:.16}));
 scene.add(orbitLine);
 const moon=new THREE.Mesh(new THREE.SphereGeometry(radius,20,14),new THREE.MeshStandardMaterial({color,roughness:.98,metalness:0}));
 moon.userData.world=parentKey;scene.add(moon);
 orbitingMoons.push({mesh:moon,center,distance,speed,phase});
}
function buildScene(){
 const canvas=overlay.querySelector(".br-universe-canvas");
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:"low-power"});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<700?1.15:1.5));renderer.setSize(overlay.clientWidth,overlay.clientHeight);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 scene=new THREE.Scene();scene.background=new THREE.Color(0x050b15);scene.fog=new THREE.FogExp2(0x050b15,.0022);
 camera=new THREE.PerspectiveCamera(44,overlay.clientWidth/overlay.clientHeight,.1,600);camera.position.set(0,18,52);camera.lookAt(0,0,-5);
 scene.add(new THREE.HemisphereLight(0x9dbbd5,0x171a26,1.05));
 const sunLight=new THREE.PointLight(0xffd5a0,360,180);sunLight.position.set(-20,7,0);scene.add(sunLight);
 const fill=new THREE.DirectionalLight(0x9dc6e4,1.1);fill.position.set(10,12,20);scene.add(fill);
 const starPos=[];for(let i=0;i<3200;i++)starPos.push((Math.random()-.5)*240,(Math.random()-.5)*130,(Math.random()-.5)*180);
 const sg=new THREE.BufferGeometry();sg.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xddeaff,size:.13,transparent:true,opacity:.8})));
 const sun=new THREE.Mesh(new THREE.SphereGeometry(3.2,48,32),new THREE.MeshBasicMaterial({color:0xffd49a}));sun.position.set(-20,0,0);scene.add(sun);
 const glow=new THREE.Mesh(new THREE.SphereGeometry(4.2,40,28),new THREE.MeshBasicMaterial({color:0xffb66f,transparent:true,opacity:.09,side:THREE.BackSide}));glow.position.copy(sun.position);scene.add(glow);
 addPlanet("earth","earth",[-11,0,-1],1.35);addPlanet("moon","moon",[-8.2,.35,-2.2],.48);orbit(-11,-1,2.8,2.8);addPlanet("mars","mars",[-1,0,-5],1.05);addPlanet("jupiter","jupiter",[7,0,-8],2.55);addPlanet("saturn","saturn",[16,0,-12],2.05);
 addSatellite("mars",.12,1.55,.012,0xb98b75,.4);addSatellite("mars",.08,2.05,.008,0x9a8c82,2.1);
 addSatellite("jupiter",.19,3.35,.004,0xd6c3a0,.2);addSatellite("jupiter",.15,3.9,.0032,0x9da8aa,1.8);addSatellite("jupiter",.23,4.55,.0025,0xb8a38a,3.2);addSatellite("jupiter",.13,5.15,.002,0xc5bca8,4.7);
 addSatellite("saturn",.18,2.85,.003,0xd9c7a2,.7);addSatellite("saturn",.11,3.55,.0022,0xb9b7ad,2.6);
 const probe=new THREE.Group();probe.position.set(22,0,-16);probe.userData.world="deep";
 const probeMetal=new THREE.MeshStandardMaterial({color:0xb9c4cc,metalness:.72,roughness:.34});
 const probeGold=new THREE.MeshStandardMaterial({color:0xd1b47e,metalness:.65,roughness:.42});
 const probeCore=new THREE.Mesh(new THREE.BoxGeometry(.48,.72,.46),probeGold);probe.add(probeCore);
 const probeDish=new THREE.Mesh(new THREE.SphereGeometry(.68,28,16,0,Math.PI*2,0,Math.PI/2),probeMetal);probeDish.position.y=.58;probeDish.rotation.x=Math.PI;probe.add(probeDish);
 [-1,1].forEach(sign=>{const panel=new THREE.Mesh(new THREE.BoxGeometry(1.35,.055,.62),new THREE.MeshStandardMaterial({color:0x355b80,metalness:.38,roughness:.42}));panel.position.set(sign*1.1,-.08,0);probe.add(panel);});
 scene.add(probe);planetGroups.deep=probe;
 orbit(-20,0,9,7);orbit(-20,0,17,12);orbit(-20,0,27,18);orbit(-20,0,39,25);orbit(-20,0,51,33);
 const belt=[];for(let i=0;i<650;i++){const a=Math.random()*Math.PI*2,r=11+Math.random()*3.2;belt.push(1+Math.cos(a)*r,(Math.random()-.5)*.6,-6+Math.sin(a)*r);}
 const bg=new THREE.BufferGeometry();bg.setAttribute("position",new THREE.Float32BufferAttribute(belt,3));scene.add(new THREE.Points(bg,new THREE.PointsMaterial({color:0x9b9ca2,size:.055,transparent:true,opacity:.42})));
 raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();
 canvas.addEventListener("pointerdown",e=>{dragging=true;moved=false;downX=lastX=e.clientX;downY=lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener("pointermove",e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)>5)moved=true;targetY+=dx*.003;targetX=Math.max(-.5,Math.min(.5,targetX+dy*.002));});
 canvas.addEventListener("pointerup",e=>{dragging=false;if(moved)return;const r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(scene.children,true);for(const hit of hits){let o=hit.object;while(o&&!o.userData.world)o=o.parent;if(o&&o.userData.world){showWorld(o.userData.world);break;}}});
 canvas.addEventListener("pointercancel",()=>dragging=false);
 canvas.tabIndex=0;
 canvas.addEventListener("keydown",event=>{if(event.key==="ArrowLeft"){targetY-=.14;event.preventDefault();}else if(event.key==="ArrowRight"){targetY+=.14;event.preventDefault();}else if(event.key==="ArrowUp"){targetX=Math.max(-.5,targetX-.1);event.preventDefault();}else if(event.key==="ArrowDown"){targetX=Math.min(.5,targetX+.1);event.preventDefault();}else if(event.key==="+"||event.key==="="){targetZoom=Math.max(.72,targetZoom-.08);event.preventDefault();}else if(event.key==="-"){targetZoom=Math.min(1.75,targetZoom+.08);event.preventDefault();}else if(event.key==="0"){resetView();event.preventDefault();}});
 canvas.addEventListener("wheel",e=>{e.preventDefault();targetZoom=Math.max(.72,Math.min(1.75,targetZoom+(e.deltaY>0?.06:-.06)));},{passive:false});
 canvas.addEventListener("webglcontextlost",event=>{event.preventDefault();active=false;cancelAnimationFrame(raf);raf=0;$("br-universe-loader").hidden=false;$("br-universe-loader").textContent="Graphics paused. The destination list and mission archive remain available.";});
 canvas.addEventListener("webglcontextrestored",()=>{if(renderer)renderer.resetState();$("br-universe-loader").hidden=true;active=!document.hidden;if(active)startLoop();});
 observer=new ResizeObserver(()=>{if(!renderer||!camera)return;const w=overlay.clientWidth,h=overlay.clientHeight;if(!w||!h)return;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<700?1.15:1.5));camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);});observer.observe(overlay);
 $("br-universe-loader").hidden=true;startLoop();
}
function showWorld(key){
 const cfg=worlds[key];if(!cfg)return;selected=key;
 $("br-universe-intro").classList.add("is-away");
 const panel=$("br-universe-info");panel.hidden=false;
 $("br-universe-kicker").textContent=cfg.kicker;$("br-universe-title").textContent=cfg.title;$("br-universe-copy").textContent=cfg.copy;
 const list=$("br-universe-records");list.replaceChildren();
 const records=data.filter(item=>cfg.ids.includes(item.id));
 $("br-universe-count").textContent=String(records.length).padStart(2,"0")+" RECORDS";
 records.forEach(item=>{const a=document.createElement("a");a.className="br-universe-record";a.href="artifact-details.html?id="+encodeURIComponent(item.id);const copy=document.createElement("span");copy.textContent=item.title;const arrow=document.createElement("b");arrow.textContent="VIEW EXHIBIT ↗";a.append(copy,arrow);list.append(a);});
 if(!records.length){const p=document.createElement("p");p.className="br-universe-empty";p.textContent="No equipment records are currently catalogued for this destination. Explore another world or browse the complete archive.";list.append(p);}
 document.querySelectorAll(".br-universe-stop").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.world===key)));
 const p=planetGroups[key].position;focusTarget=new THREE.Vector3(p.x,p.y,p.z);cameraGoal=new THREE.Vector3(p.x+cfg.position[0]*.2,p.y+9,p.z+cfg.position[2]*.2+15);targetZoom=cfg.zoom;
}
function resetView(){motionPaused=false;syncMotionButton();selected=null;focusTarget=null;cameraGoal=new THREE.Vector3(0,18,52);targetZoom=1;targetX=-.08;targetY=0;$("br-universe-info").hidden=true;$("br-universe-intro").classList.remove("is-away");document.querySelectorAll(".br-universe-stop").forEach(b=>b.setAttribute("aria-pressed","false"));}
function startLoop(){if(raf)return;const frame=(now=0)=>{if(!active){raf=0;return;}raf=requestAnimationFrame(frame);const delta=frame.lastTime?Math.min((now-frame.lastTime)/16.667,2):1;frame.lastTime=now;if(!reduced.matches&&!motionPaused&&!dragging){targetY+=.00022*delta;moonAngle+=.00105*delta;planetGroups.moon.position.set(-11+Math.cos(moonAngle)*2.8,.35,-1+Math.sin(moonAngle)*2.8);}if(!reduced.matches&&!motionPaused&&!dragging){orbitingMoons.forEach(m=>{const a=now*.001*m.speed*60+m.phase;m.mesh.position.set(m.center.x+Math.cos(a)*m.distance,m.center.y+.04,m.center.z+Math.sin(a)*m.distance*.82);});}const easing=1-Math.pow(.955,delta);rotX+=(targetX-rotX)*easing;rotY+=(targetY-rotY)*easing;scene.rotation.set(rotX,rotY,0);Object.values(planetGroups).forEach(g=>{if(g.children[0])g.children[0].rotation.y+=.00055*delta;});const base=cameraGoal||new THREE.Vector3(0,18,52);const desired=new THREE.Vector3(base.x*targetZoom,base.y*targetZoom,base.z*targetZoom);camera.position.lerp(desired,1-Math.pow(.975,delta));const aim=focusTarget||new THREE.Vector3(0,0,-5);camera.lookAt(aim);renderer.render(scene,camera);};frame();}
function loadThree(){return new Promise((resolve,reject)=>{if(window.THREE){resolve(window.THREE);return;}const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js";s.onload=()=>window.THREE?resolve(window.THREE):reject(new Error("Three.js unavailable"));s.onerror=reject;document.head.appendChild(s);});}
async function openUniverse(event){
 returnFocus=event.currentTarget;overlay.classList.add("is-open");overlay.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";active=true;$("br-universe-close").focus();$("br-universe-loader").hidden=false;
 try{if(!data.length){const r=await fetch("data/artifacts.json");if(!r.ok)throw new Error("Archive unavailable");data=await r.json();}THREE=await loadThree();if(!renderer)buildScene();else{renderer.setSize(overlay.clientWidth,overlay.clientHeight);startLoop();}}
 catch(error){$("br-universe-loader").hidden=true;$("br-universe-fallback").hidden=false;const links=$("br-universe-fallback-links");links.replaceChildren();(data.length?data:[]).forEach(item=>{const a=document.createElement("a");a.href="artifact-details.html?id="+encodeURIComponent(item.id);a.textContent=item.title;links.append(a);});}
}
function closeUniverse(){active=false;cancelAnimationFrame(raf);raf=0;overlay.classList.remove("is-open");overlay.setAttribute("aria-hidden","true");document.body.style.overflow="";if(returnFocus&&returnFocus.isConnected)returnFocus.focus();}
launcher.addEventListener("click",openUniverse);
const motionButton=$("br-universe-motion");
function syncMotionButton(){motionButton.textContent=motionPaused?"Resume orbits":"Pause orbits";motionButton.setAttribute("aria-pressed",String(motionPaused));}
motionButton.addEventListener("click",()=>{motionPaused=!motionPaused;syncMotionButton();});
if(reduced.matches){motionButton.disabled=true;motionButton.textContent="Motion reduced";motionButton.title="Your device requests reduced motion.";}
document.querySelectorAll("[data-world]").forEach(b=>b.addEventListener("click",()=>showWorld(b.dataset.world)));
$("br-universe-close").addEventListener("click",closeUniverse);$("br-universe-reset").addEventListener("click",resetView);$("br-universe-info-close").addEventListener("click",()=>{$("br-universe-info").hidden=true;$("br-universe-intro").classList.remove("is-away");selected=null;});
overlay.addEventListener("click",e=>{if(e.target===overlay)closeUniverse();});
document.addEventListener("keydown",e=>{if(!overlay.classList.contains("is-open"))return;if(e.key==="Escape"){closeUniverse();return;}if(e.key==="Tab"){const items=[...overlay.querySelectorAll("button:not([disabled]),a[href],canvas[tabindex]")].filter(x=>!x.hidden);if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else if(active)startLoop();});
window.addEventListener("pagehide",()=>{active=false;cancelAnimationFrame(raf);if(observer)observer.disconnect();if(scene){const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material){for(const material of (Array.isArray(object.material)?object.material:[object.material])){materials.add(material);for(const value of Object.values(material)){if(value&&value.isTexture)textures.add(value);}}}});textures.forEach(texture=>texture.dispose());geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());}if(renderer)renderer.dispose();});
})();