(function () {
  "use strict";
  var cache = Object.create(null);
  function score(record, query) {
    var data = record && record.data && record.data[0] || {};
    var haystack = ((data.title || "") + " " + (data.description || "")).toLowerCase();
    var words = String(query || "").toLowerCase().split(/[^a-z0-9]+/).filter(function (word) {
      return word.length > 2 && ["nasa", "mission", "mars", "moon", "the", "and"].indexOf(word) < 0;
    });
    return words.reduce(function (total, word) { return total + (haystack.indexOf(word) !== -1 ? 2 : 0); }, 0);
  }
  function search(query, limit) {
    var key = String(query || "").trim().toLowerCase();
    if (!cache[key]) {
      var url = "https://images-api.nasa.gov/search?media_type=image&page_size=40&q=" + encodeURIComponent(key);
      cache[key] = fetch(url, { headers: { Accept: "application/json" } }).then(function (response) {
        if (!response.ok) throw new Error("NASA image archive unavailable");
        return response.json();
      }).then(function (payload) {
        var rows = payload && payload.collection && Array.isArray(payload.collection.items) ? payload.collection.items : [];
        var seen = Object.create(null);
        return rows.map(function (record) {
          var data = record && record.data && record.data[0] || {};
          var image = (record && record.links || []).find(function (link) {
            return (link.render === "image" || link.rel === "preview") && /^https:\/\//i.test(link.href || "");
          });
          if (!data.nasa_id || !image || seen[data.nasa_id]) return null;
          seen[data.nasa_id] = true;
          return { id: data.nasa_id, title: data.title || key, src: image.href,
            detail: "https://images.nasa.gov/details/" + encodeURIComponent(data.nasa_id),
            score: score(record, key) };
        }).filter(Boolean).sort(function (a, b) { return b.score - a.score; });
      }).catch(function () { cache[key] = []; return []; });
    }
    return cache[key].then(function (items) { return items.slice(0, limit || 12); });
  }
  function mount(img, candidates) {
    var index = 0;
    function next() {
      if (index >= candidates.length) {
        img.removeAttribute("src");
        img.dispatchEvent(new CustomEvent("nasaimageerror"));
        return;
      }
      img.src = candidates[index++].src || candidates[index - 1];
    }
    img.addEventListener("error", next);
    if (candidates.length) next();
    else img.dispatchEvent(new CustomEvent("nasaimageerror"));
  }
  window.BeyondRelicsImages = { search: search, mount: mount };
})();