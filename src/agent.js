var Promise = require('bluebird');
var agent = require('superagent-promise')(require('superagent'), Promise);


module.exports = agent
