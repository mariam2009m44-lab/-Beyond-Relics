(function () {
  "use strict";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  root.classList.add("motion-ready");

  var selector = [
    ".page > .eyebrow",
    ".page > .page-title",
    ".page > .lead",
    ".toolbar",
    ".grid",
    ".detail",
    ".tl",
    ".data-section",
    ".about-grid > *",
    ".judge-section",
    ".stage",\n    ".scene-panel",\n    ".cp",
    ".mission-brief",
    ".chronicle-section .section-heading",
    ".chronicle-card",
    ".science-panels .section-heading",
    ".science-card",
    ".panel",
    ".release-card",
    ".insight-card",
    ".acard"
  ].join(",");

  var sequence = 0;
  var observer = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { root: null, rootMargin: "0px 0px -7% 0px", threshold: 0.08 })
    : null;

  function prepare(node) {
    if (!node || node.nodeType !== 1) return;
    var candidates = [];
    if (node.matches && node.matches(selector)) candidates.push(node);
    if (node.querySelectorAll) candidates = candidates.concat(Array.prototype.slice.call(node.querySelectorAll(selector)));
    candidates.forEach(function (element) {
      if (element.classList.contains("motion-reveal")) return;
      element.classList.add("motion-reveal");
      element.style.setProperty("--motion-index", String(sequence % 6));
      sequence += 1;
      if (observer) observer.observe(element);
      else element.classList.add("is-visible");
    });
  }

  function start() {
    prepare(document.body);
    if ("MutationObserver" in window) {
      var mutations = new MutationObserver(function (records) {
        records.forEach(function (record) {
          record.addedNodes.forEach(prepare);
        });
      });
      mutations.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();