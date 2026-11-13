(function () {
  "use strict";
  var releases = [
    {
      date: "13 AUG 2026 · PDS DATA RELEASE",
      title: "Voyager 2: Uranus radio science returns to the archive",
      meta: "Voyager 2 · Planetary Radio Astronomy instrument · 1985–1988 observations",
      text: "NASA’s Planetary Data System added a Voyager 2 Planetary Radio Astronomy data bundle from its Uranus flyby. The archive covers 70 instrument channels and preserves measurements made decades ago—an especially strong fit for Beyond Relics’ story of hardware whose scientific legacy keeps travelling.",
      source: "https://science.data.nasa.gov/features-events/data-software-highlights-august-2026",
      sourceLabel: "NASA Science Data update · August 2026",
      pds: "https://pds.nasa.gov/services/search/index.jsp?IDENTIFIER=Voyager%202%20Uranus"
    },
    {
      date: "26 JUN 2026 · PDS DATA RELEASE",
      title: "New Horizons: extended Kuiper Belt mission data",
      meta: "New Horizons · KEM2 K7 dataset · observations through April 2024",
      text: "The PDS Small Bodies Node released additional New Horizons observations, including data around the 2019 Arrokoth encounter and the spacecraft’s continuing cruise through the Kuiper Belt. It shows how an active spacecraft keeps creating a record long after its headline encounter.",
      source: "https://science.data.nasa.gov/features-events/data-software-highlights-june-2026",
      sourceLabel: "NASA Science Data update · June 2026",
      pds: "https://pds.nasa.gov/services/search/index.jsp?IDENTIFIER=New%20Horizons%20KEM2"
    },
    {
      date: "07 OCT 2026 · PDS DATA RELEASE",
      title: "Artemis II: Orion mission archive",
      meta: "Orion spacecraft · imagery, video, mission audio, environmental records, SPICE kernels",
      text: "NASA’s PDS announced the Artemis II archive release. Its products include crew and vehicle camera imagery, video, mission audio with transcripts, locker temperature and humidity records, documents, and SPICE kernels. This is a modern example of how spacecraft operations become a long-term public record.",
      source: "https://science.data.nasa.gov/features-events/data-software-highlights-october-2026",
      sourceLabel: "NASA Science Data update · October 2026",
      pds: "https://pds.nasa.gov/services/search/index.jsp?IDENTIFIER=Artemis%20II"
    },
    {
      date: "OCT 2026 · ARCHIVE PRESERVATION",
      title: "Swift Observatory: decades of data remain available",
      meta: "Neil Gehrels Swift Observatory · nearly 22 years of observations",
      text: "Following the observatory’s retirement, its archive remains open. NASA reports nearly 22 years of brightness measurements, multiwavelength spectra, and more than 1.5 million ultraviolet/optical images. The instrument’s operations ended, but its scientific record remains useful.",
      source: "https://science.data.nasa.gov/features-events/data-software-highlights-october-2026",
      sourceLabel: "NASA Science Data update · October 2026",
      pds: "https://www.swift.ac.uk/"
    }
  ];

  var grid = document.getElementById("release-grid");
  if (grid) {
    grid.replaceChildren();
    releases.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "release-card";
      var date = document.createElement("p");
      date.className = "release-date";
      date.textContent = item.date;
      var title = document.createElement("h3");
      title.textContent = item.title;
      var meta = document.createElement("p");
      meta.className = "release-meta";
      meta.textContent = item.meta;
      var body = document.createElement("p");
      body.textContent = item.text;
      var source = document.createElement("a");
      source.href = item.source;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.textContent = item.sourceLabel + " ↗";
      var archive = document.createElement("a");
      archive.href = item.pds;
      archive.target = "_blank";
      archive.rel = "noopener noreferrer";
      archive.textContent = "Explore related archive ↗";
      card.append(date, title, meta, body, source, document.createTextNode(" "), archive);
      grid.appendChild(card);
    });
  }

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