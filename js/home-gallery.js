(function () {
  "use strict";
  var cards = Array.from(document.querySelectorAll(".cards .card"));
  if (!cards.length) return;

  function getNASAImage(query) {
    var endpoint = "https://images-api.nasa.gov/search?q=" +
      encodeURIComponent(query) + "&media_type=image&page_size=8";
    return fetch(endpoint, { headers: { "Accept": "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("NASA image search failed");
        return response.json();
      })
      .then(function (payload) {
        var records = payload && payload.collection && payload.collection.items || [];
        for (var i = 0; i < records.length; i++) {
          var record = records[i];
          var data = record.data && record.data[0];
          var image = (record.links || []).find(function (link) {
            return link.render === "image" && /^https:\/\//i.test(link.href || "");
          });
          if (data && image && image.href) {
            return { src: image.href, alt: data.title || query, nasaId: data.nasa_id };
          }
        }
        throw new Error("No NASA image result");
      });
  }

  fetch("data/artifacts.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Archive unavailable");
      return response.json();
    })
    .then(function (records) {
      var byId = Object.create(null);
      records.forEach(function (record) { byId[record.id] = record; });
      cards.forEach(function (card) {
        var match = (card.getAttribute("href") || "").match(/[?&]id=([^&]+)/);
        if (!match) return;
        var item = byId[decodeURIComponent(match[1])];
        if (!item || !item.image_query) return;
        var art = card.querySelector(".art");
        if (!art) return;
        getNASAImage(item.image_query).then(function (result) {
          var image = document.createElement("img");
          image.src = result.src;
          image.alt = result.alt;
          image.loading = "lazy";
          image.decoding = "async";
          image.referrerPolicy = "no-referrer";
          image.addEventListener("load", function () {
            art.classList.add("has-nasa-image");
          }, { once: true });
          image.addEventListener("error", function () {
            image.remove();
            art.classList.remove("has-nasa-image");
          }, { once: true });
          art.prepend(image);
          var credit = document.createElement("span");
          credit.className = "nasa-image-credit";
          credit.textContent = "NASA IMAGE LIBRARY";
          art.append(credit);
        }).catch(function () {
          /* Keep the original illustrated card as a reliable offline fallback. */
        });
      });
    })
    .catch(function () {
      /* The home page remains usable when the archive or NASA API is unavailable. */
    });
})();