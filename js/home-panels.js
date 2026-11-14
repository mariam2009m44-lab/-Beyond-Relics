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


/* Mission frame selector: five curated moments per story, in chronological order. */
(function () {
  "use strict";
  var grid = document.querySelector("[data-mission-frame-grid]");
  if (!grid) return;
  var choices = Array.from(document.querySelectorAll("[data-mission-choice]"));
  var kicker = document.querySelector("[data-gallery-kicker]");
  var title = document.querySelector("[data-gallery-name]");
  var mainLink = document.querySelector("[data-gallery-link]");
  var count = document.querySelector("[data-gallery-count]");
  var stories = {
    "pathfinder-sojourner": {
      kicker: "THE FIRST MARTIAN ROVER · 1996—1998",
      title: "Pathfinder & Sojourner",
      total: 19,
      frames: [
        ["IMG-20261114-WA0554.jpg","THE LAUNCH","Earth · December 1996","Pathfinder launches from Earth on 4 December 1996, carrying Sojourner toward Mars."],
        ["IMG-20261114-WA0550(1).jpg","TOUCHDOWN","Mars · 4 July 1997","After a seven-month voyage, Pathfinder lands on Mars on 4 July 1997."],
        ["IMG-20261114-WA0561(1).jpg","FIRST ROLLOUT","5 July 1997","Sojourner rolls down the ramp and begins exploring another world."],
        ["IMG-20261114-WA0553(1).jpg","THE SCIENCE","APXS · Rock analysis","The Alpha Proton X-ray Spectrometer investigates the elemental composition of Martian rocks and soil."],
        ["IMG-20261114-WA0551(1).jpg","FINAL SIGNAL","27 September 1997","Pathfinder sends its final data transmission to Earth."]
      ]
    },
    "pioneer-10-11": {
      kicker: "MESSENGERS BEYOND THE GIANT PLANETS · 1972—2003",
      title: "Pioneer 10 & 11",
      total: 20,
      frames: [
        ["IMG-20261114-WA0644.jpg","THE SPACECRAFT","Before launch","Meet the Pioneer spacecraft built to explore the outer Solar System."],
        ["IMG-20261114-WA0642.jpg","EARTH DEPARTURE","2 March 1972","Pioneer 10 launches from Cape Kennedy."],
        ["IMG-20261114-WA0653.jpg","JUPITER ENCOUNTER","Outer Solar System","Jupiter's immense atmosphere becomes a scientific destination."],
        ["IMG-20261114-WA0654.jpg","SATURN FLYBY","1979","Pioneer 11 becomes the first spacecraft to fly past Saturn."],
        ["IMG-20261114-WA0651.jpg","LAST SIGNAL","2003","Pioneer 10 continues sending signals until 2003."]
      ]
    }
  };
  function render(id) {
    var story = stories[id];
    if (!story) return;
    var href = "comic.html?chapter=" + encodeURIComponent(id);
    if (kicker) kicker.textContent = story.kicker;
    if (title) title.textContent = story.title;
    if (mainLink) mainLink.href = href;
    if (count) count.textContent = "01—05 / " + String(story.total).padStart(2, "0") + " ORIGINAL FRAMES";
    grid.replaceChildren();
    story.frames.forEach(function (frame, index) {
      var link = document.createElement("a");
      link.className = "mission-frame";
      link.href = href;
      link.setAttribute("aria-label", frame[1] + ": " + frame[3] + " Open the full story.");
      var visual = document.createElement("span");
      visual.className = "mission-frame-image";
      var image = document.createElement("img");
      image.src = frame[0];
      image.alt = frame[3];
      image.loading = index === 0 ? "eager" : "lazy";
      image.decoding = "async";
      visual.appendChild(image);
      var caption = document.createElement("span");
      caption.className = "mission-frame-caption";
      var number = document.createElement("i");
      number.textContent = String(index + 1).padStart(2, "0");
      var label = document.createElement("b");
      label.textContent = frame[1];
      var date = document.createElement("small");
      date.textContent = frame[2];
      caption.append(number, label, date);
      link.append(visual, caption);
      grid.appendChild(link);
    });
    choices.forEach(function (button) {
      var active = button.getAttribute("data-mission-choice") === id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }
  choices.forEach(function (button) {
    button.addEventListener("click", function () {
      render(button.getAttribute("data-mission-choice"));
    });
  });
  render("pathfinder-sojourner");
})();
