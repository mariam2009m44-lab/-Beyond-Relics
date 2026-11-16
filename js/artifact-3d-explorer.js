/* Beyond Relics — shared interactive artifact viewer.
   All procedural geometry is an artistic educational visualization, not an official scan. */
(function(){
"use strict";
const THREE_URLS=["https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.module.min.js","https://esm.sh/three@0.188.0","https://cdn.jsdelivr.net/npm/three@0.188.0/build/three.module.js","https://unpkg.com/three@0.188.0/build/three.module.js"];
let enginePromise;
function engine(){if(window.THREE)return Promise.resolve(window.THREE);if(enginePromise)return enginePromise;enginePromise=(async()=>{let lastError;for(const source of THREE_URLS){try{const T=await import(source);window.THREE=T;return T;}catch(error){lastError=error;}}throw lastError||new Error("Three.js could not be loaded");})();enginePromise=enginePromise.catch(error=>{enginePromise=null;throw error;});return enginePromise;}
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
 "pioneer-10-11":[["High-gain antenna","The dish antenna maintained communication across immense distances."],["Instrument section","Scientific instruments studied the interplanetary and outer-planet environment."],["RTG power","Radioisotope thermoelectric generators supplied electrical power."],["Booms","Instrument booms helped position sensors away from spacecraft interference."]],
 "pioneer-plaque":[["Hydrogen reference","The hydrogen transition diagram provides a universal scientific reference for units of time and length."],["Pulsar map","Lines from the Sun point toward pulsars, using their periods to help describe the Solar System’s location."],["Human figures","Simplified figures communicate something about the beings who created the spacecraft; the spacecraft outline provides a scale reference."],["Solar System map","The planetary diagram shows the spacecraft’s origin and its path away from the Sun."]]
};
const componentMap={
 "lunar-module":["body","upper","landing-gear","descent-engine"],
 "apollo-12-alsep":["central-station","science-instruments","antenna","rtg-power"],
 "pathfinder-sojourner":["lander","rover-body","wheels","solar-array"],
 "spirit":["rover-body","rock-abrasion-tool","wheels","solar-array"],
 "opportunity":["rover-body","mast","wheels","solar-array"],
 "phoenix":["lander-deck","robotic-arm","solar-array","landing-legs"],
 "insight":["lander-deck",null,"solar-array","robotic-arm"],
 "curiosity":["rover-body","mast","wheels","robotic-arm"],
 "insight":["lander-deck","science-payload","solar-array","robotic-arm"],
 "pioneer-plaque":["hydrogen-diagram","pulsar-map","human-figures","solar-system-map"]
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
function makePlaqueTexture(T){
 const canvas=document.createElement("canvas");canvas.width=1200;canvas.height=720;
 const c=canvas.getContext("2d");c.fillStyle="#c5a05e";c.fillRect(0,0,1200,720);
 const g=c.createLinearGradient(0,0,1200,720);g.addColorStop(0,"rgba(255,235,175,.2)");g.addColorStop(.5,"rgba(93,61,25,.08)");g.addColorStop(1,"rgba(255,229,165,.18)");c.fillStyle=g;c.fillRect(0,0,1200,720);
 c.strokeStyle="#5d4528";c.lineWidth=5;c.strokeRect(20,20,1160,680);c.lineWidth=2;
 const line=(x1,y1,x2,y2)=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};
 c.strokeStyle="rgba(67,49,27,.88)";
 c.beginPath();c.arc(155,155,55,0,Math.PI*2);c.stroke();c.beginPath();c.arc(155,155,22,0,Math.PI*2);c.stroke();line(155,80,155,25);line(155,230,155,285);
 c.beginPath();c.arc(445,360,17,0,Math.PI*2);c.stroke();
 const rays=[[-150,-210],[-65,-245],[48,-230],[160,-180],[230,-90],[245,35],[175,145],[60,235],[-70,245],[-190,155],[-245,40],[-225,-80]];
 rays.forEach(([dx,dy],i)=>{line(445,360,445+dx,360+dy);c.beginPath();c.arc(445+dx,360+dy,5+(i%3),0,Math.PI*2);c.stroke();});
 c.strokeRect(800,255,110,165);
 [835,875].forEach(x=>{c.beginPath();c.arc(x,285,17,0,Math.PI*2);c.stroke();line(x,303,x,375);line(x,325,x-20,350);line(x,325,x+20,350);line(x,375,x-17,414);line(x,375,x+17,414);});
 const radii=[24,8,10,10,18,14,12,11,9];let x=120;
 radii.forEach((r,i)=>{c.beginPath();c.arc(x,610,r,0,Math.PI*2);c.stroke();x+=i===0?65:i===4?85:58;});
 line(95,540,1000,540);line(1000,540,970,525);line(1000,540,970,555);
 c.fillStyle="rgba(57,43,25,.75)";c.font="bold 20px sans-serif";c.fillText("PIONEER MESSAGE · SCHEMATIC RECONSTRUCTION",34,675);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
}
function makeScene(T,id,root){
 const scene=new T.Scene();scene.background=null;scene.environment=makeStudioEnvironment(T);
 const camera=new T.PerspectiveCamera(36,1,.1,100);camera.position.set(7,5,13);
 scene.add(new T.HemisphereLight(0xc4e2ff,0x3b2b25,1.35));
 const key=new T.DirectionalLight(0xffdfb2,3.8);key.position.set(-6,9,8);scene.add(key);
 const rim=new T.DirectionalLight(0x68c9ee,3.1);rim.position.set(7,4,-8);scene.add(rim);
 const fill=new T.DirectionalLight(0x9ebce8,1.25);fill.position.set(3,1,9);scene.add(fill);
 const accent=new T.PointLight(0x55c9e8,15,22,2);accent.position.set(-5,1,-3);scene.add(accent);
 const lunar=id==="lunar-module"||id==="apollo-12-alsep";
 const mars=["pathfinder-sojourner","spirit","opportunity","phoenix","insight","curiosity"].includes(id);
 const compactRender=window.innerWidth<700||(navigator.hardwareConcurrency||8)<=4;
 const roverSurface=["pathfinder-sojourner","spirit","opportunity","curiosity"].includes(id);
 const terrainY=lunar?-2.25:(roverSurface?-1.98:-1.78);
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
 const starGeo=new T.BufferGeometry(),stars=[];for(let i=0;i<(compactRender?260:620);i++)stars.push((starRand()-.5)*48,starRand()*24-2,(starRand()-.5)*42);starGeo.setAttribute("position",new T.Float32BufferAttribute(stars,3));const ambientStars=new T.Points(starGeo,new T.PointsMaterial({color:0xcce6ff,size:compactRender?.035:.045,transparent:true,opacity:.82,depthWrite:false}));scene.add(ambientStars);
 const rootObj=new T.Group();scene.add(rootObj);
 const metal=new T.MeshStandardMaterial({color:0xb9a17b,metalness:.78,roughness:.27,envMapIntensity:1.25}),foil=new T.MeshStandardMaterial({color:0xb9c5c8,metalness:.82,roughness:.24,envMapIntensity:1.3}),dark=new T.MeshStandardMaterial({color:0x343e48,metalness:.55,roughness:.36,envMapIntensity:1.05}),black=new T.MeshStandardMaterial({color:0x101a26,metalness:.38,roughness:.3,envMapIntensity:.9}),blue=new T.MeshStandardMaterial({color:0x254c70,metalness:.58,roughness:.24,envMapIntensity:1.15}),solar=new T.MeshStandardMaterial({color:0x173d65,metalness:.62,roughness:.3,emissive:0x07182c,envMapIntensity:1.05});
 const groups={},componentNodes={};
 const group=(name)=>{const g=new T.Group();g.name=name;groups[name]=g;componentNodes[name]=g;rootObj.add(g);return g;};
 const part=(parent,name)=>{const g=new T.Group();g.name=name;componentNodes[name]=g;parent.add(g);return g;};
 const mesh=(parent,geo,mat,pos=[0,0,0],rot=[0,0,0])=>{const m=new T.Mesh(geo,mat);m.position.set(...pos);m.rotation.set(...rot);parent.add(m);return m;};
 const box=(p,s,m,pos,rot)=>mesh(p,new T.BoxGeometry(...s),m,pos,rot);
 const cyl=(p,a,b,h,m,pos,segments=12,rot=[0,0,0])=>mesh(p,new T.CylinderGeometry(a,b,h,segments),m,pos,rot);
 const wheel=(p,x,z,r=.38)=>{const w=mesh(p,new T.CylinderGeometry(r,r,.22,16),black,[x,-1.65,z],[0,0,Math.PI/2]);mesh(p,new T.TorusGeometry(r*.72,.045,8,20),foil,[x,-1.65,z],[0,Math.PI/2,0]);return w;};
 function rover(curiosity=false,name="body"){
  const body=group(name);const chassis=part(body,"rover-body");box(chassis,curiosity?[2.1,.85,1.55]:[1.75,.68,1.25],metal,[0,-.42,0]);
  box(chassis,[.8,.48,.7],foil,[0,.22,0]);box(chassis,[.25,.12,.25],dark,[0,.55,0]);
  const mast=part(body,"mast");mast.position.set(0,.45,0);cyl(mast,.07,.07,.85,foil,[0,.42,0]);mesh(mast,new T.SphereGeometry(.27,16,12),blue,[0,.9,0]);for(let x of [-.12,.12])box(mast,[.12,.09,.08],dark,[x,.9,.2]);
  if(id==="spirit"){
   // Simplified artistic representation of Spirit's instrument deployment device and RAT.
   const arm=part(body,"robotic-arm");arm.position.set(.78,-.34,.12);
   cyl(arm,.065,.075,.72,foil,[.14,-.16,.08],12,[0,0,.55]);
   cyl(arm,.05,.055,.52,metal,[.43,-.43,.08],12,[0,0,-.75]);
   const rat=part(arm,"rock-abrasion-tool");rat.position.set(.62,-.64,.08);
   cyl(rat,.12,.1,.16,dark,[0,0,0],16);
   cyl(rat,.07,.07,.18,foil,[0,-.14,0],16);
  }
  if(curiosity){const arm=part(body,"robotic-arm");arm.position.set(.9,-.35,.1);cyl(arm,.07,.07,.8,foil,[.2,-.2,.2],12,[0,0,.7]);}
  const wheelAssembly=part(body,"wheels");
  for(let z of [-.7,.7])for(let x of [-.85,0,.85])wheel(wheelAssembly,x,z,.35);
  if(!curiosity){
   const solarArray=part(body,"solar-array");
   const panel=box(solarArray,[2,.07,1.05],solar,[0,.15,-.95]);panel.rotation.x=-.12;
   const cellGrid=new T.Group();cellGrid.position.copy(panel.position);cellGrid.rotation.copy(panel.rotation);solarArray.add(cellGrid);
   const gridMat=new T.MeshStandardMaterial({color:0x8caebe,metalness:.52,roughness:.38,envMapIntensity:.8});
   for(let x=-.8;x<=.81;x+=.4)box(cellGrid,[.014,.012,.98],gridMat,[x,.041,0]);
   for(let z=-.36;z<=.37;z+=.36)box(cellGrid,[1.94,.012,.014],gridMat,[0,.041,z]);
   for(const side of [-1,1])box(solarArray,[2.05,.12,.13],foil,[0,-.88,side*.68],[0,0,side*.05]);
  }else{
   // Curiosity uses an RTG, not a solar array; this is an artistic reconstruction.
   const rtg=part(body,"rtg-power");
   cyl(rtg,.31,.31,.82,foil,[0,.48,-.86],24,[Math.PI/2,0,0]);
   cyl(rtg,.36,.36,.1,dark,[0,.48,-1.28],24,[Math.PI/2,0,0]);
   box(rtg,[.62,.12,.18],metal,[0,.84,-.62]);
   const turret=new T.Group();turret.position.set(0,1.28,.02);body.add(turret);
   cyl(turret,.16,.16,.22,foil,[0,0,0],20);
   for(let x of [-.18,.18])mesh(turret,new T.SphereGeometry(.09,12,10),blue,[x,.04,.12]);
   box(body,[.12,.12,.85],dark,[.96,-.58,.12],[0,0,.35]);
  }
  return body;
 }
 function lander(name="body",legCount=4){
  const base=group(name);const deck=part(base,"lander-deck");cyl(deck,1.15,1.2,.38,metal,[0,-.45,0],8);cyl(deck,.75,.8,.7,foil,[0,.05,0],8);cyl(deck,.42,.48,.45,dark,[0,.58,0],8);
  const landingLegs=part(base,"landing-legs");
  for(let i=0;i<legCount;i++){const a=(Math.PI*2/legCount)*i+Math.PI/4,x=Math.cos(a),z=Math.sin(a);const leg=new T.Group();leg.position.set(x*.8,-.55,z*.8);leg.rotation.z=-x*.45;leg.rotation.x=z*.45;landingLegs.add(leg);cyl(leg,.045,.065,1.25,foil,[0,-.55,0]);box(leg,[.48,.07,.3],metal,[x*.2,-1.12,z*.2]);}
  return base;
 }
 if(id==="lunar-module"){
  const lower=group("body");cyl(lower,1.5,1.65,.42,metal,[0,-.55,0],8);cyl(lower,1.2,1.25,.7,foil,[0,-1.1,0],8);
  const descentEngine=part(lower,"descent-engine");cyl(descentEngine,.42,.5,.55,dark,[0,-1.68,0]);
  const landingGear=part(lower,"landing-gear");
  for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a),z=Math.sin(a),leg=new T.Group();leg.position.set(x*1,-.9,z*1);leg.rotation.z=-x*.4;leg.rotation.x=z*.4;landingGear.add(leg);cyl(leg,.055,.075,1.45,foil,[0,-.62,0]);box(leg,[.58,.08,.38],metal,[x*.18,-1.35,z*.18]);}
  const upper=group("upper");cyl(upper,.78,.9,1.05,metal,[0,.2,0],6);cyl(upper,.32,.32,.45,dark,[0,.9,0]);for(let i=0;i<3;i++){const a=i*2.094;box(upper,[.38,.3,.06],blue,[Math.cos(a)*.72,.25,Math.sin(a)*.72]);}
 }else if(id==="apollo-12-alsep"){
  const station=group("body");station.position.y=-1.55;
  const centralStation=part(station,"central-station");
  box(centralStation,[1.05,.58,.82],metal,[0,-.55,0]);box(centralStation,[.72,.08,.58],foil,[0,-.22,0]);
  // RTG package, antenna and instrument packages: educational artistic reconstruction.
  const power=part(station,"rtg-power");
  cyl(power,.22,.22,.82,foil,[-.72,-.48,0],24,[0,0,Math.PI/2]);
  for(let k=0;k<7;k++)box(power,[.025,.34,.38],dark,[-.72,-.48,-.3+k*.1]);
  const antenna=part(station,"antenna");
  cyl(antenna,.1,.1,1.2,foil,[0,.55,0],16);
  const dish=mesh(antenna,new T.SphereGeometry(.34,24,16,0,Math.PI*2,0,Math.PI/2),foil,[0,1.2,0]);dish.rotation.x=Math.PI;
  cyl(antenna,.035,.035,.8,metal,[0,1.52,0],10);
  const instrumentsGroup=part(station,"science-instruments");
  const instruments=[[-1.35,-.82,-.35],[1.25,-.82,-.35],[1.35,-.82,.55],[-1.25,-.82,.62]];
  instruments.forEach((p,i)=>box(instrumentsGroup,[.34,.22,.3],i%2?dark:foil,p));
  cyl(station,.11,.11,.18,foil,[.45,-.17,.12],16);
 }else if(id==="pathfinder-sojourner"){
  const pathfinder=lander("lander");pathfinder.position.set(-2.05,-.2,0);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;box(pathfinder,[.95,.07,.42],solar,[Math.cos(a)*1.18,.18,Math.sin(a)*1.18],[0,-a,0]);}
  const sojourner=rover(false,"rover");sojourner.position.x=2.05;sojourner.scale.set(.72,.72,.72);
 }else if(["spirit","opportunity","curiosity"].includes(id)){rover(id==="curiosity");}
 else if(["phoenix","insight"].includes(id)){
  lander("body",3);const p=groups.body;
  if(id==="insight"){
   // InSight's two deployed solar wings and instrument-placement arm.
   const solarArray=part(p,"solar-array");
   for(const side of [-1,1]){
    box(solarArray,[1.35,.055,1.05],solar,[side*1.48,.18,0]);
    for(let x=-.45;x<=.46;x+=.3)box(solarArray,[.018,.012,.98],blue,[side*1.48+x,.22,0]);
    for(let z=-.35;z<=.36;z+=.35)box(solarArray,[1.3,.012,.018],blue,[side*1.48,.22,z]);
   }
   const arm=part(p,"robotic-arm");arm.position.set(.8,.1,0);
   cyl(arm,.065,.065,1,foil,[.25,-.1,0],12,[0,0,.65]);cyl(arm,.045,.045,.65,metal,[.7,-.48,0],12,[0,0,-.7]);
   const sciencePayload=part(p,"science-payload");
   box(sciencePayload,[.42,.22,.38],foil,[-.72,-.28,.5]);cyl(sciencePayload,.12,.12,.18,dark,[-.72,-.12,.5],20);
  }else{
   // Phoenix's two solar wings, deck instruments and sample-delivery arm.
   const solarArray=part(p,"solar-array");
   for(const side of [-1,1]){
    box(solarArray,[1.15,.055,.82],solar,[side*1.45,.25,0]);
    for(let x=-.38;x<=.39;x+=.25)box(solarArray,[.018,.012,.76],blue,[side*1.45+x,.29,0]);
   }
   const arm=part(p,"robotic-arm");arm.position.set(.7,.2,.2);
   cyl(arm,.06,.06,.9,foil,[.18,-.25,0],12,[0,0,.55]);cyl(arm,.045,.045,.72,metal,[.58,-.56,.06],12,[0,0,-.5]);
   const deckInstruments=part(p,"deck-instruments");
   box(deckInstruments,[.42,.26,.36],dark,[-.45,.12,-.35]);
  }
 }
 else if(id==="pioneer-plaque"){
  const plaque=group("body"),panel=part(plaque,"plaque-panel");
  const gold=new T.MeshStandardMaterial({color:0xc4a05d,metalness:.82,roughness:.34});
  box(panel,[5.8,.16,3.55],gold,[0,0,0]);
  mesh(panel,new T.PlaneGeometry(5.64,3.38),new T.MeshStandardMaterial({map:makePlaqueTexture(T),metalness:.56,roughness:.52,side:T.DoubleSide}),[0,.083,0],[-Math.PI/2,0,0]);
  const engraving=new T.MeshStandardMaterial({color:0x49351f,metalness:.35,roughness:.7});
  const hydrogen=part(plaque,"hydrogen-diagram");
  mesh(hydrogen,new T.TorusGeometry(.25,.025,8,32),engraving,[-2.05,.105,-1.12],[Math.PI/2,0,0]);
  mesh(hydrogen,new T.TorusGeometry(.12,.018,8,28),engraving,[-2.05,.11,-1.12],[Math.PI/2,0,0]);
  mesh(hydrogen,new T.SphereGeometry(.055,12,10),engraving,[-1.78,.13,-1.12]);box(hydrogen,[.04,.02,.72],engraving,[-2.05,.11,-1.12]);
  const pulsar=part(plaque,"pulsar-map");mesh(pulsar,new T.SphereGeometry(.1,14,12),engraving,[-.55,.12,.05]);
  const rayEnds=[[-1.8,-1.2],[-1.35,-1.55],[-.65,-1.45],[.15,-1.05],[.48,-.35],[.52,.5],[.15,1.2],[-.6,1.42],[-1.45,1.1],[-1.85,.4]];
  rayEnds.forEach(([x,z])=>{const dx=x+.55,dz=z-.05,len=Math.hypot(dx,dz),bar=box(pulsar,[len,.018,.025],engraving,[-.55+dx/2,.12,.05+dz/2]);bar.rotation.y=-Math.atan2(dz,dx);mesh(pulsar,new T.SphereGeometry(.045,10,8),engraving,[x,.13,z]);});
  const figures=part(plaque,"human-figures");
  [-.25,.48].forEach(x=>{mesh(figures,new T.SphereGeometry(.13,16,12),engraving,[x,.14,-.12]);cyl(figures,.085,.12,.55,engraving,[x,.14,-.48],12);cyl(figures,.045,.045,.42,engraving,[x-.17,.14,-.43],10,[0,0,-.25]);cyl(figures,.045,.045,.42,engraving,[x+.17,.14,-.43],10,[0,0,.25]);cyl(figures,.055,.055,.43,engraving,[x-.07,.14,-.92],10);cyl(figures,.055,.055,.43,engraving,[x+.07,.14,-.92],10);});
  const solarMap=part(plaque,"solar-system-map"),planetX=[-2.1,-1.55,-1.02,-.46,.12,.68,1.25,1.82,2.28],planetR=[.12,.035,.05,.05,.09,.075,.07,.06,.05];
  planetX.forEach((x,i)=>mesh(solarMap,new T.SphereGeometry(planetR[i],12,10),engraving,[x,.14,1.12]));
  box(solarMap,[4.65,.018,.022],engraving,[.02,.12,1.12]);
 }
 else if(id==="voyager"||id==="pioneer-10-11"){
  const craft=group("body");cyl(craft,.5,.5,.9,foil,[0,0,0]);mesh(craft,new T.SphereGeometry(.82,24,18),metal,[0,.1,0]);cyl(craft,.95,.95,.08,foil,[0,.05,0],48).rotation.x=Math.PI/2;box(craft,[.12,3,.12],foil,[0,0,0]);for(let x of [-1.5,1.5])box(craft,[1.5,.06,.8],solar,[x,0,0]);cyl(craft,.08,.08,2.5,foil,[0,-.1,0]);const dish=mesh(craft,new T.SphereGeometry(.95,24,16,0,Math.PI*2,0,Math.PI/2),foil,[0,.5,1.3]);dish.rotation.x=Math.PI;
 }else{
  const telescope=group("body");cyl(telescope,.95,1.05,2.6,foil,[0,0,0],16);cyl(telescope,.7,.8,.22,dark,[0,1.4,0],16);mesh(telescope,new T.CylinderGeometry(.7,.7,.05,32),blue,[0,1.53,0]);for(let x of [-1.55,1.55])box(telescope,[1.2,.06,2.2],solar,[x,0,0]);
 }
 return {scene,camera,rootObj,groups,componentNodes,ambientStars};
}
const OFFICIAL_MODELS={
 "voyager":{src:"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/voyager-probe-%28b%29/Voyager%20Probe%20%28B%29.glb",source:"NASA / Michael D. Carbajal",page:"https://science.nasa.gov/3d-resources/voyager-probe-b/",label:"OFFICIAL NASA 3D MODEL"},
 "lunar-module":{src:"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/apollo-lunar-module/Apollo%20Lunar%20Module.glb",source:"NASA / Michael D. Carbajal",page:"https://science.nasa.gov/3d-resources/apollo-lunar-module/",label:"OFFICIAL NASA 3D MODEL"},
 "insight":{src:"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/insight-cruise-lander/InSight%20Cruise%20Lander%20%28arm%20deployed%29.glb",source:"NASA / Brian E. Kumanchik",page:"https://science.nasa.gov/3d-resources/insight-cruise-lander/",label:"OFFICIAL NASA 3D MODEL"},
 "opportunity":{src:"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-exploration-rover---opportunity-%28mer-b%29/Mars%20Exploration%20Rover%20-%20Opportunity%20%28MER-B%29.glb",source:"NASA / Ames Research Center",page:"https://science.nasa.gov/3d-resources/mars-exploration-rover-opportunity-mer-b/",label:"OFFICIAL NASA 3D MODEL"},
 "spirit":{embed:"https://mars.nasa.gov/gltf_embed/24883/?fs=true",source:"NASA/JPL-Caltech",page:"https://science.nasa.gov/resource/spirit-and-opportunity-rover-3d-model/",label:"OFFICIAL NASA/JPL INTERACTIVE MODEL · SPIRIT & OPPORTUNITY ROVER FAMILY",displayTitle:"Mars Exploration Rover — Spirit and Opportunity family"},
 "curiosity":{embed:"https://mars.nasa.gov/gltf_embed/24584/?fs=true",source:"NASA/JPL-Caltech",page:"https://science.nasa.gov/resource/curiosity-rover-3d-model/",label:"OFFICIAL NASA/JPL INTERACTIVE 3D MODEL",displayTitle:"Curiosity Mars Rover"},
 "space-telescope":{src:"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/spitzer-space-telescope/Spitzer%20Space%20Telescope.glb",source:"NASA / Janice C. Lee; NASA / Robert L. Hurt",page:"https://science.nasa.gov/3d-resources/spitzer-space-telescope/",label:"OFFICIAL NASA 3D MODEL"},
 "pioneer-10-11":{src:"https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/pioneer-10/Pioneer%2010.glb",source:"NASA / JPL / Eyes on the Solar System",page:"https://science.nasa.gov/3d-resources/pioneer/",label:"OFFICIAL PIONEER 10 MODEL · PIONEER 11 NOT SHOWN",displayTitle:"Pioneer 10"}
};
function loadModelViewer(){
 if(customElements.get("model-viewer"))return Promise.resolve();
 if(window.__brModelViewerPromise)return window.__brModelViewerPromise;
 window.__brModelViewerPromise=(async()=>{
  const sources=[
   "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js",
   "https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js",
   "https://unpkg.com/@google/model-viewer@4.0.0/dist/model-viewer.min.js"
  ];
  let lastError;
  for(const src of sources){
   try{
    await new Promise((resolve,reject)=>{
     const script=document.createElement("script");
     script.type="module";script.src=src;
     script.onload=()=>customElements.whenDefined("model-viewer").then(resolve,reject);
     script.onerror=()=>{script.remove();reject(new Error("Could not load model-viewer from "+src));};
     document.head.appendChild(script);
    });
    if(customElements.get("model-viewer"))return;
   }catch(error){lastError=error;}
  }
  throw lastError||new Error("3D model viewer unavailable");
 })();
 window.__brModelViewerPromise=window.__brModelViewerPromise.catch(error=>{
  window.__brModelViewerPromise=null;
  throw error;
 });
 return window.__brModelViewerPromise;
}
async function mountOfficialModel(root,item,loading,canvas,onFailure){
 const model=OFFICIAL_MODELS[item.id];if(!model)return false;
 if(model.embed){
  if(!canvas.isConnected)return true;
  const frame=document.createElement("iframe");
  frame.className="artifact-nasa-embed";
  frame.src=model.embed;
  frame.title=(model.displayTitle||item.title)+" — official NASA/JPL interactive 3D viewer";
  frame.loading="eager";
  frame.allow="fullscreen; xr-spatial-tracking";
  frame.allowFullscreen=true;
  frame.referrerPolicy="strict-origin-when-cross-origin";
  let embedLoaded=false;const embedTimer=setTimeout(()=>{if(!embedLoaded&&onFailure){loading.hidden=false;loading.textContent="NASA viewer is taking too long. Preparing the local 3D reconstruction…";loading.classList.add("is-error");onFailure();}},18000);
  frame.addEventListener("load",()=>{embedLoaded=true;clearTimeout(embedTimer);loading.hidden=true;},{once:true});
  frame.addEventListener("error",()=>{clearTimeout(embedTimer);loading.hidden=false;loading.textContent="The NASA viewer did not load. Preparing the local 3D reconstruction…";loading.classList.add("is-error");if(onFailure)onFailure();},{once:true});
  canvas.replaceWith(frame);
  const toolbar=root.querySelector(".artifact-3d-toolbar");if(toolbar)toolbar.hidden=true;
  const badge=document.createElement("a");
  badge.className="artifact-model-credit";
  badge.href=model.page;badge.target="_blank";badge.rel="noopener noreferrer";
  badge.textContent=model.label+" · SOURCE: "+model.source;
  root.appendChild(badge);
  loading.hidden=false;loading.textContent="Opening the official NASA interactive 3D viewer…";
  const fidelity=root.querySelector(".artifact-3d-foot span:first-child");if(fidelity)fidelity.textContent=model.label+" · NASA-HOSTED INTERACTIVE VIEWER";
  const instructions=root.querySelector(".artifact-3d-foot span:last-child");if(instructions)instructions.textContent="Use the NASA viewer controls to rotate and inspect the rover";
  return true;
 }
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
 if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches)viewer.setAttribute("auto-rotate","");
 viewer.setAttribute("rotation-per-second","2deg");
 viewer.setAttribute("auto-rotate-delay","1200");
 viewer.setAttribute("shadow-intensity","1");
 viewer.setAttribute("environment-image","neutral");
 viewer.setAttribute("exposure","1.08");
 viewer.setAttribute("interaction-prompt","auto");
 viewer.setAttribute("interaction-prompt-threshold","1200");
 viewer.setAttribute("reveal","auto");
 viewer.setAttribute("ar","");viewer.setAttribute("loading","eager");
 viewer.className="artifact-model-viewer";
 viewer.addEventListener("progress",event=>{const pct=Math.round((event.detail.totalProgress||0)*100);loading.hidden=false;loading.textContent="Loading official NASA 3D model · "+pct+"%";});
 let modelLoaded=false,modelFallbackStarted=false;
 const fallbackModel=()=>{
  if(modelFallbackStarted||modelLoaded&&viewer.modelIsVisible)return;
  modelFallbackStarted=true;clearTimeout(modelLoadTimer);
  loading.hidden=false;loading.textContent="The NASA model did not appear. Preparing the interactive 3D exhibit…";loading.classList.add("is-error");
  if(onFailure)onFailure();
 };
 const modelLoadTimer=setTimeout(()=>{if(!modelLoaded||!viewer.modelIsVisible)fallbackModel();},12000);
 viewer.addEventListener("load",()=>{
  modelLoaded=true;clearTimeout(modelLoadTimer);
  try{viewer.updateFraming();viewer.cameraTarget="auto";viewer.cameraOrbit="0deg 72deg auto";}catch(error){}
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(!viewer.modelIsVisible)fallbackModel();
   else loading.hidden=true;
  }));
 },{once:true});
 viewer.addEventListener("error",()=>{clearTimeout(modelLoadTimer);loading.hidden=false;loading.textContent="NASA model unavailable. Preparing the local 3D reconstruction…";loading.classList.add("is-error");if(onFailure)onFailure();},{once:true});
 canvas.replaceWith(viewer);
 const badge=document.createElement("a");
 badge.className="artifact-model-credit";
 badge.href=model.page;badge.target="_blank";badge.rel="noopener noreferrer";
 badge.textContent=model.label+" · SOURCE: "+model.source;
 root.appendChild(badge);
 loading.hidden=false;loading.textContent="Loading official NASA 3D model…";
 const fidelity=root.querySelector(".artifact-3d-foot span:first-child");if(fidelity)fidelity.textContent=model.label+" · NOT A PHYSICAL SCAN";
 const instructions=root.querySelector(".artifact-3d-foot span:last-child");if(instructions)instructions.textContent="Drag to orbit · Pinch to zoom · Use controls below";
 const parts=root.querySelector(".artifact-3d-parts");if(parts)parts.setAttribute("aria-label","Voyager component guide");
 const explode=root.querySelector("[data-view-explode]");if(explode)explode.hidden=true;
 const reset=root.querySelector("[data-view-reset]");if(reset)reset.addEventListener("click",()=>{viewer.cameraOrbit="0deg 75deg auto";viewer.cameraTarget="auto";viewer.fieldOfView="auto";modelFov=45;viewer.jumpCameraToGoal();});
 const rotate=root.querySelector("[data-view-rotate]");if(rotate){const rotating=viewer.hasAttribute("auto-rotate");rotate.setAttribute("aria-pressed",String(rotating));rotate.textContent=rotating?"Pause rotation":"Auto rotate";}
 const zoomIn=root.querySelector("[data-view-zoom-in]"),zoomOut=root.querySelector("[data-view-zoom-out]");let modelFov=45;
 if(zoomIn)zoomIn.addEventListener("click",()=>{modelFov=Math.max(20,modelFov-5);viewer.fieldOfView=modelFov+"deg";});
 if(zoomOut)zoomOut.addEventListener("click",()=>{modelFov=Math.min(65,modelFov+5);viewer.fieldOfView=modelFov+"deg";});
 return true;
}
function mount(root,item){
 if(!root||root.dataset.viewerMounted==="true")return;root.dataset.viewerMounted="true";
 const canvas=root.querySelector("canvas"),loading=root.querySelector(".artifact-3d-loading"),panel=root.querySelector(".artifact-3d-callout");
 const info=copy[item.id]||[["Mission hardware","Explore the shape and role of this mission system."]];
 const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");const buttons=[...root.querySelectorAll("[data-part]")];let renderer,world,raf=0,resumeFrame=null,active=false,observer,intersectionObserver,inView=false,contextAvailable=true,drag=false,lastX=0,lastY=0,rotX=-.12,rotY=.45,targetX=rotX,targetY=rotY,zoom=1,pinch=0,exploded=false,autoRotate=!reducedMotion.matches,raycaster=null,pointer=null,pointerMoved=false,pointerDownX=0,pointerDownY=0;
 const rotateButton=root.querySelector("[data-view-rotate]");
 if(rotateButton)rotateButton.addEventListener("click",()=>{const officialViewer=root.querySelector(".artifact-model-viewer");if(officialViewer){const on=!officialViewer.hasAttribute("auto-rotate");if(on)officialViewer.setAttribute("auto-rotate","");else officialViewer.removeAttribute("auto-rotate");rotateButton.setAttribute("aria-pressed",String(on));rotateButton.textContent=on?"Pause rotation":"Auto rotate";return;}autoRotate=!autoRotate;rotateButton.setAttribute("aria-pressed",String(autoRotate));rotateButton.textContent=autoRotate?"Pause rotation":"Auto rotate";});
 const highlighted=[];
 function clearHighlight(){
  highlighted.forEach(([object,original,emphasis])=>{
   object.material=original;
   (Array.isArray(emphasis)?emphasis:[emphasis]).forEach(material=>material.dispose());
  });
  highlighted.length=0;
 }
 function highlightComponent(index){
  clearHighlight();
  const targetName=(componentMap[item.id]||[])[index];
  const target=world&&targetName&&world.componentNodes[targetName];
  if(!target||!window.THREE)return false;
  target.traverse(object=>{
   if(!object.isMesh||!object.material)return;
   const original=object.material;
   const emphasize=material=>{
    const clone=material.clone();
    if(clone.emissive){clone.emissive.set(0x48cbe8);clone.emissiveIntensity=Math.max(clone.emissiveIntensity||0,.42);}
    else if(clone.color)clone.color.lerp(new window.THREE.Color(0x8edce8),.28);
    return clone;
   };
   const emphasis=Array.isArray(original)?original.map(emphasize):emphasize(original);
   object.material=emphasis;
   highlighted.push([object,original,emphasis]);
  });
  return highlighted.length>0;
 }
 function setInfo(i,show){
  const d=info[i]||info[0],emphasized=show&&highlightComponent(i);
  if(!show)clearHighlight();
  panel.querySelector("small").textContent="COMPONENT GUIDE · "+String(i+1).padStart(2,"0")+(emphasized?" · 3D PART HIGHLIGHTED":" · EXPLANATORY NOTE");
  panel.querySelector("strong").textContent=d[0];
  panel.querySelector("p").textContent=d[1]+(emphasized?" The matching modeled assembly is highlighted in the exhibit.":" This model does not expose a separately identifiable mesh for this component, so this is an explanatory note rather than a claimed 3D highlight.");
  panel.hidden=!show;panel.classList.toggle("is-visible",!!show);
  buttons.forEach((b,n)=>{b.setAttribute("aria-pressed",String(n===i&&show));if(info[n])b.textContent=info[n][0];});
 }
 function syncRenderState(){const shouldRun=!document.hidden&&inView&&contextAvailable&&canvas.isConnected;if(shouldRun){if(!active)active=true;if(renderer&&resumeFrame&&!raf)resumeFrame();}else if(active){active=false;cancelAnimationFrame(raf);raf=0;}}
 let proceduralStarted=false;const startProcedural=()=>{if(proceduralStarted)return Promise.resolve();proceduralStarted=true;return engine().then(T=>{if(!canvas.isConnected)return;world=makeScene(T,item.id,root);raycaster=new T.Raycaster();pointer=new T.Vector2();canvas.title="Tap a visible component to open its field note. Drag to rotate.";if(!world.groups.upper)root.querySelector("[data-view-explode]").hidden=true;const modelBounds=new T.Box3().setFromObject(world.rootObj);const modelSphere=modelBounds.getBoundingSphere(new T.Sphere());const modelCenter=modelSphere.center.clone();const fitRadius=Math.max(modelSphere.radius,2.4);const baseDistance=fitRadius/Math.sin(T.MathUtils.degToRad(world.camera.fov/2))*1.12;renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"low-power"});renderer.setPixelRatio(Math.min(devicePixelRatio||1,window.innerWidth<700?1.15:1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0x000000,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);observer=new ResizeObserver(()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setPixelRatio(Math.min(devicePixelRatio||1,window.innerWidth<700?1.15:1.5));renderer.setSize(w,h,false);world.camera.aspect=w/h;world.camera.updateProjectionMatrix();});observer.observe(canvas);if("IntersectionObserver" in window){intersectionObserver=new IntersectionObserver(entries=>{inView=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.01);syncRenderState();},{threshold:[0,.01,.1]});intersectionObserver.observe(canvas);}else{inView=true;}
 loading.hidden=true;
 function frame(now=performance.now()){if(!active||!renderer)return;raf=requestAnimationFrame(frame);const delta=frame.lastTime?Math.min((now-frame.lastTime)/16.667,2):1;frame.lastTime=now;if(autoRotate&&!reducedMotion.matches&&!drag)targetY+=.0012*delta;const easing=reducedMotion.matches?1:1-Math.pow(.92,delta);rotX+=(targetX-rotX)*easing;rotY+=(targetY-rotY)*easing;world.rootObj.rotation.set(rotX,rotY,0);if(world.ambientStars&&!reducedMotion.matches)world.ambientStars.rotation.y+=.000035*delta;const liveTarget=modelCenter.clone().applyEuler(world.rootObj.rotation);world.camera.position.set(liveTarget.x+baseDistance*.48*zoom,liveTarget.y+baseDistance*.34*zoom,liveTarget.z+baseDistance*.88*zoom);world.camera.lookAt(liveTarget);renderer.render(world.scene,world.camera);}resumeFrame=()=>{if(!raf&&active)frame();};syncRenderState();
 });};mountOfficialModel(root,item,loading,canvas,()=>{const viewer=root.querySelector(".artifact-model-viewer,.artifact-nasa-embed");if(viewer&&canvas&&!canvas.isConnected)viewer.replaceWith(canvas);root.querySelectorAll(".artifact-model-credit").forEach(node=>node.remove());const toolbar=root.querySelector(".artifact-3d-toolbar");if(toolbar)toolbar.hidden=false;const fidelity=root.querySelector(".artifact-3d-foot span:first-child");if(fidelity)fidelity.textContent="ARTISTIC VISUALIZATION · NOT AN OFFICIAL NASA MODEL";startProcedural();}).then(official=>{if(!official)return startProcedural();}).catch(error=>{proceduralStarted=false;loading.hidden=false;loading.textContent="The 3D model could not start. Check the connection and reload this exhibit.";loading.classList.add("is-error");console.error("Beyond Relics 3D exhibit failed:",error);});
 buttons.forEach((b,i)=>b.addEventListener("click",()=>setInfo(i,true)));
 canvas.addEventListener("webglcontextlost",event=>{event.preventDefault();contextAvailable=false;syncRenderState();loading.hidden=false;loading.textContent="The 3D graphics context was interrupted. If it does not recover, reload this exhibit.";loading.classList.add("is-error");});
 canvas.addEventListener("webglcontextrestored",()=>{if(renderer)renderer.resetState();contextAvailable=true;loading.hidden=true;loading.classList.remove("is-error");syncRenderState();});
 const closeInfo=panel.querySelector(".artifact-3d-callout-close");if(closeInfo)closeInfo.addEventListener("click",()=>setInfo(0,false));
 root.querySelector("[data-view-zoom-in]").addEventListener("click",()=>{zoom=Math.max(.62,zoom-.12);});
 root.querySelector("[data-view-zoom-out]").addEventListener("click",()=>{zoom=Math.min(1.72,zoom+.12);});
 root.querySelector("[data-view-reset]").addEventListener("click",()=>{targetX=-.12;targetY=.45;zoom=1;autoRotate=!reducedMotion.matches;if(rotateButton){rotateButton.setAttribute("aria-pressed",String(autoRotate));rotateButton.textContent=autoRotate?"Pause rotation":"Auto rotate";}setInfo(0,false);});
 root.querySelector("[data-view-explode]").addEventListener("click",()=>{if(!world)return;exploded=!exploded;const g=world.groups.upper;if(g){g.position.y=exploded?2.1:0;}const b=root.querySelector("[data-view-explode]");b.setAttribute("aria-pressed",String(exploded));b.textContent=exploded?"Reassemble":"Separate components";});
 canvas.addEventListener("pointerdown",e=>{pointerMoved=false;pointerDownX=e.clientX;pointerDownY=e.clientY;drag=true;autoRotate=false;if(rotateButton){rotateButton.setAttribute("aria-pressed","false");rotateButton.textContent="Auto rotate";}lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener("pointermove",e=>{if(!drag)return;if(Math.hypot(e.clientX-pointerDownX,e.clientY-pointerDownY)>7)pointerMoved=true;targetY+=(e.clientX-lastX)*.008;targetX=Math.max(-.65,Math.min(.65,targetX+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;});
 canvas.addEventListener("click",e=>{if(pointerMoved){pointerMoved=false;return;}if(!raycaster||!world)return;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;pointer.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(pointer,world.camera);const hits=raycaster.intersectObject(world.rootObj,true),names=componentMap[item.id]||[];for(const hit of hits){let node=hit.object;while(node&&node!==world.rootObj){const index=names.indexOf(node.name);if(index>=0){setInfo(index,true);return;}node=node.parent;}}});
 ["pointerup","pointercancel"].forEach(ev=>canvas.addEventListener(ev,()=>drag=false));
 canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(.62,Math.min(1.72,zoom+e.deltaY*.001));},{passive:false});
 canvas.tabIndex=0;
 canvas.addEventListener("keydown",e=>{
  if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-"].includes(e.key)){autoRotate=false;if(rotateButton){rotateButton.setAttribute("aria-pressed","false");rotateButton.textContent="Auto rotate";}}
  if(e.key==="ArrowLeft"){targetY-=.16;e.preventDefault();}
  else if(e.key==="ArrowRight"){targetY+=.16;e.preventDefault();}
  else if(e.key==="ArrowUp"){targetX=Math.max(-.65,targetX-.12);e.preventDefault();}
  else if(e.key==="ArrowDown"){targetX=Math.min(.65,targetX+.12);e.preventDefault();}
  else if(e.key==="+"||e.key==="="){zoom=Math.max(.62,zoom-.1);e.preventDefault();}
  else if(e.key==="-"){zoom=Math.min(1.72,zoom+.1);e.preventDefault();}
  else if(e.key==="0"){targetX=-.12;targetY=.45;zoom=1;e.preventDefault();}
 });
 canvas.addEventListener("touchstart",e=>{if(e.touches.length===2)pinch=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);},{passive:true});
 canvas.addEventListener("touchmove",e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch){zoom=Math.max(.62,Math.min(1.72,zoom+(pinch-d)*.003));}pinch=d;}},{passive:true});
 canvas.addEventListener("touchend",()=>pinch=0,{passive:true});
 document.addEventListener("visibilitychange",syncRenderState);
 window.addEventListener("pagehide",()=>{clearHighlight();active=false;cancelAnimationFrame(raf);if(observer)observer.disconnect();if(intersectionObserver)intersectionObserver.disconnect();if(world){const geometries=new Set(),materials=new Set(),textures=new Set();world.scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material){for(const material of (Array.isArray(object.material)?object.material:[object.material])){materials.add(material);for(const value of Object.values(material)){if(value&&value.isTexture)textures.add(value);}}}});textures.forEach(texture=>texture.dispose());if(world.scene.environment)world.scene.environment.dispose();geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());}if(renderer)renderer.dispose();},{once:true});
 setInfo(0);
}
window.BeyondRelicsArtifact3D={mount};
})();