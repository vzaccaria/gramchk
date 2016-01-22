let $b = require('bluebird')
let xmlparse = $b.promisify(require('xml2js').parseString)

module.exports = { xmlparse }
