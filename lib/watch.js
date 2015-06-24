'use strict';

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   TraceInvest.com
 * @create      06/24/2015
 */

let vm      = require('vm'),
    _       = require('lodash'),
    Promise = require('bluebird'),
    cmd     = require('commander');

let conf    = require('./conf.js').conf;
let Iconv   = require('iconv').Iconv;
let iconv   = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
let request = Promise.promisifyAll(require('request'));

let watchStocks = function(){
    let blessed = require('blessed'),
        contrib = require('blessed-contrib'),
        screen  = blessed.screen({fullUnicode:true});

    let table = contrib.table({
        keys          : true,
        fg            : 'white',
        selectedFg    : 'white',
        selectedBg    : 'blue',
        interactive   : true,
        label         : '股票列表',
        width         : '90%',
        height        : '50%',
        border        : {type: 'line', fg: 'cyan'},
        columnSpacing : 10,
        columnWidth   : [16, 12, 12]
    })

    table.focus();
    screen.append(table);

    table.setData({
        headers : ['名称', '当前价', '涨跌幅'],
        data    : [
            ['中国中车', 30, '3.00%'],
            ['中国建筑', 20, '7.23%']
        ]
    });

    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });

    screen.render();
};

/**
 * Do the query action.
 * @param  {String} syms    Input symbols' string.
 */
let doWatch = function(syms){
    watchStocks();
    // Promise
    //     .resolve(syms)
    //     .then(getValidSymbols)
    //     .then(watchSymbols);
};

exports.Watch = {
    doWatch : doWatch
};
