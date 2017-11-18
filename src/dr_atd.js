let agent = require("./agent");
let _ = require("lodash");
let { addErrors, decimateErrors } = require("./config");

let debug = require("debug")(__filename);

let urlencode = require("urlencode");

let { xmlparse } = require("./xml");

let flc = require("find-line-column");

function getIndex(text, string) {
  let pos = text.indexOf(string);
  if (pos >= 0) {
    let success = true;
    let { line: fromy, col: fromx } = flc(text, pos);
    fromy = fromy - 1;
    return {
      success,
      fromx,
      fromy
    };
  } else {
    return {
      success: false
    };
  }
}

function processItem(i) {
  let stringToBeFound = i.string[0];
  let editormessage = `${i.precontext[0]} '${stringToBeFound}': ${i
    .description[0]} --- ${i.url[0]}`;
  let { success, fromx, fromy } = getIndex(this.text, stringToBeFound);
  let source = `ATD`;
  let sulist = _.get(i, "suggestions[0].option", []);
  let suggestion = _.join(sulist, ", ");
  if (!success) {
    fromx = 0;
    fromy = 0;
    editormessage = "Problems parsing ATD response";
  }
  return {
    fromx,
    fromy,
    editormessage,
    source,
    suggestion
  };
}

function checkGrammar(url, text) {
  return agent
    .get(url + "/checkGrammar?data=" + text)
    .accept("application/xml")
    .end();
}

let defaultConfig = {
  atd: {
    url: "http://127.0.0.1:1049"
  }
};

function _check(config, text) {
  let { url } = config.atd;
  text = urlencode(text);
  return checkGrammar(url, text)
    .then(it => {
      return xmlparse(it.text);
    })
    .then(it => {
      return _.map(it.results.error, _.bind(processItem, config));
    });
}

function check(config) {
  config = _.merge({}, defaultConfig, config);
  return _check(config, config.text)
    .then(errorCollection => {
      return decimateErrors(config, errorCollection);
    })
    .catch(() => []);
}

function test(config, logger) {
  config = _.merge({}, defaultConfig, config);
  let text = "This is a test.";
  logger.debug(JSON.stringify({ atd: config.atd }, 0, 4));
  _check(config, text).then(
    () => console.log("️✅  After the deadline"),
    err => console.log("️❌  After the deadline - " + err)
  );
}

module.exports = {
  check,
  test,
  defaultConfig
};
