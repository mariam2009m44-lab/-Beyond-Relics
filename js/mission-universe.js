/* Beyond Relics — interactive 3D mission universe. All 3D forms are clearly illustrative, not scale models. */
(function(){
"use strict";
if(document.getElementById("br-universe"))return;
const style=document.createElement("link");style.rel="stylesheet";style.href="css/mission-universe.css";document.head.appendChild(style);
const launcher=document.createElement("button");launcher.id="br-universe-launcher";launcher.type="button";launcher.innerHTML="ENTER 3D MISSION UNIVERSE";
launcher.setAttribute("aria-haspopup","dialog");launcher.setAttribute("aria-controls","br-universe");
const overlay=document.createElement("section");overlay.id="br-universe";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-label","3D Mission Universe");
overlay.innerHTML='<div class="br-universe-loader" id="br-universe-loader">Preparing mission universe…</div><section class="br-universe-fallback" id="br-universe-fallback" hidden aria-live="polite"><h2>Explore the archive without 3D</h2><p>The 3D view is unavailable on this device or browser. The mission records remain accessible below.</p><div id="br-universe-fallback-links"></div></section><div class="br-universe-top"><div class="br-universe-brand">BEYOND RELICS <span>MISSION UNIVERSE · INTERACTIVE 3D</span></div><button id="br-universe-close" type="button" aria-label="Close universe">×</button></div><div class="br-universe-intro"><small>CHOOSE A DESTINATION</small><h2>Enter the<br>unknown.</h2><p>Travel between the Moon, Mars and deep space. Select a world or a mission object to uncover the story behind the hardware.</p></div><div class="br-universe-vignette"></div><div class="br-universe-info" id="br-universe-info" aria-live="polite"><small id="br-universe-kicker">MISSION DESTINATION</small><h3 id="br-universe-title">Explore a world</h3><p id="br-universe-copy">Choose a destination to discover the missions and objects connected to it.</p><div class="br-universe-fidelity" id="br-universe-fidelity" aria-label="3D asset fidelity labels"></div><div class="br-universe-records" id="br-universe-records"></div><p class="br-universe-foot">The 3D environment is an artistic visualization. It is not an official scan, engineering model, or scale-accurate reconstruction. Mission facts are presented separately with source links.</p></div><div class="br-universe-hud"><div class="br-universe-stops"><button class="br-universe-stop" data-world="moon" aria-pressed="false">THE MOON</button><button class="br-universe-stop" data-world="mars" aria-pressed="false">MARS</button><button class="br-universe-stop" data-world="deep" aria-pressed="false">DEEP SPACE</button></div><div class="br-universe-hint">Drag to look around · Tap a world or mission marker to explore · Select a record to open its archive</div></div>';
document.body.append(launcher,overlay);
let THREE=null,renderer=null,scene=null,camera=null,raf=0,resizeObserver=null,raycaster=null,pointer=null,worldObjects=[],data=[],active=false,dragging=false,lastX=0,lastY=0,downX=0,downY=0,rotX=0,rotY=0,targetRotX=0,targetRotY=0,selected=null,lookTarget=null;
const $=id=>document.getElementById(id);
function showWorld(key){
 const cfg={
  moon:{title:"The Moon",kicker:"LUNAR SURFACE · APOLLO",copy:"Explore the hardware and science stations left at Apollo landing sites. These records distinguish physical equipment from the measurements preserved in archives.",regions:["Moon"],ids:["lunar-module","apollo-12-alsep"],assets:["Lunar surface — Artistic visualization","Lander form — Artistic visualization"]},
  mars:{title:"Mars",kicker:"MARTIAN SURFACE · ROBOTIC EXPLORATION",copy:"Follow the landers and rovers that explored the Martian surface, from Pathfinder and Sojourner to the InSight science station.",regions:["Mars"],ids:["pathfinder-sojourner","spirit","opportunity","phoenix","insight","curiosity"],assets:["Martian surface — Artistic visualization","Rover form — Artistic visualization"]},
  deep:{title:"Deep Space",kicker:"OUTER PLANETS · INTERSTELLAR SPACE",copy:"Trace the journeys of spacecraft that travelled beyond the planets and the observatories whose scientific records remain valuable.",regions:["Deep Space"],ids:["voyager","space-telescope","pioneer-10-11"],assets:["Planetary backdrop — Artistic visualization","Spacecraft form — Artistic visualization"]}
 }[key];
 if(!cfg)return;
 selected=key;
 document.querySelectorAll(".br-universe-stop").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.world===key)));
 $("br-universe-kicker").textContent=cfg.kicker;$("br-universe-title").textContent=cfg.title;$("br-universe-copy").textContent=cfg.copy;
 const fidelity=$("br-universe-fidelity");fidelity.replaceChildren();cfg.assets.forEach(label=>{const tag=document.createElement("span");tag.className="br-fidelity-tag";tag.textContent=label;fidelity.append(tag);});
 const root=$("br-universe-records");root.replaceChildren();
 data.filter(x=>cfg.ids.includes(x.id)).forEach(item=>{
  const a=document.createElement("a");a.href="artifact-details.html?id="+encodeURIComponent(item.id);
  const title=document.createElement("strong");title.textContent=item.title;
  const arrow=document.createElement("span");arrow.textContent="OPEN ↗";a.append(title,arrow);root.append(a);
 });
 $("br-universe-info").classList.add("is-visible");
 if(scene&&camera){const target=worldObjects.find(o=>o.userData.world===key);if(target){const p=target.position;camera.userData.goal=new THREE.Vector3(p.x*1.55,p.y+3.2,p.z+9);lookTarget=new THREE.Vector3(p.x,p.y,p.z);}}
}
function makeTexture(kind){
 const canvas=document.createElement("canvas");canvas.width=512;canvas.height=256;const c=canvas.getContext("2d");
 const g=c.createLinearGradient(0,0,0,256);
 if(kind==="mars"){g.addColorStop(0,"#e0a078");g.addColorStop(.5,"#a64f36");g.addColorStop(1,"#4b211e");}
 else if(kind==="moon"){g.addColorStop(0,"#b9b7b1");g.addColorStop(.5,"#777873");g.addColorStop(1,"#3c4149");}
 else{g.addColorStop(0,"#3b9ac0");g.addColorStop(.45,"#164b7b");g.addColorStop(1,"#08172e");}
 c.fillStyle=g;c.fillRect(0,0,512,256);
 for(let i=0;i<260;i++){const x=Math.random()*512,y=Math.random()*256,r=kind==="moon"?Math.random()*8+2:Math.random()*12+2;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=kind==="moon"?"rgba(25,27,31,"+(Math.random()*.22)+")":kind==="mars"?"rgba(66,22,17,"+(Math.random()*.18)+")":"rgba(4,20,46,"+(Math.random()*.2)+")";c.fill();}
 if(kind==="earth"){c.fillStyle="#397c57";for(let i=0;i<18;i++){c.beginPath();c.ellipse(Math.random()*512,Math.random()*256,Math.random()*38+8,Math.random()*16+5,Math.random(),0,Math.PI*2);c.fill();}}
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
function createPlanet(name,kind,pos,radius,worldKey){
 const group=new THREE.Group();group.position.set(...pos);group.userData.world=worldKey;scene.add(group);
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,64,48),new THREE.MeshStandardMaterial({map:makeTexture(kind),roughness:.96,metalness:.02}));
 mesh.userData.world=worldKey;mesh.userData.kind="planet";group.add(mesh);
 const halo=new THREE.Mesh(new THREE.SphereGeometry(radius*1.035,48,36),new THREE.MeshBasicMaterial({color:kind==="mars"?0xff986d:kind==="moon"?0xc3d9ed:0x64b9ff,transparent:true,opacity:.075,side:THREE.BackSide}));group.add(halo);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(radius*1.45,.012,6,128),new THREE.MeshBasicMaterial({color:kind==="mars"?0xe59a77:kind==="moon"?0x9bc9e8:0x5a9cc9,transparent:true,opacity:.28}));ring.rotation.x=1.25;group.add(ring);
 worldObjects.push(group);worldObjects.push(mesh);return group;
}
function createRover(parent){
 const g=new THREE.Group();g.position.set(2.2,-1.15,4.35);parent.add(g);g.userData.world="mars";g.userData.kind="artifact";
 const gold=new THREE.MeshStandardMaterial({color:0xb98c51,metalness:.65,roughness:.4}),dark=new THREE.MeshStandardMaterial({color:0x202a32,metalness:.5,roughness:.65}),glass=new THREE.MeshStandardMaterial({color:0x8cd7e9,metalness:.3,roughness:.2,transparent:true,opacity:.72});
 const body=new THREE.Mesh(new THREE.BoxGeometry(1.25,.48,.78),gold);g.add(body);body.userData.world="mars";
 const mast=new THREE.Mesh(new THREE.CylinderGeometry(.055,.07,.72,12),dark);mast.position.set(-.2,.55,0);g.add(mast);
 const head=new THREE.Mesh(new THREE.BoxGeometry(.35,.24,.28),glass);head.position.set(-.2,.95,0);g.add(head);
 for(let i=0;i<6;i++){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.16,18),dark);wheel.rotation.z=Math.PI/2;wheel.position.set(i<3?-.48:.48,-.24,(i%3-1)*.31);g.add(wheel);}
 const panel=new THREE.Mesh(new THREE.BoxGeometry(.75,.045,.55),new THREE.MeshStandardMaterial({color:0x2c5b91,metalness:.35,roughness:.3}));panel.position.set(.05,.33,0);g.add(panel);
 worldObjects.push(g);return g;
}
function createLander(parent){
 const g=new THREE.Group();g.position.set(-2,-1.2,3.45);parent.add(g);g.userData.world="moon";g.userData.kind="artifact";
 const gold=new THREE.MeshStandardMaterial({color:0xc2a56d,metalness:.55,roughness:.5}),foil=new THREE.MeshStandardMaterial({color:0x9ca8ae,metalness:.75,roughness:.32});
 const cabin=new THREE.Mesh(new THREE.CylinderGeometry(.48,.62,.68,6),gold);g.add(cabin);
 const top=new THREE.Mesh(new THREE.ConeGeometry(.45,.48,6),gold);top.position.y=.55;g.add(top);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+.35,leg=new THREE.Mesh(new THREE.CylinderGeometry(.035,.055,1.1,8),foil);leg.position.set(Math.cos(a)*.72,-.55,Math.sin(a)*.72);leg.rotation.z=Math.cos(a)*-.5;leg.rotation.x=Math.sin(a)*.5;g.add(leg);}
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.08,6),foil);base.position.y=-1.05;g.add(base);worldObjects.push(g);return g;
}
function createProbe(parent){
 const g=new THREE.Group();g.position.set(1.8,.6,3.55);parent.add(g);g.userData.world="deep";g.userData.kind="artifact";
 const metal=new THREE.MeshStandardMaterial({color:0xb9c4cc,metalness:.7,roughness:.35}),gold=new THREE.MeshStandardMaterial({color:0xd2b16e,metalness:.65,roughness:.4});
 const core=new THREE.Mesh(new THREE.BoxGeometry(.45,.65,.4),gold);g.add(core);
 const dish=new THREE.Mesh(new THREE.SphereGeometry(.62,24,12,0,Math.PI*2,0,Math.PI/2),metal);dish.position.y=.48;dish.rotation.x=Math.PI;g.add(dish);
 [-1,1].forEach(sign=>{const panel=new THREE.Mesh(new THREE.BoxGeometry(1.25,.06,.55),new THREE.MeshStandardMaterial({color:0x315b83,metalness:.3,roughness:.4}));panel.position.set(sign*1.05,-.08,0);g.add(panel);});
 worldObjects.push(g);return g;
}
function buildScene(){
 const el=document.createElement("canvas");el.setAttribute("aria-hidden","true");overlay.insertBefore(el,overlay.querySelector(".br-universe-vignette"));
 renderer=new THREE.WebGLRenderer({canvas:el,alpha:false,antialias:true,powerPreference:"low-power"});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(overlay.clientWidth,overlay.clientHeight);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 scene=new THREE.Scene();scene.background=new THREE.Color(0x020611);scene.fog=new THREE.FogExp2(0x020611,.008);
 camera=new THREE.PerspectiveCamera(48,overlay.clientWidth/overlay.clientHeight,.1,500);camera.position.set(0,7,31);lookTarget=new THREE.Vector3(0,0,0);camera.lookAt(lookTarget);camera.userData.goal=new THREE.Vector3(0,7,31);
 scene.add(new THREE.HemisphereLight(0x9bc9f5,0x171426,1.1));
 const sun=new THREE.PointLight(0xffd3a0,240,130);sun.position.set(-18,12,18);scene.add(sun);
 const key=new THREE.DirectionalLight(0x91cfff,1.2);key.position.set(12,8,8);scene.add(key);
 const starGeo=new THREE.BufferGeometry(),positions=[];for(let i=0;i<2300;i++)positions.push((Math.random()-.5)*180,(Math.random()-.5)*100,(Math.random()-.5)*150);
 starGeo.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xd7eaff,size:.12,transparent:true,opacity:.8}));scene.add(stars);worldObjects.push(stars);
 const sunMesh=new THREE.Mesh(new THREE.SphereGeometry(2.1,32,24),new THREE.MeshBasicMaterial({color:0xffc67a}));sunMesh.position.set(-18,12,-15);scene.add(sunMesh);
 const moon=createPlanet("Moon","moon",[-9,-.2,-4],3.4,"moon"),mars=createPlanet("Mars","mars",[0,1,-7],4.2,"mars"),deep=createPlanet("Deep Space","earth",[10,1.8,-6],3.5,"deep");
 const orbitMat=new THREE.LineBasicMaterial({color:0x6fbbe5,transparent:true,opacity:.18});
 [-9,0,10].forEach((x,i)=>{const curve=new THREE.EllipseCurve(x,0,i===1?6.2:5.1,i===1?2.8:2.1,0,Math.PI*2,false,0);const pts=curve.getPoints(120).map(p=>new THREE.Vector3(p.x,p.y,-8));scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),orbitMat));});
 createLander(moon);createRover(mars);createProbe(deep);
 raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();
 el.addEventListener("pointerdown",e=>{dragging=true;downX=lastX=e.clientX;downY=lastY=e.clientY;el.setPointerCapture(e.pointerId);});
 el.addEventListener("pointermove",e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;targetRotY+=dx*.003;targetRotX=Math.max(-.42,Math.min(.42,targetRotX+dy*.002));});
 el.addEventListener("pointerup",e=>{dragging=false;if(Math.hypot(e.clientX-downX,e.clientY-downY)>7)return;const r=el.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(scene.children,true);let key=null;for(const hit of hits){let obj=hit.object;while(obj&& !obj.userData.world)obj=obj.parent;if(obj&&obj.userData.world){key=obj.userData.world;break;}}if(key)showWorld(key);});
 el.addEventListener("pointercancel",()=>dragging=false);
 resizeObserver=new ResizeObserver(()=>{if(!renderer||!camera)return;const w=overlay.clientWidth,h=overlay.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);});
 resizeObserver.observe(overlay);
 startRenderLoop();$("br-universe-loader").hidden=true;
}
function startRenderLoop(){if(raf)return;const tick=()=>{if(!active){raf=0;return;}raf=requestAnimationFrame(tick);rotX+=(targetRotX-rotX)*.045;rotY+=(targetRotY-rotY)*.045;scene.rotation.x=rotX;scene.rotation.y=rotY;worldObjects.forEach(o=>{if(o.userData.kind==="planet")o.rotation.y+=.0009;});const goal=camera.userData.goal;camera.position.lerp(goal,.025);const aim=worldObjects.find(o=>o.userData.world===selected);if(lookTarget&&selected){const p=aim?aim.position:new THREE.Vector3();lookTarget.lerp(p,.035);}else if(lookTarget)lookTarget.lerp(new THREE.Vector3(0,0,0),.02);camera.lookAt(lookTarget||new THREE.Vector3());renderer.render(scene,camera);};tick();}
function loadThree(){return new Promise((resolve,reject)=>{if(window.THREE){resolve(window.THREE);return;}const script=document.createElement("script");script.src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";script.onload=()=>window.THREE?resolve(window.THREE):reject(new Error("Three.js unavailable"));script.onerror=reject;document.head.appendChild(script);});}
async function openUniverse(){
 overlay.classList.add("is-open");overlay.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";active=true;
 $("br-universe-close").focus();
 $("br-universe-loader").hidden=false;
 try{if(!data.length){const r=await fetch("data/artifacts.json");if(!r.ok)throw Error("Mission archive unavailable");data=await r.json();}
 THREE=await loadThree();if(!renderer)buildScene();else{renderer.setSize(overlay.clientWidth,overlay.clientHeight);active=true;startRenderLoop();}
 }catch(e){
  $("br-universe-loader").hidden=true;
  const fallback=$("br-universe-fallback"),links=$("br-universe-fallback-links");fallback.hidden=false;links.replaceChildren();
  const records=data.length?data:[{id:"artifacts",title:"Mission archive",url:"artifacts.html"},{id:"data",title:"NASA Data Lab",url:"data.html"}];
  records.forEach(item=>{const a=document.createElement("a");a.href=item.url||("artifact-details.html?id="+encodeURIComponent(item.id));a.textContent=item.title||item.id;links.append(a);});
 }
}
function closeUniverse(){active=false;cancelAnimationFrame(raf);raf=0;overlay.classList.remove("is-open");overlay.setAttribute("aria-hidden","true");document.body.style.overflow="";launcher.focus();}
launcher.addEventListener("click",openUniverse);document.querySelectorAll("[data-open-universe]").forEach(b=>b.addEventListener("click",openUniverse));$("br-universe-close").addEventListener("click",closeUniverse);
overlay.addEventListener("click",e=>{if(e.target===overlay)closeUniverse();});
document.addEventListener("keydown",e=>{
 if(!overlay.classList.contains("is-open"))return;
 if(e.key==="Escape"){closeUniverse();return;}
 if(e.key==="Tab"){const focusable=Array.from(overlay.querySelectorAll("button:not([disabled]),a[href], [tabindex]:not([tabindex=\"-1\"])")).filter(el=>!el.hidden);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
 });
document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else if(active)startRenderLoop();});
document.querySelectorAll(".br-universe-stop").forEach(b=>b.addEventListener("click",()=>showWorld(b.dataset.world)));
window.addEventListener("pagehide",()=>{active=false;cancelAnimationFrame(raf);if(renderer)renderer.dispose();if(resizeObserver)resizeObserver.disconnect();});
})();