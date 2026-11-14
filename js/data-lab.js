(function () {
  "use strict";
  var releaseGrid = document.getElementById("release-grid");
  var metrics = document.getElementById("evidence-metrics");
  var track = document.getElementById("evidence-track");

  function node(tag, className, value) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  }
  function safeExternalLink(url, label) {
    var link = node("a", "", label);
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }
  function renderMetrics(records) {
    if (!metrics) return;
    var values = [
      ["04", "NASA archive-release summaries"],
      ["03", "Mission data-release records"],
      ["01", "Retired observatory archive"],
      ["100%", "Records link to NASA source pages"]
    ];
    metrics.replaceChildren();
    values.forEach(function (item) {
      var card = node("div", "evidence-metric");
      card.append(node("strong", "", item[0]), node("span", "", item[1]));
      metrics.appendChild(card);
    });
    metrics.setAttribute("aria-label", records.length + " curated NASA archive records");
  }
  function renderTimeline(records) {
    if (!track) return;
    track.replaceChildren();
    records.slice().sort(function (a, b) {
      return String(a.published).localeCompare(String(b.published));
    }).forEach(function (item) {
      var event = node("article", "evidence-event");
      event.append(node("span", "evidence-event-date", item.published || "Date not listed"));
      event.append(node("h4", "", item.mission));
      event.append(node("p", "", item.dataset || item.instrument || item.type));
      event.append(safeExternalLink(item.archive, "Open source archive ↗"));
      track.appendChild(event);
    });
  }
  function renderReleases(releases) {
    if (!releaseGrid) return;
    releaseGrid.replaceChildren();
    releases.forEach(function (item) {
      var card = node("article", "release-card");
      card.append(node("p", "release-date", (item.published || "").toUpperCase() + " · " + (item.type || "NASA archive update").toUpperCase()));
      card.append(node("h3", "", item.mission + ": " + (item.dataset || item.instrument || "mission archive")));
      card.append(node("p", "release-meta", [item.instrument, item.observation_period, item.archive_scale].filter(Boolean).join(" · ")));
      card.append(node("p", "", item.summary));
      if (item.data_products) {
        var details = node("details", "release-details");
        details.append(node("summary", "", "Explore the contents"));
        details.append(node("p", "", item.data_products));
        if (Array.isArray(item.identifiers)) {
          var list = node("ul", "identifier-list");
          item.identifiers.forEach(function (record) {
            var li = node("li", "");
            li.append(node("span", "", record.label + " "));
            li.append(safeExternalLink(record.url, record.doi));
            list.appendChild(li);
          });
          details.appendChild(list);
        }
        card.appendChild(details);
      }
      var actions = node("div", "release-actions");
      actions.append(safeExternalLink(item.source, "NASA release notes ↗"));
      actions.append(safeExternalLink(item.archive, item.archive_label || "Explore archive ↗"));
      card.appendChild(actions);
      releaseGrid.appendChild(card);
    });
  }

  fetch("data/nasa-2026-releases.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Research index unavailable");
      return response.json();
    })
    .then(function (records) {
      if (!Array.isArray(records) || !records.length) throw new Error("Research index is empty");
      renderMetrics(records);
      renderTimeline(records);
      renderReleases(records);
    })
    .catch(function () {
      if (releaseGrid) releaseGrid.textContent = "The research index could not be loaded. Please refresh the page.";
      if (track) track.textContent = "The evidence timeline is temporarily unavailable.";
    });

  var form = document.getElementById("nasa-search");
  var input = document.getElementById("nasa-query");
  var status = document.getElementById("nasa-status");
  var results = document.getElementById("nasa-results");
  if (!form || !input || !status || !results) return;

  var activeController = null;
  function clearResults(message) {
    status.textContent = message;
    results.replaceChildren();
  }
  function searchNASA(query) {
    if (activeController) activeController.abort();
    activeController = new AbortController();
    var endpoint = "https://images-api.nasa.gov/search?q=" + encodeURIComponent(query) + "&media_type=image&page_size=9";
    clearResults("Searching NASA’s public image archive…");
    fetch(endpoint, { signal: activeController.signal })
      .then(function (response) {
        if (!response.ok) throw new Error("NASA image service returned an error");
        return response.json();
      })
      .then(function (payload) {
        var items = payload && payload.collection && Array.isArray(payload.collection.items) ? payload.collection.items : [];
        var fragment = document.createDocumentFragment();
        items.slice(0, 9).forEach(function (item) {
          var data = item && item.data && item.data[0] ? item.data[0] : {};
          var imageLink = (item.links || []).find(function (link) {
            return link && link.render === "image" && /^https:\/\//i.test(link.href || "");
          });
          if (!imageLink) return;
          var article = node("article", "nasa-result");
          var image = node("img", "");
          image.src = imageLink.href;
          image.alt = data.title || "NASA mission archive image";
          image.loading = "lazy";
          image.decoding = "async";
          image.referrerPolicy = "no-referrer";
          var body = node("div", "nasa-result-body");
          body.append(node("h3", "", data.title || "Untitled NASA image"));
          var description = data.description || "NASA public image archive record.";
          body.append(node("p", "", description.length > 155 ? description.slice(0, 152) + "…" : description));
          var id = data.nasa_id;
          if (id) body.append(safeExternalLink("https://images.nasa.gov/details/" + encodeURIComponent(id), "Open NASA record ↗"));
          article.append(image, body);
          fragment.appendChild(article);
        });
        results.replaceChildren(fragment);
        status.textContent = results.childElementCount
          ? "Showing " + results.childElementCount + " NASA image records for “" + query + "”."
          : "No displayable image records found. Try a broader mission name.";
      })
      .catch(function (error) {
        if (error && error.name === "AbortError") return;
        clearResults("NASA’s image service could not be reached right now. Please try again.");
      });
  }
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var query = input.value.trim();
    if (!query) {
      clearResults("Enter a mission or spacecraft name to search.");
      input.focus();
      return;
    }
    searchNASA(query);
  });
  if (input.value.trim()) searchNASA(input.value.trim());
})();