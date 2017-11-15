/* global require, module, __filename */
let agent = require("./agent");
let _ = require("lodash");

let debug = require("debug")(__filename);
let debugConfig = require("debug")("grmcheck_config");
let { stripMarkdown } = require("./strip");

let { addErrors } = require("./config");

let urlencode = require("urlencode");

let flc = require("find-line-column");

function removeSuggestions(errors, sugArray) {
  debugConfig("Removing suggestions");
  debugConfig(sugArray);
  return _.filter(errors, e => {
    debugConfig(`check ${e.suggestion} - ${JSON.stringify(e)}`);
    if (_.includes(sugArray, e.suggestion)) {
      debugConfig(`rm ${e.suggestion} - ${e}`);
      return false;
    } else {
      return true;
    }
  });
}

function processItem(i) {
  debugConfig(i);
  let { message, replacements, rule, offset } = i;
  let suggestion = "no suggestion";
  if (!_.isUndefined(replacements[0])) {
    suggestion = replacements[0].value;
  }

  let editormessage = `${rule.category.name}: ${message} (${suggestion})`;
  let source = `languageTool.${rule.id}`;
  let { line: fromy, col: fromx } = flc(this.text, offset);
  fromy = fromy - 1;
  return {
    fromx,
    fromy,
    editormessage,
    source,
    suggestion
  };
}

function check(config) {
  let url = _.get(config, "languagetool.url", "http://localhost:8081/v2/check");
  let disabled = _.get(config, "languagetool.disabledrules", [
    "WHITESPACE_RULE",
    "COMMA_PARENTHESIS_WHITESPACE"
  ]);
  debug(config);
  let ignoredSuggestions = _.get(config, "languagetool.ignoredSuggestions", []);
  let text = config.text;
  let language = _.get(config, "language", "en-us");

  text = stripMarkdown(text);
  text = urlencode(text);
  return agent
    .post(url)
    .send("language=" + language)
    .send("text=" + text)
    .send("disabledRules=" + disabled.join(","))
    .end()
    .then(res => {
      return JSON.parse(res.text);
    })
    .then(parsed => {
      debug(`Ignoring suggestions ${ignoredSuggestions}`);
      debug(`received the following data`);
      debug(parsed.matches);
      debug(config);
      let errorCollection = _.map(parsed.matches, _.bind(processItem, config));
      errorCollection = removeSuggestions(errorCollection, ignoredSuggestions);

      debug(errorCollection);
      if (config.test) {
        console.log("️✅  Language tool");
      }
      return addErrors(config, errorCollection);
    })
    .catch(err => {
      if (config.test) {
        console.log("️❌  Language tool - " + err);
      }
      debug(`Error ${err}`);
      return addErrors(config, []);
    });
}

module.exports = {
  check
};
