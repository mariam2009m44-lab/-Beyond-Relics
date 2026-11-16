(function(){
"use strict";
const stage=document.getElementById("reader-stage");
if(!stage||!window.THREE)return;
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const chapter=new URLSearchParams(location.search).get("chapter")||"";
const isMars=chapter==="pathfinder-sojourner";
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.setSize(stage.clientWidth,stage.clientHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;
renderer.domElement.className="comic-world-canvas";
renderer.domElement.setAttribute("aria-hidden","true");
stage.prepend(renderer.domElement);
const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(isMars?0x1a0d0b:0x050b18,.022);
const camera=new THREE.PerspectiveCamera(43,stage.clientWidth/stage.clientHeight,.1,180);
camera.position.set(0,0,17);
scene.add(new THREE.HemisphereLight(0x9ac9e8,0x241b20,1.45));
const key=new THREE.PointLight(isMars?0xffa66b:0x79d8ed,85,70);key.position.set(-7,7,9);scene.add(key);
const fill=new THREE.PointLight(0x4c8acb,45,80);fill.position.set(8,-2,4);scene.add(fill);
const world=new THREE.Group();scene.add(world);
const sphereMat=new THREE.MeshStandardMaterial({color:isMars?0x9d4b32:0x254b69,roughness:.94,metalness:.04});
const planet=new THREE.Mesh(new THREE.SphereGeometry(isMars?4.8:3.8,48,40),sphereMat);
planet.position.set(isMars?-7.4:7.5,isMars?-1.2:1.8,-9);world.add(planet);
const halo=new THREE.Mesh(new THREE.SphereGeometry(isMars?4.98:3.96,40,32),new THREE.MeshBasicMaterial({color:isMars?0xe58b5b:0x57c8e8,transparent:true,opacity:.12,side:THREE.BackSide}));
halo.position.copy(planet.position);world.add(halo);
const ring=new THREE.Mesh(new THREE.TorusGeometry(isMars?5.8:4.8,.018,6,140),new THREE.MeshBasicMaterial({color:isMars?0xe3a17a:0x79cfe3,transparent:true,opacity:.45}));
ring.position.copy(planet.position);ring.rotation.set(1.22,.24,.18);world.add(ring);
const starsGeo=new THREE.BufferGeometry(),starPos=[];
for(let i=0;i<1150;i++)starPos.push((Math.random()-.5)*105,(Math.random()-.5)*65,-Math.random()*90-8);
starsGeo.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));
const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xd7eaff,size:.065,transparent:true,opacity:.78}));
scene.add(stars);
const dustGeo=new THREE.BufferGeometry(),dustPos=[];
for(let i=0;i<180;i++)dustPos.push((Math.random()-.5)*34,(Math.random()-.5)*20,Math.random()*5-15);
dustGeo.setAttribute("position",new THREE.Float32BufferAttribute(dustPos,3));
const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:isMars?0xffb27d:0x72d8ec,size:.035,transparent:true,opacity:.42}));
scene.add(dust);
// A restrained 3D horizon and landing-site beacon, kept behind the original comic artwork.
const floor=new THREE.Mesh(new THREE.PlaneGeometry(160,100),new THREE.MeshStandardMaterial({color:isMars?0x24120e:0x081321,roughness:1,metalness:0}));
floor.rotation.x=-Math.PI/2;floor.position.set(0,-7.4,-12);scene.add(floor);
const grid=new THREE.GridHelper(90,60,isMars?0x824b37:0x24506b,isMars?0x442b27:0x142d43);
grid.position.set(0,-7.35,-12);scene.add(grid);
if(isMars){
 const beacon=new THREE.Group();beacon.position.set(6,-4.8,-3);scene.add(beacon);
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.045,.07,2.2,8),new THREE.MeshStandardMaterial({color:0xc9b17d,metalness:.5,roughness:.45}));stem.position.y=1;beacon.add(stem);
 const lamp=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),new THREE.MeshBasicMaterial({color:0xffb36d}));lamp.position.y=2.15;beacon.add(lamp);
 const glow=new THREE.PointLight(0xff8955,12,8);glow.position.y=2.2;beacon.add(glow);
}
let pointerX=0,pointerY=0,targetX=0,targetY=0,last=0,frame=0;
stage.addEventListener("pointermove",e=>{const r=stage.getBoundingClientRect();targetX=((e.clientX-r.left)/r.width-.5)*.7;targetY=((e.clientY-r.top)/r.height-.5)*.35;},{passive:true});
stage.addEventListener("pointerleave",()=>{targetX=0;targetY=0;},{passive:true});
const resize=new ResizeObserver(()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);});
resize.observe(stage);
function animate(t){
 requestAnimationFrame(animate);
 if(document.hidden)return;
 const dt=Math.min(.05,(t-last)/1000||0);last=t;frame+=dt;
 pointerX+=(targetX-pointerX)*.025;pointerY+=(targetY-pointerY)*.025;
 const cinema=document.body.classList.contains("is-cinematic-playing");
 camera.position.x=pointerX+(cinema?Math.sin(frame*.18)*.12:0);
 camera.position.y=-pointerY+(cinema?Math.sin(frame*.13)*.08:0);
 camera.lookAt(0,0,-4);
 if(!reduced){planet.rotation.y+=dt*.012;ring.rotation.z+=dt*.004;stars.rotation.y+=dt*.0012;dust.rotation.y-=dt*.002;}
 renderer.render(scene,camera);
}
requestAnimationFrame(animate);
stage.classList.add("has-3d-world");
stage.dataset.world=isMars?"mars":"deep-space";
})();