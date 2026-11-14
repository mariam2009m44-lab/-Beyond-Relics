(function () {
  "use strict";

  var cards = Array.from(document.querySelectorAll(".cards .card"));
  if (!cards.length || !window.BeyondRelicsImages) return;

  fetch("data/artifacts.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Mission archive unavailable");
      return response.json();
    })
    .then(function (records) {
      var byId = Object.create(null);
      records.forEach(function (record) {
        if (record && record.id) byId[record.id] = record;
      });

      cards.forEach(function (card) {
        var match = (card.getAttribute("href") || "").match(/[?&]id=([^&]+)/);
        if (!match) return;

        var item;
        try { item = byId[decodeURIComponent(match[1])]; }
        catch (error) { return; }

        var art = card.querySelector(".art");
        if (!item || !item.image_query || !art) return;

        window.BeyondRelicsImages.search(item.image_query, 12)
          .then(function (images) {
            if (!images.length || !art.isConnected) return;

            var image = document.createElement("img");
            image.alt = images[0].title || item.title || "NASA mission archive photograph";
            image.loading = "lazy";
            image.decoding = "async";
            image.referrerPolicy = "no-referrer";

            var credit = document.createElement("a");
            credit.className = "nasa-image-credit";
            credit.target = "_blank";
            credit.rel = "noopener noreferrer";
            credit.textContent = "NASA ARCHIVE";
            credit.setAttribute("aria-label", "Open the original NASA image record");
            credit.addEventListener("click", function (event) {
              event.stopPropagation();
            });

            image.addEventListener("nasaimageload", function (event) {
              var record = event.detail;
              if (!record || !record.detail) return;
              art.classList.add("has-nasa-image");
              credit.href = record.detail;
              credit.textContent = "NASA · " + record.id;
            });

            image.addEventListener("nasaimageerror", function () {
              image.remove();
              art.classList.remove("has-nasa-image");
              credit.remove();
            }, { once: true });

            art.prepend(image);
            art.append(credit);
            window.BeyondRelicsImages.mount(image, images);
          })
          .catch(function () {
            /* Keep the original vector illustration as a graceful fallback. */
          });
      });
    })
    .catch(function () {
      /* The homepage remains usable when the archive endpoint is unavailable. */
    });
})();