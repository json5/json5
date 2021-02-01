# JSON5 – JSON for Humans (适合人类使用的JSON格式,更加语义化)

[![Build Status](https://travis-ci.org/json5/json5.svg)](https://travis-ci.org/json5/json5)

JSON是非常棒的数据格式，但是我们认为它可以更友好点

**JSON5是JSON的优化扩展** 他致力于让*人们书写维护*代码变得更加简单. 
它主要是通过增加一些很少的ECMAScript 5的语法特效.

JSON5仍然是JavaScript的严格子集，并没有增加任何新的数据类型，而且兼容目前所有的JSON内容。

JSON5并 *不* 是 JSON官方的升级版，而且JSON5的内容也并不能很好的兼容现有的JSON parsers. 
因此，JSON5的文件格式采用了一个新的 .json5的扩展名. *(TODO: 需要新的 MIME type)*

这里的代码**参考标准JavaScript**适合用于Node.js和所有的客户端浏览器。
他直接基于Douglas Crockford’s own [JSON implementation][json_parse.js], 并且他是健壮和安全的。

## Why

JSON并不是最适合*写*的方式。Keys需要加上引号，对象和数组不能有逗号，也不允许有注释 - 
尽管现今正常的JavaScript都不会有这些问题。

当JSON作为一种数据格式，肯定是好的，但是JSON的用途已经扩展，不仅仅用于 *机器*. 
JSON现在已经被*人们*用于 [configs][ex1],[manifests][ex2], even [tests][ex3].

[ex1]: http://plovr.com/docs.html
[ex2]: https://www.npmjs.org/doc/files/package.json.html
[ex3]: http://code.google.com/p/fuzztester/wiki/JSONFileFormat

当然，有很多用户友好的格式，像YAML，但是从JSON改到一个完全不同的格式，还是很不方便的。
JSON5的目标是继续保留使用JSON和JavaScript的基本格式。

## Features

以下是JSON5提供的一系列扩展的JSON格式。   **所有这些都是可选的**， 并且 **所有的语法采用ES5**.

### Objects

- 对象键值可以不用双引号，只要他们是有效的 [标识符][mdn_variables].
  对，甚至在ES5里像保留的关键词 （像`default`）也是允许不加双引号的。
  [[§11.1.5](http://es5.github.com/#x11.1.5), [§7.6](http://es5.github.com/#x7.6)].
  ([More info](https://mathiasbynens.be/notes/javascript-identifiers))

  *(TODO: Unicode characters and escape sequences aren’t yet supported in this
  implementation.)*
  
- 对象键值也可以用单引号.

- 对象可以在尾部加逗号.

[mdn_variables]: https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Core_Language_Features#Variables

### Arrays

- 数组可以在尾部加逗号.

### Strings

- 字符串可以加单引号.

- 字符串可以分开多行，只需要在每个新行加上反斜杠“／”. [ES5 [§7.8.4](http://es5.github.com/#x7.8.4)]

### Numbers

- 数字可以使用16进制 (base 16).

- 数字可以开始或结尾处以小数点（前置或尾部）.

- 数字可以包含 `Infinity`, `-Infinity`,  `NaN`, and `-NaN`.

- 数字也可以以显示的“+”开头.

### Comments

- 注释即支持单行，也支持多行方式.


## Example

下面是一个基本案例，但是他基本展示了多数功能：

```js
{
    foo: 'bar',
    while: true,

    this: 'is a \
multi-line string',

    // this is an inline comment
    here: 'is another', // inline comment

    /* this is a block comment
       that continues on another line */

    hex: 0xDEADbeef,
    half: .5,
    delta: +10,
    to: Infinity,   // and beyond!

    finally: 'a trailing comma',
    oh: [
        "we shouldn't forget",
        'arrays can have',
        'trailing commas too',
    ],
}
```

This implementation’s own [package.json5](https://github.com/json5/json5/blob/master/package.json5) is more realistic:

```js
// This file is written in JSON5 syntax, naturally, but npm needs a regular
// JSON file, so compile via `npm run build`. Be sure to keep both in sync!

{
    name: 'json5',
    version: '0.5.0',
    description: 'JSON for the ES5 era.',
    keywords: ['json', 'es5'],
    author: 'Aseem Kishore <aseem.kishore@gmail.com>',
    contributors: [
        // TODO: Should we remove this section in favor of GitHub's list?
        // https://github.com/json5/json5/contributors
        'Max Nanasy <max.nanasy@gmail.com>',
        'Andrew Eisenberg <andrew@eisenberg.as>',
        'Jordan Tucker <jordanbtucker@gmail.com>',
    ],
    main: 'lib/json5.js',
    bin: 'lib/cli.js',
    files: ["lib/"],
    dependencies: {},
    devDependencies: {
        gulp: "^3.9.1",
        'gulp-jshint': "^2.0.0",
        jshint: "^2.9.1",
        'jshint-stylish': "^2.1.0",
        mocha: "^2.4.5"
    },
    scripts: {
        build: 'node ./lib/cli.js -c package.json5',
        test: 'mocha --ui exports --reporter spec',
            // TODO: Would it be better to define these in a mocha.opts file?
    },
    homepage: 'http://json5.org/',
    license: 'MIT',
    repository: {
        type: 'git',
        url: 'https://github.com/json5/json5',
    },
}
```


## Community

Join the [Google Group](http://groups.google.com/group/json5) if you’re
interested in JSON5 news, updates, and general discussion.
Don’t worry, it’s very low-traffic.

The [GitHub wiki](https://github.com/json5/json5/wiki) is a good place to track
JSON5 support and usage. Contribute freely there!

[GitHub Issues](https://github.com/json5/json5/issues) is the place to
formally propose feature requests and report bugs. Questions and general
feedback are better directed at the Google Group.


## Usage

This JavaScript implementation of JSON5 simply provides a `JSON5` object just
like the native ES5 `JSON` object.

To use from Node:

```sh
npm install json5
```

```js
var JSON5 = require('json5');
```

To use in the browser (adds the `JSON5` object to the global namespace):

```html
<script src="json5.js"></script>
```

Then in both cases, you can simply replace native `JSON` calls with `JSON5`:

```js
var obj = JSON5.parse('{unquoted:"key",trailing:"comma",}');
var str = JSON5.stringify(obj);
```

`JSON5.parse` supports all of the JSON5 features listed above (*TODO: except
Unicode*), as well as the native [`reviver` argument][json-parse].

[json-parse]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

`JSON5.stringify` mainly avoids quoting keys where possible, but we hope to
keep expanding it in the future (e.g. to also output trailing commas).
It supports the native [`replacer` and `space` arguments][json-stringify],
as well. *(TODO: Any implemented `toJSON` methods aren’t used today.)*

[json-stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify


### Extras

If you’re running this on Node, you can also register a JSON5 `require()` hook
to let you `require()` `.json5` files just like you can `.json` files:

```js
require('json5/lib/require');
require('./path/to/foo');   // tries foo.json5 after foo.js, foo.json, etc.
require('./path/to/bar.json5');
```

This module also provides a `json5` executable (requires Node) for converting
JSON5 files to JSON:

```sh
json5 -c path/to/foo.json5    # generates path/to/foo.json
```


## Development

```sh
git clone https://github.com/json5/json5
cd json5
npm install
npm test
```

As the `package.json5` file states, be sure to run `npm run build` on changes
to `package.json5`, since npm requires `package.json`.

Feel free to [file issues](https://github.com/json5/json5/issues) and submit
[pull requests](https://github.com/json5/json5/pulls) — contributions are
welcome. If you do submit a pull request, please be sure to add or update the
tests, and ensure that `npm test` continues to pass.


## License

MIT. See [LICENSE.md](./LICENSE.md) for details.


## Credits

[Aseem Kishore](https://github.com/aseemk) started this project.
He got a [lot of flak](https://news.ycombinator.com/item?id=4031699) for it
(including [this gem](https://web.archive.org/web/20150714105148/https://github.com/mitchellh/html7)).

[Michael Bolin](http://bolinfest.com/) independently arrived at and published
some of these same ideas with awesome explanations and detail.
Recommended reading:
[Suggested Improvements to JSON](http://bolinfest.com/essays/json.html)

[Douglas Crockford](http://www.crockford.com/) of course designed and built
JSON, but his state machine diagrams on the [JSON website](http://json.org/),
as cheesy as it may sound, gave me motivation and confidence that building a
new parser to implement these ideas this was within my reach!
This code is also modeled directly off of Doug’s open-source [json_parse.js][]
parser. I’m super grateful for that clean and well-documented code.

[json_parse.js]: https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js

[Max Nanasy](https://github.com/MaxNanasy) has been an early and prolific
supporter, contributing multiple patches and ideas. Thanks Max!

[Andrew Eisenberg](https://github.com/aeisenberg) has contributed the
`stringify` method.

[Jordan Tucker](https://github.com/jordanbtucker) has aligned JSON5 more closely
with ES5 and is actively maintaining this project.