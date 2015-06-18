'use strict';

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   TraceInvest.com
 * @create      06/18/2015
 */

let vm      = require('vm'),
    _       = require('lodash'),
    printf  = require('printf'),
    Promise = require('bluebird'),
    cmd     = require('commander');

let start   = new Date().getTime();
let conf    = require('./conf.js').conf;
let Iconv   = require('iconv').Iconv;
let iconv   = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
let request = Promise.promisifyAll(require('request'));

let querySymbols = function(syms) {

    console.log(syms);

}

exports.Query = {
    querySymbols : querySymbols
};
