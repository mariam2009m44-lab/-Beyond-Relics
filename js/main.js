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

  /* Original, locally generated deep-space ambience. It starts only after a visitor opts in. */
  var soundButton = document.getElementById("sound");
  var audioContext = null;
  var soundNodes = [];
  var master = null;
  var soundEnabled = false;

  function remember(node) {
    soundNodes.push(node);
    return node;
  }

  function makeTone(frequency, type, volume, detune) {
    var oscillator = remember(audioContext.createOscillator());
    var voiceGain = remember(audioContext.createGain());
    var filter = remember(audioContext.createBiquadFilter());
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune || 0;
    filter.type = "lowpass";
    filter.frequency.value = 520;
    filter.Q.value = .35;
    voiceGain.gain.value = volume;
    oscillator.connect(filter);
    filter.connect(voiceGain);
    voiceGain.connect(master);
    oscillator.start();
    return { oscillator: oscillator, filter: filter };
  }

  function startAmbient() {
    var AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) {
      if (soundButton) soundButton.setAttribute("aria-label", "Ambient audio is not supported in this browser");
      return false;
    }
    try {
      audioContext = audioContext || new AudioEngine();
      if (audioContext.state === "suspended") audioContext.resume();
      if (master) return true;

      master = remember(audioContext.createGain());
      master.gain.setValueAtTime(0, audioContext.currentTime);
      master.gain.linearRampToValueAtTime(.24, audioContext.currentTime + 3.5);
      master.connect(audioContext.destination);

      var pad = [
        makeTone(55, "sine", .23, -4),
        makeTone(82.41, "triangle", .12, 3),
        makeTone(110, "sine", .075, 7),
        makeTone(164.81, "sine", .035, -6)
      ];

      var lfo = remember(audioContext.createOscillator());
      var lfoGain = remember(audioContext.createGain());
      lfo.type = "sine";
      lfo.frequency.value = .075;
      lfoGain.gain.value = 85;
      lfo.connect(lfoGain);
      pad.forEach(function (voice) {
        lfoGain.connect(voice.filter.frequency);
      });
      lfo.start();

      var shimmer = remember(audioContext.createOscillator());
      var shimmerGain = remember(audioContext.createGain());
      var shimmerFilter = remember(audioContext.createBiquadFilter());
      shimmer.type = "sine";
      shimmer.frequency.value = 440;
      shimmer.detune.value = 11;
      shimmerFilter.type = "lowpass";
      shimmerFilter.frequency.value = 760;
      shimmerGain.gain.value = .012;
      shimmer.connect(shimmerFilter);
      shimmerFilter.connect(shimmerGain);
      shimmerGain.connect(master);
      shimmer.start();

      var bufferLength = Math.floor(audioContext.sampleRate * 3);
      var noiseBuffer = audioContext.createBuffer(1, bufferLength, audioContext.sampleRate);
      var noiseData = noiseBuffer.getChannelData(0);
      for (var i = 0; i < bufferLength; i++) noiseData[i] = (Math.random() * 2 - 1) * .22;
      var noise = remember(audioContext.createBufferSource());
      var noiseFilter = remember(audioContext.createBiquadFilter());
      var noiseGain = remember(audioContext.createGain());
      noise.buffer = noiseBuffer;
      noise.loop = true;
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.value = 170;
      noiseGain.gain.value = .045;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start();

      soundEnabled = true;
      return true;
    } catch (error) {
      stopAmbient(true);
      if (soundButton) soundButton.setAttribute("aria-label", "Could not start ambient audio");
      return false;
    }
  }

  function stopAmbient(immediate) {
    if (!audioContext || !master) {
      soundEnabled = false;
      return;
    }
    var oldMaster = master;
    var now = audioContext.currentTime;
    oldMaster.gain.cancelScheduledValues(now);
    if (immediate) oldMaster.gain.setValueAtTime(0, now);
    else {
      oldMaster.gain.setTargetAtTime(0, now, .22);
    }
    soundNodes.forEach(function (node) {
      if (node && typeof node.stop === "function") {
        try { node.stop(now + (immediate ? 0 : .9)); } catch (error) {}
      }
    });
    var nodesToRelease = soundNodes.slice();
    soundNodes = [];
    master = null;
    soundEnabled = false;
    window.setTimeout(function () {
      nodesToRelease.forEach(function (node) {
        try { node.disconnect(); } catch (error) {}
      });
    }, immediate ? 0 : 1100);
  }

  if (soundButton) {
    soundButton.setAttribute("aria-label", "Turn ambient space sound on");
    soundButton.addEventListener("click", function () {
      if (!soundEnabled) {
        if (startAmbient()) {
          soundButton.setAttribute("aria-pressed", "true");
          soundButton.setAttribute("aria-label", "Turn ambient space sound off");
        }
      } else {
        stopAmbient(false);
        soundButton.setAttribute("aria-pressed", "false");
        soundButton.setAttribute("aria-label", "Turn ambient space sound on");
      }
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });
})();