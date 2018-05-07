#!/usr/bin/env node
/* eslint quotes: [0], strict: [0] */
/* global require, __filename */

const prog = require("caporal");
const process = require("process");
const $b = require("bluebird");
const _ = require("lodash");
let langtool = require("./src/dr_languagetool");
let atdtool = require("./src/dr_atd");
let writegoodtool = require("./src/dr_writegood");
let proselinttool = require("./src/dr_proselint");
let csoutput = require("./src/checkstyle");
let debug = require("debug")(__filename);
let readUnsugared = require("./src/unsugar");
let path = require("path");
let { readConfig } = require("./src/config");
let $yaml = require("js-yaml");

prog
  .version("1.0.0")
  .description("Checks grammar by using a host of tools")
  .command("check", "Checks <file>")
  .argument("<file>", "Top level file or directory")
  .option("--maxerr <num>", "Max <num> of errors", prog.INT, 100)
  .option("--detex", "Use detex instead of huntex", prog.BOOL, false)
  .option("--configfile <file>", "Use config file")
  .option("--dump", "Dump unsugared and exit", prog.BOOL, false)
  .action(function(args, options) {
    if (path.extname(args.file) === ".tex") {
      options.latex = true;
    } else {
      options.latex = false;
    }
    if (options.latex) {
      if (options.detex) {
        options.huntex = false;
      } else {
        options.huntex = true;
      }
    }
    options.file = args.file;
    readConfig(options)
      .then(readUnsugared)
      .then(config => {
        return $b.all([
          langtool.check(config),
          atdtool.check(config),
          writegoodtool.check(config),
          proselinttool.check(config)
        ]);
      })
      .then(res => {
        let errorCollection = _.flattenDeep(res);
        return {
          file: args.file,
          errorCollection
        };
      })
      .then(csoutput);
  })
  .command("test", "Test if servers and commands are available")
  .option("--configfile <file>", "Use config file")
  .action(function(args, options, logger) {
    readConfig(options).then(c => {
      return $b.all([
        langtool.test(c, logger),
        atdtool.test(c, logger),
        writegoodtool.test(c, logger),
        proselinttool.test(c, logger)
      ]);
    });
  })
  .command("dumpconfig", "Dumps default config")
  .action(function() {
    console.log(
      $yaml.dump(_.merge({}, langtool.defaultConfig, atdtool.defaultConfig))
    );
  });

prog.parse(process.argv);
