'use strict';

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   TraceInvest.com
 * @create      07/08/2015
 * @example
 *      star -i 002065      // 查询东华软件高管交易信息
 *      star -i 300036      // 查询超图软件高管交易信息
 *      star -i 000060      // 查询中金岭南高管交易信息
 *      star -i 603993      // 查询洛阳钼业高管交易信息
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
let request = require('request');

const MSG = {
    INPUT_ERROR   : '输入错误，当前只支持通过单只股票代码查询，请重新输入！',
    REQUEST_ERROR : '数据请求错误，请重试！'
};

let parseJsonP = function(jsonpData){
    let startPos   = jsonpData.indexOf('({');
    let endPos     = jsonpData.indexOf('})');
    let jsonString = jsonpData.substring(startPos+1, endPos+1);
    return JSON.parse(jsonString);
};

let queryInsider = function(code) {
    if(!_.isNumber(+code)){
        console.error(MSG.INPUT_ERROR);
    }
    let market = conf.market[code.substr(0,3)];
    let option = conf.insider[market];
    option.qs[option.codeKey] = code;
    if(market === 'sz'){
        option.qs.CATALOGID = option.catalog[code.substr(0,3)];
    }
    console.log('Query insider trading of:', code, 'with query conf:', JSON.stringify(option, null, 4) );
    request(option, function(e, r, body){
        if(e || r.statusCode !== 200){
            console.error(MSG.REQUEST_ERROR);
            return false;
        }
        if(market === 'sz'){
            console.log(iconv.convert(body).toString());
            return false;
        }
        console.log(JSON.stringify(parseJsonP(body), null, 4));
    });
}

exports.Insider = {
    queryInsider : queryInsider
};
