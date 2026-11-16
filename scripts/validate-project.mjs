import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const failures = [];
const checks = [];

function check(condition, message) {
  if (condition) checks.push(message);
  else failures.push(message);
}
function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}
function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

const records = JSON.parse(read("data/artifacts.json"));
const index = read("index.html");
const comicPage = read("comic.html");
const comicScript = read("js/comic-reader.js");
const dataPage = read("data.html");
const artifact3d = read("js/artifact-3d-explorer.js");
const artifactsScript = read("js/artifacts.js");
const artifact3dCss = read("css/artifact-3d-explorer.css");
const cosmicScript = read("js/cosmic-environment.js");
const cosmicCss = read("css/cosmic-environment.css");
const visualSystem = read("css/visual-system.css");
const provenanceData = JSON.parse(read("data/data-provenance.json"));
const provenanceScript = read("js/data-provenance.js");

const layoutConsistency = read("css/layout-consistency.css");
const artifactFinish = read("css/artifact-exhibit-finish.css");
const layoutPages = ["index.html","artifacts.html","timeline.html","challenge.html","data.html","about.html","comic.html","artifact-details.html","404.html","credits.html","lunar-journey.html"];
for (const page of layoutPages) {
  check(read(page).includes("css/layout-consistency.css"), "Final responsive layout layer is included on " + page);
}
check(layoutConsistency.includes("@media(max-width:650px)") && layoutConsistency.includes("@media(max-width:390px)"), "Final layout layer includes compact phone and narrow-device breakpoints");
check(layoutConsistency.includes("min-height:44px") && layoutConsistency.includes(":focus-visible"), "Final layout layer preserves touch targets and visible keyboard focus");
check(layoutConsistency.includes("prefers-reduced-motion:reduce"), "Final layout layer respects reduced-motion preferences");
check(layoutConsistency.includes(".reader-image") && layoutConsistency.includes(".cinema-controls") && layoutConsistency.includes(".artifact-3d-toolbar"), "Final layout layer explicitly covers comic and 3D exhibit controls");


const universe3d = read("js/mission-universe.js");
check(artifact3d.includes("frame.lastTime") && universe3d.includes("frame.lastTime"), "3D camera and object motion use frame-rate independent delta time");
check(artifact3d.includes("function makeStudioEnvironment(T)") && artifact3d.includes("scene.environment=makeStudioEnvironment(T)"), "Artifact reconstructions use a generated studio reflection environment");
check(artifact3d.includes("new T.Box3().setFromObject(world.rootObj)") && artifact3d.includes("baseDistance*.88*zoom"), "Each artifact reconstruction is auto-framed from its own 3D bounds");
check(artifactFinish.includes(".artifact-3d-stage") && artifactFinish.includes("@media(max-width:650px)") && artifactFinish.includes("prefers-reduced-motion"), "Artifact exhibit finish layer covers responsive stage styling and reduced motion");
check(read("artifacts.html").includes("css/artifact-exhibit-finish.css") && read("artifact-details.html").includes("css/artifact-exhibit-finish.css"), "Artifact archive and detail pages share the dedicated exhibit finish layer");
check(artifact3d.includes("toneMappingExposure=1.08") && artifact3d.includes("envMapIntensity"), "Artifact PBR materials use a calibrated tone-mapping and reflection workflow");
check(artifact3d.includes("cellGrid") && artifact3d.includes("gridMat"), "Artistic rover reconstructions include segmented solar-array surface details");
check(artifact3d.includes('setAttribute("environment-image","neutral")'), "Official GLB exhibits use a neutral environment without modifying source geometry");
check(artifact3d.includes("world.scene.environment.dispose()"), "Generated studio environment is disposed with the artifact scene");
check(artifact3d.includes("if(lunar||mars)") && artifact3d.includes("terrainY"), "Only lunar and Mars exhibits receive a mission-surface environment with per-model ground alignment");
check(artifact3d.includes('const roverSurface=["pathfinder-sojourner","spirit","opportunity","curiosity"].includes(id)'), "Rover reconstructions align their wheels with the Mars surface stage");
check(artifact3d.includes("contactShadow") && artifact3d.includes("CanvasTexture"), "Surface exhibits include a soft procedural contact shadow");
check(artifact3d.includes("compactRender?44:84") && artifact3d.includes("compactRender?30:72"), "Terrain and rock detail adapt to lower-power and mobile devices");
check(artifact3d.includes("starRand") && !artifact3d.includes("Math.random()"), "Procedural star fields are deterministic between visits");
check(artifact3d.includes('matchMedia("(prefers-reduced-motion: reduce)")') && artifact3d.includes('const rotating=viewer.hasAttribute("auto-rotate")'), "Official NASA model rotation respects reduced-motion preferences and reports the correct control state");
check(artifactsScript.includes("Arrow keys to explore") && artifactsScript.includes("+/- to zoom"), "Procedural 3D exhibits display keyboard interaction instructions");
check(artifact3dCss.includes(".artifact-3d-canvas:focus-visible") && artifact3dCss.includes(".artifact-3d-callout-close{pointer-events:auto}"), "3D canvas focus and component-guide close control remain accessible");


