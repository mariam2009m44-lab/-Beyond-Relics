(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var DATA = [];

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
    });
  }
  function safeURL(value) {
    try {
      var url = new URL(value);
      return url.protocol === "https:" ? url.href : "#";
    } catch (error) { return "#"; }
  }
  function loadData() {
    return fetch("data/artifacts.json")
      .then(function (response) {
        if (!response.ok) throw new Error("Archive data could not be loaded.");
        return response.json();
      })
      .then(function (records) {
        if (!Array.isArray(records) || !records.length) throw new Error("The archive is currently empty.");
        DATA = records;
        renderArchive();
        renderDetails();
      })
      .catch(function (error) {
        var grid = $("grid"), detail = $("detail");
        if (grid) grid.innerHTML = '<p class="empty">The archive could not load. Please refresh the page.</p>';
        if (detail) detail.innerHTML = '<div class="panel"><h2>Archive temporarily unavailable</h2><p>Please refresh the page to try again.</p><a class="btn ghost" href="artifacts.html">Back to archive</a></div>';
        console.error("Beyond Relics:", error);
      });
  }

  function renderArchive() {
    var grid = $("grid");
    if (!grid) return;
    var chips = $("chips"), query = $("q"), empty = $("empty");
    var selectedRegion = "All", searchTerm = "";
    var regions = ["All"].concat(DATA.map(function (item) { return item.region; }).filter(function (region, index, all) {
      return all.indexOf(region) === index;
    }));

    chips.innerHTML = regions.map(function (region) {
      return '<button class="chip" type="button" data-region="' + escapeHTML(region) + '" aria-pressed="' +
        String(region === selectedRegion) + '">' + escapeHTML(region) + '</button>';
    }).join("");

    function draw() {
      var records = DATA.filter(function (item) {
        var searchable = [item.title, item.short, item.region, item.type, item.status].join(" ").toLowerCase();
        return (selectedRegion === "All" || item.region === selectedRegion) && searchable.indexOf(searchTerm) !== -1;
      });
      grid.innerHTML = records.map(function (item) {
        return '<a class="acard" href="artifact-details.html?id=' + encodeURIComponent(item.id) + '">' +
          '<div class="aart" data-tone="' + escapeHTML(item.tone) + '">' +
          '<span>' + escapeHTML(item.region) + ' · ' + escapeHTML(item.years) + '</span></div>' +
          '<div class="abody"><p class="eyebrow">' + escapeHTML(item.type) + '</p>' +
          '<h3>' + escapeHTML(item.title) + '</h3><p>' + escapeHTML(item.short) + '</p>' +
          '<span class="more">Explore artifact ↗</span></div></a>';
      }).join("");
      empty.hidden = records.length !== 0;
    }
    chips.addEventListener("click", function (event) {
      var button = event.target.closest("[data-region]");
      if (!button) return;
      selectedRegion = button.getAttribute("data-region");
      chips.querySelectorAll(".chip").forEach(function (chip) {
        chip.setAttribute("aria-pressed", String(chip === button));
      });
      draw();
    });
    query.addEventListener("input", function () {
      searchTerm = query.value.trim().toLowerCase();
      draw();
    });
    draw();
  }

  function renderDetails() {
    var detail = $("detail");
    if (!detail) return;
    var id = new URLSearchParams(window.location.search).get("id");
    var index = DATA.findIndex(function (item) { return item.id === id; });
    if (index < 0) {
      detail.innerHTML = '<div class="panel"><h2>Artifact not found</h2><p>We couldn’t find that artifact in the archive.</p><a class="btn" href="artifacts.html">Back to archive</a></div>';
      detail.style.display = "block";
      return;
    }
    var item = DATA[index];
    var previous = DATA[(index + DATA.length - 1) % DATA.length];
    var next = DATA[(index + 1) % DATA.length];
    document.title = item.title + " — Beyond Relics";
    detail.innerHTML =
      '<div class="dart" data-tone="' + escapeHTML(item.tone) + '">' +
        '<span>' + escapeHTML(item.region) + ' · ' + escapeHTML(item.years) + '</span></div>' +
      '<div><p class="eyebrow">' + escapeHTML(item.type) + ' · ' + escapeHTML(item.status) + '</p>' +
        '<h1 class="page-title">' + escapeHTML(item.title) + '</h1>' +
        '<p class="body">' + escapeHTML(item.body) + '</p>' +
        '<dl class="facts">' + item.facts.map(function (fact) {
          return '<dt>' + escapeHTML(fact[0]) + '</dt><dd>' + escapeHTML(fact[1]) + '</dd>';
        }).join("") + '</dl>' +
        '<section class="source-list" aria-labelledby="source-heading"><h2 id="source-heading">Mission sources</h2>' +
          '<p>Facts on this page are based on official mission references.</p><ul>' +
          item.sources.map(function (source) {
            return '<li><a href="' + safeURL(source.url) + '" target="_blank" rel="noopener noreferrer">' +
              escapeHTML(source.label) + ' ↗</a></li>';
          }).join("") + '</ul></section>' +
        '<div class="actions"><a class="btn" href="comic.html?chapter=' + encodeURIComponent(item.id) + '">Read the story →</a>' +
          '<a class="btn ghost" href="timeline.html">View timeline</a></div></div>';

    $("pn").innerHTML =
      '<a href="artifact-details.html?id=' + encodeURIComponent(previous.id) + '">← ' + escapeHTML(previous.title) + '</a>' +
      '<a href="artifact-details.html?id=' + encodeURIComponent(next.id) + '">' + escapeHTML(next.title) + ' →</a>';
  }

  loadData();
})();