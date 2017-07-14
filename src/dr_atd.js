let agent = require("./agent");
let _ = require("lodash");
let {
  addErrors
} = require("./config");

let debug = require("debug")(__filename);
let path = require("path");

let urlencode = require("urlencode");

let {
  xmlparse
} = require("./xml");

let uid = require("uid");
let flc = require("find-line-column");

function getIndex(text, string) {
  let pos = text.indexOf(string);
  if (pos >= 0) {
    let success = true;
    let {
      line: fromy,
      col: fromx
    } = flc(text, pos);
    fromy = fromy - 1;
    fromx = fromx;
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
  debug(i);
  let stringToBeFound = i.string[0];
  let editormessage = `${stringToBeFound}: ${i.description[0]}`;
  let {
    success,
    fromx,
    fromy
  } = getIndex(this.text, stringToBeFound);
  let source = `ATD`;
  let suggestion = `No suggestions`;
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
  debug(config);
  let url = _.get(config, "atd.url", "http://127.0.0.1:1049");
  let text = urlencode(config.text);
  return checkGrammar(url, text)
    .then(it => {
      return xmlparse(it.text);
    })
    .then(it => {
      let errorCollection = _.map(it.results.error, processItem, config);
      debug(errorCollection);
      if (config.test) {
        console.log("️✅  After the deadline");
      }
      return addErrors(config, errorCollection);
    })
    .catch(it => {
      if (config.test) {
        console.log("️❌  After the deadline - " + it);
      }
    });
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
