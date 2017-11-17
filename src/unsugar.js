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
let vfile = require("to-vfile");
let unified = require("unified");
let parse = require("remark-parse");
let remark2retext = require("remark-retext");
const Promise = require("bluebird");
let stringify = require("retext-stringify");

let returnAsText = (config, text) => {
  if (config.dump) {
    console.log(text);
  }
  return _.assign(config, {
    text: text
  });
};

let readUnsugaredMarkdown = (config, file) => {
  let processor = unified()
    .use(parse)
    .use(remark2retext);

  return new Promise((resolve, reject) => {
    file = new vfile(file);
    let tree = processor.parse(file);
    processor.runSync(tree, file);
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
  rtex_p.then(t => t[0]).then(_.curry(returnAsText)(config));
};

function readUnsugared(config) {
  let file = config.file;
  if (!config.latex) {
    return readUnsugaredMarkdown(config, file).then(
      _.curry(returnAsText)(config)
    );
  } else {
    return readUnsugaredTex(config, file);
  }
}

module.exports = readUnsugared;
