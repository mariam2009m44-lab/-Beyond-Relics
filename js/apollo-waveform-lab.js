(function () {
  "use strict";
  var root = document.getElementById("apollo-waveform-lab");
  if (!root) return;

  var sampleUrl = "https://pds-geosciences.wustl.edu/lunar/urn-nasa-pds-apollo_pse/data/xa/continuous_waveform/s12/1969/323/xa.s12.00.mhz.1969.323.0.a.csv";
  var fileInput = root.querySelector("[data-wave-file]");
  var loadButton = root.querySelector("[data-wave-load]");
  var status = root.querySelector("[data-wave-status]");
  var chart = root.querySelector("[data-wave-chart]");
  var stats = root.querySelector("[data-wave-stats]");
  var details = root.querySelector("[data-wave-details]");
  var selectedFile = null;

  function node(tag, cls, value) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value !== undefined) el.textContent = value;
    return el;
  }
  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state || "info";
  }
  var parseCSV = window.BeyondRelicsGeoCSV && window.BeyondRelicsGeoCSV.parse;
  if (typeof parseCSV !== "function") {
    setStatus("The GeoCSV parser could not be initialized. Refresh the page and try again.", "error");
    return;
  }
  function render(result, filename) {
    chart.replaceChildren();
    stats.replaceChildren();
    var values = result.points.map(function (p) { return p.y; });
    var min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    var mean = values.reduce(function (a, b) { return a + b; }, 0) / values.length;
    var sortedValues = values.slice().sort(function (a, b) { return a - b; });
    var middle = Math.floor(sortedValues.length / 2);
    var median = sortedValues.length % 2 ? sortedValues[middle] : (sortedValues[middle - 1] + sortedValues[middle]) / 2;
    var rms = Math.sqrt(values.reduce(function (sum, v) { return sum + v * v; }, 0) / values.length);
    var peak = result.points.reduce(function (best, p) { return Math.abs(p.y) > Math.abs(best.y) ? p : best; }, result.points[0]);
    var spread = Math.sqrt(values.reduce(function (sum, v) { return sum + Math.pow(v - mean, 2); }, 0) / values.length);
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 960 340");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Plot of " + result.valueLabel + " from " + filename);
    var left = 76, right = 930, top = 24, bottom = 278;
    var pad = Math.max((max - min) * 0.08, Math.abs(max || min || 1) * 0.025, 1e-12);
    var lo = min - pad, hi = max + pad;
    function sx(i) { return left + (i / Math.max(1, result.points.length - 1)) * (right - left); }
    function sy(v) { return bottom - ((v - lo) / (hi - lo)) * (bottom - top); }
    function add(tag, attrs, text) {
      var e = document.createElementNS(svgNS, tag);
      Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      if (text !== undefined) e.textContent = text;
      svg.appendChild(e); return e;
    }
    [0, .25, .5, .75, 1].forEach(function (t) {
      var y = bottom - t * (bottom - top);
      add("line", { x1: left, y1: y, x2: right, y2: y, class: "wave-grid" });
      add("text", { x: left - 12, y: y + 4, "text-anchor": "end", class: "wave-axis-label" }, (lo + t * (hi - lo)).toExponential(2));
    });
    add("line", { x1: left, y1: top, x2: left, y2: bottom, class: "wave-axis" });
    add("line", { x1: left, y1: bottom, x2: right, y2: bottom, class: "wave-axis" });
    var maxDraw = 1600, step = Math.max(1, Math.ceil(result.points.length / maxDraw));
    var path = [];
    for (var i = 0; i < result.points.length; i += step) path.push((path.length ? "L" : "M") + sx(i).toFixed(2) + " " + sy(result.points[i].y).toFixed(2));
    if ((result.points.length - 1) % step !== 0) {
      var last = result.points.length - 1;
      path.push("L" + sx(last).toFixed(2) + " " + sy(result.points[last].y).toFixed(2));
    }
    add("path", { d: path.join(" "), class: "wave-line" });
    add("text", { x: left, y: 314, class: "wave-axis-label" }, "Start · " + result.points[0].x);
    add("text", { x: right, y: 314, "text-anchor": "end", class: "wave-axis-label" }, "End · " + result.points[result.points.length - 1].x);
    add("text", { x: 18, y: 18, class: "wave-axis-label" }, result.valueLabel);
    chart.appendChild(svg);

    [
      ["Valid samples plotted", values.length.toLocaleString()],
      ["Minimum", min.toExponential(4)],
      ["Maximum", max.toExponential(4)],
      ["Mean", mean.toExponential(4)],
      ["Median", median.toExponential(4)],
      ["RMS", rms.toExponential(4)],
      ["Population standard deviation", spread.toExponential(4)],
      ["Largest |value|", peak.y.toExponential(4)],
      ["Rows skipped / invalid", (result.skippedRows + result.invalidValues).toLocaleString()]
    ].forEach(function (pair) {
      var item = node("div", "wave-stat");
      item.append(node("span", "", pair[0]), node("strong", "", pair[1]));
      stats.appendChild(item);
    });
    details.replaceChildren();
    details.append(node("p", "", "Source file: " + filename));
    details.append(node("p", "", "Detected value column: " + result.valueLabel + " · Horizontal axis: " + result.timeLabel + " · Delimiter: " + result.delimiter + "."));
    details.append(node("p", "", "Rows read: " + result.totalRows.toLocaleString() + " · Valid numeric observations: " + result.points.length.toLocaleString() + " · Invalid numeric values: " + result.invalidValues.toLocaleString() + " · Malformed rows skipped: " + result.skippedRows.toLocaleString() + "."));
    details.append(node("p", "", "The chart plots values from the selected archive file. The explorer does not infer physical units, identify moonquakes, or assign causes to peaks."));
    setStatus("Archive file parsed. " + values.length.toLocaleString() + " valid numeric observations plotted; " + (result.skippedRows + result.invalidValues).toLocaleString() + " rows or values were excluded and are reported below.", "success");
  }
  function processText(text, filename) {
    try {
      var result = parseCSV(text);
      render(result, filename);
    } catch (error) {
      setStatus(error.message, "error");
    }
  }
  fileInput.addEventListener("change", function () {
    selectedFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
    if (selectedFile) setStatus("Selected " + selectedFile.name + ". Choose “Plot selected file” to inspect its observations.", "info");
  });
  root.querySelector("[data-wave-plot]").addEventListener("click", function () {
    if (!selectedFile) { setStatus("Choose a downloaded NASA PDS ASCII GeoCSV observation file first.", "error"); return; }
    var reader = new FileReader();
    reader.onload = function () { processText(String(reader.result || ""), selectedFile.name); };
    reader.onerror = function () { setStatus("The selected file could not be read by this browser.", "error"); };
    reader.readAsText(selectedFile);
  });
  loadButton.addEventListener("click", function () {
    loadButton.disabled = true;
    setStatus("Requesting the Apollo 12 observation file from NASA PDS…", "info");
    fetch(sampleUrl).then(function (response) {
      if (!response.ok) throw new Error("NASA PDS returned HTTP " + response.status);
      return response.text();
    }).then(function (text) {
      processText(text, "xa.s12.00.mhz.1969.323.0.a.csv");
    }).catch(function () {
      setStatus("This browser could not read the remote file directly (the archive may block cross-origin requests). Download the NASA CSV using the link below, then choose it here. The project does not replace it with simulated data.", "error");
    }).finally(function () { loadButton.disabled = false; });
  });
})();