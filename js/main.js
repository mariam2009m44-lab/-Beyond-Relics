(function () {
  "use strict";
  var root = document.documentElement;

  // Build a lightweight star field without external assets.
  document.querySelectorAll("#stars").forEach(function (box) {
    if (box.childElementCount) return;
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < 160; i++) {
      var star = document.createElement("i");
      var size = Math.random() * 1.8 + .4;
      star.style.cssText =
        "left:" + Math.random() * 100 + "%;top:" + Math.random() * 100 +
        "%;width:" + size + "px;height:" + size + "px;opacity:" +
        (Math.random() * .6 + .2);
      fragment.appendChild(star);
    }
    box.appendChild(fragment);
  });

  // Theme preference is shared across the archive pages.
  var themeButton = document.getElementById("theme");
  function setDim(enabled) {
    if (enabled) root.setAttribute("data-theme", "dim");
    else root.removeAttribute("data-theme");
    if (themeButton) themeButton.setAttribute("aria-pressed", String(enabled));
    try { localStorage.setItem("br-dim", enabled ? "1" : "0"); } catch (error) {}
  }
  try { setDim(localStorage.getItem("br-dim") === "1"); } catch (error) { setDim(false); }
  if (themeButton) {
    themeButton.addEventListener("click", function () {
      setDim(root.getAttribute("data-theme") !== "dim");
    });
  }

  // A quiet, optional ambient tone generated locally; it never starts by itself.
  var soundButton = document.getElementById("sound");
  var audioContext = null;
  var oscillators = [];
  var masterGain = null;
  function startAmbient() {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      if (soundButton) soundButton.setAttribute("aria-label", "Ambient audio is not supported");
      return false;
    }
    try {
      audioContext = audioContext || new AudioContext();
      if (audioContext.state === "suspended") audioContext.resume();
      if (masterGain) return true;
      masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(0, audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(.018, audioContext.currentTime + 1.2);
      masterGain.connect(audioContext.destination);
      [55, 82.41].forEach(function (frequency, index) {
        var oscillator = audioContext.createOscillator();
        var gain = audioContext.createGain();
        oscillator.type = index ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        gain.gain.value = index ? .28 : .72;
        oscillator.connect(gain);
        gain.connect(masterGain);
        oscillator.start();
        oscillators.push(oscillator);
      });
      return true;
    } catch (error) {
      masterGain = null;
      return false;
    }
  }
  function stopAmbient() {
    if (!audioContext || !masterGain) return;
    var oldGain = masterGain;
    oldGain.gain.cancelScheduledValues(audioContext.currentTime);
    oldGain.gain.setTargetAtTime(0, audioContext.currentTime, .12);
    window.setTimeout(function () {
      oscillators.forEach(function (oscillator) {
        try { oscillator.stop(); } catch (error) {}
      });
      oscillators = [];
      try { oldGain.disconnect(); } catch (error) {}
      masterGain = null;
    }, 650);
  }
  if (soundButton) {
    soundButton.addEventListener("click", function () {
      var enabled = soundButton.getAttribute("aria-pressed") !== "true";
      if (enabled && !startAmbient()) return;
      if (!enabled) stopAmbient();
      soundButton.setAttribute("aria-pressed", String(enabled));
      soundButton.setAttribute("aria-label", enabled ? "Turn ambient sound off" : "Turn ambient sound on");
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });
})();