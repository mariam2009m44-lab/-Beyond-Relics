import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../js/geocsv-parser.js", import.meta.url), "utf8");
const sandbox = {};
vm.runInNewContext(source, sandbox);
const parse = sandbox.BeyondRelicsGeoCSV.parse;

test("reads GeoCSV after comment metadata and identifies time and value columns", () => {
  const rows = Array.from({ length: 25 }, (_, i) => "2026-01-01T00:00:" + String(i).padStart(2, "0") + "Z," + (i - 12)).join("\n");
  const result = parse("# dataset: Apollo PSE\n# format: GeoCSV\ntime_utc,amplitude\n" + rows);
  assert.equal(result.points.length, 25);
  assert.equal(result.valueLabel, "amplitude");
  assert.equal(result.timeLabel, "time_utc");
  assert.equal(result.points[0].y, -12);
  assert.equal(result.points[24].y, 12);
});

test("preserves quoted fields containing commas", () => {
  const rows = Array.from({ length: 22 }, (_, i) => "2026-01-01T00:00:" + String(i).padStart(2, "0") + "Z," + (i * 2)).join("\n");
  const result = parse('time_utc,"seismic, sample"\n' + rows);
  assert.equal(result.valueLabel, "seismic, sample");
  assert.equal(result.points.length, 22);
});

test("supports tab-delimited observation tables", () => {
  const rows = Array.from({ length: 21 }, (_, i) => "T" + i + "\t" + (i + 0.5)).join("\n");
  const result = parse("time_utc\tvalue\n" + rows);
  assert.equal(result.delimiter, "tab");
  assert.equal(result.points[0].y, 0.5);
});

test("keeps numeric time values as the horizontal coordinate", () => {
  const rows = Array.from({ length: 20 }, (_, i) => (i * 0.25) + "," + (i - 4)).join("\n");
  const result = parse("time_seconds,amplitude\n" + rows);
  assert.equal(result.timeLabel, "time_seconds");
  assert.equal(result.points[3].x, "0.75");
});

test("reports missing numeric values and malformed rows without inventing samples", () => {
  const rows = Array.from({ length: 21 }, (_, i) => i === 4 ? "T" + i + ",NA" : "T" + i + "," + i).join("\n");
  const result = parse("time,value\n" + rows + "\nmalformed,row,extra");
  assert.equal(result.points.length, 20);
  assert.equal(result.invalidValues, 1);
  assert.equal(result.skippedRows, 1);
});

test("rejects metadata-only or non-observation files", () => {
  assert.throws(() => parse("# metadata only\n# no observation table"), /Could not identify/);
});

test("skips incomplete quoted CSV records and reports the omission", () => {
  const rows = Array.from({ length: 20 }, (_, i) => "T" + i + "," + i).join("\n");
  const result = parse("time,value\n" + rows + '\nT20,"unfinished');
  assert.equal(result.points.length, 20);
  assert.equal(result.skippedRows, 1);
});
