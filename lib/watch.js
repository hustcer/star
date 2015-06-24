'use strict';

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   TraceInvest.com
 * @create      06/24/2015
 */

let vm      = require('vm'),
    _       = require('lodash'),
    printf  = require('printf'),
    blessed = require('blessed'),
    Promise = require('bluebird'),
    cmd     = require('commander'),
    contrib = require('blessed-contrib');

let conf    = require('./conf.js').conf;
let Iconv   = require('iconv').Iconv;
let iconv   = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
let request = Promise.promisifyAll(require('request'));

let table   = null;
let screen  = blessed.screen({fullUnicode:true});

const MSG = {
    INPUT_ERROR   : '输入错误，当前只支持通过股票代码看盘，请检查后重新输入！',
    TOO_MANY_SYMS : '输入的股票太多，一次最多支持盯盘20只股票！'
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
    // TODO: if syms is blank get watch list symbols
    let symbols = syms.replace(/，/g, ',');
    let valid = /^[0-9\,]+$/.test(symbols);
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

let initUI = function(){
    table = contrib.table({
        keys          : true,
        fg            : 'white',
        selectedFg    : 'black',
        selectedBg    : 'cyan',
        interactive   : true,
        label         : '股票列表',
        width         : '55%',
        height        : '50%',
        border        : {type: 'line', fg: 'cyan'},
        columnSpacing : 6,
        columnWidth   : [7, 7, 7, 7, 9]
    });

    screen.key(['escape', 'q', 'C-c'], function() {
      return process.exit(0);
    });
};

/**
 * Query symbols' price info
 * @param  {Array} syms  Symbols array to query
 * @return {Array}       Basic info array of queried symbols
 */
let querySymbols = function(syms) {
    let query = _.map(syms, x => conf.market[x.substr(0,3)] + x).join(',');

    setInterval(refreshData.bind(this, syms, query), 3600);
};

let refreshData = function(syms, query){
    return request.getAsync(ds.url + query, {encoding:null}).spread(function(resp, body) {

        vm.runInThisContext(iconv.convert(body).toString());

        _.each(syms, function(s){
            let res    = {};
            let splits = vm.runInThisContext(ds.flag + conf.market[s.substr(0,3)] + s).split(ds.sep);
            res.name   = splits[ds.nameIdx];
            res.code   = s;
            // 对于停牌股票价格以上个交易日收盘价格为准
            res.close  = +splits[ds.closeIdx];
            res.price  = +splits[ds.priceIdx] || res.close;
            res.inc    = res.price - res.close;
            res.incPct = ((res.price - res.close)/res.close) * 100;
            queryResults.push(res);
        });

        updateData();
    });
};

/**
 * Update table data
 * @param  {Array} data    New table data to be updated
 */
let updateData = function(data){
    let queryData = [];
    let select    = 'four';
    const FMT = {
        three:{
            CODE    : '%7s',
            PRICE   : '%7.2f',
            INC     : '%7.2f',
            INC_PCT : '%7.2f %%'
        },
        four:{
            CODE    : '%6s',
            PRICE   : '%6.2f',
            INC     : '%6.2f',
            INC_PCT : '%6.2f %%'
        }
    };
    _.each(queryResults, function(q){
        // Fix the padding of company name with 3 characters
        if(q.name.length === 3){
            select = 'three';
            q.name = ' '.repeat(2) + q.name;
        }else{
            select = 'four';
        }
        q.code   = printf(FMT[select].CODE    , q.code);
        q.price  = printf(FMT[select].PRICE   , q.price);
        q.inc    = printf(FMT[select].INC     , q.inc);
        q.incPct = printf(FMT[select].INC_PCT , q.incPct);

        queryData.push([q.name, q.code, q.price, q.inc, q.incPct]);
    });

    // console.log(queryData);
    // return false;

    table.setData({
        headers : ['公司', '代码', '当前价', '涨跌', '涨跌%'],
        data    : queryData
    });
    table.focus();
    screen.append(table);
    screen.render();
};

/**
 * Do the query action.
 * @param  {String} syms    Input symbols' string.
 */
let doWatch = function(syms){
    initUI();
    Promise
        .resolve(syms)
        .then(getValidSymbols)
        .then(querySymbols);
};

// star -w 002625,600588,601179,600415,600816,600880,600703,000861,600410,000768,000712,600118,600893,002456,000902,000725,000002,000100
exports.Watch = {
    doWatch : doWatch
};
