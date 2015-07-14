'use strict';

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   TraceInvest.com
 * @create      07/13/2015
 */

let _       = require('lodash'),
    printf  = require('printf'),
    cheerio = require('cheerio');

let start   = new Date().getTime();
let conf    = require('./conf.js').conf;
let Iconv   = require('iconv').Iconv;
let iconv   = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
let request = require('request');

let showCal = function(){

    return request(conf.cal, function(e, r, body) {
        if(e || (r && r.statusCode !== 200)){
            console.error('Request error, Please try again later. Error info:',
                           printf(JSON.stringify(e||r, null, 4)).error);
            return false;
        }

        let html   = iconv.convert(body).toString();
        let $      = cheerio.load(html, {decodeEntities:false});
        let $tr    = $('tr', conf.cal.selector);
        let $td    = null;

        console.log(('\n中国股市未来30日题材前瞻' + ' '.repeat(60)).em.underline);
        console.log((printf(conf.cal.TH, '日期', '事件') + ' '.repeat(38)).underline);

        $tr.each(function(){
            $td = $('td', this);

            if($td.length !== 0){
                console.log(' '.repeat(3), _.trim($td.eq(0).html()),
                            ' '.repeat(5), _.trim($td.eq(1).html()));
            }
        });

        let end      = new Date().getTime();
        console.log(' '.repeat(80).underline.yellow);
        console.log(' '.repeat(20) + 'Done!'.header, '操作耗时:', ((end - start) + ' ms').em,
                    ' '.repeat(15),'By TraceInvest.com\n' );
    });
};

exports.Cal = {
    showCal : showCal
};
