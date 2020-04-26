/*!
 * d-path-parser - v1.0.0
 * by Massimo Artizzu (MaxArt2501)
 *
 * https://github.com/MaxArt2501/d-path-parser
 *
 * Licensed under the MIT License
 * See LICENSE for details
 */

(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === "object") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.dPathParse = factory();
    }
})(this, function() {
"use strict";

return function parse(d) {
    var re = {
        command: /\s*([achlmqstvz])/gi,
        number: /\s*([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/gi,
        comma: /\s*(?:(,)|\s)/g,
        flag: /\s*([01])/g
    };
    var matchers = {
        "number": function(must) {
            var x = get("number", must);
            if(x === null) return null;
            return +x;
        },
        "coordinate pair": function(must) {
            var x = get("number", must);
            if (x === null && !must) return null;
            get("comma");
            var y = get("number", true);
            return { x: +x, y: +y };
        },
        "arc definition": function(must) {
            var radii = matchers["coordinate pair"](must);
            if (!radii && !must) return null;
            get("comma");
            var rotation = +get("number", true);
            get("comma", true);
            var large = !!+get("flag", true);
            get("comma");
            var clockwise = !!+get("flag", true);
            get("comma");
            var end = matchers["coordinate pair"](true);
            return {
                radii: radii,
                rotation: rotation,
                large: large,
                clockwise: clockwise,
                end: end
            };
        }
    }
    var index = 0;
    var commands = [];

    while (index < d.length) {
        var cmd = get("command");
        var upcmd = cmd.toUpperCase();
        var relative = cmd !== upcmd;
        var sequence;
        switch (upcmd) {
            case "M":
                sequence = getSequence("coordinate pair").map(function(coords, i) {
                    if (i === 1) cmd = relative ? "l" : "L";
                    return makeCommand({ end: coords });
                });
                break;
            case "L":
            case "T":
                sequence = getSequence("coordinate pair").map(function(coords) {
                    return makeCommand({ end: coords });
                });
                break;
            case "C":
                sequence = getSequence("coordinate pair");
                if (sequence.length % 3)
                    throw Error("Expected coordinate pair triplet at position " + index);

                sequence = sequence.reduce(function(seq, coords, i) {
                    var rest = i % 3;
                    if (!rest) {
                        seq.push(makeCommand({ cp1: coords }));
                    } else {
                        var last = seq[seq.length - 1];
                        last[rest === 1 ? "cp2" : "end"] = coords;
                    }
                    return seq;
                }, []);

                break;
            case "Q":
            case "S":
                sequence = getSequence("coordinate pair");
                if (sequence.length & 1)
                    throw Error("Expected coordinate pair couple at position " + index);

                sequence = sequence.reduce(function(seq, coords, i) {
                    var odd = i & 1;
                    if (!odd) {
                        seq.push(makeCommand({ cp: coords }));
                    } else {
                        var last = seq[seq.length - 1];
                        last.end = coords;
                    }
                    return seq;
                }, []);

                break;
            case "H":
            case "V":
                sequence = getSequence("number").map(function(value) {
                    return makeCommand({ value: value });
                });
                break;
            case "A":
                sequence = getSequence("arc definition").map(makeCommand);
                break;
            case "Z":
                sequence = [ { code: "Z" } ];
                break;
        }
        commands.push.apply(commands, sequence);
    }

    return commands;

    function makeCommand(obj) {
        obj.code = cmd;
        obj.relative = relative;

        return obj;
    }
    function get(what, must) {
        re[what].lastIndex = index;
        var res = re[what].exec(d);
        if (!res || res.index !== index) {
            if (!must) return null;
            throw Error("Expected " + what + " at position " + index);
        }

        index = re[what].lastIndex;

        return res[1];
    }
    function getSequence(what) {
        var sequence = [];
        var matched;
        var must = true;
        while ((matched = matchers[what](must)) !== null) {
            sequence.push(matched);
            must = !!get("comma");
        }

        return sequence;
    }
};
});
