/* global require, module, __filename */
let agent = require("./agent");
let _ = require("lodash");

let debug = require("debug")(__filename);

let { decimateErrors } = require("./config");

let urlencode = require("urlencode");

let flc = require("find-line-column");

function removeSuggestions(errors, sugArray) {
  return _.filter(errors, e => {
    if (_.includes(sugArray, e.suggestion)) {
      return false;
    } else {
      return true;
    }
  });
}

function processItem(i) {
  let { message, replacements, rule, offset } = i;
  let suggestion = "?";
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

let defaultConfig = {
  languagetool: {
    url: "http://localhost:8081/v2/check",
    disabledRules: ["WHITESPACE_RULE", "COMMA_PARENTHESIS_WHITESPACE"],
    ignoredSuggestions: [],
    language: "en-us"
  }
};

function _check(_config, text) {
  let {
    url,
    disabledRules,
    ignoredSuggestions,
    language
  } = _config.languagetool;
  text = urlencode(text);
  return agent
    .post(url)
    .send("language=" + language)
    .send("text=" + text)
    .send("disabledRules=" + disabledRules.join(","))
    .end()
    .then(res => {
      return JSON.parse(res.text);
    })
    .then(parsed => {
      debug(`Ignoring suggestions ${ignoredSuggestions}`);
      debug(`received the following data`);
      debug(parsed.matches);
      return _.map(parsed.matches, _.bind(processItem, _config));
    });
}

function test(config, logger) {
  config = _.merge({}, defaultConfig, config);
  let text = "This is a test.";
  logger.debug(JSON.stringify({ languagetool: config.languagetool }, 0, 4));
  _check(config, text).then(
    () => console.log("️✅  Language tool"),
    err => console.log("️❌  Language tool - " + err)
  );
}

function check(config) {
  config = _.merge({}, defaultConfig, config);
  return _check(config, config.text)
    .then(errorCollection => {
      return decimateErrors(
        config,
        removeSuggestions(
          errorCollection,
          config.languagetool.ignoredSuggestions
        )
      );
    })
    .catch(() => []);
}

module.exports = {
  check,
  test,
  defaultConfig
};
