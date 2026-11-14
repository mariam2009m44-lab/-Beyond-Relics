(function () {
  "use strict";
  var root = document.querySelector("[data-mission-quiz]");
  if (!root) return;

  var cases = [
    {
      question: "What part of Apollo 11’s Lunar Module remained on the Moon?",
      options: ["The ascent stage", "The descent stage", "The entire spacecraft"],
      answer: 1,
      explanation: "Correct. The ascent stage carried the astronauts back to lunar orbit. The descent stage, landing legs, and surface equipment remained at Tranquility Base.",
      source: "https://science.nasa.gov/resource/apollo-11-landing-site/",
      sourceLabel: "NASA · Apollo 11 landing site",
      link: "artifact-details.html?id=lunar-module"
    },
    {
      question: "What did the Apollo Lunar Surface Experiments Package do after the astronauts left?",
      options: ["Measured lunar activity and the environment", "Sent images of Earth", "Moved across the lunar surface"],
      answer: 0,
      explanation: "Correct. ALSEP stations carried instruments that returned measurements such as seismic activity, heat flow, and magnetic-field observations. NASA ended network operations in 1977.",
      source: "https://ntrs.nasa.gov/citations/20190032593",
      sourceLabel: "NASA Technical Reports · ALSEP archive",
      link: "artifact-details.html?id=apollo-12-alsep"
    },
    {
      question: "What was the name of the small rover delivered by Mars Pathfinder in 1997?",
      options: ["Spirit", "Sojourner", "Opportunity"],
      answer: 1,
      explanation: "Correct. Sojourner explored near the Pathfinder lander at Ares Vallis. The lander also served as a communications relay between the rover and Earth.",
      source: "https://science.nasa.gov/mission/mars-pathfinder/",
      sourceLabel: "NASA · Mars Pathfinder",
      link: "artifact-details.html?id=pathfinder-sojourner"
    },
    {
      question: "Which InSight instrument measured seismic activity on Mars?",
      options: ["SEIS", "RISE", "HP³"],
      answer: 0,
      explanation: "Correct. SEIS was InSight’s seismometer. RISE tracked the planet’s rotation and interior, while HP³ was designed to investigate heat flow.",
      source: "https://science.nasa.gov/mission/insight/",
      sourceLabel: "NASA · InSight mission",
      link: "artifact-details.html?id=insight"
    }
  ];

  var index = 0;
  var score = 0;
  var answered = false;
  var step = root.querySelector("[data-quiz-step]");
  var scoreLabel = root.querySelector("[data-quiz-score]");
  var progress = root.querySelector("[data-quiz-progress]");
  var progressBar = root.querySelector(".detective-progress");
  var question = root.querySelector("[data-quiz-question]");
  var feedback = root.querySelector("[data-quiz-feedback]");
  var next = root.querySelector("[data-quiz-next]");
  var source = root.querySelector("[data-quiz-source]");

  function make(tag, className, value) {
    var item = document.createElement(tag);
    if (className) item.className = className;
    if (value !== undefined) item.textContent = value;
    return item;
  }
  function render() {
    var item = cases[index];
    answered = false;
    step.textContent = "CASE FILE " + String(index + 1).padStart(2, "0") + " / " + String(cases.length).padStart(2, "0");
    scoreLabel.textContent = score + " correct";
    progress.style.width = (index / cases.length * 100) + "%";
    progressBar.setAttribute("aria-valuenow", String(index));
    question.replaceChildren();
    question.appendChild(make("p", "detective-kicker", "FIELD QUESTION"));
    question.appendChild(make("h3", "", item.question));
    var options = make("div", "detective-options");
    options.setAttribute("role", "group");
    options.setAttribute("aria-label", "Answer choices");
    item.options.forEach(function (label, optionIndex) {
      var button = make("button", "", label);
      button.type = "button";
      button.addEventListener("click", function () { choose(optionIndex, button, options); });
      options.appendChild(button);
    });
    question.appendChild(options);
    feedback.hidden = true;
    feedback.replaceChildren();
    source.href = item.source;
    source.textContent = item.sourceLabel + " ↗";
    next.disabled = true;
    next.textContent = index === cases.length - 1 ? "View result" : "Next case →";
  }
  function choose(choice, selected, options) {
    if (answered) return;
    answered = true;
    var item = cases[index];
    var correct = choice === item.answer;
    if (correct) score++;
    Array.prototype.forEach.call(options.querySelectorAll("button"), function (button, optionIndex) {
      button.disabled = true;
      if (optionIndex === item.answer) button.classList.add("is-correct");
      else if (button === selected && !correct) button.classList.add("is-incorrect");
    });
    feedback.hidden = false;
    feedback.className = "detective-feedback " + (correct ? "is-correct" : "is-incorrect");
    feedback.appendChild(make("strong", "", correct ? "Evidence matched." : "Not quite — here is the clue."));
    feedback.appendChild(make("p", "", item.explanation));
    var record = make("a", "", "Explore this mission record ↗");
    record.href = item.link;
    feedback.appendChild(record);
    scoreLabel.textContent = score + " correct";
    progress.style.width = ((index + 1) / cases.length * 100) + "%";
    progressBar.setAttribute("aria-valuenow", String(index + 1));
    next.disabled = false;
  }
  function finish() {
    step.textContent = "INVESTIGATION COMPLETE";
    scoreLabel.textContent = score + " / " + cases.length + " correct";
    progress.style.width = "100%";
    progressBar.setAttribute("aria-valuenow", String(cases.length));
    question.replaceChildren(
      make("p", "detective-kicker", "CASE FILE CLOSED"),
      make("h3", "", score === cases.length ? "Outstanding field work." : "Every mission leaves more clues to discover."),
      make("p", "detective-result", "You matched " + score + " of " + cases.length + " mission clues. Explore the linked NASA records to learn more.")
    );
    feedback.hidden = true;
    source.hidden = true;
    next.disabled = false;
    next.textContent = "Investigate again ↻";
    next.dataset.restart = "true";
  }
  next.addEventListener("click", function () {
    if (next.dataset.restart === "true") {
      index = 0; score = 0; delete next.dataset.restart; source.hidden = false; render(); return;
    }
    if (!answered) return;
    if (index === cases.length - 1) { finish(); return; }
    index++;
    render();
  });
  render();
})();