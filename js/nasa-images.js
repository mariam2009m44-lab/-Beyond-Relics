(function () {
  "use strict";
  var cache = Object.create(null);
  var aliases = [
    { match: /apollo 11|lunar module|descent stage/i, queries: ["Apollo 11 Eagle lunar module on the Moon", "Apollo 11 Tranquility Base lunar module NASA"] },
    { match: /alsep|apollo 12/i, queries: ["Apollo Lunar Surface Experiments Package ALSEP NASA", "Apollo lunar surface experiment instruments on Moon"] },
    { match: /pathfinder|sojourner/i, queries: ["Mars Pathfinder lander Sojourner rover NASA", "Sojourner rover Mars surface 1997"] },
    { match: /spirit/i, queries: ["Mars Exploration Rover Spirit NASA Mars surface", "Spirit rover Gusev crater NASA"] },
    { match: /opportunity/i, queries: ["Mars Exploration Rover Opportunity NASA Mars surface", "Opportunity rover Endeavour crater NASA"] },
    { match: /phoenix/i, queries: ["Phoenix Mars Lander NASA surface", "Phoenix lander robotic arm Mars ice NASA"] },
    { match: /insight/i, queries: ["NASA InSight lander Mars surface", "InSight Mars lander instrument deck NASA"] },
    { match: /curiosity/i, queries: ["NASA Curiosity rover Mars Gale crater", "Curiosity rover Mars selfie NASA"] },
    { match: /voyager/i, queries: ["NASA Voyager spacecraft illustration", "Voyager 1 Voyager 2 spacecraft NASA"] },
    { match: /spitzer/i, queries: ["NASA Spitzer Space Telescope illustration", "Spitzer infrared space telescope NASA"] }
  ];
  function score(record, query) {
    var data = record && record.data && record.data[0] || {};
    var haystack = ((data.title || "") + " " + (data.description || "")).toLowerCase();
    var words = String(query || "").toLowerCase().split(/[^a-z0-9]+/).filter(function (word) {
      return word.length > 2 && ["nasa", "mission", "mars", "moon", "the", "and"].indexOf(word) < 0;
    });
    return words.reduce(function (total, word) { return total + (haystack.indexOf(word) !== -1 ? 2 : 0); }, 0);
  }
  function oneSearch(query) {
    var key = String(query || "").trim().toLowerCase();
    if (!cache[key]) {
      var url = "https://images-api.nasa.gov/search?media_type=image&page_size=60&q=" + encodeURIComponent(key);
      cache[key] = fetch(url, { headers: { Accept: "application/json" } }).then(function (response) {
        if (!response.ok) throw new Error("NASA image archive unavailable");
        return response.json();
      }).then(function (payload) {
        var rows = payload && payload.collection && Array.isArray(payload.collection.items) ? payload.collection.items : [];
        var seen = Object.create(null);
        return rows.map(function (record) {
          var data = record && record.data && record.data[0] || {};
          var links = record && record.links || [];
          var image = links.find(function (link) {
            return (link.render === "image" || link.rel === "preview") && /^https:\/\//i.test(link.href || "");
          }) || links.find(function (link) { return /^https:\/\//i.test(link.href || "") && /\.(jpg|jpeg|png)(\?|$)/i.test(link.href); });
          if (!data.nasa_id || !image || seen[data.nasa_id]) return null;
          seen[data.nasa_id] = true;
          return { id: data.nasa_id, title: data.title || key, src: image.href,
            detail: "https://images.nasa.gov/details/" + encodeURIComponent(data.nasa_id),
            score: score(record, key) };
        }).filter(Boolean).sort(function (a, b) { return b.score - a.score; });
      }).catch(function () { return []; });
    }
    return cache[key];
  }
  function search(query, limit) {
    var candidates = [String(query || "")];
    aliases.forEach(function (entry) {
      if (entry.match.test(query || "")) candidates = candidates.concat(entry.queries);
    });
    var unique = candidates.filter(function (value, index, all) { return value && all.indexOf(value) === index; });
    return unique.reduce(function (chain, term) {
      return chain.then(function (found) {
        if (found.length >= 4) return found;
        return oneSearch(term).then(function (more) {
          var seen = Object.create(null);
          found.concat(more).forEach(function (item) { if (!seen[item.id]) seen[item.id] = item; });
          return Object.keys(seen).map(function (id) { return seen[id]; }).sort(function (a,b) { return b.score-a.score; });
        });
      });
    }, Promise.resolve([])).then(function (items) { return items.slice(0, limit || 12); });
  }
  function mount(img, candidates) {
    var index = 0;
    function next() {
      if (index >= candidates.length) {
        img.removeAttribute("src");
        img.dispatchEvent(new CustomEvent("nasaimageerror"));
        return;
      }
      img.src = candidates[index++].src;
    }
    img.addEventListener("error", next);
    if (candidates.length) next();
    else img.dispatchEvent(new CustomEvent("nasaimageerror"));
  }
  window.BeyondRelicsImages = { search: search, mount: mount };
})();