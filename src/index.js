/* eslint quotes: [0], strict: [0] */
let {
    $d, $o, $f, $r, $fs, _, $b
    // $r.stdin() -> Promise  ;; to read from stdin
} = require('zaccaria-cli')

let langtool = require('./lib/dr_languagetool').check
let atdtool = require('./lib/dr_atd').check
let csoutput = require('./lib/checkstyle')
let debug = require('debug')(__filename);
let readUnsugared = require('./lib/unsugar');
let path = require('path');
let {
    readConfig, readConfigFile
} = require('./lib/config');

let getOptions = doc => {
    "use strict"
    let o = $d(doc)
    debug(o)
    let help = $o('-h', '--help', false, o)
    let num = $o('-h', '--num', 100, o);
    let auto = $o('-a', '--auto', false, o);
    let huntex = $o("-x", "--huntex", false, o);
    let latex = $o('-l', '--latex', false, o);
    let dump = parseInt($o('-d', '--dump', 0, o));
    let config = $o('-c', '--config', 'bogus', o)
    let test = o.test
    let file = o.FILE
    if (auto && path.extname(file) === '.tex') {
        latex = true;
    }
    return {
        help, file, num, latex, dump, huntex, config, test
    }
}

let probe = (config) => {
    console.log(config.text)
    return config
}

let main = () => {
    $f.readLocal('docs/usage.md').then(it => {
        let {
            help, file, num, latex, huntex, dump, config, test
        } = getOptions(it);
        if (help) {
            console.log(it)
        } else {
            if (!test) {
                readConfig({
                        file, latex, num, huntex, dump
                    })
                    .then(readUnsugared)
                    .then((config) => {
                        debug('launching')
                        return $b.all([langtool(config), atdtool(config)])
                    })
                    .then(([lt, atd]) => {
                        let errorCollection = lt.concat(atd)
                        return {
                            file, errorCollection
                        }
                    })
                    .then(csoutput)
            } else {
                readConfigFile(config).then((c) => {
                    return _.assign(c, {
                        text: 'this is a test',
                        test: true
                    })
                }).then((config) => {
                    return $b.all([langtool(config), atdtool(config)])
                })
            }
        }
    })
}

main()