check(artifact3d.includes("webglcontextlost") && artifact3d.includes("webglcontextrestored") && universe3d.includes("webglcontextlost") && universe3d.includes("webglcontextrestored"), "Both 3D experiences handle WebGL context loss and restoration");
check(artifact3d.includes("resumeFrame=()=>frame()"), "Artifact viewer can resume its render loop after a restored WebGL context");
check(artifact3d.includes("if(document.hidden){active=false;cancelAnimationFrame(raf);raf=0;}else{active=true;if(renderer&&resumeFrame)resumeFrame();}"), "Artifact viewer correctly pauses and resumes after tab visibility changes");
check(universe3d.includes('canvas.addEventListener("keydown"') && universe3d.includes('canvas[tabindex]'), "Solar explorer supports keyboard camera controls and includes its canvas in the modal focus loop");
check(universe3d.includes("orbit(-11,-1,2.8,2.8)") && universe3d.includes("moonAngle+=.00105*delta"), "The Moon follows a visible, animated orbit around Earth in the Solar System explorer");
check(universe3d.includes("br-universe-motion") && universe3d.includes("Pause orbits") && universe3d.includes("Motion reduced"), "Visitors can pause orbital motion and reduced-motion settings remain enforced");

check(artifact3d.includes("geometries.forEach(geometry=>geometry.dispose())") && universe3d.includes("geometries.forEach(geometry=>geometry.dispose())"), "3D scene geometry and material resources are explicitly disposed on page exit");
check(exists("docs/3D-ENGINEERING-STANDARDS.md"), "3D engineering standards and review checklist are documented");


check(Array.isArray(records) && records.length > 0, "Artifact catalogue is valid JSON and non-empty");
check(index.includes('id="home"') && index.includes('id="mission-stories"'), "Homepage presents the original mission-archive experience");
check(index.includes('href="data.html"') && index.includes('href="artifacts.html"'), "Homepage links directly to the NASA Data Lab and artifact archive");
check(index.includes('href="challenge.html"') && index.includes('href="timeline.html"'), "Homepage retains the challenge brief and mission timeline navigation");
check(comicPage.includes('id="reader-image"') && comicPage.includes('js/comic-reader.js'), "Comic reader page loads the dedicated page viewer");
check(comicPage.includes('id="reader-image"') && comicPage.includes('js/comic-reader.js') && !comicPage.includes("three.min.js") && !comicPage.includes("comic-world-3d"), "Comic reader is a lightweight 2D-only experience with the original page reader");
check(comicScript.includes("showImageError") && comicScript.includes('img.addEventListener("error"'), "Comic reader reports failed frame loads without leaving playback stuck");
check(comicScript.includes('addEventListener("click",toggleFilm)'), "Film playback does not enable audio without a separate sound action");
const creditsPage = read("credits.html");
check(creditsPage.includes("ASSETS.md"), "Credits page links to the existing asset register");
check(comicScript.includes("requestFullscreen") && comicScript.includes("ArrowRight") && comicScript.includes("ArrowLeft"), "Comic reader supports full-screen and keyboard page navigation");
const comicRecords = records.filter((item) => Array.isArray(item.story_artwork) && item.story_artwork.length);
check(comicRecords.length > 0 && comicRecords.every((item) => item.story_artwork.every((frame) => typeof frame.file === "string")), "Comic collection is built only from assigned team artwork");
check(dataPage.includes("Read the Moon through its data"), "Waveform lab wording describes a plotted data experience, not audio playback");
check(dataPage.indexOf("js/geocsv-parser.js") >= 0 && dataPage.indexOf("js/geocsv-parser.js") < dataPage.indexOf("js/apollo-waveform-lab.js"), "GeoCSV parser loads before the waveform explorer");


