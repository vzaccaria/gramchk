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

let { addErrors } = require('./config');

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
        fromx, fromy, category, msg, replacements
    } = i;
    replacements = _.take(replacements.split('#'), 5)
    let suggestion = replacements[0]
    replacements = replacements.join(' ');
    let editormessage = `${category}: ${msg} (${replacements})`
    let source = `languageTool.${i.ruleId}`;
    return {
        fromx, fromy, editormessage, source, suggestion
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
        debug(`received the following data`);
        debug(parsed.matches.error);
        let errorCollection = (_.map(parsed.matches.error, processItem));
        debug(JSON.stringify(errorCollection, 0, 4))
        errorCollection = removeSuggestions(errorCollection, ignoredSuggestions)

        if(config.test) {
            console.log("️✅  Language tool")
        }
        return addErrors(config, errorCollection);
    }).catch((err) => {
        if(config.test) {
            console.log("️❌  Language tool - "+err)
        }
        return addErrors(config, []);
    })
}


module.exports = {
    check
}
