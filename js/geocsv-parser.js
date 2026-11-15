(function (scope) {
  "use strict";
  function splitRecord(line, delimiter) {
    var cells = [], value = "", quoted = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line.charAt(i);
      if (ch === '"') {
        if (quoted && line.charAt(i + 1) === '"') { value += '"'; i++; }
        else quoted = !quoted;
      } else if (ch === delimiter && !quoted) { cells.push(value.trim()); value = ""; }
      else value += ch;
    }
    if (quoted) throw new Error("A quoted CSV field is not closed. Check that the original GeoCSV file is complete.");
    cells.push(value.trim());
    return cells;
  }
  function numeric(value) {
    if (value === null || value === undefined) return null;
    var clean = String(value).trim();
    if (!clean || /^(?:nan|na|null|n\/a|--?)$/i.test(clean)) return null;
    var parsed = Number(clean);
    return Number.isFinite(parsed) ? parsed : null;
  }
  function parse(text) {
    if (typeof text !== "string" || !text.trim()) throw new Error("The selected file is empty or is not readable text.");
    var lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
    var headerIndex = -1, headers = [], delimiter = ",";
    var headerPattern = /time|date|sample|value|data|amplitude|count|^x$|^y$/i;
    var delimiters = [",", "\t", ";"];
    for (var i = 0; i < Math.min(lines.length, 500); i++) {
      var line = lines[i].trim();
      if (!line || line.charAt(0) === "#") continue;
      var candidates = delimiters.map(function (candidate) {
        try {
          var cells = splitRecord(line, candidate);
          var matching = cells.filter(function (cell) { return headerPattern.test(cell.trim()); }).length;
          return { delimiter: candidate, cells: cells, matching: matching };
        } catch (_) { return { delimiter: candidate, cells: [], matching: 0 }; }
      }).sort(function (a, b) { return (b.matching * 100 + b.cells.length) - (a.matching * 100 + a.cells.length); });
      if (candidates[0] && candidates[0].cells.length > 1 && candidates[0].matching > 0) {
        headerIndex = i;
        headers = candidates[0].cells.map(function (cell) { return cell.replace(/^\uFEFF/, "").trim(); });
        delimiter = candidates[0].delimiter;
        break;
      }
    }
    if (headerIndex < 0) throw new Error("Could not identify the GeoCSV column header. Choose an ASCII GeoCSV observation file with a time or numeric-data column.");
    var rows = [], skippedRows = 0;
    for (var r = headerIndex + 1; r < lines.length; r++) {
      var raw = lines[r].trim();
      if (!raw || raw.charAt(0) === "#") continue;
      var cells;
      try { cells = splitRecord(raw, delimiter); }
      catch (_) { skippedRows++; continue; }
      if (cells.length !== headers.length) { skippedRows++; continue; }
      rows.push(cells);
    }
    if (rows.length < 20) throw new Error("The file contains fewer than 20 readable data rows. Check that the selected file is an observation table, not a metadata file.");
    var timeCol = headers.findIndex(function (header) {
      return /(^|[_\s-])(time|date|epoch|utc|timestamp)([_\s-]|$)/i.test(header) || /time|timestamp|utc/i.test(header);
    });
    var numericCounts = headers.map(function (_, col) {
      return rows.reduce(function (count, row) { return count + (numeric(row[col]) === null ? 0 : 1); }, 0);
    });
    var candidates = headers.map(function (header, col) {
      var name = header.toLowerCase(), score = numericCounts[col];
      if (col === timeCol || /time|date|epoch|utc|timestamp|index|sequence|ordinal/i.test(name)) score -= rows.length * 2;
      if (/sample|value|data|amplitude|count|measurement|^y$/i.test(name)) score += rows.length * 0.2;
      return { col: col, score: score, count: numericCounts[col] };
    }).filter(function (item) {
      return item.col !== timeCol && item.count >= Math.max(20, Math.ceil(rows.length * 0.5));
    }).sort(function (a, b) { return b.score - a.score; });
    if (!candidates.length) throw new Error("No numeric observation column was found. The selected file may contain metadata rather than seismic measurements.");
    var valueCol = candidates[0].col, points = [];
    rows.forEach(function (row, index) {
      var y = numeric(row[valueCol]);
      if (y === null) return;
      points.push({ x: timeCol >= 0 ? row[timeCol] : String(index + 1), y: y, row: index + 1 });
    });
    if (points.length < 20) throw new Error("Fewer than 20 valid numeric samples were found in the selected observation column.");
    return {
      headers: headers, valueLabel: headers[valueCol] || "Observed value",
      timeLabel: timeCol >= 0 ? headers[timeCol] : "Sample index",
      points: points, totalRows: rows.length, skippedRows: skippedRows,
      invalidValues: rows.length - points.length,
      delimiter: delimiter === "\t" ? "tab" : delimiter
    };
  }
  scope.BeyondRelicsGeoCSV = Object.freeze({ parse: parse });
})(typeof window !== "undefined" ? window : globalThis);
