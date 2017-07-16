/* global require, __filename */
let debug = require("debug")(__filename);
let path = require("path");
let _ = require("lodash");
let $yaml = require("js-yaml");
let { read } = require("find-config");
let $b = require("bluebird");

function readConfig(config) {
  let rulefile = _.get(config, "rulefile", "/.gramchk.yml");
  let data;
  if (!_.isUndefined(config.file)) {
    data = read(rulefile, { cwd: path.dirname(config.file) });
  } else {
    data = read(rulefile);
  }
  data = $yaml.safeLoad(data);
  return $b.resolve(_.assign(config, data));
}

function addErrors(config, errorCollection) {
  debug(errorCollection);
  errorCollection = _.take(errorCollection, config.num);
  return errorCollection;
}

module.exports = {
  readConfig,
  addErrors
};
