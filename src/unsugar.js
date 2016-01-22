let {
    $s, $fs, _
} = require('zaccaria-cli')

let absolutelyAvoidTheseEnvs = [
    "title",
    "author",
    "authorrunning",
    "tocauthor",
    "email",
    "institute",
    "keywords",
    "thebibliography"
].join(",");

let debug = require('debug')(__filename);

function readUnsugared(config) {
    let file = config.file
    let cb = (text) => {
        debug(text)
        return _.assign(config, {
            text
        })
    }
    if (!config.latex) {
        return $fs.readFileAsync(file, 'utf8').then(cb)
    } else {
        if (!config.huntex) {
            let detexOptions = _.get(config, "detexOptions", "");
            return $s.execAsync(`detex -n -s -e ${absolutelyAvoidTheseEnvs} ${detexOptions} ${file}`, {
                silent: true
            }).then(cb)
        } else {
            return $s.execAsync(`huntex-exe ${file}`, {
                silent: true
            }).then(cb);

        }
    }
}

module.exports = readUnsugared
