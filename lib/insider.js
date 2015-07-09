'use strict';

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   TraceInvest.com
 * @create      07/08/2015
 * @example
 *      star -i 002065    // 查询东华软件高管交易信息
 *      star -i 300036    // 查询超图软件高管交易信息
 *      star -i 000060    // 查询中金岭南高管交易信息
 *      star -i 603993    // 查询洛阳钼业高管交易信息
 * @see
 *      深中小板高管持股变动: http://www.szse.cn/main/sme/jgxxgk/djggfbd/
 *      深创业板高管持股变动: http://www.szse.cn/main/chinext/jgxxgk/djggfbd/
 *      深圳主板高管持股变动: http://www.szse.cn/main/mainboard/jgxxgk/djggfbd/
 *      上海主板高管持股变动: http://www.sse.com.cn/disclosure/listedinfo/credibility/change/
 */

let _       = require('lodash'),
    printf  = require('printf'),
    cheerio = require('cheerio'),
    numeral = require('numeral'),
    Promise = require('bluebird'),
    cmd     = require('commander');


let start   = new Date().getTime();
let conf    = require('./conf.js').conf;
let Iconv   = require('iconv').Iconv;
let iconv   = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
let request = require('request');

numeral.language('chs', conf.numeral);
// switch between languages
numeral.language('chs');
numeral.defaultFormat(conf.fmt.common);

/**
 * 各类提示信息
 * @type {Object}
 */
const MSG = {
    INPUT_ERROR   : '输入错误，当前只支持通过单只股票代码查询，请重新输入！',
    REQUEST_ERROR : '数据请求错误，请重试！'
};

/**
 * JsonP 解析
 * @param  {String} jsonpData A jsonP response.
 * @return {Object}           The JSON Object.
 */
let parseJsonP = function(jsonpData){
    let startPos   = jsonpData.indexOf('({');
    let endPos     = jsonpData.indexOf('})');
    let jsonString = jsonpData.substring(startPos+1, endPos+1);
    return JSON.parse(jsonString);
};

/**
 * 计算董监高交易信息汇总摘要数据
 * @param  {Array} tradings  Trading array.
 * @return {Object}          Trading summary.
 */
let calcSummary = function(tradings){
    let summary = {
        buyShare   : 0,
        sellShare  : 0,
        buyPrice   : 0.00,
        sellPrice  : 0.00,
        buyCost    : 0.00,
        sellProfit : 0.00,
        netBuyShare: 0,
        netBuyCost : 0.00
    };
    _.each(tradings, t => {
        if(t.CHANGE_NUM > 0){
            summary.buyShare += t.CHANGE_NUM;
            summary.buyCost  += t.CHANGE_NUM*t.CURRENT_AVG_PRICE;
        }else{
            summary.sellShare  += Math.abs(t.CHANGE_NUM);
            summary.sellProfit += Math.abs(t.CHANGE_NUM*t.CURRENT_AVG_PRICE);
        }
    });

    summary.buyPrice    = (summary.buyShare  !== 0) ? summary.buyCost/summary.buyShare     :'N/A';
    summary.sellPrice   = (summary.sellShare !== 0) ? summary.sellProfit/summary.sellShare :'N/A';
    summary.netBuyShare = summary.buyShare - summary.sellShare;
    summary.netBuyCost  = summary.buyCost  - summary.sellProfit;

    summary.buyShare    = numeral(summary.buyShare).format();
    summary.sellShare   = numeral(summary.sellShare).format();
    summary.netBuyShare = numeral(summary.netBuyShare).format();
    summary.buyPrice    = numeral(summary.buyPrice).format(conf.fmt.money);
    summary.sellPrice   = numeral(summary.sellPrice).format(conf.fmt.money);
    summary.buyCost     = numeral(summary.buyCost).format(conf.fmt.money);
    summary.netBuyCost  = numeral(summary.netBuyCost).format(conf.fmt.money);
    summary.sellProfit  = numeral(summary.sellProfit).format(conf.fmt.money);

    return summary;
};

/**
 * Get trading data from html segment.
 * @param  {String} html Html string
 * @return {Array}      Trading records.
 */
let getTradings = function(html){
    let data = [];
    let $    = cheerio.load(html, {decodeEntities:false});
    let $td  = null;
    $('tr.cls-data-tr').each(function(idx){
        $td = $('td', this);
        data.push({
            COMPANY_CODE      : $td.eq(0).html(),
            COMPANY_ABBR      : $td.eq(1).html(),
            NAME              : $td.eq(2).html(),
            FORM_DATE         : $td.eq(3).html(),
            CHANGE_NUM        :+$td.eq(4).html(),
            CURRENT_AVG_PRICE :+$td.eq(5).html(),
            CHANGE_REASON     : $td.eq(6).html(),
            _RATIO            :+$td.eq(7).html(),
            HOLDSTOCK_NUM     :+$td.eq(8).html(),
            _INSIDER          : $td.eq(9).html(),
            DUTY              : $td.eq(10).html(),
            _RELATION         : $td.eq(11).html()
        });
    })
    return data;
};

/**
 * Query insider tradings from the specified symbol code
 * @param  {String} code Symbol code of specified company.
 */
let queryInsider = function(code) {
    if(!Number.isInteger(Number(code))){
        console.error(MSG.INPUT_ERROR);
        return false;
    }
    let market = conf.market[code.substr(0,3)];
    let option = conf.insider[market];
    option.qs[option.codeKey] = code;
    if(market === 'sz'){
        option.qs.CATALOGID = option.catalog[code.substr(0,3)];
    }
    console.log('Query insider tradings of:', code);

    request(option, function(e, r, body){
        if(e || (r && r.statusCode !== 200)){
            console.error(MSG.REQUEST_ERROR, printf(e.toString().error));
            return false;
        }
        if(market === 'sz'){
            let html     = iconv.convert(body).toString();
            let tradings = getTradings(html);
            let summary  = calcSummary(tradings);
            console.log(JSON.stringify(tradings, null, 4));
            console.log(JSON.stringify(summary, null, 4));
            return false;
        }
        let tradings = parseJsonP(body).result;
        _.each(tradings, t => {
            t.CHANGE_NUM        = +t.CHANGE_NUM;
            t.HOLDSTOCK_NUM     = +t.HOLDSTOCK_NUM;
            t.CURRENT_AVG_PRICE = +t.CURRENT_AVG_PRICE;
            return t;
        });
        let summary  = calcSummary(tradings);
        console.log(JSON.stringify(tradings, null, 4));
        console.log(JSON.stringify(summary, null, 4));
    });
}

exports.Insider = {
    queryInsider : queryInsider
};
