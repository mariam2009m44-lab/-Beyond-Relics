/* Beyond Relics — lightweight motion orchestration */
(function () {
  "use strict";
  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isReader = doc.body && doc.body.classList.contains("reader-page");

  // A tiny reading-progress indicator; no layout reads are performed during scroll.
  var progress = doc.createElement("div");
  progress.className = "br-motion-progress";
  progress.setAttribute("aria-hidden", "true");
  doc.body.appendChild(progress);

  var ticking = false;
  function updateProgress() {
    var max = Math.max(1, root.scrollHeight - window.innerHeight);
    var ratio = Math.min(1, Math.max(0, window.scrollY / max));
    progress.style.setProperty("--br-scroll-progress", ratio);
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

  if (reduceMotion || !("IntersectionObserver" in window)) return;

  var selectors = [
    "main > .eyebrow", "main > .page-title", "main > .page-lead",
    "main > section", "main > .panel", "main > .panel-grid",
    ".story-worlds-heading", ".story-world-card", ".chronicle-card",
    ".brief-copy", ".brief-stats > div", ".detective-heading",
    ".detective-console", ".science-card", ".mission-frame",
    ".release-card", ".insight-card", ".judge-pillars article",
    ".timeline-item", ".timeline-event", ".artifact-card",
    ".data-panel", ".data-card", ".reader-title"
  ];
  var candidates = Array.prototype.slice.call(doc.querySelectorAll(selectors.join(",")));
  if (!candidates.length) return;

  var seen = new WeakSet();
  candidates.forEach(function (element, index) {
    if (seen.has(element) || element.closest("[hidden]")) return;
    seen.add(element);
    element.setAttribute("data-motion-reveal", "");
    if (element.matches(".brief-stats > div, .story-world-card, .chronicle-card, .science-card, .mission-frame, .release-card, .insight-card, .judge-pillars article")) {
      element.style.setProperty("--br-motion-delay", Math.min(index % 4, 3) * 75 + "ms");
    }
  });

  root.classList.add("motion-ready");
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-motion-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  candidates.forEach(function (element) {
    if (element.hasAttribute("data-motion-reveal")) observer.observe(element);
  });

  // Reader controls stay responsive; the reader's own script owns page and camera motion.
  if (isReader) doc.body.classList.add("br-motion-reader-ready");
})();
