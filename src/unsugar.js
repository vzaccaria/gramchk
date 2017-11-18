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
let Promise = require("bluebird");
let { stripMarkdown } = require("./strip");

let returnAsText = (config, text) => {
  if (config.dump) {
    console.log(text);
    process.exit(0);
  }
  return _.assign(config, {
    text: text
  });
};

let readUnsugaredMarkdown = (config, file) => {
  return $fs.readFile(file, "utf8").then(text => {
    return new Promise(resolve => {
      text = stripMarkdown(text);
      resolve(text);
    });
  });
};

let readUnsugaredTex = (config, file) => {
  let rtex_p;
  if (!config.huntex) {
    let detexOptions = _.get(config, "detexOptions", "");
    rtex_p = exec(
      `detex -n -s -e ${absolutelyAvoidTheseEnvs} ${detexOptions} ${file}`,
      {
        silent: true
      }
    );
  } else {
    rtex_p = exec(`huntex-exe ${file}`, {
      silent: true
    });
  }
  return rtex_p.then(
    t => {
      debug(t);
      return t[0];
    },
    t => debug(t)
  );
};

function readUnsugared(config) {
  let file = config.file;
  let unsugared_p;
  if (!config.latex) {
    unsugared_p = readUnsugaredMarkdown(config, file);
  } else {
    unsugared_p = readUnsugaredTex(config, file);
  }
  return unsugared_p.then(_.curry(returnAsText)(config));
}

module.exports = readUnsugared;
