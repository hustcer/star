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

/* eslint no-unused-vars:0 */
let Common  = require('./common.js').Common;

const MSG = {
    INPUT_ERROR      : '输入错误，当前只支持通过证券代码查询，请检查后重新输入！',
    TOO_MANY_SYMS    : '查询的股票太多，一次最多支持查询25只股票！',
    SYMBOL_NOT_EXIST : '该股票代码不存在:'
};

// A client error like 400 Bad Request happened
let ClientError = e => {
    return e.code >= 400 && e.code < 500 || e.code === 'ENOTFOUND';
};

// Global symbol query results
let queryResults = [];
// Set current data source
let src    = (cmd.data || '').toUpperCase();
let source = (src === 'SINA' || src === 'TENCENT') ? src : conf.dataSource;
let ds     =  conf.provider[source];

/**
 * Check validity of input symbols, and return a valid symbols array if there is.
 * @param  {String} syms    Input symbols' string.
 * @return {Array}  Array of input symbols
 */
let getValidSymbols = function(syms){
    let symbols = syms.replace(/，/g, ',');
    let valid   = /^[0-9\,]+$/.test(symbols);
    if(!valid){
        console.error(MSG.INPUT_ERROR.error);
        return false;
    }
    symbols = _.trimRight(symbols, ',').split(',');
    if(symbols.length > conf.chunkSize){
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
    let query = _.map(syms, x => conf.market[x.substr(0,3)] + x).join(',');

    return request.getAsync(ds.url + query, {encoding:null}).spread(function(resp, body) {
        body = iconv.convert(body).toString();
        vm.runInThisContext(body);

        _.each(syms, function(s){
            let localVar = ds.flag + conf.market[s.substr(0,3)] + s;
            if(body.indexOf(localVar) < 0 || body.indexOf(localVar+'="";') >= 0){
                console.error(MSG.SYMBOL_NOT_EXIST.error, s.em);
                return false;
            }
            let res      = {};
            let splits   = vm.runInThisContext(ds.flag + conf.market[s.substr(0,3)] + s).split(ds.sep);
            res.name     = splits[ds.nameIdx];
            res.code     = s;
            res.open     = +splits[ds.openIdx];
            // 对于停牌股票价格以上个交易日收盘价格为准
            res.close    = +splits[ds.closeIdx];
            res.price    = +splits[ds.priceIdx] || res.close;
            res.low      = +splits[ds.lowIdx];
            res.high     = +splits[ds.highIdx];
            res.inc      = res.price - res.close;
            res.incPct   = ((res.price - res.close)/res.close) * 100;
            res.capacity = (ds.capIdx > -1)? +splits[ds.capIdx]: 0;
            res.pe       = (ds.peIdx > -1)? +splits[ds.peIdx]: 0;
            res.pb       = (ds.pbIdx > -1)? +splits[ds.pbIdx]: 0;
            queryResults.push(res);
        });

    }).catch(ClientError, function(e) {
        console.error(e);
    });
};

/**
 * Print symbol code query result
 */
let printResults = function(){
    console.log('\n', printf(ds.queryTH, '公司','代码','当前价','涨跌','涨跌%','最低','最高','开盘价',
                                         '上次收盘','总市值','P/E','P/B').underline.header);
    _.each(queryResults, function(s){
        s.name = s.name.padOutput(8, 'left');
        console.log(printf(ds.queryTD,s.name,s.code,s.price,s.inc,s.incPct,s.low,s.high,s.open,s.close,s.capacity,s.pe,s.pb));
    });
    let end = new Date().getTime();
    console.log(' '.repeat(102).underline.yellow);

    console.log(' '.repeat(15) + 'Done!'.header, '总计查询:', (queryResults.length + '').em,
                '只股票, 操作耗时:', ((end - start) + ' ms').em, ' '.repeat(18),'By TraceInvest.com\n' );
};

/**
 * Do the query action.
 * @param  {String} syms    Input symbols' string.
 */
let doQuery = function(syms){
    Promise
        .resolve(syms)
        .then(getValidSymbols)
        .then(querySymbols)
        .then(printResults);
};

exports.Query = {
    doQuery : doQuery
};
