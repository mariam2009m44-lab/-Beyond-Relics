/* Beyond Relics — cinematic 3D solar-system navigation.
   Celestial bodies are original artistic visualizations, not scale models or NASA scans. */
(function(){
"use strict";
if(document.getElementById("br-universe"))return;
const launcher=document.getElementById("br-universe-launcher");
if(!launcher)return;
let THREE=null,renderer=null,scene=null,camera=null,raf=0,observer=null,raycaster=null,pointer=null,gltfLoaderPromise=null;
let active=false,dragging=false,moved=false,lastX=0,lastY=0,downX=0,downY=0;
let rotX=0,rotY=0,targetX=rotX,targetY=rotY,zoom=1,targetZoom=1,selected=null,data=[];
let focusTarget=null,cameraGoal=null,motionPaused=false,moonAngle=0,surfaceRoot=null,surfaceGroups={},surfaceMode=false,surfaceWorldKey=null,surfaceLookAt=null,surfaceHotspots=[];
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
const $=id=>document.getElementById(id);
const worlds={
 moon:{title:"The Moon",kicker:"LUNAR FRONTIER · APOLLO",copy:"A world of ancient craters and human exploration. Move from orbit toward the lunar surface, then enter the guided Apollo journey and inspect the hardware left behind.",ids:["lunar-module","apollo-12-alsep"],position:[-7,0,-3],zoom:1.5,tag:"LUNAR SURFACE",journey:"lunar-journey.html?from=moon"},
 mars:{title:"Mars",kicker:"MARTIAN FRONTIER · ROBOTIC EXPLORATION",copy:"Meet the landers and rovers that transformed our understanding of Mars, from Pathfinder and Sojourner to the InSight science station and later explorers.",ids:["pathfinder-sojourner","spirit","opportunity","phoenix","insight","curiosity"],position:[-1,0,-5],zoom:1.45,tag:"ROVERS & LANDERS"},
 jupiter:{title:"Jupiter",kicker:"OUTER PLANETS · GAS GIANT",copy:"Follow the spacecraft encounters that revealed Jupiter's atmosphere, moons and immense magnetosphere. Mission records connect the planet to Pioneer and Voyager journeys.",ids:["voyager","pioneer-10-11"],position:[7,0,-8],zoom:1.25,tag:"PIONEER & VOYAGER"},
 saturn:{title:"Saturn",kicker:"OUTER PLANETS · RINGED WORLD",copy:"Explore the historic Pioneer and Voyager encounters with Saturn and the outer Solar System. The ring system shown here is an artistic visualization.",ids:["voyager","pioneer-10-11"],position:[15,0,-11],zoom:1.2,tag:"OUTER-PLANET ENCOUNTERS"},
 earth:{title:"Earth",kicker:"HOME WORLD · OBSERVATION",copy:"Earth is the starting point for planetary exploration. Browse the archive's space-observatory record and follow its documented science mission sources.",ids:["space-telescope"],position:[-11,0,-1],zoom:1.6,tag:"SPACE OBSERVATORIES"},
 deep:{title:"Deep Space",kicker:"BEYOND THE PLANETS · DEEP-SPACE MISSIONS",copy:"Trace the long journeys of Pioneer and Voyager, and explore the observatories that expanded our view of the universe.",ids:["voyager","space-telescope","pioneer-10-11","pioneer-plaque"],position:[20,0,-16],zoom:1.15,tag:"INTERPLANETARY MISSIONS"}
};

worlds.sun={title:"The Sun",kicker:"OUR STAR · SOLAR SYSTEM",copy:"The star at the centre of our planetary system. Its gravity holds the planets in orbit and its energy drives the space environment around them.",ids:[],position:[-20,0,0],zoom:1.1,tag:"OUR STAR",facts:["A G-type main-sequence star","About 4.6 billion years old","Contains more than 99% of the Solar System’s mass"]};
worlds.mercury={title:"Mercury",kicker:"INNER PLANET · AIRLESS ROCKY WORLD",copy:"The smallest planet follows a fast orbit close to the Sun. Its ancient cratered terrain preserves a long record of impacts.",ids:[],position:[-16,0,1],zoom:1.5,tag:"INNER PLANET",facts:["Smallest planet","Almost no atmosphere","88 Earth days per orbit"]};
worlds.venus={title:"Venus",kicker:"INNER PLANET · EXTREME GREENHOUSE",copy:"A rocky world wrapped in thick clouds. Its surface is hidden beneath a dense carbon-dioxide atmosphere and intense pressure.",ids:[],position:[-13,0,-1],zoom:1.5,tag:"INNER PLANET",facts:["Thick carbon-dioxide atmosphere","Surface about 465°C","Retrograde rotation"]};
worlds.earth={...worlds.earth,position:[-11,0,-1],moons:["moon"],facts:["One natural moon","Liquid surface water","Nitrogen-oxygen atmosphere"]};
worlds.moon={...worlds.moon,position:[-8.2,.35,-2.2],journey:null,facts:["Mean distance: 384,400 km","Tidally locked to Earth","Apollo surface experiments operated until 1977"]};
worlds.mars={...worlds.mars,position:[-5,0,-4],moons:["phobos","deimos"],facts:["Two small moons","A day is about 24.6 hours","Home to Olympus Mons"]};
worlds.jupiter={...worlds.jupiter,position:[3,0,-7],moons:["io","europa","ganymede","callisto"],facts:["Largest planet","Great Red Spot is a long-lived storm","Four large Galilean moons"]};
worlds.saturn={...worlds.saturn,position:[12,0,-10],moons:["titan","enceladus"],facts:["Rings made mostly of ice and rocky particles","Low average density","Titan has hydrocarbon lakes"]};
worlds.uranus={title:"Uranus",kicker:"ICE GIANT · EXTREME AXIAL TILT",copy:"An ice giant that rotates on its side. Voyager 2 remains the only spacecraft to have made a close flyby of Uranus.",ids:["voyager"],position:[22,0,-12],zoom:1.2,tag:"ICE GIANT",moons:["miranda","titania","oberon"],facts:["Axial tilt about 98°","13 known rings","Voyager 2 flyby: 1986"]};
worlds.neptune={title:"Neptune",kicker:"ICE GIANT · DISTANT FRONTIER",copy:"A dynamic blue ice giant with powerful winds. Voyager 2 flew past Neptune in 1989 and revealed its moon Triton.",ids:["voyager"],position:[32,0,-14],zoom:1.2,tag:"ICE GIANT",moons:["triton"],facts:["One orbit takes about 165 Earth years","Very fast atmospheric winds","Triton has a retrograde orbit"]};
worlds.phobos={title:"Phobos",kicker:"MARS MOON · INNER SATELLITE",copy:"Phobos is the larger and closer of Mars’s two moons. Its irregular, heavily cratered surface is slowly moving toward the planet.",ids:[],position:[-1,0,-5],zoom:1.45,tag:"MARTIAN MOON",facts:["Mean radius: about 11 km","Orbits Mars in about 7.7 hours","Very close to Mars"]};
worlds.deimos={...worlds.deimos,ids:[],facts:["Mean radius: about 6 km","Orbits Mars in about 30.3 hours","Smaller than Phobos"]};
worlds.io={...worlds.io,position:[3,0,-7],facts:["Hundreds of active volcanoes","Strong tidal heating","Most volcanically active known world"]};
worlds.europa={...worlds.europa,position:[3,0,-7],ids:["voyager"],facts:["Ice-covered surface","Evidence for a subsurface ocean","Target of NASA’s Europa Clipper mission"]};
worlds.ganymede={...worlds.ganymede,position:[3,0,-7],ids:["voyager"],facts:["Largest moon in the Solar System","Has its own magnetic field","Ice and rock interior"]};
worlds.callisto={...worlds.callisto,position:[3,0,-7],ids:["voyager"],facts:["Ancient cratered surface","Low geological activity","Outer Galilean moon"]};
worlds.titan={...worlds.titan,position:[12,0,-10],ids:["voyager"],facts:["Dense nitrogen-rich atmosphere","Lakes of methane and ethane","Larger than Mercury"]};
worlds.enceladus={...worlds.enceladus,position:[12,0,-10],ids:["voyager"],facts:["Active south-polar plumes","Global subsurface ocean","Bright icy surface"]};
worlds.miranda={title:"Miranda",kicker:"URANUS MOON · PATCHWORK TERRAIN",copy:"Miranda has a strikingly varied surface with cliffs, ridges and large corona-like regions.",ids:["voyager"],position:[22,0,-12],zoom:1.2,tag:"URANIAN MOON",facts:["One of Uranus’s five major moons","Very varied terrain","Imaged by Voyager 2 in 1986"]};
worlds.titania={title:"Titania",kicker:"URANUS MOON · LARGEST URANIAN SATELLITE",copy:"Titania is the largest moon of Uranus, with a surface marked by large canyons and impact craters.",ids:["voyager"],position:[22,0,-12],zoom:1.2,tag:"URANIAN MOON",facts:["Largest moon of Uranus","Water ice and rocky material","Voyager 2 flyby imagery"]};
worlds.oberon={title:"Oberon",kicker:"URANUS MOON · OUTER MAJOR SATELLITE",copy:"Oberon is an ancient, heavily cratered moon orbiting farthest among Uranus’s five major satellites.",ids:["voyager"],position:[22,0,-12],zoom:1.2,tag:"URANIAN MOON",facts:["Heavily cratered surface","One of Uranus’s five major moons","Voyager 2 flyby imagery"]};
worlds.triton={title:"Triton",kicker:"NEPTUNE MOON · RETROGRADE ORBIT",copy:"Triton is Neptune’s largest moon and travels in a retrograde orbit, suggesting it was captured by Neptune’s gravity.",ids:["voyager"],position:[32,0,-14],zoom:1.2,tag:"NEPTUNIAN MOON",facts:["Retrograde orbit","Very cold icy surface","Voyager 2 flyby in 1989"]};
worlds.phobos={...worlds.phobos,ids:[],facts:["Mean radius: about 11 km","Orbits Mars in about 7.7 hours","Larger and closer to Mars than Deimos"]};
worlds.deimos={...worlds.deimos,ids:[],facts:["Mean radius: about 6 km","Orbits Mars in about 30.3 hours","Smaller and farther from Mars than Phobos"]};
worlds.io={title:"Io",kicker:"JUPITER MOON · VOLCANIC WORLD",copy:"Io is a volcanically active moon shaped by strong tidal interactions with Jupiter and neighbouring moons.",ids:["voyager","pioneer-10-11"],position:[7,0,-8],zoom:1.25,tag:"JOVIAN MOON"};
worlds.europa={title:"Europa",kicker:"JUPITER MOON · ICE-COVERED WORLD",copy:"Europa's icy surface and evidence for a subsurface ocean make it a major target in the search for habitable environments.",ids:["voyager","pioneer-10-11"],position:[7,0,-8],zoom:1.25,tag:"JOVIAN MOON"};
worlds.ganymede={title:"Ganymede",kicker:"JUPITER MOON · LARGEST NATURAL SATELLITE",copy:"Ganymede is the largest moon in the Solar System and has its own magnetic field.",ids:["voyager","pioneer-10-11"],position:[7,0,-8],zoom:1.25,tag:"JOVIAN MOON"};
worlds.callisto={title:"Callisto",kicker:"JUPITER MOON · ANCIENT CRATERED WORLD",copy:"Callisto is an ancient, heavily cratered moon with a surface that preserves a long record of impacts.",ids:["voyager","pioneer-10-11"],position:[7,0,-8],zoom:1.25,tag:"JOVIAN MOON"};
worlds.titan={title:"Titan",kicker:"SATURN MOON · DENSE ATMOSPHERE",copy:"Titan has a thick atmosphere and lakes and seas of liquid hydrocarbons at its surface. The scene here is a simplified artistic visualization.",ids:["voyager","pioneer-10-11"],position:[16,0,-12],zoom:1.2,tag:"SATURNIAN MOON"};
worlds.enceladus={title:"Enceladus",kicker:"SATURN MOON · ICY OCEAN WORLD",copy:"Enceladus is an icy moon known for plumes that eject water-rich material from its south polar region.",ids:["voyager","pioneer-10-11"],position:[16,0,-12],zoom:1.2,tag:"SATURNIAN MOON"};
const surfacePoints={
 moon:[
  {id:"lunar-module",title:"Apollo 11 · Eagle descent stage",label:"EAGLE LANDING SITE",copy:"The lower stage of Eagle remained at Tranquility Base after the ascent stage carried the astronauts back to lunar orbit."},
  {id:"apollo-12-alsep",title:"Apollo 12 · ALSEP science station",label:"LUNAR SCIENCE NETWORK",copy:"A set of instruments kept measuring the lunar environment after the crew returned to Earth. NASA ended ALSEP operations in 1977."}
 ],
 mars:[
  {id:"pathfinder-sojourner",title:"Pathfinder & Sojourner",label:"THE FIRST ROVER",copy:"Pathfinder delivered Sojourner to Ares Vallis in 1997, demonstrating a new way to explore the Martian surface."},
  {id:"opportunity",title:"Opportunity rover",label:"MER-B · MERIDIANI PLANUM",copy:"Opportunity explored Martian rocks and soil for many years, far beyond its original planned mission."},
  {id:"insight",title:"InSight lander",label:"LISTENING TO MARS",copy:"InSight studied the planet's interior using a seismometer and other geophysical instruments."}
 ]
};
const overlay=document.createElement("section");
overlay.id="br-universe";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-hidden","true");overlay.setAttribute("aria-label","Interactive 3D solar system explorer");
overlay.innerHTML='<canvas class="br-universe-canvas" aria-label="Interactive artistic 3D visualization of the Solar System. Drag to rotate and select a planet."></canvas><div class="br-universe-vignette" aria-hidden="true"></div><header class="br-universe-top"><a class="br-universe-brand" href="artifacts.html">BEYOND RELICS <span>THE SOLAR FRONTIERS EXPLORER</span></a><div class="br-universe-top-actions"><span class="br-universe-live">3D EXPLORATION</span><button id="br-universe-motion" type="button" aria-pressed="false">Pause orbits</button><button id="br-universe-reset" type="button">Reset view</button><button id="br-universe-close" type="button" aria-label="Close 3D explorer">×</button></div></header><div class="br-universe-intro" id="br-universe-intro"><small>AN INTERACTIVE JOURNEY THROUGH OUR COSMIC NEIGHBOURHOOD</small><h2>Choose your<br><em>destination.</em></h2><p>Select a planet in the scene or use the destination navigator below. Then discover the missions connected to that world.</p><span class="br-universe-scroll-hint">DRAG TO ORBIT · SCROLL TO ZOOM</span></div><aside class="br-universe-info" id="br-universe-info" aria-live="polite" hidden><div class="br-universe-info-main"><small id="br-universe-kicker"></small><h2 id="br-universe-title"></h2><p id="br-universe-copy"></p><div class="br-universe-facts" id="br-universe-facts"></div><div class="br-universe-moon-nav" id="br-universe-moon-nav" hidden><small>MOONS TO EXPLORE</small><div id="br-universe-moon-buttons"></div></div><button id="br-universe-land" class="br-universe-land" type="button" hidden>ENTER THE SURFACE <span aria-hidden="true">↗</span></button></div><div class="br-universe-archive"><div class="br-universe-record-heading"><span>MISSION ARCHIVE</span><span id="br-universe-count"></span><button id="br-universe-record-toggle" type="button" aria-expanded="false" aria-controls="br-universe-records">Explore missions</button></div><div class="br-universe-records" id="br-universe-records" hidden></div><a class="br-universe-enter" id="br-universe-enter" href="lunar-journey.html?from=moon" hidden>ENTER THE LUNAR SURFACE JOURNEY <span aria-hidden="true">↗</span></a></div><button id="br-universe-info-close" type="button" aria-label="Close destination information">×</button><p class="br-universe-fidelity">Celestial scene: artistic visualization · Not to scale.</p></aside><nav class="br-universe-nav" aria-label="Choose a destination"><div class="br-universe-nav-heading"><span>EXPLORE THE SOLAR SYSTEM</span><span>SELECT A WORLD</span></div><div class="br-universe-stops"><button type="button" class="br-universe-stop" data-world="sun"><i class="br-dot sun-dot"></i><span>Sun</span></button><button type="button" class="br-universe-stop" data-world="mercury"><i class="br-dot mercury-dot"></i><span>Mercury</span></button><button type="button" class="br-universe-stop" data-world="venus"><i class="br-dot venus-dot"></i><span>Venus</span></button><button type="button" class="br-universe-stop" data-world="earth"><i class="br-dot earth-dot"></i><span>Earth</span></button><button type="button" class="br-universe-stop" data-world="moon"><i class="br-dot moon-dot"></i><span>Moon</span></button><button type="button" class="br-universe-stop" data-world="mars"><i class="br-dot mars-dot"></i><span>Mars</span></button><button type="button" class="br-universe-stop" data-world="jupiter"><i class="br-dot jupiter-dot"></i><span>Jupiter</span></button><button type="button" class="br-universe-stop" data-world="saturn"><i class="br-dot saturn-dot"></i><span>Saturn</span></button><button type="button" class="br-universe-stop" data-world="uranus"><i class="br-dot uranus-dot"></i><span>Uranus</span></button><button type="button" class="br-universe-stop" data-world="neptune"><i class="br-dot neptune-dot"></i><span>Neptune</span></button><button type="button" class="br-universe-stop" data-world="deep"><i class="br-dot deep-dot"></i><span>Deep Space</span></button></div></nav><section class="br-universe-surface-panel" id="br-universe-surface-panel" aria-label="Surface exploration" hidden><header><div><small id="br-universe-surface-kicker">SURFACE EXPEDITION</small><h2 id="br-universe-surface-title"></h2><p id="br-universe-surface-subtitle"></p></div><button id="br-universe-surface-exit" type="button">← BACK TO ORBIT</button></header><div class="br-universe-surface-content"><nav id="br-universe-surface-points" aria-label="Explore mission sites"></nav><article id="br-universe-surface-note" aria-live="polite"><small id="br-universe-surface-label"></small><h3 id="br-universe-surface-point-title"></h3><p id="br-universe-surface-point-copy"></p><a id="br-universe-surface-link" href="artifacts.html">OPEN THE 3D EXHIBIT ↗</a></article></div><p class="br-universe-surface-status" id="br-universe-surface-status">Preparing the surface scene…</p></section><div class="br-universe-loader" id="br-universe-loader"><span></span>Preparing the 3D universe…</div><section class="br-universe-fallback" id="br-universe-fallback" hidden><h2>Explore the mission archive</h2><p>The 3D view is unavailable on this device or browser. You can still open every mission record below.</p><div id="br-universe-fallback-links"></div></section>';
document.body.appendChild(overlay);
let returnFocus=launcher;
function texture(kind){
 const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=512;const c=canvas.getContext("2d");
 const palettes={mercury:["#c7b7a4","#81786f","#38383d"],venus:["#f0d5a0","#c18b55","#68452f"],earth:["#8cb7c6","#235a77","#12283d"],moon:["#d3d0c7","#858b8d","#3a424b"],mars:["#e9a47b","#a64d35","#51251f"],jupiter:["#dfc39b","#9b7559","#59463e"],saturn:["#e5d1a8","#b89b6e","#67533d"],uranus:["#b7e0df","#5eaaa9","#285d69"],neptune:["#80b9ed","#285caa","#132b65"]};
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
const planetGroups={},worldRadii={};
const orbitingMoons=[];
function addPlanet(key,kind,pos,radius){
 const group=new THREE.Group();group.position.set(pos[0],pos[1],pos[2]);group.userData.world=key;scene.add(group);
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,72,56),new THREE.MeshStandardMaterial({map:texture(kind),roughness:.94,metalness:.01}));mesh.userData.world=key;group.add(mesh);
 const halo=new THREE.Mesh(new THREE.SphereGeometry(radius*1.045,48,32),new THREE.MeshBasicMaterial({color:kind==="mars"?0xe18a68:kind==="moon"?0xc5d2dc:0x78b9d1,transparent:true,opacity:.055,side:THREE.BackSide}));group.add(halo);
 const atmosphereColor=kind==="earth"?0x69c8ff:kind==="mars"?0xf18a63:kind==="moon"?0xb8d6e8:kind==="jupiter"?0xe6bd8e:kind==="uranus"?0x7bd6d6:kind==="neptune"?0x5c8ff2:kind==="venus"?0xe7b56e:kind==="mercury"?0x9a9288:0xd8c5a0;
 const atmosphere=new THREE.Mesh(
  new THREE.SphereGeometry(radius*1.085,48,32),
  new THREE.ShaderMaterial({
   uniforms:{glowColor:{value:new THREE.Color(atmosphereColor)},glowStrength:{value:kind==="moon"?.12:kind==="mars"?.28:.24}},
   vertexShader:`varying vec3 vNormal; varying vec3 vViewPosition;
    void main(){
     vec4 mvPosition=modelViewMatrix*vec4(position,1.0);
     vNormal=normalize(normalMatrix*normal);
     vViewPosition=-mvPosition.xyz;
     gl_Position=projectionMatrix*mvPosition;
    }`,
   fragmentShader:`uniform vec3 glowColor; uniform float glowStrength;
    varying vec3 vNormal; varying vec3 vViewPosition;
    void main(){
     float facing=max(dot(normalize(vNormal),normalize(vViewPosition)),0.0);
     float rim=pow(1.0-facing,2.65);
     float softRim=smoothstep(0.05,0.95,rim);
     gl_FragColor=vec4(glowColor,softRim*glowStrength);
    }`,
   transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.FrontSide
  })
 );
 atmosphere.renderOrder=2;group.add(atmosphere);
 if(kind==="saturn"||kind==="uranus"){const ring=new THREE.Mesh(new THREE.RingGeometry(radius*(kind==="saturn"?1.35:1.5),radius*(kind==="saturn"?2.25:1.9),128),new THREE.MeshStandardMaterial({color:kind==="saturn"?0xcab58d:0x8ba5a7,roughness:.85,metalness:.08,side:THREE.DoubleSide,transparent:true,opacity:kind==="saturn"?.72:.3}));ring.rotation.x=kind==="saturn"?Math.PI/2.35:Math.PI/2.08;group.add(ring);}
 if(kind==="jupiter"){const band=new THREE.Mesh(new THREE.TorusGeometry(radius*1.02,.018,4,100),new THREE.MeshBasicMaterial({color:0xe2c49c,transparent:true,opacity:.18}));band.rotation.x=.35;group.add(band);}
 planetGroups[key]=group;worldRadii[key]=radius;
}
function orbit(x,z,rx,rz){
 const curve=new THREE.EllipseCurve(x,0,rx,rz,0,Math.PI*2,false,0);const pts=curve.getPoints(180).map(p=>new THREE.Vector3(p.x,0,p.y+z));
 const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x8aa9c4,transparent:true,opacity:.17}));scene.add(line);
}
function addSatellite(parentKey,key,radius,distance,speed,color,phase=0){
 const parent=planetGroups[parentKey];if(!parent)return;
 const center=parent.position.clone();
 const orbitCurve=new THREE.EllipseCurve(center.x,center.z,distance,distance*.82,0,Math.PI*2,false,0);
 const orbitPoints=orbitCurve.getPoints(96).map(p=>new THREE.Vector3(p.x,center.y+.02,p.y));
 const orbitLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints),new THREE.LineBasicMaterial({color:0x9bb8d0,transparent:true,opacity:.16}));
 scene.add(orbitLine);
 const group=new THREE.Group();group.position.set(center.x+Math.cos(phase)*distance,center.y+.04,center.z+Math.sin(phase)*distance*.82);group.userData.world=key;
 const moon=new THREE.Mesh(new THREE.SphereGeometry(radius,36,28),new THREE.MeshStandardMaterial({color,roughness:.98,metalness:0}));
 moon.userData.world=key;group.add(moon);scene.add(group);
 planetGroups[key]=group;worldRadii[key]=radius;
 orbitingMoons.push({group,center,distance,speed,phase});
}
function overviewCameraPosition(){const aspect=Math.max(.42,overlay.clientWidth/Math.max(1,overlay.clientHeight));const halfFov=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));const distance=62/(2*halfFov*aspect)*1.08;return new THREE.Vector3(0,Math.max(82,distance),-7);}
function buildScene(){
 const canvas=overlay.querySelector(".br-universe-canvas");
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:"low-power"});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<700?1.15:1.5));renderer.setSize(overlay.clientWidth,overlay.clientHeight);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 scene=new THREE.Scene();scene.background=new THREE.Color(0x050b15);scene.fog=new THREE.FogExp2(0x050b15,.0022);
 camera=new THREE.PerspectiveCamera(44,overlay.clientWidth/overlay.clientHeight,.1,900);camera.up.set(0,0,-1);camera.position.copy(overviewCameraPosition());camera.lookAt(0,0,-7);
 scene.add(new THREE.HemisphereLight(0x9dbbd5,0x171a26,1.05));
 const sunLight=new THREE.PointLight(0xffd5a0,360,180);sunLight.position.set(-20,7,0);scene.add(sunLight);
 const fill=new THREE.DirectionalLight(0x9dc6e4,1.1);fill.position.set(10,12,20);scene.add(fill);
 const starPos=[];for(let i=0;i<3200;i++)starPos.push((Math.random()-.5)*240,(Math.random()-.5)*130,(Math.random()-.5)*180);
 const sg=new THREE.BufferGeometry();sg.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xddeaff,size:.13,transparent:true,opacity:.8})));surfaceRoot=new THREE.Group();surfaceRoot.visible=false;scene.add(surfaceRoot);
 const sun=new THREE.Mesh(new THREE.SphereGeometry(3.2,64,48),new THREE.MeshBasicMaterial({color:0xffd49a}));sun.position.set(-20,0,0);sun.userData.world="sun";scene.add(sun);planetGroups.sun=sun;worldRadii.sun=3.2;
 const glow=new THREE.Mesh(new THREE.SphereGeometry(4.2,40,28),new THREE.MeshBasicMaterial({color:0xffb66f,transparent:true,opacity:.09,side:THREE.BackSide}));glow.position.copy(sun.position);scene.add(glow);
 addPlanet("mercury","mercury",[-16,0,1],.42);addPlanet("venus","venus",[-13,0,-1],.72);addPlanet("earth","earth",[-11,0,-1],1.15);addPlanet("moon","moon",[-8.2,.35,-2.2],.34);orbit(-11,-1,2.8,2.8);addPlanet("mars","mars",[-5,0,-4],.68);addPlanet("jupiter","jupiter",[3,0,-7],2.05);addPlanet("saturn","saturn",[12,0,-10],1.72);addPlanet("uranus","uranus",[22,0,-12],1.2);addPlanet("neptune","neptune",[32,0,-14],1.18);
 addSatellite("mars","phobos",.22,1.55,.012,0xb98b75,.4);addSatellite("mars","deimos",.16,2.05,.008,0x9a8c82,2.1);
 addSatellite("jupiter","io",.25,3.35,.004,0xd6c3a0,.2);addSatellite("jupiter","europa",.22,3.9,.0032,0x9da8aa,1.8);addSatellite("jupiter","ganymede",.29,4.55,.0025,0xb8a38a,3.2);addSatellite("jupiter","callisto",.24,5.15,.002,0xc5bca8,4.7);
 addSatellite("saturn","titan",.27,2.85,.003,0xd9c7a2,.7);addSatellite("saturn","enceladus",.17,3.55,.0022,0xb9b7ad,2.6);addSatellite("uranus","miranda",.13,1.9,.003,0x9ba5a8,.4);addSatellite("uranus","titania",.2,2.65,.0023,0xb7aaa0,1.7);addSatellite("uranus","oberon",.18,3.25,.0018,0x918a83,3.1);addSatellite("neptune","triton",.2,2.25,.002,0x9fb9c5,2.4);
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
 canvas.addEventListener("pointerup",e=>{dragging=false;if(moved)return;const r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);if(surfaceMode&&surfaceRoot){const hits=raycaster.intersectObjects(surfaceRoot.children,true);for(const hit of hits){let o=hit.object;while(o&&!o.userData.surfacePoint)o=o.parent;if(o&&o.userData.surfacePoint){showSurfacePoint(o.userData.surfacePoint);return;}}return;}const hits=raycaster.intersectObjects(scene.children,true);for(const hit of hits){let o=hit.object;while(o&&!o.userData.world)o=o.parent;if(o&&o.userData.world){showWorld(o.userData.world);break;}}});
 canvas.addEventListener("pointercancel",()=>dragging=false);
 canvas.tabIndex=0;
 canvas.addEventListener("keydown",event=>{if(event.key==="ArrowLeft"){targetY-=.14;event.preventDefault();}else if(event.key==="ArrowRight"){targetY+=.14;event.preventDefault();}else if(event.key==="ArrowUp"){targetX=Math.max(-.5,targetX-.1);event.preventDefault();}else if(event.key==="ArrowDown"){targetX=Math.min(.5,targetX+.1);event.preventDefault();}else if(event.key==="+"||event.key==="="){targetZoom=Math.max(.72,targetZoom-.08);event.preventDefault();}else if(event.key==="-"){targetZoom=Math.min(1.75,targetZoom+.08);event.preventDefault();}else if(event.key==="0"){resetView();event.preventDefault();}});
 canvas.addEventListener("wheel",e=>{e.preventDefault();targetZoom=Math.max(.72,Math.min(1.75,targetZoom+(e.deltaY>0?.06:-.06)));},{passive:false});
 canvas.addEventListener("webglcontextlost",event=>{event.preventDefault();active=false;cancelAnimationFrame(raf);raf=0;$("br-universe-loader").hidden=false;$("br-universe-loader").textContent="Graphics paused. The destination list and mission archive remain available.";});
 canvas.addEventListener("webglcontextrestored",()=>{if(renderer)renderer.resetState();$("br-universe-loader").hidden=true;active=!document.hidden;if(active)startLoop();});
 observer=new ResizeObserver(()=>{if(!renderer||!camera)return;const w=overlay.clientWidth,h=overlay.clientHeight;if(!w||!h)return;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<700?1.15:1.5));camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);if(!selected&&!surfaceMode){cameraGoal=overviewCameraPosition();camera.position.copy(cameraGoal);camera.lookAt(0,0,-7);}});observer.observe(overlay);
 $("br-universe-loader").hidden=true;startLoop();
}
function transitionCameraTo(position,duration=1.65){
 const target=new THREE.Vector3(position.x,position.y,position.z);
 if(reduced.matches){cameraGoal=target;return;}
 if(window.gsap){
  if(!cameraGoal)cameraGoal=target.clone();
  window.gsap.killTweensOf(cameraGoal);
  window.gsap.to(cameraGoal,{x:target.x,y:target.y,z:target.z,duration,ease:"power3.inOut",overwrite:true});
 }else cameraGoal=target;
}
const authenticWorldModelURLs={moon:"https://svs.gsfc.nasa.gov/vis/a010000/a014900/a014959/moon_small.glb"};
const authenticWorldModelPromises={};
async function loadAuthenticWorldModel(key){
 const url=authenticWorldModelURLs[key],group=planetGroups[key];
 if(!url||!group)return false;
 if(group.userData.authenticModel)return true;
 if(authenticWorldModelPromises[key])return authenticWorldModelPromises[key];
 authenticWorldModelPromises[key]=(async()=>{
  try{
   const loader=await getSurfaceLoader(),gltf=await loader.loadAsync(url),model=new THREE.Group();
   model.add(gltf.scene);
   const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
   const max=Math.max(size.x,size.y,size.z)||1,scale=(worldRadii[key]*2)/max;
   model.scale.setScalar(scale);model.position.set(-center.x*scale,-center.y*scale,-center.z*scale);
   model.userData.world=key;
   const placeholder=group.children.find(child=>child.isMesh&&child.geometry&&child.geometry.type==="SphereGeometry");
   if(placeholder){group.remove(placeholder);placeholder.geometry.dispose();const materials=Array.isArray(placeholder.material)?placeholder.material:[placeholder.material];materials.forEach(material=>{if(material.map)material.map.dispose();material.dispose();});}
   group.add(model);group.userData.authenticModel=model;
   const chip=document.createElement("span");chip.textContent="NASA LRO 3D MODEL";chip.dataset.modelSource=key;$("br-universe-facts").append(chip);
   return true;
  }catch(error){delete authenticWorldModelPromises[key];return false;}
 })();
 return authenticWorldModelPromises[key];
}
function getSurfaceLoader(){
 if(window.__brSurfaceGLTFLoader)return window.__brSurfaceGLTFLoader;
 window.__brSurfaceGLTFLoader=import("https://cdn.jsdelivr.net/npm/three@0.188.0/examples/jsm/loaders/GLTFLoader.js").then(module=>{gltfLoaderPromise=new module.GLTFLoader();return gltfLoaderPromise;});
 return window.__brSurfaceGLTFLoader;
}
function addSurfaceMarker(group,point,position,index){
 const marker=new THREE.Group();marker.position.set(position[0],position[1],position[2]);marker.userData.surfacePoint=point.id;marker.userData.phase=index*.8;
 const core=new THREE.Mesh(new THREE.SphereGeometry(.16,20,16),new THREE.MeshBasicMaterial({color:0x8edce8,transparent:true,opacity:.96}));
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.34,.025,8,36),new THREE.MeshBasicMaterial({color:0xe2c28d,transparent:true,opacity:.9}));ring.rotation.x=Math.PI/2;ring.position.y=-.08;
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.72,8),new THREE.MeshBasicMaterial({color:0x8edce8,transparent:true,opacity:.45}));stem.position.y=-.42;
 marker.add(core,ring,stem);group.add(marker);surfaceHotspots.push(marker);return marker;
}
function addSurfaceTerrain(group,key){
 const moon=key==="moon",segments=72,geo=new THREE.PlaneGeometry(68,68,segments,segments),pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getY(i);let h=moon?(Math.sin(x*.23)*Math.cos(z*.2)*.22):Math.sin(x*.14+z*.18)*.34+Math.sin(z*.39)*.08;if(moon){[[ -7,-4,3.2],[4,7,2.1],[10,-8,2.6],[-12,11,1.8]].forEach(([cx,cz,r])=>{const d=Math.hypot(x-cx,z-cz);h-=Math.exp(-Math.pow(d/(r*.72),2))*.62;h+=Math.exp(-Math.pow((d-r)/(r*.15),2))*.16;});}pos.setZ(i,h);}
 geo.computeVertexNormals();const terrain=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:moon?0x777b80:0x80503e,roughness:.98,metalness:0}));terrain.rotation.x=-Math.PI/2;terrain.position.y=-.22;group.add(terrain);
 const rockMat=new THREE.MeshStandardMaterial({color:moon?0x96989b:0xa56b50,roughness:1});let seed=key==="moon"?31:67;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 for(let i=0;i<90;i++){const x=(rand()-.5)*48,z=(rand()-.5)*48;if(Math.abs(x)<3&&Math.abs(z)<3)continue;const size=.1+rand()*.32;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(size,0),rockMat);rock.position.set(x,-.16+rand()*.08,z);rock.rotation.set(rand(),rand()*Math.PI,rand());rock.scale.y=.45+rand()*.8;group.add(rock);}
 const horizon=new THREE.Mesh(new THREE.SphereGeometry(110,32,24),new THREE.MeshBasicMaterial({color:moon?0x080d16:0x1a1014,side:THREE.BackSide}));horizon.position.y=-5;group.add(horizon);
}
async function loadSurfaceModel(group,url,id,position,targetSize){
 try{
  const loader=await getSurfaceLoader(),gltf=await loader.loadAsync(url),model=new THREE.Group();model.add(gltf.scene);
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),max=Math.max(size.x,size.y,size.z)||1;
  model.scale.setScalar(targetSize/max);const scaled=new THREE.Box3().setFromObject(model);
  model.position.set(position[0],-scaled.min.y-.2,position[2]);model.userData.surfacePoint=id;group.add(model);return true;
 }catch(error){return false;}
}
async function ensureSurface(key){
 if(surfaceGroups[key])return;
 const group=new THREE.Group();group.name=key+"-surface-environment";surfaceGroups[key]=group;surfaceRoot.add(group);surfaceHotspots=[];addSurfaceTerrain(group,key);
 const records=surfacePoints[key]||[];
 const positions=key==="moon"?[[-3,.45,0],[3,.45,-1]]:[[-4,.45,1],[0,.45,-2],[4,.45,1]];
 records.forEach((point,i)=>addSurfaceMarker(group,point,positions[i]||[i*2,.45,0],i));
 if(key==="moon"){
  const ok=await loadSurfaceModel(group,"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/apollo-lunar-module/Apollo%20Lunar%20Module.glb","lunar-module",[-3,0,0],4.2);
  if(!ok)$("br-universe-surface-status").textContent="NASA's 3D lander model could not be loaded right now. The interactive landing-site markers are still available.";
  else $("br-universe-surface-status").textContent="NASA 3D model loaded · Apollo Lunar Module · Select a glowing field marker to inspect the mission.";
 }else{
  const ok=await loadSurfaceModel(group,"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-exploration-rover---opportunity-%28mer-b%29/Mars%20Exploration%20Rover%20-%20Opportunity%20%28MER-B%29.glb","opportunity",[0,0,-2],3.6);
  const insight=await loadSurfaceModel(group,"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/insight-cruise-lander/InSight%20Cruise%20Lander%20%28arm%20deployed%29.glb","insight",[4,0,1],3.1);
  $("br-universe-surface-status").textContent=ok&&insight?"NASA 3D models loaded · Opportunity and InSight · Select a glowing field marker to inspect the mission.":"NASA model service is unavailable for one or more objects. The mission markers remain interactive.";
 }
}
function showSurfacePoint(id){
 const point=(surfacePoints[surfaceWorldKey]||[]).find(p=>p.id===id);if(!point)return;
 const record=data.find(item=>item.id===id);$("br-universe-surface-label").textContent=point.label;
 $("br-universe-surface-point-title").textContent=point.title;
 $("br-universe-surface-point-copy").textContent=record?(record.short||point.copy):point.copy;
 $("br-universe-surface-link").href="artifact-details.html?id="+encodeURIComponent(id)+"&from=universe&world="+encodeURIComponent(surfaceWorldKey);
 $("br-universe-surface-note").classList.add("is-active");
 const marker=surfaceHotspots.find(h=>h.userData.surfacePoint===id);
 if(marker){const p=marker.position;surfaceLookAt.set(p.x,p.y,p.z);transitionCameraTo({x:p.x,y:p.y+5.5,z:p.z+9},1.1);}
 document.querySelectorAll(".br-universe-surface-point").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.point===id)));
}
async function enterSurface(key){
 if(!surfacePoints[key]||!surfaceRoot)return;
 surfaceMode=true;surfaceWorldKey=key;surfaceHotspots=[];surfaceRoot.visible=true;
 scene.children.forEach(object=>{if(object!==surfaceRoot&&!object.isLight&&!object.isPoints)object.visible=false;});
 Object.values(surfaceGroups).forEach(group=>group.visible=false);
 $("br-universe-surface-panel").hidden=false;overlay.classList.add("br-universe-surface-active");
 $("br-universe-surface-title").textContent=key==="moon"?"The lunar surface":"The Martian surface";
 $("br-universe-surface-kicker").textContent=key==="moon"?"LUNAR FIELD EXPEDITION · APOLLO":"MARS FIELD EXPEDITION · ROBOTIC EXPLORATION";
 $("br-universe-surface-subtitle").textContent=key==="moon"?"Explore the landing site and the instruments left behind.":"Explore rover and lander sites through real NASA 3D models and mission records.";
 $("br-universe-surface-status").textContent="Building the surface environment and loading NASA 3D models…";
 const list=$("br-universe-surface-points");list.replaceChildren();
 (surfacePoints[key]||[]).forEach(point=>{const button=document.createElement("button");button.type="button";button.className="br-universe-surface-point";button.dataset.point=point.id;button.textContent=point.title;button.addEventListener("click",()=>showSurfacePoint(point.id));list.append(button);});
 camera.up.set(0,1,0);rotX=0;rotY=0;targetX=rotX;targetY=rotY;focusTarget=null;surfaceLookAt=new THREE.Vector3(0,0,0);transitionCameraTo({x:0,y:6,z:15},1.5);targetZoom=1;
 const group=surfaceGroups[key];if(group)group.visible=true;else await ensureSurface(key);
 surfaceHotspots=[];surfaceGroups[key].traverse(object=>{if(object.userData&&object.userData.surfacePoint)surfaceHotspots.push(object);});
 scene.rotation.set(0,0,0);
 if(key==="moon")showSurfacePoint("lunar-module");else showSurfacePoint("opportunity");
}
function exitSurface(){
 if(!surfaceMode)return;const key=surfaceWorldKey;surfaceMode=false;surfaceWorldKey=null;camera.up.set(0,0,-1);surfaceRoot.visible=false;scene.children.forEach(object=>{if(object!==surfaceRoot)object.visible=true;});
 overlay.classList.remove("br-universe-surface-active");$("br-universe-surface-panel").hidden=true;surfaceLookAt=null;resetView();if(key)showWorld(key);
}
function showWorld(key){
 const cfg=worlds[key],group=planetGroups[key];if(!cfg||!group)return;selected=key;
 $("br-universe-intro").classList.add("is-away");
 const panel=$("br-universe-info"),toggle=$("br-universe-record-toggle"),list=$("br-universe-records");
 panel.hidden=false;panel.classList.remove("has-records");
 $("br-universe-kicker").textContent=cfg.kicker;$("br-universe-title").textContent=cfg.title;$("br-universe-copy").textContent=cfg.copy;
 const facts=$("br-universe-facts");facts.replaceChildren();(cfg.facts||[]).forEach(value=>{const chip=document.createElement("span");chip.textContent=value;facts.append(chip);});if(authenticWorldModelURLs[key]){if(planetGroups[key].userData.authenticModel){const chip=document.createElement("span");chip.textContent="NASA LRO 3D MODEL";facts.append(chip);}else{const chip=document.createElement("span");chip.textContent="Loading NASA LRO model…";facts.append(chip);loadAuthenticWorldModel(key).then(ok=>{if(selected!==key||!chip.isConnected)return;if(ok)chip.textContent="NASA LRO 3D MODEL";else chip.textContent="NASA model unavailable · visual fallback active";});}}
 const moonNav=$("br-universe-moon-nav"),moonButtons=$("br-universe-moon-buttons");moonButtons.replaceChildren();(cfg.moons||[]).forEach(key=>{const b=document.createElement("button");b.type="button";b.textContent=worlds[key].title;b.addEventListener("click",()=>showWorld(key));moonButtons.append(b);});moonNav.hidden=!(cfg.moons&&cfg.moons.length);
 list.replaceChildren();list.hidden=true;
 const records=data.filter(item=>cfg.ids.includes(item.id));
 $("br-universe-count").textContent=String(records.length).padStart(2,"0")+" RECORDS";
 records.forEach(item=>{const a=document.createElement("a");a.className="br-universe-record";a.href="artifact-details.html?id="+encodeURIComponent(item.id)+"&from=universe&world="+encodeURIComponent(key);const copy=document.createElement("span");copy.textContent=item.title;const arrow=document.createElement("b");arrow.textContent="VIEW EXHIBIT ↗";a.append(copy,arrow);list.append(a);});
 if(!records.length){const p=document.createElement("p");p.className="br-universe-empty";p.textContent="No equipment records are currently catalogued for this destination. Browse the complete archive.";list.append(p);}
 toggle.hidden=!records.length;toggle.textContent=records.length?"Explore "+records.length+" missions":"No mission records";toggle.setAttribute("aria-expanded","false");
 document.querySelectorAll(".br-universe-stop").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.world===key)));
 const enter=$("br-universe-enter");enter.hidden=!cfg.journey;if(cfg.journey)enter.href=cfg.journey;const land=$("br-universe-land");land.hidden=!surfacePoints[key];
 const p=group.position,radius=worldRadii[key]||1,distance=Math.max(3.2,Math.min(17,radius*5.8));
 focusTarget=p.clone();transitionCameraTo({x:p.x,y:p.y+distance*.34,z:p.z+distance});targetZoom=1;
}function resetView(){if(surfaceMode){exitSurface();return;}motionPaused=false;syncMotionButton();selected=null;focusTarget=null;transitionCameraTo(overviewCameraPosition(),1.25);targetZoom=1;targetX=0;targetY=0;$("br-universe-info").hidden=true;$("br-universe-info").classList.remove("has-records");$("br-universe-records").hidden=true;$("br-universe-record-toggle").setAttribute("aria-expanded","false");$("br-universe-intro").classList.remove("is-away");document.querySelectorAll(".br-universe-stop").forEach(b=>b.setAttribute("aria-pressed","false"));}
function startLoop(){if(raf)return;const frame=(now=0)=>{if(!active){raf=0;return;}raf=requestAnimationFrame(frame);const delta=frame.lastTime?Math.min((now-frame.lastTime)/16.667,2):1;frame.lastTime=now;if(surfaceMode&&surfaceRoot){const ease=1-Math.pow(.955,delta);rotX+=(targetX-rotX)*ease;rotY+=(targetY-rotY)*ease;surfaceRoot.rotation.set(rotX,rotY,0);const base=cameraGoal||new THREE.Vector3(0,5,14);const desired=base.clone().multiplyScalar(targetZoom);camera.position.lerp(desired,reduced.matches?1:1-Math.pow(.94,delta));const aim=(surfaceLookAt||new THREE.Vector3()).clone().applyEuler(surfaceRoot.rotation);camera.lookAt(aim);surfaceHotspots.forEach(h=>{if(h.children[0]){const pulse=1+Math.sin(now*.003+h.userData.phase)*.08;h.children[0].scale.setScalar(pulse);}});renderer.render(scene,camera);return;}if(!reduced.matches&&!motionPaused&&!dragging){targetY+=.00022*delta;moonAngle+=.00105*delta;planetGroups.moon.position.set(-11+Math.cos(moonAngle)*2.8,.35,-1+Math.sin(moonAngle)*2.8);}if(!reduced.matches&&!motionPaused&&!dragging){orbitingMoons.forEach(m=>{const a=now*.001*m.speed*60+m.phase;m.group.position.set(m.center.x+Math.cos(a)*m.distance,m.center.y+.04,m.center.z+Math.sin(a)*m.distance*.82);});}if(focusTarget&&selected&&planetGroups[selected])focusTarget.copy(planetGroups[selected].position);const easing=1-Math.pow(.955,delta);rotX+=(targetX-rotX)*easing;rotY+=(targetY-rotY)*easing;scene.rotation.set(rotX,rotY,0);Object.values(planetGroups).forEach(g=>{const rotating=g.userData.authenticModel||g.children[0];if(rotating)rotating.rotation.y+=.00055*delta;});const base=cameraGoal||overviewCameraPosition();const desired=new THREE.Vector3(base.x*targetZoom,base.y*targetZoom,base.z*targetZoom);if(focusTarget)desired.applyEuler(scene.rotation);camera.position.lerp(desired,reduced.matches?1:1-Math.pow(.965,delta));const aim=focusTarget?focusTarget.clone().applyEuler(scene.rotation):new THREE.Vector3(0,0,-5);camera.lookAt(aim);renderer.render(scene,camera);};frame();}
function loadThree(){if(window.THREE)return Promise.resolve(window.THREE);if(window.__brThreePromise)return window.__brThreePromise;window.__brThreePromise=import("https://cdn.jsdelivr.net/npm/three@0.188.0/build/three.module.js").then(T=>{window.THREE=T;return T;}).catch(error=>{window.__brThreePromise=null;throw error;});return window.__brThreePromise;}
async function openUniverse(event){
 returnFocus=event&&event.currentTarget?event.currentTarget:launcher;overlay.classList.add("is-open");overlay.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";active=true;$("br-universe-close").focus();$("br-universe-loader").hidden=false;
 try{if(!data.length){const r=await fetch("data/artifacts.json");if(!r.ok)throw new Error("Archive unavailable");data=await r.json();}THREE=await loadThree();if(!renderer)buildScene();else{renderer.setSize(overlay.clientWidth,overlay.clientHeight);startLoop();}const requested=new URLSearchParams(location.search).get("openWorld");if(requested&&worlds[requested])showWorld(requested);}
 catch(error){$("br-universe-loader").hidden=true;$("br-universe-fallback").hidden=false;const links=$("br-universe-fallback-links");links.replaceChildren();(data.length?data:[]).forEach(item=>{const a=document.createElement("a");a.href="artifact-details.html?id="+encodeURIComponent(item.id);a.textContent=item.title;links.append(a);});}
}
function closeUniverse(){active=false;cancelAnimationFrame(raf);raf=0;overlay.classList.remove("is-open");overlay.setAttribute("aria-hidden","true");document.body.style.overflow="";if(returnFocus&&returnFocus.isConnected)returnFocus.focus();}
launcher.addEventListener("click",openUniverse);
if(new URLSearchParams(location.search).has("openWorld"))openUniverse({currentTarget:launcher});
const motionButton=$("br-universe-motion");
function syncMotionButton(){motionButton.textContent=motionPaused?"Resume orbits":"Pause orbits";motionButton.setAttribute("aria-pressed",String(motionPaused));}
motionButton.addEventListener("click",()=>{motionPaused=!motionPaused;syncMotionButton();});
if(reduced.matches){motionButton.disabled=true;motionButton.textContent="Motion reduced";motionButton.title="Your device requests reduced motion.";}
document.querySelectorAll("[data-world]").forEach(b=>b.addEventListener("click",()=>showWorld(b.dataset.world)));$("br-universe-land").addEventListener("click",()=>enterSurface(selected));$("br-universe-surface-exit").addEventListener("click",exitSurface);
$("br-universe-close").addEventListener("click",closeUniverse);$("br-universe-reset").addEventListener("click",resetView);$("br-universe-info-close").addEventListener("click",resetView);$("br-universe-record-toggle").addEventListener("click",()=>{const list=$("br-universe-records"),button=$("br-universe-record-toggle"),expanded=button.getAttribute("aria-expanded")==="true";list.hidden=expanded;button.setAttribute("aria-expanded",String(!expanded));button.textContent=expanded?"Explore "+$("br-universe-count").textContent.split(" ")[0]+" missions":"Hide mission records";$("br-universe-info").classList.toggle("has-records",!expanded);});
overlay.addEventListener("click",e=>{if(e.target===overlay)closeUniverse();});
document.addEventListener("keydown",e=>{if(!overlay.classList.contains("is-open"))return;if(e.key==="Escape"){closeUniverse();return;}if(e.key==="Tab"){const items=[...overlay.querySelectorAll("button:not([disabled]),a[href],canvas[tabindex]")].filter(x=>!x.hidden);if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else if(active)startLoop();});
window.addEventListener("pagehide",()=>{active=false;cancelAnimationFrame(raf);if(observer)observer.disconnect();if(scene){const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material){for(const material of (Array.isArray(object.material)?object.material:[object.material])){materials.add(material);for(const value of Object.values(material)){if(value&&value.isTexture)textures.add(value);}}}});textures.forEach(texture=>texture.dispose());geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());}if(renderer)renderer.dispose();});
})();