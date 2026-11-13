(function () {
  "use strict";
  function renderReleases(releases) {
    var grid = document.getElementById("release-grid");
    if (!grid) return;
    grid.replaceChildren();
    releases.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "release-card";
      var date = document.createElement("p");
      date.className = "release-date";
      date.textContent = (item.published || "").toUpperCase() + " · " + (item.type || "NASA archive update").toUpperCase();
      var title = document.createElement("h3");
      title.textContent = item.mission + ": " + (item.dataset || item.instrument || "mission archive");
      var meta = document.createElement("p");
      meta.className = "release-meta";
      meta.textContent = [item.mission, item.instrument, item.dataset, item.observation_period, item.archive_scale].filter(Boolean).join(" · ");
      var body = document.createElement("p");
      body.textContent = item.summary + (item.data_products ? " Data products: " + item.data_products : "");
      var source = document.createElement("a");
      source.href = item.source;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.textContent = "NASA source ↗";
      var archive = document.createElement("a");
      archive.href = item.archive;
      archive.target = "_blank";
      archive.rel = "noopener noreferrer";
      archive.textContent = item.archive_label || "Explore archive ↗";
      card.append(date, title, meta, body, source, document.createTextNode(" "), archive);
      grid.appendChild(card);
    });
  }

  fetch("data/nasa-2026-releases.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Could not load the NASA research index");
      return response.json();
    })
    .then(renderReleases)
    .catch(function () {
      var grid = document.getElementById("release-grid");
      if (grid) grid.textContent = "The research index could not be loaded. Please refresh the page.";
    });

  var form = document.getElementById("nasa-search");
  var input = document.getElementById("nasa-query");
  var status = document.getElementById("nasa-status");
  var results = document.getElementById("nasa-results");
  if (!form || !input || !status || !results) return;

  function renderEmpty(message) {
    status.textContent = message;
    results.replaceChildren();
  }

  function searchNASA(query) {
    var endpoint = "https://images-api.nasa.gov/search?q=" + encodeURIComponent(query) + "&media_type=image&page_size=9";
    renderEmpty("Searching NASA’s image archive…");
    fetch(endpoint)
      .then(function (response) {
        if (!response.ok) throw new Error("NASA archive returned " + response.status);
        return response.json();
      })
      .then(function (payload) {
        var items = payload && payload.collection && payload.collection.items ? payload.collection.items : [];
        results.replaceChildren();
        if (!items.length) {
          renderEmpty("No image records found. Try a broader mission name.");
          return;
        }
        items.slice(0, 9).forEach(function (item) {
          var data = item.data && item.data[0] ? item.data[0] : {};
          var imageLink = (item.links || []).find(function (link) { return link.render === "image"; });
          if (!imageLink || !imageLink.href) return;
          var article = document.createElement("article");
          article.className = "nasa-result";
          var image = document.createElement("img");
          image.src = imageLink.href;
          image.alt = data.title || "NASA mission archive image";
          image.loading = "lazy";
          var body = document.createElement("div");
          body.className = "nasa-result-body";
          var title = document.createElement("h3");
          title.textContent = data.title || "Untitled NASA image";
          var description = document.createElement("p");
          var summary = data.description || "NASA public image archive record.";
          description.textContent = summary.length > 155 ? summary.slice(0, 152) + "…" : summary;
          var link = document.createElement("a");
          link.href = "https://images.nasa.gov/details/" + encodeURIComponent(data.nasa_id || "");
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "Open NASA record ↗";
          body.append(title, description, link);
          article.append(image, body);
          results.appendChild(article);
        });
        status.textContent = "Showing " + results.childElementCount + " NASA image records for “" + query + "”.";
        if (!results.childElementCount) renderEmpty("NASA returned records without displayable image previews. Try another search.");
      })
      .catch(function () {
        renderEmpty("NASA’s image service could not be reached right now. Please try again in a moment.");
      });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var query = input.value.trim();
    if (!query) {
      renderEmpty("Enter a mission or spacecraft name to search.");
      input.focus();
      return;
    }
    searchNASA(query);
  });
  searchNASA(input.value.trim());
})();