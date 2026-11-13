(function () {
  "use strict";
  var root = document.documentElement;

  document.querySelectorAll("#stars").forEach(function (box) {
    if (box.childElementCount) return;
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < 160; i++) {
      var star = document.createElement("i");
      var size = Math.random() * 1.8 + .4;
      star.style.cssText = "left:" + Math.random() * 100 + "%;top:" + Math.random() * 100 +
        "%;width:" + size + "px;height:" + size + "px;opacity:" + (Math.random() * .6 + .2);
      fragment.appendChild(star);
    }
    box.appendChild(fragment);
  });

  var themeButton = document.getElementById("theme");
  function setDim(enabled) {
    if (enabled) root.setAttribute("data-theme", "dim");
    else root.removeAttribute("data-theme");
    if (themeButton) themeButton.setAttribute("aria-pressed", String(enabled));
    try { localStorage.setItem("br-dim", enabled ? "1" : "0"); } catch (error) {}
  }
  try { setDim(localStorage.getItem("br-dim") === "1"); } catch (error) { setDim(false); }
  if (themeButton) themeButton.addEventListener("click", function () {
    setDim(root.getAttribute("data-theme") !== "dim");
  });

  /*
   * BEYOND RELICS — original cinematic space score.
   * Entirely synthesized in Web Audio: no external track, autoplay, or third-party asset.
   */
  var soundButton = document.getElementById("sound");
  var AudioEngine = window.AudioContext || window.webkitAudioContext;
  var audioContext = null;
  var master = null;
  var musicNodes = [];
  var musicTimer = null;
  var soundEnabled = false;
  var step = 0;
  var progression = [
    [146.83, 174.61, 220.00, 293.66],
    [130.81, 164.81, 196.00, 261.63],
    [110.00, 146.83, 174.61, 220.00],
    [123.47, 146.83, 185.00, 246.94]
  ];
  var melody = [293.66, 349.23, 440.00, 392.00, 329.63, 293.66, 261.63, 220.00];

  function keep(node) {
    musicNodes.push(node);
    return node;
  }

  function tone(freq, type, destination, volume, detune) {
    var osc = keep(audioContext.createOscillator());
    var gain = keep(audioContext.createGain());
    var filter = keep(audioContext.createBiquadFilter());
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune || 0;
    filter.type = "lowpass";
    filter.frequency.value = type === "sine" ? 900 : 1450;
    filter.Q.value = .45;
    gain.gain.value = volume;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    osc.start();
    return { osc: osc, gain: gain, filter: filter };
  }

  function makePluck(freq, when, strength) {
    var osc = keep(audioContext.createOscillator());
    var gain = keep(audioContext.createGain());
    var filter = keep(audioContext.createBiquadFilter());
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, when);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2100, when);
    filter.frequency.exponentialRampToValueAtTime(650, when + .75);
    gain.gain.setValueAtTime(.0001, when);
    gain.gain.exponentialRampToValueAtTime(strength, when + .035);
    gain.gain.exponentialRampToValueAtTime(.0001, when + 1.05);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc.start(when);
    osc.stop(when + 1.08);
    osc.onended = function () {
      [osc, gain, filter].forEach(function (node) {
        try { node.disconnect(); } catch (error) {}
      });
    };
  }

  function makePulse(when) {
    var osc = keep(audioContext.createOscillator());
    var gain = keep(audioContext.createGain());
    osc.type = "sine";
    osc.frequency.setValueAtTime(78, when);
    osc.frequency.exponentialRampToValueAtTime(42, when + .42);
    gain.gain.setValueAtTime(.0001, when);
    gain.gain.exponentialRampToValueAtTime(.12, when + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, when + .55);
    osc.connect(gain);
    gain.connect(master);
    osc.start(when);
    osc.stop(when + .58);
    osc.onended = function () {
      try { osc.disconnect(); gain.disconnect(); } catch (error) {}
    };
  }

  function scheduleMusic() {
    if (!audioContext || !master || !soundEnabled) return;
    var now = audioContext.currentTime + .06;
    var chordIndex = Math.floor(step / 8) % progression.length;
    var chord = progression[chordIndex];
    var note = melody[step % melody.length];

    makePluck(note, now, .095);
    if (step % 4 === 0) makePluck(chord[1] * 2, now + .12, .035);
    if (step % 8 === 0) makePulse(now);
    if (step % 8 === 4) makePulse(now + .08);

    if (step % 8 === 0) {
      var padNotes = [chord[0] / 2, chord[0], chord[1], chord[2]];
      padNotes.forEach(function (frequency, index) {
        var voice = tone(frequency, index === 2 ? "triangle" : "sine", master, index === 0 ? .11 : .045, index % 2 ? 4 : -3);
        voice.gain.gain.setValueAtTime(.0001, now);
        voice.gain.gain.linearRampToValueAtTime(index === 0 ? .11 : .045, now + 1.6);
        voice.gain.gain.setTargetAtTime(.0001, now + 7.1, 1.2);
        voice.osc.stop(now + 12);
        voice.osc.onended = function () {
          [voice.osc, voice.gain, voice.filter].forEach(function (node) {
            try { node.disconnect(); } catch (error) {}
          });
        };
      });
    }
    step += 1;
  }

  function startMusic() {
    if (!AudioEngine) {
      if (soundButton) soundButton.setAttribute("aria-label", "Audio is not supported in this browser");
      return false;
    }
    try {
      audioContext = audioContext || new AudioEngine();
      if (audioContext.state === "suspended") audioContext.resume();
      if (soundEnabled) return true;

      master = keep(audioContext.createGain());
      var compressor = keep(audioContext.createDynamicsCompressor());
      compressor.threshold.value = -20;
      compressor.knee.value = 18;
      compressor.ratio.value = 3.5;
      compressor.attack.value = .012;
      compressor.release.value = .28;
      master.gain.setValueAtTime(.0001, audioContext.currentTime);
      master.gain.linearRampToValueAtTime(.38, audioContext.currentTime + 2.8);
      master.connect(compressor);
      compressor.connect(audioContext.destination);

      var low = tone(43.65, "sine", master, .12, 0);
      var lowLfo = keep(audioContext.createOscillator());
      var lowDepth = keep(audioContext.createGain());
      lowLfo.frequency.value = .055;
      lowDepth.gain.value = 5;
      lowLfo.connect(lowDepth);
      lowDepth.connect(low.osc.frequency);
      lowLfo.start();

      var shimmer = tone(587.33, "sine", master, .012, 7);
      shimmer.filter.frequency.value = 1150;

      soundEnabled = true;
      step = 0;
      scheduleMusic();
      musicTimer = window.setInterval(scheduleMusic, 720);
      try { localStorage.setItem("br-music-enabled", "1"); } catch (error) {}
      return true;
    } catch (error) {
      stopMusic(true);
      if (soundButton) soundButton.setAttribute("aria-label", "Could not start the music");
      return false;
    }
  }

  function stopMusic(immediate) {
    soundEnabled = false;
    if (musicTimer) window.clearInterval(musicTimer);
    musicTimer = null;
    try { localStorage.setItem("br-music-enabled", "0"); } catch (error) {}
    if (!audioContext || !master) return;
    var oldMaster = master;
    var now = audioContext.currentTime;
    oldMaster.gain.cancelScheduledValues(now);
    if (immediate) oldMaster.gain.setValueAtTime(.0001, now);
    else oldMaster.gain.setTargetAtTime(.0001, now, .3);
    var oldNodes = musicNodes.slice();
    musicNodes = [];
    master = null;
    window.setTimeout(function () {
      oldNodes.forEach(function (node) {
        if (node && typeof node.stop === "function") {
          try { node.stop(); } catch (error) {}
        }
        try { node.disconnect(); } catch (error) {}
      });
    }, immediate ? 0 : 1400);
  }

  function updateSoundButton() {
    if (!soundButton) return;
    soundButton.setAttribute("aria-pressed", String(soundEnabled));
    soundButton.setAttribute("aria-label", soundEnabled ? "Turn cinematic space music off" : "Turn cinematic space music on");
    soundButton.setAttribute("title", soundEnabled ? "Music on — click to mute" : "Play the Beyond Relics soundtrack");
  }

  if (soundButton) {
    soundButton.setAttribute("aria-pressed", "false");
    updateSoundButton();
    soundButton.addEventListener("click", function () {
      if (soundEnabled) stopMusic(false);
      else startMusic();
      updateSoundButton();
    });
  }

  /* Remember the visitor's choice between archive pages; never force sound on without prior consent. */
  try {
    if (localStorage.getItem("br-music-enabled") === "1") {
      startMusic();
      updateSoundButton();
    }
  } catch (error) {}

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });
})();