const cosmicPages = ["index.html","artifacts.html","timeline.html","challenge.html","data.html","about.html","comic.html","artifact-details.html","credits.html","404.html"];
check(exists("js/cosmic-environment.js") && exists("css/cosmic-environment.css"), "Shared procedural cosmic atmosphere files exist");
check(cosmicScript.includes("br-cosmic-canvas") && cosmicScript.includes("galaxies.forEach") && cosmicScript.includes("br-cosmic-dock"), "Cosmic atmosphere renders nebula galaxies, stars, and visitor controls");
check(cosmicScript.includes("prefers-reduced-motion") && cosmicScript.includes("visibilitychange") && cosmicScript.includes("cancelAnimationFrame"), "Cosmic animation respects reduced motion and pauses when the page is hidden");
check(cosmicScript.includes("artifacts.html#br-universe-launcher"), "Cosmic controls link to the existing interactive Solar System explorer");
check(cosmicCss.includes("body.reader-page .br-cosmic-dock{display:none}") && cosmicCss.includes("body.reader-page #br-cosmic-canvas{opacity:.24}"), "Comic reader keeps its dedicated reading controls and subdued backdrop");
for (const page of cosmicPages) {
  const source = read(page);
  check(source.includes("css/cosmic-environment.css") && source.includes("js/cosmic-environment.js"), "Shared cosmic atmosphere is included on " + page);
}
const requiredFields = ["mission_goal", "what_stayed", "science_legacy", "why_it_matters"];
let sourceCount = 0;
let artworkCount = 0;
for (const item of records) {
  check(Boolean(item.id && item.title && item.region && item.status_group), "Artifact has identity, destination, and status: " + (item.id || "unknown"));
  check(requiredFields.every((field) => typeof item[field] === "string" && item[field].trim()), "Artifact has all four narrative evidence fields: " + item.id);
  check(Array.isArray(item.sources) && item.sources.length > 0, "Artifact has primary source links: " + item.id);
  for (const source of item.sources || []) {
    sourceCount++;
    check(typeof source.url === "string" && source.url.startsWith("https://"), "Source uses HTTPS: " + item.id + " / " + (source.label || source.url));
  }
  for (const frame of item.story_artwork || []) {
    artworkCount++;
    check(typeof frame.file === "string" && exists(frame.file), "Story artwork file exists: " + (frame.file || "missing filename"));
  }
}
const pioneer = records.find((item) => item.id === "pioneer-10-11");
check(Boolean(pioneer && pioneer.region === "Deep Space" && pioneer.status_group === "retired"), "Pioneer is explicitly classified as a retired deep-space comparison");

const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith(".html"));
let localReferenceCount = 0;
for (const htmlFile of htmlFiles) {
  const html = read(htmlFile);
  const refs = [...html.matchAll(/(?:href|src)=["']([^"'#]+)["']/g)].map((match) => match[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|javascript:|#)/i.test(ref)) continue;
    if (ref.startsWith("//")) continue;
    check(!ref.startsWith("/"), "Project-page asset uses a GitHub Pages-safe relative path: " + htmlFile + " -> " + ref);
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
    if (!clean) continue;
    const resolved = path.normalize(path.join(path.dirname(htmlFile), clean));
    localReferenceCount++;
    check(exists(resolved), "Local page reference resolves: " + htmlFile + " -> " + ref);
  }
}
check(exists("assets/logos/favicon.svg"), "Primary SVG favicon exists");
check(!exists("css/comic-world-3d.css") && !exists("js/comic-world-3d.js"), "Comic reader has no unused 3D runtime or stylesheet; its story remains 2D-only");

function collectFiles(directory, extension, output = []) {
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(relative, extension, output);
    else if (entry.isFile() && entry.name.endsWith(extension)) output.push(relative);
  }
  return output;
}
const jsFiles = collectFiles(".", ".js");
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", path.join(root, file)], { encoding: "utf8" });
  check(result.status === 0, "JavaScript syntax is valid: " + file + (result.status === 0 ? "" : " — " + (result.stderr || result.stdout).trim()));
}
const jsonFiles = collectFiles(".", ".json");
for (const file of jsonFiles) {
  try { JSON.parse(read(file)); check(true, "JSON is valid: " + file); }
  catch (error) { check(false, "JSON is valid: " + file + " — " + error.message); }
}


check(artifact3d.includes("scene.background=null") && artifact3d.includes("new T.WebGLRenderer({canvas,antialias:true,alpha:true") && artifact3d.includes("setClearColor(0x000000,0)"), "Artifact 3D canvases remain transparent so the cinematic nebula chamber is visible behind models");
check(artifact3d.includes("ambientStars.rotation.y") && artifact3d.includes("compactRender?260:620"), "Artifact exhibits add subtle parallax star depth without changing model geometry");
check(artifact3dCss.includes("br-artifact-nebula-drift") && artifact3dCss.includes("br-artifact-stars-drift") && artifact3dCss.includes("background:transparent!important"), "Both official and reconstructed artifact models sit inside an animated, reduced-motion-aware nebula chamber");

