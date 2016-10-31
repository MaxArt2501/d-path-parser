d-path-parser
=============

JavaScript parser for SVG `<path>`'s `d` attribute.

[![Version](http://img.shields.io/npm/v/d-path-parser.svg)](https://www.npmjs.org/package/d-path-parser)
[![Build Status](https://travis-ci.org/MaxArt2501/d-path-parser.svg?branch=master)](https://travis-ci.org/MaxArt2501/d-path-parser)

## Reason

The syntax for the `d` attribute is [compact and expressive](https://www.w3.org/TR/SVG/paths.html), but unfortunately it's also
dramatic to debug/maintain/read. This parser gives you a breakdown of the commands in the string, ready for you to read and
manipulate.

There's [another library](https://github.com/hughsk/svg-path-parser) with the same purpose around, maintained by Hugh Kennedy.
Its main feature is that's generated from a formal grammar, so that's actually pretty neat. On the down size, there's its...
size, and the fact that it's quite slow compared to this one. We're talking about 11x the size minified, 3.5 the size minified
and gzipped (`d-path-parser` is less than 1K), and 6x-10x slower depending on the input (the longer, the slower) and the environment.

One may argue that size and speed aren't usually important features, and they might be right. `d-path-parser` also has 100%
test coverage, by the way.

## Installation

Via `npm`/`yarn`:

```bash
npm install d-path-parser
yarn add d-path-parser
```

Via `bower`;

```bash
bower install d-path-parser
```

## Usage

As a CommonJS package:
```javascript
const parse = require("d-path-parser");
const path = "M0,0 l10,10 A14.142 14.142 0 1 1 10,-10 Z";
const commands = parse(path);
```

This will yield the following result:

```javascript
[{
    code: "M",
    relative: false,
    end: { x: 0, y: 0 }
}, {
    code: "l",
    relative: true,
    end: { x: 10, y: 10 }
}, {
    code: "A",
    relative: false,
    radii: { x: 14.142, y: 14.142 },
    rotation: 0,
    large: true,
    clockwise: true,
    end: { x: 10, y: -10 }
}, {
    code: "Z"
}]
```

The parser can also be loaded via AMD (`define([ "d-path-parser", ... ], function(parse) { ... })`) and, if no module loader is
detected, a global function `dPathParse` will be defined.

## Gotchas

`d-path-parser` does *not* assume the given string is the full path string of a `d` attribute. In short, it won't throw if the
first command is not a `moveTo`.

## Tests

[Mocha](https://mochajs.org/) and [Chai](http://chaijs.com/) are used for tests. Just run `npm test` (or `mocha` if it's globally
installed).

## License

MIT @ Massimo Artizzu 2016. See [LICENSE](LICENSE).
