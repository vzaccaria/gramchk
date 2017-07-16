let _ = require("lodash");
let debug = require("debug")(__filename);

function removeLinks(text) {
  return text.replace(/\[.*?\]\(.*\)/g, function(whole) {
    return "";
  });
}

function nLines(text) {
  return text.split(/\r\n|\r|\n/).length;
}

function removeFenced(text) {
  let r = /`{3}(?:(.*$)\n)?([\s\S]*)`{3}/gm;
  text.replace(r, function(whole) {
    return _.map(_.range(1, nLines(whole)), () => "\n").join("");
  });
  return text;
}

function stripMarkdown(text) {
  debug(text);
  text = removeLinks(text);
  text = removeFenced(text);
  return text;
}

module.exports = { stripMarkdown };
