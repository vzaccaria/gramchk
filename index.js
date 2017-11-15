#!/usr/bin/env node
/* eslint quotes: [0], strict: [0] */
/* global require, __filename */

const prog = require("caporal");
const process = require("process");
const $b = require("bluebird");
const _ = require("lodash");
let langtool = require("./src/dr_languagetool").check;
let atdtool = require("./src/dr_atd").check;
let csoutput = require("./src/checkstyle");
let debug = require("debug")(__filename);
let readUnsugared = require("./src/unsugar");
let path = require("path");
let { readConfig } = require("./src/config");

prog
  .version("1.0.0")
  .description("Checks grammar by using a host of tools")
  .command("check", "Checks <file>")
  .argument("<file>", "Top level file or directory")
  .option("--maxerr <num>", "Max <num> of errors", prog.INT, 100)
  .option(
    "--auto",
    "Determine if it is a latex file from extension",
    prog.BOOL,
    true
  )
  .option("--detex", "Use detex instead of huntex", prog.BOOL, false)
  .option("--latex", "Is it a latex file", prog.BOOL, false)
  .option("--rulefile <file>", "Use explicit rulefile")
  .action(function(args, options) {
    if (options.auto) {
      if (path.extname(args.file) === ".tex") {
        options.latex = true;
      }
    }
    if (options.latex) {
      if (options.detex) {
        options.huntex = false;
      } else {
        options.huntex = true;
      }
    }
    readConfig({
      file: args.file,
      latex: options.latex,
      num: options.maxerr,
      huntex: options.huntex,
      rulefile: options.rulefile
    })
      .then(readUnsugared)
      .then(config => {
        return $b.all([langtool(config), atdtool(config)]);
      })
      .then(([lt, atd]) => {
        let errorCollection = lt.concat(atd);
        debug(lt);
        return {
          file: args.file,
          errorCollection
        };
      })
      .then(csoutput);
  })
  .command("test", "Test if servers and commands are available")
  .action(function() {
    readConfig({})
      .then(c => {
        return _.assign(c, {
          text: "this is a test",
          test: true
        });
      })
      .then(config => {
        return $b.all([langtool(config), atdtool(config)]);
      });
  });

prog.parse(process.argv);
