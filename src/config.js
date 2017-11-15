/* global require, __filename */
let debug = require("debug")(__filename);
let path = require("path");
let _ = require("lodash");
let $yaml = require("js-yaml");
let { read } = require("find-config");
let { readFile } = require("mz/fs");
let $b = require("bluebird");
let debugConfig = require("debug")("grmcheck_config");

function readConfig(config) {
  debugConfig("Original config");
  debugConfig(config);
  let data;
  if (!_.isUndefined(config.file) && _.isUndefined(config.rulefile)) {
    let rulefile = _.get(config, "rulefile", "/.gramchk.yml");
    debugConfig(`Using rulefile ${rulefile}`);
    data = read(rulefile, { cwd: path.dirname(config.file) });
    debugConfig(`Read-data ${data}`);
    data = $yaml.safeLoad(data);
    debugConfig(`Interpreted-data ${data}`);
    return $b.resolve(_.assign(config, data));
  } else {
    return readFile(config.rulefile).then(data => {
      debugConfig(`Read-data ${data}`);
      data = $yaml.safeLoad(data);
      debugConfig(`Interpreted-data ${data}`);
      return $b.resolve(_.assign(config, data));
    });
  }
}

function addErrors(config, errorCollection) {
  // debug(errorCollection);
  errorCollection = _.take(errorCollection, config.num);
  return errorCollection;
}

module.exports = {
  readConfig,
  addErrors
};
