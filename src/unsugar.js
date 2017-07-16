/* global require, __filename */

let absolutelyAvoidTheseEnvs = [
  "title",
  "author",
  "authorrunning",
  "tocauthor",
  "email",
  "institute",
  "keywords",
  "thebibliography"
].join(",");

let debug = require("debug")(__filename);
const _ = require("lodash");
const $fs = require("mz/fs");
let exec = require("mz/child_process").exec;

function readUnsugared(config) {
  let file = config.file;
  let cb = text => {
    if (config.dump) {
      console.log(text);
    }
    return _.assign(config, {
      text: text
    });
  };
  if (!config.latex) {
    return $fs.readFile(file, "utf8").then(cb);
  } else {
    if (!config.huntex) {
      let detexOptions = _.get(config, "detexOptions", "");
      return exec(
        `detex -n -s -e ${absolutelyAvoidTheseEnvs} ${detexOptions} ${file}`,
        {
          silent: true
        }
      )
        .then(t => t[0])
        .then(cb);
    } else {
      return exec(`huntex-exe ${file}`, {
        silent: true
      })
        .then(t => t[0])
        .then(cb);
    }
  }
}

module.exports = readUnsugared;
