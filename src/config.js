let debug = require('debug')(__filename);
let path = require('path')
let _ = require('lodash')
let {
    $fs, $yaml
} = require('zaccaria-cli');

function readConfig(config) {
    let rulefile = path.dirname(config.file) + "/.gramchk.yml"
    return $fs.readFileAsync(rulefile).then((it) => {
        debug(`read rules: ${it}`);
        return _.assign(config, $yaml(it));
    }).catch(() => {
        return config
    })
}

function addErrors(config, errorCollection) {
    debug(errorCollection)
    errorCollection = _.take(errorCollection, config.num);
    return errorCollection
}

module.exports = {
    readConfig, addErrors
}
