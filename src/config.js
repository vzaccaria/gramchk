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
  let data;
  if (!_.isUndefined(config.file) && _.isUndefined(config.configfile)) {
    let configfile = "/.gramchk.yml";
    data = read(configfile, { cwd: path.dirname(config.file) });
    data = $yaml.safeLoad(data);
    return $b.resolve(_.assign(config, data));
  } else {
    if (!_.isUndefined(config.configfile)) {
      return readFile(config.configfile).then(data => {
        data = $yaml.safeLoad(data);
        return $b.resolve(_.assign(config, data));
      });
    } else {
      return $b.resolve(config);
    }
  }
}

function decimateErrors(config, errorCollection) {
  // debug(errorCollection);
  errorCollection = _.take(errorCollection, config.maxerr);
  return errorCollection;
}

function addErrors(config, errorCollection) {
  // debug(errorCollection);
  errorCollection = _.take(errorCollection, config.maxerr);
  return errorCollection;
}

module.exports = {
  readConfig,
  addErrors,
  decimateErrors
};
