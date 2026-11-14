(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var progress = doc.createElement("div");
  progress.className = "br-scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  doc.body.appendChild(progress);

  var ticking = false;
  function updateProgress() {
    var max = doc.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = "scaleX(" + Math.max(0, Math.min(1, ratio)) + ")";
    ticking = false;
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateProgress);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateProgress();

  if (reduceMotion) {
    root.classList.add("br-motion-reduced");
    return;
  }

  root.classList.add("br-motion-enabled");

  var hero = doc.querySelector(".hero");
  if (hero && !hero.querySelector(".br-orbit-system")) {
    var orbit = doc.createElement("div");
    orbit.className = "br-orbit-system";
    orbit.setAttribute("aria-hidden", "true");
    orbit.innerHTML = '<span class="br-orbit br-orbit-one"></span><span class="br-orbit br-orbit-two"></span><span class="br-orbit-satellite"></span><span class="br-orbit-glint"></span>';
    hero.appendChild(orbit);
  }

  var selector = [
    ".hero .copy", ".hero .card", ".mission-brief", ".chronicle-card",
    ".data-section", ".judge-section", ".judge-hero", ".judge-pillars article",
    ".acard", ".tl-item", ".scene-panel", ".wave-stat", ".insight-card",
    ".release-card", ".pathfinder-explorer", ".mission-detective"
  ].join(",");

  var sequence = 0;
  function reveal(node) {
    if (!node || node.nodeType !== 1) return;
    var list = [];
    if (node.matches && node.matches(selector)) list.push(node);
    if (node.querySelectorAll) list = list.concat(Array.prototype.slice.call(node.querySelectorAll(selector)));
    list.forEach(function (item) {
      if (item.classList.contains("br-motion-target")) return;
      item.classList.add("br-motion-target");
      item.style.setProperty("--br-motion-order", String(sequence++ % 7));
      if (observer) observer.observe(item);
      else item.classList.add("br-in-view");
    });
    animateCharts(node);
  }

  function animateCharts(node) {
    var charts = [];
    if (node.matches && node.matches("[data-wave-chart]")) charts.push(node);
    if (node.querySelectorAll) charts = charts.concat(Array.prototype.slice.call(node.querySelectorAll("[data-wave-chart]")));
    charts.forEach(function (container) {
      var svg = container.querySelector("svg");
      if (!svg || svg.dataset.brAnimated) return;
      svg.dataset.brAnimated = "true";
      var path = svg.querySelector(".wave-line");
      if (path) {
        path.setAttribute("pathLength", "1");
        path.classList.add("br-draw-line");
      }
    });
  }

  var observer = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("br-in-view");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" })
    : null;

  reveal(doc.body);

  if ("MutationObserver" in window) {
    var mutationObserver = new MutationObserver(function (records) {
      records.forEach(function (record) {
        record.addedNodes.forEach(function (node) {
          reveal(node);
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(".scene-panel")) node.classList.add("br-scene-arrive");
          if (node.querySelectorAll) node.querySelectorAll(".scene-panel").forEach(function (panel) {
            panel.classList.add("br-scene-arrive");
          });
        });
      });
    });
    mutationObserver.observe(doc.body, { childList: true, subtree: true });
  }

  var earth = doc.querySelector(".hero .earth");
  if (earth && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var frame = 0, pointerX = 0, pointerY = 0;
    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 9;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 7;
      if (frame) return;
      frame = window.requestAnimationFrame(function () {
        earth.style.setProperty("--br-pointer-x", pointerX.toFixed(2) + "px");
        earth.style.setProperty("--br-pointer-y", pointerY.toFixed(2) + "px");
        frame = 0;
      });
    }, { passive: true });
    hero.addEventListener("pointerleave", function () {
      earth.style.setProperty("--br-pointer-x", "0px");
      earth.style.setProperty("--br-pointer-y", "0px");
    }, { passive: true });
  }
})();