let agent = require("./agent");
let _ = require("lodash");
let { addErrors } = require("./config");

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

function check(config) {
  let disabled = _.get(config, "atd.disabled", false);
  if (!disabled) {
    let url = _.get(config, "atd.url", "http://127.0.0.1:1049");
    let text = urlencode(config.text);
    return checkGrammar(url, text)
      .then(it => {
        return xmlparse(it.text);
      })
      .then(it => {
        let errorCollection = _.map(
          it.results.error,
          _.bind(processItem, config)
        );
        debug(errorCollection);
        if (config.test) {
          console.log("️✅  After the deadline");
        }
        return addErrors(config, errorCollection);
      })
      .catch(it => {
        if (config.test) {
          console.log("️❌  After the deadline - " + it);
        } else {
          debug(it);
        }
      });
  } else {
    return [];
  }
}

function testIt() {
  check({
    text: "this has been done"
  });
}

module.exports = {
  check,
  testIt
};
