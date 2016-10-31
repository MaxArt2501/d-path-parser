(function(root, tests) {
    if (typeof define === "function" && define.amd)
        define(["chai", "parser"], tests);
    else if (typeof exports === "object")
        tests(require("chai"), require("../parser.js"));
    else tests(root.dPathParse);
})(this, function(chai, parse) {
"use strict";

var expect = chai.expect;

describe("d-path-parser", function() {
    it("should handle moveTo commands", function() {
        expect(parse("M10,20")).to.eql([{ code: "M", relative: false, end: { x: 10, y: 20 }}]);
    });
    it("should handle lineTo commands", function() {
        expect(parse("L10,20")).to.eql([{ code: "L", relative: false, end: { x: 10, y: 20 }}]);
    });
    it("should handle horizontal lineTo commands", function() {
        expect(parse("H10")).to.eql([{ code: "H", relative: false, value: 10 }]);
    });
    it("should handle vertical lineTo commands", function() {
        expect(parse("V10")).to.eql([{ code: "V", relative: false, value: 10 }]);
    });
    it("should handle curveTo commands", function() {
        expect(parse("C1,2 3,4 5,6")).to.eql([{
            code: "C",
            relative: false,
            cp1: { x: 1, y: 2 },
            cp2: { x: 3, y: 4 },
            end: { x: 5, y: 6 }
        }]);
    });
    it("should handle quadratic curveTo commands", function() {
        expect(parse("Q1,2 3,4")).to.eql([{
            code: "Q",
            relative: false,
            cp: { x: 1, y: 2 },
            end: { x: 3, y: 4 }
        }]);
    });
    it("should handle smooth curveTo commands", function() {
        expect(parse("S1,2 3,4")).to.eql([{
            code: "S",
            relative: false,
            cp: { x: 1, y: 2 },
            end: { x: 3, y: 4 }
        }]);
    });
    it("should handle quadratic smooth curveTo commands", function() {
        expect(parse("T1,2")).to.eql([{ code: "T", relative: false, end: { x: 1, y: 2 } }]);
    });
    it("should handle arcTo commands", function() {
        expect(parse("A1,2 3 0 0 4,5")).to.eql([{
            code: "A",
            relative: false,
            radii: { x: 1, y: 2 },
            rotation: 3,
            large: false,
            clockwise: false,
            end: { x: 4, y: 5 }
        }]);
    });
    it("should handle closePath commands", function() {
        expect(parse("Z")).to.eql([{ code: "Z" }]);
    });
});
describe("With relation to relative commands", function() {
    it("should handle relative moveTo commands", function() {
        expect(parse("m10,20")).to.eql([{ code: "m", relative: true, end: { x: 10, y: 20 }}]);
    });
    it("should handle relative lineTo commands", function() {
        expect(parse("l10,20")).to.eql([{ code: "l", relative: true, end: { x: 10, y: 20 }}]);
    });
    it("should handle relative horizontal lineTo commands", function() {
        expect(parse("h10")).to.eql([{ code: "h", relative: true, value: 10 }]);
    });
    it("should handle relative vertical lineTo commands", function() {
        expect(parse("v10")).to.eql([{ code: "v", relative: true, value: 10 }]);
    });
    it("should handle relative curveTo commands", function() {
        expect(parse("c1,2 3,4 5,6")).to.eql([{
            code: "c",
            relative: true,
            cp1: { x: 1, y: 2 },
            cp2: { x: 3, y: 4 },
            end: { x: 5, y: 6 }
        }]);
    });
    it("should handle relative quadratic curveTo commands", function() {
        expect(parse("q1,2 3,4")).to.eql([{
            code: "q",
            relative: true,
            cp: { x: 1, y: 2 },
            end: { x: 3, y: 4 }
        }]);
    });
    it("should handle relative smooth curveTo commands", function() {
        expect(parse("s1,2 3,4")).to.eql([{
            code: "s",
            relative: true,
            cp: { x: 1, y: 2 },
            end: { x: 3, y: 4 }
        }]);
    });
    it("should handle relative quadratic smooth curveTo commands", function() {
        expect(parse("t1,2")).to.eql([{ code: "t", relative: true, end: { x: 1, y: 2 } }]);
    });
    it("should handle relative arcTo commands", function() {
        expect(parse("a1,2 3 0 0 4,5")).to.eql([{
            code: "a",
            relative: true,
            radii: { x: 1, y: 2 },
            rotation: 3,
            large: false,
            clockwise: false,
            end: { x: 4, y: 5 }
        }]);
    });
    it("should make no difference between 'z' and 'Z'", function() {
        expect(parse("z")).to.eql([{ code: "Z" }]);
    });
});

describe("With relation to multiple subpaths", function() {
    it("should parse only the first 'm/M' command as moveTo, the following as lineTo", function() {
        expect(parse("M1,2 3,4")).to.eql([
            { code: "M", relative: false, end: { x: 1, y: 2} },
            { code: "L", relative: false, end: { x: 3, y: 4} }
        ])
    });
    it("should handle multiple lineTo subpaths", function() {
        expect(parse("L1,2 3,4")).to.eql([
            { code: "L", relative: false, end: { x: 1, y: 2} },
            { code: "L", relative: false, end: { x: 3, y: 4} }
        ])
    });
    it("should handle multiple horizontal lineTo variations", function() {
        expect(parse("H1 2")).to.eql([
            { code: "H", relative: false, value: 1 },
            { code: "H", relative: false, value: 2 }
        ])
    });
    it("should handle multiple vertical lineTo variations", function() {
        expect(parse("V1 2")).to.eql([
            { code: "V", relative: false, value: 1 },
            { code: "V", relative: false, value: 2 }
        ])
    });
    it("should handle multiple curveTo subpaths", function() {
        expect(parse("C1,2 3,4 5,6 7,8 9,10 11,12")).to.eql([{
            code: "C",
            relative: false,
            cp1: { x: 1, y: 2 },
            cp2: { x: 3, y: 4 },
            end: { x: 5, y: 6 }
        }, {
            code: "C",
            relative: false,
            cp1: { x: 7, y: 8 },
            cp2: { x: 9, y: 10 },
            end: { x: 11, y: 12 }
        }]);
    });
    it("should handle multiple quadratic curveTo subpaths", function() {
        expect(parse("Q1,2 3,4 5,6 7,8")).to.eql([{
            code: "Q",
            relative: false,
            cp: { x: 1, y: 2 },
            end: { x: 3, y: 4 }
        }, {
            code: "Q",
            relative: false,
            cp: { x: 5, y: 6 },
            end: { x: 7, y: 8 }
        }]);
    });
    it("should handle multiple smooth curveTo subpaths", function() {
        expect(parse("S1,2 3,4 5,6 7,8")).to.eql([{
            code: "S",
            relative: false,
            cp: { x: 1, y: 2 },
            end: { x: 3, y: 4 }
        }, {
            code: "S",
            relative: false,
            cp: { x: 5, y: 6 },
            end: { x: 7, y: 8 }
        }]);
    });
    it("should handle multiple quadratic smooth curveTo subpaths", function() {
        expect(parse("T1,2 3,4")).to.eql([
            { code: "T", relative: false, end: { x: 1, y: 2} },
            { code: "T", relative: false, end: { x: 3, y: 4} }
        ])
    });
});

describe("Complex paths", function() {
    it("Triangle", function() {
        expect(parse("M1,1 L2,2 3,1 Z")).to.eql([
            { code: "M", relative: false, end: { x: 1, y: 1 }},
            { code: "L", relative: false, end: { x: 2, y: 2 }},
            { code: "L", relative: false, end: { x: 3, y: 1 }},
            { code: "Z" }
        ]);
    });
    it("Pac-man", function() {
        expect(parse("M0,0 l10,10 A14.142 14.142 0 1 1 10,-10 Z")).to.eql([
            { code: "M", relative: false, end: { x: 0, y: 0 }},
            { code: "l", relative: true, end: { x: 10, y: 10 }},
            {
                code: "A",
                relative: false,
                radii: { x: 14.142, y: 14.142 },
                rotation: 0,
                large: true,
                clockwise: true,
                end: { x: 10, y: -10 }
            },
            { code: "Z" }
        ]);
    });
    it("Clubs", function() {
        expect(parse("M50,90 h10 Q53,80 53,60 C80,75 90,65 90,57 90,49 80,39 53,54 68,27 58,17 50,17 42,17 32,27 47,54 c-27,-15 -37,-5 -37,3 0,8 10,18 37,3 q0,20 -7,30Z")).to.eql([
            { code: "M", relative: false, end: { x: 50, y: 90} },
            { code: "h", relative: true, value: 10 },
            {
                code: "Q",
                relative: false,
                cp: { x: 53, y: 80 },
                end: { x: 53, y: 60 }
            },
            {
                code: "C",
                relative: false,
                cp1: { x: 80, y: 75 },
                cp2: { x: 90, y: 65 },
                end: { x: 90, y: 57 }
            },
            {
                code: "C",
                relative: false,
                cp1: { x: 90, y: 49 },
                cp2: { x: 80, y: 39 },
                end: { x: 53, y: 54 }
            },
            {
                code: "C",
                relative: false,
                cp1: { x: 68, y: 27 },
                cp2: { x: 58, y: 17 },
                end: { x: 50, y: 17 }
            },
            {
                code: "C",
                relative: false,
                cp1: { x: 42, y: 17 },
                cp2: { x: 32, y: 27 },
                end: { x: 47, y: 54 }
            },
            {
                code: "c",
                relative: true,
                cp1: { x: -27, y: -15 },
                cp2: { x: -37, y: -5 },
                end: { x: -37, y: 3 }
            },
            {
                code: "c",
                relative: true,
                cp1: { x: 0, y: 8 },
                cp2: { x: 10, y: 18 },
                end: { x: 37, y: 3 }
            },
            {
                code: "q",
                relative: true,
                cp: { x: 0, y: 20 },
                end: { x: -7, y: 30 }
            },
            { code: "Z" }
        ]);
    });
});

describe("Troublesome parsing", function() {
    it("Decimal numbers", function() {
        expect(parse("M-10.5 .3")).to.eql([
            { code: "M", relative: false, end: { x: -10.5, y: 0.3 }}
        ]);
        expect(parse("M1.5.3")).to.eql([
            { code: "M", relative: false, end: { x: 1.5, y: 0.3 }}
        ]);
    });
    it("Negative numbers", function() {
        expect(parse("M5-3-1,0")).to.eql([
            { code: "M", relative: false, end: { x: 5, y: -3 }},
            { code: "L", relative: false, end: { x: -1, y: 0 }}
        ]);
    });
    it("Exponential numbers", function() {
        expect(parse("M 500e-1 1.23e+2")).to.eql([
            { code: "M", relative: false, end: { x: 50, y: 123 }}
        ]);
    });
    it("Insert ALL of the commas!", function() {
        expect(parse("A4,3,2,1,0,-1,-2,-3,-2,-1,0,1,2,3")).to.eql([
            {
                code: "A",
                relative: false,
                radii: { x: 4, y: 3 },
                rotation: 2,
                large: true,
                clockwise: false,
                end: { x: -1, y: -2 }
            },
            {
                code: "A",
                relative: false,
                radii: { x: -3, y: -2 },
                rotation: -1,
                large: false,
                clockwise: true,
                end: { x: 2, y: 3 }
            }
        ]);
    });
    it("Collapsed whitespaces", function() {
        expect(parse("M1,2 3,4 5,6Zh10")).to.eql([
            { code: "M", relative: false, end: { x: 1, y: 2 }},
            { code: "L", relative: false, end: { x: 3, y: 4 }},
            { code: "L", relative: false, end: { x: 5, y: 6 }},
            { code: "Z" },
            { code: "h", relative: true, value: 10 }
        ]);
    });
    it("Spaaaaace", function() {
        expect(parse("    M  1\t2\n3\r4   ")).to.eql([
            { code: "M", relative: false, end: { x: 1, y: 2 }},
            { code: "L", relative: false, end: { x: 3, y: 4 }}
        ]);
    });
});

});
