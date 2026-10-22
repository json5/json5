import { test } from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";
import JSON5, { parse, stringify } from "../lib/index.js";

const require = createRequire(import.meta.url);

test("exports: the default export carries the named exports", () => {
  assert.strictEqual(JSON5.parse, parse);
  assert.strictEqual(JSON5.stringify, stringify);
});

test("exports: require() returns the named and default exports", () => {
  const json5 = require("../lib/index.js");
  assert.strictEqual(json5.parse, parse);
  assert.strictEqual(json5.stringify, stringify);
  assert.strictEqual(json5.default, JSON5);
});
