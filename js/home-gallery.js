(function () {
  "use strict";
  var cards = Array.from(document.querySelectorAll(".cards .card"));
  if (!cards.length || !window.BeyondRelicsImages) return;
  fetch("data/artifacts.json").then(function (response) {
    if (!response.ok) throw new Error("Archive unavailable");
    return response.json();
  }).then(function (records) {
    var byId = Object.create(null);
    records.forEach(function (record) { byId[record.id] = record; });
    cards.forEach(function (card) {
      var match = (card.getAttribute("href") || "").match(/[?&]id=([^&]+)/);
      if (!match) return;
      var item = byId[decodeURIComponent(match[1])];
      var art = card.querySelector(".art");
      if (!item || !item.image_query || !art) return;
      window.BeyondRelicsImages.search(item.image_query, 12).then(function (images) {
        if (!images.length) return;
        var image = document.createElement("img");
        image.alt = images[0].title || item.title;
        image.loading = "lazy";
        image.decoding = "async";
        image.referrerPolicy = "no-referrer";
        image.addEventListener("nasaimageerror", function () { image.remove(); }, { once: true });
        window.BeyondRelicsImages.mount(image, images);
        art.prepend(image);
        var credit = document.createElement("a");
        credit.className = "nasa-image-credit";
        credit.href = images[0].detail;
        credit.target = "_blank";
        credit.rel = "noopener noreferrer";
        credit.textContent = "NASA · " + images[0].id;
        credit.addEventListener("click", function (event) { event.stopPropagation(); });
        art.append(credit);
      });
    });
  }).catch(function () {});
})();