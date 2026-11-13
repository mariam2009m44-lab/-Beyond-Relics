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
  var chapterId = new URLSearchParams(window.location.search).get("chapter") || "lunar-module";
  var storyScores = {
    "lunar-module": { chords:[[146.83,174.61,220,293.66],[130.81,164.81,196,261.63],[110,146.83,174.61,220],[123.47,146.83,185,246.94]], notes:[293.66,349.23,440,392,329.63,293.66,261.63,220] },
    "apollo-12-alsep": { chords:[[110,164.81,220,329.63],[98,146.83,196,293.66],[110,164.81,246.94,329.63],[82.41,123.47,185,246.94]], notes:[329.63,392,493.88,440,392,329.63,293.66,246.94] },
    "pathfinder-sojourner": { chords:[[164.81,196,246.94,329.63],[146.83,174.61,220,293.66],[130.81,164.81,196,261.63],[146.83,185,220,293.66]], notes:[392,493.88,587.33,493.88,440,392,329.63,293.66] },
    "spirit": { chords:[[130.81,155.56,196,261.63],[116.54,146.83,174.61,233.08],[103.83,130.81,155.56,207.65],[116.54,138.59,174.61,233.08]], notes:[261.63,311.13,349.23,311.13,293.66,261.63,233.08,196] },
    "opportunity": { chords:[[146.83,185,220,293.66],[164.81,196,246.94,329.63],[130.81,164.81,196,261.63],[146.83,174.61,220,293.66]], notes:[293.66,369.99,440,493.88,440,369.99,329.63,293.66] },
    "phoenix": { chords:[[138.59,164.81,207.65,277.18],[123.47,146.83,185,246.94],[110,138.59,164.81,220],[123.47,155.56,185,246.94]], notes:[554.37,493.88,415.3,369.99,415.3,493.88,369.99,311.13] },
    "insight": { chords:[[98,146.83,196,246.94],[87.31,130.81,174.61,220],[82.41,123.47,164.81,207.65],[98,146.83,185,246.94]], notes:[196,246.94,293.66,246.94,220,196,174.61,146.83] },
    "curiosity": { chords:[[164.81,207.65,246.94,329.63],[146.83,185,220,293.66],[174.61,220,261.63,349.23],[146.83,196,246.94,293.66]], notes:[392,493.88,587.33,659.25,587.33,493.88,440,392] },
    "voyager": { chords:[[110,164.81,220,329.63],[123.47,185,246.94,369.99],[98,146.83,196,293.66],[110,164.81,246.94,369.99]], notes:[329.63,392,493.88,587.33,493.88,440,392,329.63] },
    "space-telescope": { chords:[[155.56,196,233.08,311.13],[138.59,174.61,207.65,277.18],[164.81,207.65,246.94,329.63],[146.83,185,220,293.66]], notes:[311.13,369.99,466.16,554.37,466.16,415.3,369.99,311.13] }
  };
  function applyStoryScore(id) {
    var score = storyScores[id];
    if (!score) return;
    progression = score.chords;
    melody = score.notes;
    step = 0;
  }
  applyStoryScore(chapterId);
  window.addEventListener("beyondrelics:chapter", function(event) {
    if (event.detail && event.detail.id) applyStoryScore(event.detail.id);
  });


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
    function activate() {
      if (soundEnabled || !audioContext || audioContext.state !== "running") return;
      try {
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

        /* A rising five-note entrance cue gives each story an unmistakable beginning. */
        var opening = [melody[0] * .5, melody[2] * .5, melody[4] * .5, melody[6] * .5, melody[7]];
        var entranceAt = audioContext.currentTime + .16;
        opening.forEach(function (frequency, index) {
          makePluck(frequency, entranceAt + index * .24, .075 + index * .012);
        });
        makePulse(entranceAt + .58);

        soundEnabled = true;
        step = 0;
        scheduleMusic();
        musicTimer = window.setInterval(scheduleMusic, 720);
        try { localStorage.setItem("br-music-enabled", "1"); } catch (error) {}
        updateSoundButton();
      } catch (error) {
        stopMusic(true);
        if (soundButton) soundButton.setAttribute("aria-label", "Could not start the music");
      }
    }
    try {
      audioContext = audioContext || new AudioEngine();
      if (audioContext.state === "running") {
        activate();
      } else {
        audioContext.resume().then(activate).catch(function () {
          soundEnabled = false;
          updateSoundButton();
        });
      }
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

  /* Audio starts only after an explicit visitor action. */
  window.BeyondRelicsAudio = {
    playStory: function () { return startMusic(); },
    stop: function () { stopMusic(false); updateSoundButton(); },
    isPlaying: function () { return soundEnabled; }
  };

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });
})();