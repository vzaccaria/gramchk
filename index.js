#!/usr/bin/env node
/* eslint quotes: [0], strict: [0] */
"use strict";

var _require = require("zaccaria-cli");

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;
var $r = _require.$r;
var $fs = _require.$fs;
var _
// $r.stdin() -> Promise  ;; to read from stdin
= _require._;

var langtool = require("./lib/dr_languagetool").check;
var csoutput = require("./lib/checkstyle");
var readUnsugared = require("./lib/unsugar");
var path = require("path");
var readConfig = require("./lib/config");

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

        if (help) {
            console.log(it);
        } else {
            readConfig({
                file: file, latex: latex, num: num, huntex: huntex
            }).then(readUnsugared).then(langtool).then(csoutput);
        }
    });
};

main();
