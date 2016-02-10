#!/usr/bin/env node
"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

/* eslint quotes: [0], strict: [0] */

var _require = require("zaccaria-cli");

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;
var $r = _require.$r;
var $fs = _require.$fs;
var _ = _require._;
var $b
// $r.stdin() -> Promise  ;; to read from stdin
= _require.$b;

var langtool = require("./lib/dr_languagetool").check;
var atdtool = require("./lib/dr_atd").check;
var csoutput = require("./lib/checkstyle");
var debug = require("debug")(__filename);
var readUnsugared = require("./lib/unsugar");
var path = require("path");

var _require2 = require("./lib/config");

var readConfig = _require2.readConfig;

var getOptions = function (doc) {
    "use strict";
    var o = $d(doc);
    var help = $o("-h", "--help", false, o);
    var num = $o("-h", "--num", 100, o);
    var auto = $o("-a", "--auto", false, o);
    var huntex = $o("-x", "--huntex", false, o);
    var latex = $o("-l", "--latex", false, o);
    var dump = parseInt($o("-d", "--dump", 0, o));
    var file = o.FILE;
    if (auto && path.extname(file) === ".tex") {
        latex = true;
    }
    return {
        help: help, file: file, num: num, latex: latex, dump: dump, huntex: huntex
    };
};

var probe = function (config) {
    console.log(config.text);
    return config;
};

var main = function () {
    $f.readLocal("docs/usage.md").then(function (it) {
        var _getOptions = getOptions(it);

        var help = _getOptions.help;
        var file = _getOptions.file;
        var num = _getOptions.num;
        var latex = _getOptions.latex;
        var huntex = _getOptions.huntex;
        var dump = _getOptions.dump;

        if (help) {
            console.log(it);
        } else {
            readConfig({
                file: file, latex: latex, num: num, huntex: huntex, dump: dump
            }).then(readUnsugared).then(function (config) {
                debug("launching");
                return $b.all([langtool(config), atdtool(config)]);
            }).then(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2);

                var lt = _ref2[0];
                var atd = _ref2[1];

                var errorCollection = lt.concat(atd);
                return { file: file, errorCollection: errorCollection };
            }).then(csoutput);
        }
    });
};

main();
