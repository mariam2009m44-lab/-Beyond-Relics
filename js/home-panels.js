(function () {
  "use strict";
  var root = document.getElementById("home-chronicle");
  if (!root || !window.BeyondRelicsImages) return;
  var cards = Array.from(root.querySelectorAll("[data-artifact]"));
  var queries = {
    "lunar-module": "Apollo lunar module descent stage on Moon NASA",
    "apollo-12-alsep": "Apollo lunar surface experiments package ALSEP NASA",
    "pathfinder-sojourner": "Mars Pathfinder Sojourner rover NASA 1997",
    "insight": "NASA InSight lander Mars surface SEIS"
  };
  cards.forEach(function (card) {
    var id = card.getAttribute("data-artifact");
    var visual = card.querySelector("[data-chronicle-visual]");
    var query = queries[id];
    if (!visual || !query) return;
    window.BeyondRelicsImages.search(query, 12).then(function (records) {
      if (!records.length || !visual.isConnected) return;
      var image = document.createElement("img");
      image.alt = records[0].title || "NASA mission photograph";
      image.loading = "lazy";
      image.decoding = "async";
      image.referrerPolicy = "no-referrer";
      var credit = visual.querySelector(".chronicle-credit");
      if (credit && credit.tagName !== "A") {
        var sourceLink = document.createElement("a");
        sourceLink.className = credit.className;
        sourceLink.textContent = credit.textContent;
        credit.replaceWith(sourceLink);
        credit = sourceLink;
      }
      image.addEventListener("nasaimageload", function (event) {
        var record = event.detail;
        if (!credit) return;
        credit.textContent = "NASA · " + record.id + " ↗";
        credit.href = record.detail;
        credit.target = "_blank";
        credit.rel = "noopener noreferrer";
      });
      image.addEventListener("nasaimageerror", function () { image.remove(); }, { once: true });
      window.BeyondRelicsImages.mount(image, records);
      visual.prepend(image);
    }).catch(function () {});
  });
})();

/* Horizontal story-deck controls: native scrolling, touch swipe and keyboard friendly. */
(function () {
  "use strict";
  var viewport = document.querySelector("[data-story-viewport]");
  if (!viewport) return;
  var cards = Array.from(viewport.querySelectorAll("[data-story-card]"));
  var previous = document.querySelector("[data-story-prev]");
  var next = document.querySelector("[data-story-next]");
  var current = document.querySelector("[data-story-current]");
  var total = document.querySelector("[data-story-total]");
  if (!cards.length) return;
  if (total) total.textContent = String(cards.length).padStart(2, "0");
  function activeIndex() {
    var center = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
    var best = 0, distance = Infinity;
    cards.forEach(function (card, index) {
      var rect = card.getBoundingClientRect();
      var d = Math.abs(rect.left + rect.width / 2 - center);
      if (d < distance) { distance = d; best = index; }
    });
    return best;
  }
  function update() {
    var index = activeIndex();
    if (current) current.textContent = String(index + 1).padStart(2, "0");
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === cards.length - 1;
  }
  function move(direction) {
    var index = Math.max(0, Math.min(cards.length - 1, activeIndex() + direction));
    cards[index].scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest", inline: "start" });
    window.setTimeout(update, 420);
  }
  if (previous) previous.addEventListener("click", function () { move(-1); });
  if (next) next.addEventListener("click", function () { move(1); });
  viewport.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
})();
