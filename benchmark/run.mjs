import { Bench } from "tinybench";
import { parse, stringify } from "../lib/index.js";

const small = `{
    // comment
    unquoted: 'this is an unquoted property',
    singleQuotes: 'this value uses "double quotes"!',
    lineBreaks: "This value contains line \\
breaks!",
    hexadecimal: 0xC0FFEE,
    leadingDecimalPoint: .8675309,
    trailingDecimalPoint: 8675309.,
    positiveSign: +1,
    trailingComma: {field: 'in a field value',},
    trailingCommaInArray: ['in an array value',],
    "quotedKey": "this is a quoted property",
}`;

const largeValue = {
  items: Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `item ${i}`,
    arrayValue: ["a", "b", "c"],
    booleanValue: i % 2 === 0,
    numberValue: i * 1.5,
    nestedValue: { key: "value", "quoted-key": null },
  })),
};
const large = stringify(largeValue, null, 2);
const smallValue = parse(small);

const bench = new Bench();

bench
  .add("parse (small)", () => {
    parse(small);
  })
  .add("parse (large)", () => {
    parse(large);
  })
  .add("stringify (small)", () => {
    stringify(smallValue);
  })
  .add("stringify (large)", () => {
    stringify(largeValue);
  })
  .add("stringify (large, indented)", () => {
    stringify(largeValue, null, 2);
  });

await bench.run();

console.table(bench.table());
