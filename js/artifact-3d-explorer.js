async function mountOfficialModel(root,item,loading,canvas){
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
  frame.addEventListener("load",()=>{loading.hidden=true;},{once:true});
  frame.addEventListener("error",()=>{loading.hidden=false;loading.textContent="The NASA interactive viewer could not load. Open the official NASA source page below.";loading.classList.add("is-error");},{once:true});
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
 const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");const buttons=[...root.querySelectorAll("[data-part]")];let renderer,world,raf=0,resumeFrame=null,active=!document.hidden,observer,drag=false,lastX=0,lastY=0,rotX=-.12,rotY=.45,targetX=rotX,targetY=rotY,zoom=1,pinch=0,exploded=false,autoRotate=!reducedMotion.matches;
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
 mountOfficialModel(root,item,loading,canvas).then(official=>{if(official)return;return engine().then(T=>{if(!canvas.isConnected)return;world=makeScene(T,item.id,root);if(!world.groups.upper)root.querySelector("[data-view-explode]").hidden=true;const modelBounds=new T.Box3().setFromObject(world.rootObj);const modelSphere=modelBounds.getBoundingSphere(new T.Sphere());const modelCenter=modelSphere.center.clone();const fitRadius=Math.max(modelSphere.radius,2.4);const baseDistance=fitRadius/Math.sin(T.MathUtils.degToRad(world.camera.fov/2))*1.12;renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"low-power"});renderer.setPixelRatio(Math.min(devicePixelRatio||1,window.innerWidth<700?1.15:1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0x000000,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);observer=new ResizeObserver(()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setPixelRatio(Math.min(devicePixelRatio||1,window.innerWidth<700?1.15:1.5));renderer.setSize(w,h,false);world.camera.aspect=w/h;world.camera.updateProjectionMatrix();});observer.observe(canvas);
 loading.hidden=true;
 function frame(now=performance.now()){if(!active||!renderer)return;raf=requestAnimationFrame(frame);const delta=frame.lastTime?Math.min((now-frame.lastTime)/16.667,2):1;frame.lastTime=now;if(autoRotate&&!reducedMotion.matches&&!drag)targetY+=.0012*delta;const easing=reducedMotion.matches?1:1-Math.pow(.92,delta);rotX+=(targetX-rotX)*easing;rotY+=(targetY-rotY)*easing;world.rootObj.rotation.set(rotX,rotY,0);if(world.ambientStars&&!reducedMotion.matches)world.ambientStars.rotation.y+=.000035*delta;const liveTarget=modelCenter.clone().applyEuler(world.rootObj.rotation);world.camera.position.set(liveTarget.x+baseDistance*.48*zoom,liveTarget.y+baseDistance*.34*zoom,liveTarget.z+baseDistance*.88*zoom);world.camera.lookAt(liveTarget);renderer.render(world.scene,world.camera);}resumeFrame=()=>frame();frame();
 });}).catch(()=>{loading.textContent="3D preview is unavailable here. The verified mission record and source links remain below.";loading.classList.add("is-error");});
 buttons.forEach((b,i)=>b.addEventListener("click",()=>setInfo(i,true)));
 canvas.addEventListener("webglcontextlost",event=>{event.preventDefault();active=false;cancelAnimationFrame(raf);raf=0;loading.hidden=false;loading.textContent="The 3D graphics context was interrupted. If it does not recover, reload this exhibit.";loading.classList.add("is-error");});
 canvas.addEventListener("webglcontextrestored",()=>{if(renderer)renderer.resetState();loading.hidden=true;loading.classList.remove("is-error");active=!document.hidden;if(active&&resumeFrame)resumeFrame();});
 const closeInfo=panel.querySelector(".artifact-3d-callout-close");if(closeInfo)closeInfo.addEventListener("click",()=>setInfo(0,false));
 root.querySelector("[data-view-zoom-in]").addEventListener("click",()=>{zoom=Math.max(.62,zoom-.12);});
 root.querySelector("[data-view-zoom-out]").addEventListener("click",()=>{zoom=Math.min(1.72,zoom+.12);});
 root.querySelector("[data-view-reset]").addEventListener("click",()=>{targetX=-.12;targetY=.45;zoom=1;autoRotate=!reducedMotion.matches;if(rotateButton){rotateButton.setAttribute("aria-pressed",String(autoRotate));rotateButton.textContent=autoRotate?"Pause rotation":"Auto rotate";}setInfo(0,false);});
 root.querySelector("[data-view-explode]").addEventListener("click",()=>{if(!world)return;exploded=!exploded;const g=world.groups.upper;if(g){g.position.y=exploded?2.1:0;}const b=root.querySelector("[data-view-explode]");b.setAttribute("aria-pressed",String(exploded));b.textContent=exploded?"Reassemble":"Separate components";});
 canvas.addEventListener("pointerdown",e=>{drag=true;autoRotate=false;if(rotateButton){rotateButton.setAttribute("aria-pressed","false");rotateButton.textContent="Auto rotate";}lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener("pointermove",e=>{if(!drag)return;targetY+=(e.clientX-lastX)*.008;targetX=Math.max(-.65,Math.min(.65,targetX+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;});
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
 document.addEventListener("visibilitychange",()=>{if(document.hidden){active=false;cancelAnimationFrame(raf);raf=0;}else{active=true;if(renderer&&resumeFrame)resumeFrame();}});
 window.addEventListener("pagehide",()=>{clearHighlight();active=false;cancelAnimationFrame(raf);if(observer)observer.disconnect();if(world){const geometries=new Set(),materials=new Set(),textures=new Set();world.scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material){for(const material of (Array.isArray(object.material)?object.material:[object.material])){materials.add(material);for(const value of Object.values(material)){if(value&&value.isTexture)textures.add(value);}}}});textures.forEach(texture=>texture.dispose());if(world.scene.environment)world.scene.environment.dispose();geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());}if(renderer)renderer.dispose();},{once:true});
 setInfo(0);
}
window.BeyondRelicsArtifact3D={mount};
})();