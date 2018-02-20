'use strict';

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   uzfin.com
 * @create      07/13/2015
 */

let _         = require('lodash'),
    strman    = require('strman'),
    cheerio   = require('cheerio'),
    columnify = require('columnify');

let start   = new Date().getTime();
let conf    = require('./conf').conf;
let request = require('request');


let showCal = function showCal(){

    return request(conf.cal, (e, r, body) => {
        if(e || (r && r.statusCode !== 200)){
            /* eslint no-unused-expressions:0 */
            console.error('Request error, Please try again later. Error info:',
                           JSON.stringify(e||r, null, 4)).error;
            return false;
        }

        let html   = body.toString();
        let $      = cheerio.load(html, { decodeEntities:false });
        let $rows  = $('li', conf.cal.selector);
        let $date  = null,
            evt    = null,
            date   = null,
            evts   = [];

        let headers = { date:'日期', evt:'事件' };
        let option  = {
            minWidth         : 5,
            columnSplitter   : '   ',
            headingTransform : h => headers[h].em.underline,
        };

        console.log((`\n中国股市未来30日题材前瞻${' '.repeat(60)}\n`).em.underline);

        $rows.each(function stripEvts(){
            $date = $('.body-date', this);

            if($date.length){
                date   = _.trim($date.html());
                evt    = strman.collapseWhitespace($('.event-relative-container', this).text());
                evt    = strman.htmlDecode(evt).replace(/当日复牌/g, '当日复牌:');
                evts.push({ date, evt:_.trimStart(_.trim(evt), ', ') });
            }
        });
        console.log(columnify(evts, option));

        let end = new Date().getTime();
        console.log(' '.repeat(80).underline.yellow);
        console.log(' '.repeat(20) + 'Done!'.header, '操作耗时:', (`${end - start} ms`).em,
                    ' '.repeat(15),'By uzfin.com\n' );
        return false;
    });
};

exports.Cal = {
    showCal,
};
