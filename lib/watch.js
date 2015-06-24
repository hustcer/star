'use strict';

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   TraceInvest.com
 * @create      06/24/2015
 */

let vm      = require('vm'),
    _       = require('lodash'),
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
        columnWidth   : [7, 6, 7, 7, 7]
    });

    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
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

    return request.getAsync(ds.url + query, {encoding:null}).spread(function(resp, body) {

        vm.runInThisContext(iconv.convert(body).toString());

        _.each(syms, function(s){
            let res    = {};
            let splits = vm.runInThisContext(ds.flag + conf.market[s.substr(0,3)] + s).split(ds.sep);
            res.name   = splits[ds.nameIdx];
            res.code   = s;
            res.price  = +splits[ds.priceIdx] || res.close;
            res.inc    = res.price - res.close;
            res.incPct = ((res.price - res.close)/res.close) * 100;
            queryResults.push(res);
        });
    });
};

/**
 * Update table data
 * @param  {Array} data    New table data to be updated
 */
let updateData = function(data){
    table.setData({
        headers : ['公司', '代码', '当前价', '涨跌', '涨跌%'],
        data    : data
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
    var data = [
            ['中国中车', 600886, '30.00', '2.50', '3.00%'],
            ['中国建筑', 600998, '11.22', '1.20', '7.23%'],
            [' TCL集团', 600998, '11.22', '1.20', '7.23%']
        ];
    initUI();
    updateData(data);
    // Promise
    //     .resolve(syms)
    //     .then(getValidSymbols)
    //     .then(watchSymbols);
};

exports.Watch = {
    doWatch : doWatch
};
