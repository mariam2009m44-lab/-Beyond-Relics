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