/* global require, module, __filename */
let agent = require("./agent");
let _ = require("lodash");

let debug = require("debug")(__filename);
let { stripMarkdown } = require("./strip");

let { addErrors } = require("./config");

let urlencode = require("urlencode");

let flc = require("find-line-column");

function removeSuggestions(errors, sugArray) {
  return _.filter(errors, e => !_.includes(sugArray, e.suggestion));
}

function processItem(i) {
  let { message, replacements, rule, offset } = i;
  let suggestion = replacements[0].value;
  let editormessage = `${rule.category.name}: ${message} (${suggestion})`;
  let source = `languageTool.${rule.id}`;
  let { line: fromx, col: fromy } = flc(this.text, offset);
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
  let disabled = _.get(config, "languagetool.disabled", [
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
      return addErrors(config, []);
    });
}

module.exports = {
  check
};
