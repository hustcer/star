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
        let html   = iconv.convert(body).toString();
        let $      = cheerio.load(html, {decodeEntities:false});
        let $tr    = $('tr', conf.cal.selector);
        let $td    = null;
        let events = [];

        $tr.each(function(){
            $td = $('td', this);

            if($td.length !== 0){
                events.push({date : $td.eq(0).html(), event : $td.eq(1).html()});
            }
        });
        console.log(JSON.stringify(events, null, 4));

    });
}

exports.Cal = {
    showCal : showCal
};
