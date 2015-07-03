'use strict';

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   TraceInvest.com
 * @create      07/03/2015
 */

let _       = require('lodash'),
    printf  = require('printf'),
    cheerio = require('cheerio'),
    Promise = require('bluebird');

let conf    = require('./conf.js').conf;
let Iconv   = require('iconv').Iconv;
let iconv   = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
let request = Promise.promisifyAll(require('request'));

let showCal = function(){

    return request.getAsync(conf.cal.url, {encoding:null}).spread(function(resp, body) {

        console.log(iconv.convert(body).toString());

    });
}

exports.Cal = {
    showCal : showCal
};
