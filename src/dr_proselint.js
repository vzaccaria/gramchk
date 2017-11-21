/* global require, module, __filename */
let _ = require("lodash");

let debug = require("debug")(__filename);
let debugConfig = require("debug")("grmcheck_config");

let { addErrors } = require("./config");
let { execWithString } = require("./common.js");

function process(config) {
  let text = config.text;
  return execWithString(c => `proselint ${c} -j`, text, {})
    .then(d => JSON.parse(d))
    .then(
      data => {
        debug(data);
        let suggestions = data.data.errors;
        let errorCollection = _.map(suggestions, _.bind(processItem, config));
        return addErrors(config, errorCollection);
      },
      () => []
    );
}

function processItem(i) {
  debugConfig(i);
  let { message, line, column } = i;
  let reason = message;
  let editormessage = `${message}`;
  let source = `Proselint`;
  let fromy = line;
  let fromx = column;
  fromy = fromy - 1;
  let o = {
    fromx,
    fromy,
    editormessage,
    source,
    reason
  };
  debug(o);
  return o;
}

function check(config) {
  return process(config);
}

module.exports = {
  check
};