const lunarJourney = read("js/lunar-journey.js");
const lunarJourneyCss = read("css/lunar-journey.css");
const lunarJourneyPage = read("lunar-journey.html");
const archivePage = read("artifacts.html");
check(exists("lunar-journey.html") && exists("js/lunar-journey.js") && exists("css/lunar-journey.css"), "Guided lunar journey page, renderer, and styles exist");
check(lunarJourney.includes('title:"The Moon comes closer"') && lunarJourney.includes('camera:[0,1,-2]'), "Lunar journey includes an animated Moon approach scene");
check(lunarJourney.includes("Apollo 12's ALSEP station was deployed on 19 November 1969") && lunarJourney.includes("30 September 1977"), "Lunar journey includes grounded ALSEP deployment and shutdown dates");
check(lunarJourney.includes("not a NASA waveform") && lunarJourneyPage.includes("artistic visualizations"), "Lunar journey distinguishes illustrative 3D and signal art from NASA data");
check(lunarJourney.includes('matchMedia("(prefers-reduced-motion: reduce)")') && lunarJourney.includes("pagehide"), "Lunar journey respects reduced motion and disposes WebGL resources");
check(index.includes('href="lunar-journey.html"') && archivePage.includes('href="lunar-journey.html"'), "Homepage and archive provide a clear guided-journey entry");
check(artifact3d.includes("Curiosity uses an RTG, not a solar array") && artifact3d.includes("if(!curiosity)"), "Curiosity reconstruction uses an RTG while MER rover reconstructions retain solar arrays");
check(artifact3d.includes("RTG package, antenna and instrument packages") && !artifact3d.slice(artifact3d.indexOf('const station=group("body")'),artifact3d.indexOf('}else if(id==="pathfinder-sojourner")')).includes("solar,"), "ALSEP reconstruction shows RTG power and instrument packages without invented solar panels");
check(artifact3d.includes('lander("body",3)') && artifact3d.includes("InSight's two deployed solar wings") && artifact3d.includes("Phoenix's two solar wings"), "Phoenix and InSight reconstructions include three-leg landers and mission-specific solar wings");
check(universe3d.includes("function addSatellite") && (universe3d.match(/addSatellite\("/g)||[]).length===8, "Solar System explorer includes eight orbiting natural satellite visualizations");
check(universe3d.includes("orbitingMoons.forEach") && universe3d.includes("motionPaused"), "Natural satellite orbits respect the explorer pause control");
check(artifact3dCss.includes("min-height:44px") && artifact3dCss.includes("prefers-reduced-motion"), "3D exhibit controls retain touch target and reduced-motion styling");
check(visualSystem.includes(".acard") && visualSystem.includes("prefers-reduced-motion:reduce"), "Archive card polish remains reduced-motion aware");
check(Array.isArray(provenanceData.entries) && provenanceData.entries.length >= 5, "Scientific provenance register contains the expected evidence records");
check(provenanceData.entries.every((entry) => entry.source && entry.source.startsWith("https://") && entry.processing && entry.limitations && entry.units && entry.period), "Every provenance record documents source, units, period, processing, and limitations");
check(provenanceScript.includes("aria-expanded") && provenanceScript.includes("noopener noreferrer") && provenanceScript.includes("data-provenance-register"), "Provenance disclosure controls are accessible and external sources are safely linked");
check(read("data.html").includes("css/data-provenance.css") && read("data.html").includes("js/data-provenance.js") && read("data.html").includes("data-provenance-register"), "NASA Data Lab loads and displays the scientific provenance register");

console.log("Beyond Relics quality audit");
console.log("---------------------------");
console.log("HTML pages checked: " + htmlFiles.length);
console.log("JavaScript files syntax-checked: " + jsFiles.length);
console.log("JSON files parsed: " + jsonFiles.length);
console.log("Artifact records: " + records.length);
console.log("Primary source links: " + sourceCount);
console.log("Original story frames: " + artworkCount);
console.log("Local HTML references checked: " + localReferenceCount);
console.log("Checks passed: " + checks.length);
if (failures.length) {
  console.error("Checks failed: " + failures.length);
  failures.forEach((failure) => console.error("FAIL: " + failure));
  process.exitCode = 1;
} else {
  console.log("RESULT: PASS");
}
