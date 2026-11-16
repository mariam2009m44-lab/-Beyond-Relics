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
const universe3d = read("js/mission-universe.js");
check(artifact3d.includes("frame.lastTime") && universe3d.includes("frame.lastTime"), "3D camera and object motion use frame-rate independent delta time");
check(artifact3d.includes("function makeStudioEnvironment(T)") && artifact3d.includes("scene.environment=makeStudioEnvironment(T)"), "Artifact reconstructions use a generated studio reflection environment");
check(artifact3d.includes("toneMappingExposure=1.08") && artifact3d.includes("envMapIntensity"), "Artifact PBR materials use a calibrated tone-mapping and reflection workflow");
check(artifact3d.includes("cellGrid") && artifact3d.includes("gridMat"), "Artistic rover reconstructions include segmented solar-array surface details");
check(artifact3d.includes('setAttribute("environment-image","neutral")'), "Official GLB exhibits use a neutral environment without modifying source geometry");
check(artifact3d.includes("world.scene.environment.dispose()"), "Generated studio environment is disposed with the artifact scene");
check(artifact3d.includes("if(lunar||mars)") && artifact3d.includes("terrainY"), "Only lunar and Mars exhibits receive a mission-surface environment with per-model ground alignment");
check(artifact3d.includes("contactShadow") && artifact3d.includes("CanvasTexture"), "Surface exhibits include a soft procedural contact shadow");
check(artifact3d.includes("compactRender?44:84") && artifact3d.includes("compactRender?30:72"), "Terrain and rock detail adapt to lower-power and mobile devices");
check(artifact3d.includes("starRand") && !artifact3d.includes("Math.random()"), "Procedural star fields are deterministic between visits");
check(artifact3d.includes('matchMedia("(prefers-reduced-motion: reduce)")') && artifact3d.includes('const rotating=viewer.hasAttribute("auto-rotate")'), "Official NASA model rotation respects reduced-motion preferences and reports the correct control state");
check(artifacts.includes("Arrow keys to explore") && artifacts.includes("+/- to zoom"), "Procedural 3D exhibits display keyboard interaction instructions");
check(css.includes(".artifact-3d-canvas:focus-visible") && css.includes(".artifact-3d-callout-close{pointer-events:auto}"), "3D canvas focus and component-guide close control remain accessible");


check(artifact3d.includes("webglcontextlost") && artifact3d.includes("webglcontextrestored") && universe3d.includes("webglcontextlost") && universe3d.includes("webglcontextrestored"), "Both 3D experiences handle WebGL context loss and restoration");
check(artifact3d.includes("resumeFrame=()=>frame()"), "Artifact viewer can resume its render loop after a restored WebGL context");
check(artifact3d.includes("if(document.hidden){active=false;cancelAnimationFrame(raf);raf=0;}else{active=true;if(renderer&&resumeFrame)resumeFrame();}"), "Artifact viewer correctly pauses and resumes after tab visibility changes");
check(universe3d.includes('canvas.addEventListener("keydown"') && universe3d.includes('canvas[tabindex]'), "Solar explorer supports keyboard camera controls and includes its canvas in the modal focus loop");
check(artifact3d.includes("geometries.forEach(geometry=>geometry.dispose())") && universe3d.includes("geometries.forEach(geometry=>geometry.dispose())"), "3D scene geometry and material resources are explicitly disposed on page exit");
check(exists("docs/3D-ENGINEERING-STANDARDS.md"), "3D engineering standards and review checklist are documented");


check(Array.isArray(records) && records.length > 0, "Artifact catalogue is valid JSON and non-empty");
check(index.includes('id="home"') && index.includes('id="mission-stories"'), "Homepage presents the original mission-archive experience");
check(index.includes('href="data.html"') && index.includes('href="artifacts.html"'), "Homepage links directly to the NASA Data Lab and artifact archive");
check(index.includes('href="challenge.html"') && index.includes('href="timeline.html"'), "Homepage retains the challenge brief and mission timeline navigation");
check(comicPage.includes('id="reader-image"') && comicPage.includes('js/comic-reader.js'), "Comic reader page loads the dedicated page viewer");
check(!comicPage.includes("three.min.js") && !comicPage.includes("comic-world-3d.js") && !comicPage.includes("mission-universe"), "Comic reader remains a 2D-only experience");
const creditsPage = read("credits.html");
check(creditsPage.includes("ASSETS.md"), "Credits page links to the existing asset register");
check(comicScript.includes("requestFullscreen") && comicScript.includes("ArrowRight") && comicScript.includes("ArrowLeft"), "Comic reader supports full-screen and keyboard page navigation");
const comicRecords = records.filter((item) => Array.isArray(item.story_artwork) && item.story_artwork.length);
check(comicRecords.length > 0 && comicRecords.every((item) => item.story_artwork.every((frame) => typeof frame.file === "string")), "Comic collection is built only from assigned team artwork");
check(dataPage.includes("Read the Moon through its data"), "Waveform lab wording describes a plotted data experience, not audio playback");
check(dataPage.indexOf("js/geocsv-parser.js") >= 0 && dataPage.indexOf("js/geocsv-parser.js") < dataPage.indexOf("js/apollo-waveform-lab.js"), "GeoCSV parser loads before the waveform explorer");

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
