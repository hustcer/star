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

const MSG = {
    INPUT_ERROR   : '输入错误，当前只支持通过股票代码查询，请检查后重新输入！',
    TOO_MANY_SYMS : '查询的股票太多，一次最多支持查询20只股票！'
}

/**
 * Check validity of input symbols, and return a valid symbols array if there is.
 * @param  {String} syms    Input symbols' string.
 * @return {Array}  Array of input symbols
 */
let getValidSymbols = function(syms){
    let symbols = syms.replace(/，/g, ',');
    let valid = /^[0-9\,]+$/.test(syms);
    if(!valid){
        console.error(MSG.INPUT_ERROR.error);
        return false;
    }
    symbols = symbols.split(',');
    if(symbols.length>conf.chunkSize){
        console.error(MSG.TOO_MANY_SYMS.error);
        return false;
    }
    return symbols;
};

/**
 * Query symbols' basic info
 * @param  {Array} syms  Symbols array to query
 * @return {Array}       Basic info array of queried symbols
 */
let querySymbols = function(syms) {
    console.log(syms);
};

/**
 * Do the query action.
 * @param  {String} syms    Input symbols' string.
 */
let doQuery = function(syms){
    Promise
        .resolve(syms)
        .then(getValidSymbols)
        .then(querySymbols);
};

exports.Query = {
    doQuery : doQuery
};
