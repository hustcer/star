'use strict';

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   TraceInvest.com
 * @create      07/08/2015
 * @see
 *      深中小板高管持股变动: http://www.szse.cn/main/sme/jgxxgk/djggfbd/
 *      深创业板高管持股变动: http://www.szse.cn/main/chinext/jgxxgk/djggfbd/
 *      深圳主板高管持股变动: http://www.szse.cn/main/mainboard/jgxxgk/djggfbd/
 *      上海主板高管持股变动: http://www.sse.com.cn/disclosure/listedinfo/credibility/change/
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

let queryInsider = function(code) {
    console.log('Query insider trading of:', code);
}

exports.Insider = {
    queryInsider : queryInsider
};
