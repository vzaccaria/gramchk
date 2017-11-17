/* global require, module, __filename */
let _ = require("lodash");

let debug = require("debug")(__filename);
let debugConfig = require("debug")("grmcheck_config");

let { addErrors } = require("./config");

let writegood = require("write-good");
let alex = require("alex");

let flc = require("find-line-column");
function processAlex(config) {
  let options = _.get(config, "alex.allow", undefined);
  let text = config.text;
  let suggestions = alex(text, options).messages;

  let errorCollection = _.map(suggestions, _.bind(processItemAlex, config));
  return addErrors(config, errorCollection);
}

function processItemAlex(i) {
  debugConfig(i);
  let { reason, line, column } = i;
  let editormessage = `${reason}`;
  let source = `Alex`;
  let col = column;
  line = line - 1;
  let fromx = col;
  let fromy = line;
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

function processWriteGood(config) {
  let options = _.get(config, "writegood", {});
  let text = config.text;
  let suggestions = writegood(text, options);

  let errorCollection = _.map(suggestions, _.bind(processItemWG, config));
  return addErrors(config, errorCollection);
}

function processItemWG(i) {
  debugConfig(i);
  let { reason, index } = i;
  let editormessage = `${reason}`;
  let source = `Writegood`;
  let { line: fromy, col: fromx } = flc(this.text, index);
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
  return [processWriteGood(config), processAlex(config)];
}

module.exports = {
  check
};
