let agent = require('./agent')
let _ = require('lodash')
let {
    $fs, $yaml
} = require('zaccaria-cli');

let debug = require('debug')(__filename);
let path = require('path')
let {
    stripMarkdown
} = require('./strip')

let urlencode = require('urlencode');

let {
    xmlparse
} = require('./xml')


function removeSuggestions(errors, sugArray) {
    return _.filter(errors, (e) => !_.includes(sugArray, e.suggestion))
}

function processItem(i) {
    i = i.$
    let {
        fromx, fromy, tox, toy, category, msg, replacements
    } = i;
    replacements = _.take(replacements.split('#'), 5)
    let suggestion = replacements[0]
    replacements = replacements.join(' ');
    let editormessage = `${category}: ${msg} (${replacements})`
    let source = `languageTool.${i.ruleId}`;
    return {
        fromx, fromy, tox, toy, editormessage, source, suggestion
    };
}

function check(config) {
    let url = _.get(config, "languagetool.url", "http://localhost:8081");
    let disabled = _.get(config, "languagetool.disabled", [ "WHITESPACE_RULE", "COMMA_PARENTHESIS_WHITESPACE" ]);
    debug(config)
    let ignoredSuggestions = _.get(config, "languagetool.ignoredSuggestions", [ ]);
    let text = config.text
    let language = _.get(config, "language", "en-us");

    text = stripMarkdown(text)
    debug(text)
    text = urlencode(text);
    return agent.post(url).send(
        "language=" + language
    ).send(
        "text=" + text
    ).send(
        "disabled=" + disabled.join(',')
    ).end().then((res) => {
        return xmlparse(res.text)
    }).then((parsed) => {
        debug(`Ignoring suggestions ${ignoredSuggestions}`);
        let errorCollection = (_.map(parsed.matches.error, processItem));
        debug(JSON.stringify(errorCollection, 0, 4))
        errorCollection = removeSuggestions(errorCollection, ignoredSuggestions)
        errorCollection = _.take(errorCollection, config.num);
        return _.assign(config, { errorCollection });
    }).catch((err) => {
        console.log("Error " + err);
        throw err;
    })
}


module.exports = {
    check
}
