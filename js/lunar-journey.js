(function(){
"use strict";
const $=id=>document.getElementById(id);
const canvas=$("lj-canvas"),stage=$("lj-stage"),fallback=$("lj-fallback");
if(!window.THREE||!canvas){fallback.hidden=false;canvas.hidden=true;return;}
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let renderer,scene,camera,raf=0,observer,started=false,paused=reduced,sceneIndex=0,elapsed=0,last=0,drag=false,lastX=0,lastY=0,rotX=0,rotY=0,zoom=1,autoTimer=0;
const clock=new THREE.Clock(),raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),pickables=[];
const scenes=[
 {kicker:"01 / DEPARTURE",title:"A distant world",description:"From Earth, the Moon is a world in the distance. The journey begins by looking outward—and asking what people left there.",fact:"A real mission. A real landing site. A story told through its surviving hardware.",camera:[0,2,29],look:[0,0,-17],moonScale:1,earth:true},
 {kicker:"02 / APPROACH",title:"The Moon comes closer",description:"The camera glides toward the lunar surface. Craters and ridges grow into view, turning a bright point in the sky into a place we can investigate.",fact:"The approach is an artistic camera journey, not a reconstruction of Apollo flight telemetry.",camera:[0,1,-2],look:[0,0,-17],moonScale:1.08,earth:true},
 {kicker:"03 / WHAT STAYED",title:"A station on the surface",description:"Apollo crews deployed instruments that kept measuring the lunar environment after astronauts returned to Earth. Apollo 12's ALSEP station was deployed on 19 November 1969.",fact:"NASA ended ALSEP operations on 30 September 1977. The instruments remained at their lunar sites.",surface:true,camera:[0,2.2,10.5],look:[0,-.5,-2]},
 {kicker:"04 / THE SIGNAL",title:"The instrument fell silent. The evidence stayed.",description:"The Apollo Passive Seismic Experiment recorded lunar ground motion. Archived observations let researchers revisit measurements long after the stations were switched off.",fact:"The signal motif shown here is illustrative—not a NASA waveform or a plotted measurement. Open the Data Lab to inspect the archived record.",camera:[0,1.5,7.6],look:[0,-.6,-2]}
];
let moon,earth,station,signalLine,signalMaterial,stars;
function seeded(seed){let n=seed;return()=>{n=(n*16807)%2147483647;return(n-1)/2147483646;};}
function makeTexture(kind){
 const c=document.createElement("canvas");c.width=1024;c.height=512;const x=c.getContext("2d"),rnd=seeded(kind==="moon"?41:89);
 const g=x.createLinearGradient(0,0,0,512);
 if(kind==="moon"){g.addColorStop(0,"#c6c5c1");g.addColorStop(.5,"#858a91");g.addColorStop(1,"#4c535e");}
 else{g.addColorStop(0,"#4c91c6");g.addColorStop(.52,"#1a507d");g.addColorStop(1,"#071c37");}
 x.fillStyle=g;x.fillRect(0,0,1024,512);
 if(kind==="moon"){
  for(let i=0;i<460;i++){const px=rnd()*1024,py=rnd()*512,r=2+rnd()*23;x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fillStyle="rgba(28,32,39,"+(.025+rnd()*.12)+")";x.fill();x.beginPath();x.arc(px-r*.15,py-r*.2,r*.72,0,Math.PI*2);x.strokeStyle="rgba(247,246,237,.12)";x.lineWidth=2;x.stroke();}
 }else{
  for(let i=0;i<45;i++){const px=rnd()*1024,py=rnd()*512;x.beginPath();x.ellipse(px,py,18+rnd()*62,7+rnd()*23,rnd()*2,0,Math.PI*2);x.fillStyle="rgba(98,145,100,.58)";x.fill();}
  for(let i=0;i<40;i++){x.beginPath();x.moveTo(rnd()*1024,rnd()*512);x.lineTo(rnd()*1024,rnd()*512);x.strokeStyle="rgba(110,185,219,.12)";x.lineWidth=1+rnd()*4;x.stroke();}
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function mat(color,metalness=.05,roughness=.8){return new THREE.MeshStandardMaterial({color,metalness,roughness});}
function add(parent,geo,material,pos,rot=[0,0,0],name=""){const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.rotation.set(...rot);m.userData.label=name;parent.add(m);if(name)pickables.push(m);return m;}
function makeStation(){
 const g=new THREE.Group();g.position.set(0,-2.35,-1.2);g.userData.label="Apollo ALSEP · artistic reconstruction";scene.add(g);station=g;
 const gold=mat(0xb9945c,.62,.45),foil=mat(0xbec2bd,.68,.38),dark=mat(0x252d35,.45,.55),white=mat(0xd6d5c9,.28,.7);
 add(g,new THREE.BoxGeometry(1.25,.48,.9),gold,[0,0,0], [0,.18,0],"ALSEP central station");
 add(g,new THREE.BoxGeometry(.7,.12,.55),foil,[0,.3,0]);
 add(g,new THREE.CylinderGeometry(.035,.035,1.35,10),dark,[0,.92,0]);
 add(g,new THREE.SphereGeometry(.22,20,16),white,[0,1.62,0],"Seismic instrument housing");
 add(g,new THREE.CylinderGeometry(.38,.38,.035,32),foil,[0,1.82,0],[Math.PI/2,0,0],"Antenna dish");
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;add(g,new THREE.BoxGeometry(.46,.045,.34),mat(0x315477,.55,.35),[Math.cos(a)*.95,-.05,Math.sin(a)*.95],[0,a,0],"Solar panel");}
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const cable=add(g,new THREE.CylinderGeometry(.018,.018,.85,8),dark,[Math.cos(a)*.8,-.38,Math.sin(a)*.8],[0,0,Math.PI/2]);}
 const mast=add(g,new THREE.CylinderGeometry(.025,.03,.9,8),foil,[-.62,.6,.1],[0,0,-.4],"Instrument mast");
 return g;
}
function build(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0x030713);scene.fog=new THREE.FogExp2(0x030713,.006);
 camera=new THREE.PerspectiveCamera(44,1,.1,180);camera.position.set(0,2,29);
 scene.add(new THREE.HemisphereLight(0xc7e5ff,0x202536,1.55));
 const sun=new THREE.DirectionalLight(0xffe5c0,2.6);sun.position.set(-8,9,8);scene.add(sun);
 moon=add(scene,new THREE.SphereGeometry(6,80,64),new THREE.MeshStandardMaterial({map:makeTexture("moon"),roughness:1}),[0,0,-17]);
 add(scene,new THREE.SphereGeometry(6.13,64,48),new THREE.MeshBasicMaterial({color:0xbac8db,transparent:true,opacity:.055,side:THREE.BackSide}),[0,0,-17]);
 earth=add(scene,new THREE.SphereGeometry(2.2,48,36),new THREE.MeshStandardMaterial({map:makeTexture("earth"),roughness:.95}),[-11,7,-23]);
 add(scene,new THREE.SphereGeometry(2.34,36,28),new THREE.MeshBasicMaterial({color:0x63bde8,transparent:true,opacity:.1,side:THREE.BackSide}),[-11,7,-23]);
 const positions=[],rnd=seeded(734);
 for(let i=0;i<1600;i++)positions.push((rnd()-.5)*130,(rnd()-.5)*75,-rnd()*100-12);
 const sg=new THREE.BufferGeometry();sg.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
 stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xe5efff,size:.075,transparent:true,opacity:.9}));scene.add(stars);
 const groundGeo=new THREE.PlaneGeometry(90,70,110,80),v=groundGeo.attributes.position;
 for(let i=0;i<v.count;i++){const x=v.getX(i),y=v.getY(i);v.setZ(i,Math.sin(x*.14+y*.1)*.15+Math.cos(y*.25)*.12);}
 groundGeo.computeVertexNormals();
 const ground=add(scene,groundGeo,mat(0x737982,0,.98),[0,-3.1,-2],[-Math.PI/2,0,0]);
 const rndRock=seeded(552);for(let i=0;i<85;i++){const s=.08+rndRock()*.32;add(scene,new THREE.DodecahedronGeometry(s,0),mat(0x8d9198,0,.98),[(rndRock()-.5)*65,-2.96+rndRock()*.12,(rndRock()-.5)*45-3],[rndRock(),rndRock()*3,rndRock()]);}
 makeStation();
 const signalPts=[];for(let i=0;i<260;i++){const x=-5+i/259*10;const y=Math.sin(i*.18)*.045+Math.sin(i*.047)*.07+(i%47===0?.28:0);signalPts.push(new THREE.Vector3(x,y,0));}
 const lineGeo=new THREE.BufferGeometry().setFromPoints(signalPts);signalMaterial=new THREE.LineBasicMaterial({color:0x8fe7f1,transparent:true,opacity:.9});signalLine=new THREE.Line(lineGeo,signalMaterial);signalLine.position.set(0,-.7,-.3);signalLine.visible=false;scene.add(signalLine);
}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
function updateUI(){
 const s=scenes[sceneIndex];$("lj-kicker").textContent=s.kicker;$("lj-title").textContent=s.title;$("lj-description").textContent=s.description;$("lj-fact").textContent=s.fact;
 $("lj-step").textContent=String(sceneIndex+1).padStart(2,"0")+" / 04";
 $("lj-progress-fill").style.width=((sceneIndex+1)/4*100)+"%";
 $("lj-prev").disabled=sceneIndex===0;$("lj-next").disabled=sceneIndex===3;
 $("lj-next").innerHTML=sceneIndex===3?'OPEN DATA LAB <span>↗</span>':'NEXT <span>→</span>';
 document.querySelectorAll("[data-scene]").forEach((n,i)=>n.classList.toggle("is-active",i===sceneIndex));
 $("lj-object-card").hidden=sceneIndex!==2;
}
function goTo(index,animate=true){
 if(index<0||index>=scenes.length)return;
 sceneIndex=index;elapsed=0;updateUI();
 const s=scenes[index];
 if(index===0){camera.position.set(0,2,29);camera.lookAt(0,0,-17);moon.scale.setScalar(1);earth.visible=true;ground.visible=false;station.visible=false;signalLine.visible=false;}
 if(index===1){camera.position.set(0,1,-1.8);camera.lookAt(0,0,-17);moon.scale.setScalar(1.08);earth.visible=true;ground.visible=false;station.visible=false;signalLine.visible=false;}
 if(index===2){camera.position.set(0,2.2,10.5);camera.lookAt(0,-.5,-2);moon.scale.setScalar(1);earth.visible=false;ground.visible=true;station.visible=true;signalLine.visible=false;}
 if(index===3){camera.position.set(0,1.5,7.6);camera.lookAt(0,-.6,-2);moon.scale.setScalar(1);earth.visible=false;ground.visible=true;station.visible=true;signalLine.visible=true;}
 rotX=rotY=0;zoom=1;
 if(!animate||reduced){renderOnce();}
}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
let fromPos=new THREE.Vector3(),toPos=new THREE.Vector3(),fromLook=new THREE.Vector3(),toLook=new THREE.Vector3(),transition=0,transitionDuration=0;
function transitionTo(index){
 if(index<0||index>=scenes.length)return;
 sceneIndex=index;elapsed=0;updateUI();const s=scenes[index];
 fromPos.copy(camera.position);toPos.set(...s.camera);fromLook.set(0,0,-17);toLook.set(...s.look);
 transition=0;transitionDuration=reduced?0:2400;
 if(index===0){earth.visible=true;ground.visible=false;station.visible=false;signalLine.visible=false;}
 if(index===1){earth.visible=true;ground.visible=false;station.visible=false;signalLine.visible=false;}
 if(index===2){earth.visible=false;ground.visible=true;station.visible=true;signalLine.visible=false;}
 if(index===3){earth.visible=false;ground.visible=true;station.visible=true;signalLine.visible=true;}
 if(!transitionDuration){camera.position.copy(toPos);camera.lookAt(toLook);renderOnce();}
}
function renderOnce(){if(renderer&&scene&&camera)renderer.render(scene,camera);}
function tick(now){
 if(!started||document.hidden){raf=0;return;}raf=requestAnimationFrame(tick);
 const dt=Math.min(.05,(now-last)/1000||0);last=now;elapsed+=dt;
 if(!paused&&!reduced){
  moon.rotation.y+=dt*.012;earth.rotation.y+=dt*.035;stars.rotation.y+=dt*.0008;
  if(sceneIndex===0){moon.position.x=Math.sin(elapsed*.18)*.5;moon.position.y=Math.cos(elapsed*.18)*.15;}
  if(transitionDuration>0){transition=Math.min(1,transition+dt/(transitionDuration/1000));const t=ease(transition);camera.position.lerpVectors(fromPos,toPos,t);const look=fromLook.clone().lerp(toLook,t);camera.lookAt(look);if(transition>=1)transitionDuration=0;}
  if(sceneIndex===3&&signalMaterial)signalMaterial.opacity=.6+Math.sin(now*.002)*.25;
 }
 if(drag){camera.position.x+=0;}
 if(sceneIndex===1&&!reduced){moon.scale.setScalar(1.08+Math.sin(now*.0007)*.012);}
 renderer.render(scene,camera);
}
function start(){if(started)return;started=true;$("lj-intro").hidden=true;$("lj-copy").hidden=false;transitionTo(0);$("lj-prev").disabled=true;$("lj-next").disabled=false;last=performance.now();raf=requestAnimationFrame(tick);}
$("lj-begin").addEventListener("click",start);
$("lj-prev").addEventListener("click",()=>{if(sceneIndex>0)transitionTo(sceneIndex-1);});
$("lj-next").addEventListener("click",()=>{if(sceneIndex<3)transitionTo(sceneIndex+1);else location.href="data.html#waveform-title";});
$("lj-motion").addEventListener("click",()=>{paused=!paused;$("lj-motion").textContent=paused?"▶ Resume motion":"Ⅱ Pause motion";$("lj-motion").setAttribute("aria-pressed",String(paused));});
$("lj-reset").addEventListener("click",()=>{rotX=rotY=0;zoom=1;transitionTo(sceneIndex);});
document.querySelectorAll("[data-scene]").forEach(n=>n.addEventListener("click",()=>transitionTo(Number(n.dataset.scene))));
canvas.addEventListener("pointerdown",e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener("pointermove",e=>{if(!drag||!started)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;rotY+=dx*.004;rotX=Math.max(-.6,Math.min(.6,rotX+dy*.003));lastX=e.clientX;lastY=e.clientY;camera.position.x=Math.sin(rotY)*10*zoom;camera.position.y=2+rotX*4;camera.lookAt(0,0,sceneIndex<2?-17:-2);renderOnce();});
canvas.addEventListener("pointerup",()=>drag=false);canvas.addEventListener("pointercancel",()=>drag=false);
canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(.65,Math.min(1.8,zoom+e.deltaY*.001));camera.position.z+=e.deltaY*.012;renderOnce();},{passive:false});
canvas.addEventListener("keydown",e=>{if(e.key==="ArrowRight")transitionTo(Math.min(3,sceneIndex+1));else if(e.key==="ArrowLeft")transitionTo(Math.max(0,sceneIndex-1));else if(e.key==="+"||e.key==="="){zoom=Math.max(.65,zoom-.08);camera.position.z-=.7;}else if(e.key==="-"){zoom=Math.min(1.8,zoom+.08);camera.position.z+=.7;}else return;e.preventDefault();renderOnce();});
document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else if(started&&!raf){last=performance.now();raf=requestAnimationFrame(tick);}});
try{renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:true,powerPreference:"low-power"});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;build();observer=new ResizeObserver(resize);observer.observe(stage);resize();}catch(e){canvas.hidden=true;fallback.hidden=false;}
window.addEventListener("pagehide",()=>{cancelAnimationFrame(raf);if(observer)observer.disconnect();if(scene)scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const a=Array.isArray(o.material)?o.material:[o.material];a.forEach(m=>{if(m.map)m.map.dispose();m.dispose();});}});if(renderer)renderer.dispose();},{once:true});
})();