'use strict';

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   uzfin.com
 * @create      07/08/2015
 * @example
 *      star -i 002065    // 查询东华软件高管交易信息
 *      star -i 300036    // 查询超图软件高管交易信息
 *      star -i 000060    // 查询中金岭南高管交易信息
 *      star -i 603993    // 查询洛阳钼业高管交易信息
 *      star -i 000768,002456,600118,601777,300036,000902 --span 3m
 * @see
 *      深中小板高管持股变动: http://www.szse.cn/main/sme/jgxxgk/djggfbd/
 *      深创业板高管持股变动: http://www.szse.cn/main/chinext/jgxxgk/djggfbd/
 *      深圳主板高管持股变动: http://www.szse.cn/main/mainboard/jgxxgk/djggfbd/
 *      深圳所有板块持股变动: http://www.szse.cn/main/disclosure/jgxxgk/djggfbd/
 *      上海主板高管持股变动: http://www.sse.com.cn/disclosure/listedinfo/credibility/change/
 */

let vm        = require('vm'),
    async     = require('async'),
    _         = require('lodash'),
    moment    = require('moment'),
    numbro    = require('numbro'),
    cheerio   = require('cheerio'),
    Promise   = require('bluebird'),
    cmd       = require('commander'),
    columnify = require('columnify');

/* eslint no-useless-escape:0 */
let start   = new Date().getTime();
let conf    = require('./conf').conf;
let Iconv   = require('iconv').Iconv;
let iconv   = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
let request = require('request');
let Common  = require('./common').Common;

let from = null;
let to   = null;
let ft   = conf.fmt;

numbro.culture('zh-CN', conf.numbro);
// switch between languages
numbro.culture('zh-CN');
numbro.zeroFormat('N/A');
numbro.defaultFormat(ft.common);

/**
 * 各类提示信息
 * @type {Object}
 */
const MSG = {
    NO_TRADING      : '在当前时间范围内无董监高交易记录！',
    PARAM_ERROR     : '参数输入错误，请检查后重试！',
    INPUT_ERROR     : '输入错误，当前只支持通过单只证券代码查询，请重新输入！',
    REQUEST_ERROR   : '数据请求错误，请重试！错误信息：\n',
    SYSTEM_BUSY     : '系统正忙，请稍后再试!\n',
    SHOW_DETAIL_TIP : '  具体交易记录省略，可通过 "--show-detail" 参数查看详情...',
};

const MISC_QUERY_KEY = 'uzfin.com';

/**
 * 计算董监高交易信息汇总摘要数据
 * @param  {Array} tradings  Trading array.
 * @param {Boolean} format   Set true to format output.
 * @return {Object}          Trading summary.
 */
let calcSummary = function calcSummary(tradings, format){
    if(tradings.length === 0){ return null; }

    let summary = {
        buyShare   : 0,
        sellShare  : 0,
        buyPrice   : 0,
        sellPrice  : 0,
        buyCost    : 0,
        sellProfit : 0,
        netBuyShare: 0,
        netBuyCost : 0,
    };
    _.each(tradings, t => {
        if(t.CHANGE_NUM > 0){
            summary.buyShare += t.CHANGE_NUM;
            summary.buyCost  += t.CHANGE_NUM*t.CURRENT_AVG_PRICE;
        } else{
            summary.sellShare  += Math.abs(t.CHANGE_NUM);
            summary.sellProfit += Math.abs(t.CHANGE_NUM*t.CURRENT_AVG_PRICE);
        }
    });

    summary.buyPrice    = (summary.buyShare  !== 0) ? summary.buyCost/summary.buyShare     :'N/A';
    summary.sellPrice   = (summary.sellShare !== 0) ? summary.sellProfit/summary.sellShare :'N/A';
    summary.netBuyShare = summary.buyShare - summary.sellShare;
    summary.netBuyCost  = summary.buyCost  - summary.sellProfit;

    if(!format) { return summary; }

    summary.buyShare    = numbro(summary.buyShare).format();
    summary.sellShare   = numbro(summary.sellShare).format();
    summary.netBuyShare = numbro(summary.netBuyShare).format();
    summary.buyPrice    = numbro(summary.buyPrice).format(ft.flot);
    summary.sellPrice   = numbro(summary.sellPrice).format(ft.flot);
    summary.buyCost     = numbro(summary.buyCost).format(ft.money);
    summary.netBuyCost  = numbro(summary.netBuyCost).format(ft.money);
    summary.sellProfit  = numbro(summary.sellProfit).format(ft.money);

    return summary;
};

/**
 * 计算非单一证券董监高持股变动信息汇总摘要数据
 * @param  {Array} tradings  Trading array.
 * @return {Object}          Trading summary.
 */
let calcMiscSummary = function calcMiscSummary(tradings){
    let summary      = {};
    let summaries    = [];
    let tradingGroup = _.groupBy(tradings, s => `${s.COMPANY_CODE} - ${s.COMPANY_ABBR}`);
    // console.log(JSON.stringify(tradings, null, 4));

    _.forOwn(tradingGroup, (v, k) => {
        summary[k] = calcSummary(v, false);
    });

    _.forOwn(summary, (v, k) => {
        v.company = k;
        summaries.push(v);
    });

    summaries = _.sortBy(summaries, n => -n.netBuyCost);

    _.each(summaries, s => {
        s.buyShare    = numbro(s.buyShare).format();
        s.sellShare   = numbro(s.sellShare).format();
        s.netBuyShare = numbro(s.netBuyShare).format();
        s.buyPrice    = numbro(s.buyPrice).format(ft.flot);
        s.sellPrice   = numbro(s.sellPrice).format(ft.flot);
        s.buyCost     = numbro(s.buyCost).format(ft.money);
        s.netBuyCost  = numbro(s.netBuyCost).format(ft.money);
        s.sellProfit  = numbro(s.sellProfit).format(ft.money);
    });
    return summaries;
};

/**
 * Display misc insider trading summary
 * @param  {Object} summary  Trading summary
 */
let displayMiscSummary = function displayMiscSummary(summary){
    // console.log(JSON.stringify(summary, null, 4));
    console.log((`\n董监高近期交易信息汇总, 从: ${from}, 到: ${to} ${' '.repeat(50)}\n`).em.underline);

    summary = cmd.limit > 0 ? _.take(summary, cmd.limit) : summary;

    _.each(summary, s => {
        console.log('  净增持股数：', _.padEnd(s.netBuyShare, 18),
                    '净增持额：', _.padEnd(s.netBuyCost, 18),
                    '公    司：'.em, s.company.em);
        console.log('  总增持股数：', _.padEnd(s.buyShare, 18),
                    '增持均价：', _.padEnd(s.buyPrice, 18),
                    '总增持额：', s.buyCost);
        console.log('  总减持股数：', _.padEnd(s.sellShare, 18),
                    '减持均价：', _.padEnd(s.sellPrice, 18),
                    '总减持额：', s.sellProfit);
        console.log((' '.repeat(93)).gray.underline);
    });

    if(cmd.showDetail){
        console.log(`\n交易详情:${' '.repeat(110)}`.header.underline);
    }
};

/**
 * Get total trading count of sz market from html segment.
 * @param  {String} html Html string
 * @return {Object}      Promise of total trading count.
 */
let getSzPagingInfo = function getSzPagingInfo(html){

    let $    = cheerio.load(html, { decodeEntities:false });
    let text = _.trim($('td[colspan="12"]',this).text());
    if(text === MSG.NO_DATA_FROM_SZ){ return { totalPg: 0, totalCount: 0 }; }

    let nextFn = $('input.cls-navigate-next', this).attr('onclick')||'';
    let prevFn = $('input.cls-navigate-prev', this).attr('onclick')||'';
    if(!nextFn && !prevFn) { return { totalPg:1, totalCount: $('tr.cls-data-tr', this).length }; }

    // gotoReportPageNo('1801_nm','tab1',2,584,11670)
    global.gotoReportPageNo = (mkt, id, nIdx, totalPg, totalCount) => ({totalPg, totalCount});

    let pgInfo = vm.runInThisContext(nextFn||prevFn);

    return pgInfo;
};

/**
 * Get SZ market trading data from html segment.
 * @param  {String} html Html string
 * @return {Array}      Trading records.
 */
let getTradings = function getTradings(html){
    let data = [];
    let $    = cheerio.load(html, { decodeEntities:false });
    let $td  = null;
    $('tr[bgcolor]', '#REPORTID_tab1').each(function stripData(){
        $td = $('td', this);
        data.push({
            COMPANY_CODE      : $td.eq(0).html(),
            COMPANY_ABBR      : $td.eq(1).html(),
            NAME              : $td.eq(2).html(),
            CHANGE_DATE       : $td.eq(3).html(),
            CHANGE_NUM        :+$td.eq(4).html(),
            CURRENT_AVG_PRICE :+$td.eq(5).html(),
            CHANGE_REASON     : $td.eq(6).html(),
            _RATIO            :+$td.eq(7).html(),
            HOLDSTOCK_NUM     :+$td.eq(8).html(),
            _INSIDER          : $td.eq(9).html(),
            DUTY              : $td.eq(10).html(),
            _RELATION         : $td.eq(11).html(),
        });
    });
    return data;
};

/**
 * Display ShenZhen market insider trading records.
 * @param {String} market     Market type should be 'sz' or 'sh'
 * @param  {Array} tradings   Insider trading records array
 */
let displayTradings = function displayTradings(market, tradings){
    let headers = {
        COMPANY_ABBR:'证券简称', COMPANY_CODE:'代码', NAME:'交易人',
        CHANGE_NUM:'变动股数', CURRENT_AVG_PRICE:'均价', HOLDSTOCK_NUM:'结存股数',
        CHANGE_DATE:'变动日期', FORM_DATE: '填报日期', CHANGE_REASON:'变动原因',
        _INSIDER:'高管姓名', _RELATION:'关系', DUTY:'职务',
    };
    let option  = {
        align            : 'right',
        config           : { NAME:{ maxWidth:15 },_INSIDER:{ maxWidth:15 } },
        columnSplitter   : '  ',
        headingTransform : h => headers[h].em.underline,
    };

    if(market === 'sz'){
        let data = [];
        _.each(tradings, t => {
            t.COMPANY_ABBR  = t.COMPANY_ABBR.replace(/ /g, '');
            t.CHANGE_NUM    = numbro(t.CHANGE_NUM).format();
            t.HOLDSTOCK_NUM = _.isNaN(t.HOLDSTOCK_NUM)? '-' : numbro(t.HOLDSTOCK_NUM).format();
            t.CHANGE_DATE   = t.CHANGE_DATE.replace(/\-/g, '/');
            t.CURRENT_AVG_PRICE = t.CURRENT_AVG_PRICE.toFixed(2);
            data.push(_.pick(t, _.keys(headers)));
        });
        console.log(columnify(data, option));
        return false;

    } else if(market === 'sh'){
        let data = [];
        _.each(tradings, t => {
            t.COMPANY_ABBR  = t.COMPANY_ABBR.replace(/ /g, '');
            t.NAME          = t.NAME.replace(/ /g, '');
            t.CHANGE_NUM    = numbro(t.CHANGE_NUM).format();
            t.HOLDSTOCK_NUM = numbro(t.HOLDSTOCK_NUM).format();
            t.CHANGE_DATE   = t.CHANGE_DATE.replace(/\-/g, '/');
            t.FORM_DATE     = t.FORM_DATE.replace(/\-/g, '/');
            t.CURRENT_AVG_PRICE = t.CURRENT_AVG_PRICE.toFixed(2);
            data.push(_.pick(t, _.keys(headers)));
        });
        console.log(columnify(data, option));
        return false;
    }

    let data = [];
    _.each(tradings, t => {
        t.COMPANY_ABBR  = t.COMPANY_ABBR.replace(/ /g, '');
        t.NAME          = t.NAME.replace(/ /g, '');
        t.CHANGE_NUM    = numbro(t.CHANGE_NUM).format();
        t.HOLDSTOCK_NUM = numbro(t.HOLDSTOCK_NUM).format();
        t.CHANGE_DATE   = moment(new Date(t.CHANGE_DATE)).format(ft.inDate);
        t.CURRENT_AVG_PRICE = t.CURRENT_AVG_PRICE.toFixed(2);
        data.push(_.pick(t, _.keys(headers)));
    });
    console.log(columnify(data, option));

};

/**
 * Display insider trading details of specified symbol code
 * @param  {String} code     symbol code
 * @param  {Object} summary  Trading summary
 * @param  {Array} tradings  Trading records
 */
let displayDetail = function displayDetail(code, summary, tradings){
    // console.log(JSON.stringify(summary, null, 4));
    // console.log(JSON.stringify(tradings, null, 4));
    if(from && to){
        console.log(`\n董监高近期交易信息，证券代码：${code}, 从: ${from}, 到: ${to}${' '.repeat(50)}`.em.underline);
    } else{
        console.log(`\n董监高近期交易信息，证券代码：${code}${' '.repeat(80)}`.em.underline);
    }
    if(!summary){
        console.log(MSG.NO_TRADING.info);
        return false;
    }
    console.log('净增持股数：', _.padEnd(summary.netBuyShare, 18),
                '净增持额：', _.padEnd(summary.netBuyCost, 20));
    console.log('总增持股数：', _.padEnd(summary.buyShare, 18),
                '增持均价：', _.padEnd(summary.buyPrice, 20),
                '总增持额：', summary.buyCost);
    console.log('总减持股数：', _.padEnd(summary.sellShare, 18),
                '减持均价：', _.padEnd(summary.sellPrice, 20),
                '总减持额：', summary.sellProfit);

    console.log(`\n交易详情:${' '.repeat(109)}`.header.underline);

    let market = conf.market[code.substr(0,3)];
    displayTradings(market, tradings);
};

/**
 * Get query option from code and cmd input
 * @param  {String} code Symbol code
 * @return {Object}      Query option
 */
let getQueryOption = function getQueryOption(code){

    let market = conf.market[code.substr(0,3)];
    let option = conf.insider[market];
    let spanM  = cmd.span || option.span;
    option.qs[option.codeKey] = code;
    if(market === 'sz'){
        option.qs.CATALOGID   = option.catalog[code.substr(0,3)];
        option.qs.tab1PAGENUM = cmd.page || 1;
    }
    if(spanM){
        let span = _.parseInt(spanM);
        span = span > 24 ? 24: span;
        span = span < 1 ?   1: span;
        option.qs[option.endKey]   = moment().format(ft.outDate);
        option.qs[option.beginKey] = moment().subtract(span, 'month').format(ft.outDate);
    }
    if(cmd.from){
        if(moment(cmd.from, ft.inDate).isValid()){
            option.qs[option.beginKey] = moment(cmd.from, ft.inDate).format(ft.outDate);
        } else{
            console.error(MSG.PARAM_ERROR.em);
            return false;
        }
    }
    if(cmd.to){
        if(moment(cmd.to, ft.inDate).isValid()){
            option.qs[option.endKey] = moment(cmd.to, ft.inDate).format(ft.outDate);
        } else{
            console.error(MSG.PARAM_ERROR.em);
            return false;
        }
    }
    from = moment(option.qs[option.beginKey]).format(ft.inDate);
    to   = moment(option.qs[option.endKey]).format(ft.inDate);
    // console.log(JSON.stringify(option.qs, null, 4));
    return option;
};

/**
 * Get query latest insider trading option
 * @param  {Function} callback Callback
 */
let getQueryLatestOption = function getQueryLatestOption(callback){
    let option = conf.insider;
    let spanD  = cmd.span || '10d';
    option.sz.qs.CATALOGID = '1801_cxda';

    let span = _.parseInt(spanD);
    span = span > 60 ?  60: span;
    span = span < 1  ?  1 : span;
    to   = moment().format(ft.outDate);
    from = moment().subtract(span, 'day').format(ft.outDate);
    option.sh.qs[option.sh.endKey]   = to;
    option.sh.qs[option.sh.beginKey] = from;
    option.sz.qs[option.sz.endKey]   = to;
    option.sz.qs[option.sz.beginKey] = from;

    callback(null, option);
};

/**
 * Get option of query misc stocks' insider tradings
 * @return {Object} Query option
 */
let getQueryMiscOption = function getQueryMiscOption(){
    let option = conf.insider[MISC_QUERY_KEY].insider;
    option.qs  = _.extend(option.qs, _.pick(cmd, 'page', 'limit', 'from', 'to', 'span'));
    if(!cmd.from && !cmd.to && !cmd.span){ option.qs.span = '3m'; }      // Default timespan will be 3 months
    option.qs.code   = cmd.code   ? cmd.code.replace(/，/g, ',') : '';
    option.qs.market = cmd.market ? cmd.market.replace(/，/g, ',') : '';

    // console.log(JSON.stringify(option, null, 4));
    return option;
};

/**
 * Query insider tradings from the specified symbol code
 * @param {String}      code    Symbol code of specified company.
 * @param {Function}    cb      Callback function
 */
let queryInsider = function queryInsider(code, cb) {
    if(!Number.isInteger(Number(code))){
        console.error(MSG.INPUT_ERROR);
        return false;
    }
    let market = conf.market[code.substr(0,3)];
    let option = getQueryOption(code);
    let pgInfo = {}, idx;

    request(option, (e, r, body) => {
        let tradings = [];
        if(e || (r && r.statusCode !== 200)){
            if(r && r.statusCode === 408){
                console.error(MSG.SYSTEM_BUSY.error);
                console.error(JSON.stringify({ statusCode: r.statusCode, headers: r.request.headers }, null, 4).error);
                return false;
            }
            console.error(MSG.REQUEST_ERROR, JSON.stringify(e||r, null, 4).error);
            return false;
        }
        if(market === 'sz'){
            let html = iconv.convert(body).toString();
            tradings = getTradings(html);
            pgInfo   = getSzPagingInfo(html);
            idx      = (option.qs.tab1PAGENUM - 1) * 20 + 1;

        } else{
            tradings   = Common.parseJsonP(body).result;
            _.each(tradings, t => {
                t.CHANGE_NUM        = +t.CHANGE_NUM;
                t.HOLDSTOCK_NUM     = +t.HOLDSTOCK_NUM;
                // t.CURRENT_AVG_PRICE could be null, check symbol code: 600056 frome 2006/06/01
                t.CURRENT_AVG_PRICE = +t.CURRENT_AVG_PRICE || 0;
                return t;
            });
        }

        let summary  = calcSummary(tradings, true);
        displayDetail(code, summary, tradings);

        let end = new Date().getTime();
        console.log(' '.repeat(118).underline.yellow);

        if(market === 'sz'){
            console.log(' '.repeat(35), 'Done!'.header, '耗时:', `${end - start} ms`.em, ', 总记录：',
                        `${pgInfo.totalCount}`.em, ', 当前:', `${idx}-${idx+tradings.length-1}`.em,
                        ', 页码:', `${option.qs.tab1PAGENUM} / ${pgInfo.totalPg}`.em, ' '.repeat(9), 'By uzfin.com\n' );
        } else{
            console.log(' '.repeat(35), 'Done!'.header, '耗时:', `${end - start} ms`.em, ', 总记录：',
                        `${tradings.length}`.em, ' '.repeat(15), 'By uzfin.com\n' );
        }

        if(_.isFunction(cb)){ cb(); }
    });
};


/**
 * Query latest insider tradings of ShangHai market
 * @param  {Object}   option   Query option
 * @param  {Function} callback Callback after query finish
 */
let querySH = function querySH(option, callback){
    request(option.sh, (e, r, body) => {
        let tradings = [];
        if(e || (r && r.statusCode !== 200)){
            console.error(MSG.REQUEST_ERROR, JSON.stringify(e||r, null, 4).error);
            callback(e||r, option);
            return false;
        }

        tradings   = Common.parseJsonP(body).result;
        _.each(tradings, t => {
            t.CHANGE_NUM        = +t.CHANGE_NUM;
            t.HOLDSTOCK_NUM     = +t.HOLDSTOCK_NUM;
            // t.CURRENT_AVG_PRICE could be null, check symbol code: 600056 frome 2006/06/01
            t.CURRENT_AVG_PRICE = +t.CURRENT_AVG_PRICE || 0;
            return t;
        });
        let summary = calcMiscSummary(tradings);
        displayMiscSummary(summary);

        if(cmd.showDetail){
            displayTradings('sh', tradings);
        } else{
            console.log(MSG.SHOW_DETAIL_TIP.em);
        }

        let end      = new Date().getTime();
        console.log(' '.repeat(118).underline.yellow);

        console.log(' '.repeat(35), 'Done!'.header, '耗时:', `${end - start} ms`.em, ', 总记录：',
                    `${tradings.length}`.em, ' '.repeat(15), 'By uzfin.com\n' );

        callback(null, option);
    });
};

/**
 * Query latest insider tradings of ShenZhen market
 * @param  {Object}   option   Query option
 * @param  {Function} callback Callback after query finish
 */
let querySZ = function querySZ(option, callback){
    option.sz.qs.tab1PAGENUM = cmd.page ? cmd.page : 1;
    request(option.sz, (e, r, body) => {
        let tradings = [];
        if(e || (r && r.statusCode !== 200)){
            if(r && r.statusCode === 408){
                console.error(MSG.SYSTEM_BUSY.error);
                console.error(JSON.stringify({ statusCode: r.statusCode, headers: r.request.headers }, null, 4).error);
                callback(e||r);
                return false;
            }
            console.error(MSG.REQUEST_ERROR, JSON.stringify(e||r, null, 4).error);
            callback(e||r);
            return false;
        }
        let html    = iconv.convert(body).toString();
        let pgInfo  = getSzPagingInfo(html);
        tradings    = getTradings(html);
        let summary = calcMiscSummary(tradings);
        displayMiscSummary(summary);

        if(cmd.showDetail){
            displayTradings('sz', tradings);
        } else{
            console.log(MSG.SHOW_DETAIL_TIP.em);
        }

        let end  = new Date().getTime();
        let idx  = (option.sz.qs.tab1PAGENUM - 1) * 20 + 1;
        console.log(' '.repeat(118).underline.yellow);

        console.log(' '.repeat(25), 'Done!'.header, '耗时:', `${end - start} ms`.em, ', 总记录：',
                    `${pgInfo.totalCount}`.em, '当前:', `${idx}-${idx+tradings.length-1}`.em, '页码:',
                    `${option.sz.qs.tab1PAGENUM} / ${pgInfo.totalPg}`.em, ' '.repeat(8), 'By uzfin.com\n' );
        callback(null);
    });
};

/**
 * Query misc stocks' insider trading records in async way
 * @param  {Object} option Query option
 * @return {Promise}        A promise object
 */
let queryMiscInsiderAsync = function queryMiscInsiderAsync(option){
    request = Promise.promisify(request, {multiArgs:true});

    return request(option)
        .spread((resp, res) => {

            let tradings = res.data;
            let summary  = calcMiscSummary(tradings);
            to   = res.condition.endDate || moment().format(ft.inDate);
            from = res.condition.beginDate;
            displayMiscSummary(summary);

            if(cmd.showDetail){
                displayTradings(null, tradings);
            } else{
                console.log(MSG.SHOW_DETAIL_TIP.em);
            }

            let end = new Date().getTime();
            console.log(' '.repeat(108).underline.yellow);

            let idx = (option.qs.page-1)*option.qs.limit + 1;

            console.log(' '.repeat(18), 'Done!'.header, '耗时:', `${end - start} ms`.em, ', 总记录：',
                        `${res.total}`.em, '当前:', `${idx}-${idx+tradings.length-1}`.em, '页码:',
                        `${option.qs.page} / ${Math.ceil(res.total/option.qs.limit)}`.em,
                        ' '.repeat(6), 'By uzfin.com\n' );

            return tradings;
        });
};

/**
 * Query latest insider tradings of ShangHai market
 */
let querySHLatest = function querySHLatest(){

    async.waterfall([getQueryLatestOption, querySH], err => {
        if(!err) { console.log('SH Query Done!'); }
    });
};

/**
 * Query latest insider tradings of ShenZhen market
 */
let querySZLatest = function querySZLatest(){

    async.waterfall([getQueryLatestOption, querySZ], err => {
        if(!err) { console.log('SZ Query Done!'); }
    });
};

/**
 * Query misc stocks' insider trading records
 */
let queryMiscInsider = function queryMiscInsider(){
    return Promise
        .resolve()
        .then(getQueryMiscOption)
        .then(queryMiscInsiderAsync)
        .then(() => { console.log('\n'); })     // Just a placeholder here.
        .catch((e) => {
            if(e.code === 'ETIMEDOUT' || e.code === 'ESOCKETTIMEDOUT'){
                console.error(MSG.SYSTEM_BUSY.error);
                return false;
            }
            console.error('Error occurred:', e);
        });
};

/**
 * Query top buy/sell value of insider tradings
 * @param {String} type Query type: BV--BuyValue,SV--SellValue
 * @return {Promise} A promise object of top trading list
 */
let queryTopAsync = function queryTopAsync(type){
    const QUERY_TYPE = {
        BV: 'top_buy_value',
        SV: 'top_sell_value',
    };
    let spanM       = cmd.span || '3m';
    let option      = conf.insider[MISC_QUERY_KEY].top;
    option.qs.span  = spanM;
    option.qs.order = QUERY_TYPE[type];

    request = Promise.promisify(request, {multiArgs:true});

    return request(option)
        .spread((resp, res) => {

            let tradings = res.data;
            to   = moment().format(ft.inDate);
            from = moment().subtract(_.parseInt(res.condition.span), 'months').format(ft.inDate);
            option.qs.span = res.condition.span;

            return { data: tradings, option };
        });
};

/**
 * Display top buy/sell list of insider tradings
 * @param  {Object} topData  Trading list
 */
let displayTopList = function displayTopList(topData){

    let data    = [];
    let headers = {
        COMPANY_ABBR:'公司简称', COMPANY_CODE:'证券代码', meanPrice:'交易均价',
        amount:'交易股数', totalValue:'交易总额',
    };
    let option  = {
        align            : 'right',
        columnSplitter   : '   ',
        headingTransform : h => headers[h].em.underline,
    };

    console.log((`\n董监高近期交易排行榜, 从: ${from}, 到: ${to} ${' '.repeat(33)} \n`).em.underline);

    _.each(topData.data, t => {
        t.COMPANY_ABBR = t.COMPANY_ABBR.replace(/ /g, '');
        t.amount       = numbro(t.amount).format();
        t.meanPrice    = numbro(t.meanPrice).format(ft.money);
        t.totalValue   = numbro(t.totalValue).format(ft.money);
        data.push(_.pick(t, _.keys(headers)));
    });
    console.log(columnify(data, option));
    console.log((' '.repeat(85)).header.underline);
    return topData;
};

/**
 * Query and display top buy/sell value of insider tradings
 * @param {String} type Query type: BV--BuyValue,SV--SellValue
 */
let queryTopList = function queryTopList(type){
    return Promise
        .resolve(type)
        .then(queryTopAsync)
        .then(displayTopList)
        .then((top) => {
            let end = new Date();

            console.log(' '.repeat(16) + 'Done!'.header, '耗时:', `${end - start} ms,`.em, '最近',
                        `${_.parseInt(top.option.qs.span)}`.em, '月', (type === 'BV')?'买入总额前':'卖出总额前',
                        `${top.data.length}`.em, ' '.repeat(3), 'By uzfin.com\n' );
        })
        .catch((e) => {
            if(e.code === 'ETIMEDOUT' || e.code === 'ESOCKETTIMEDOUT'){
                console.error(MSG.SYSTEM_BUSY.error);
                return false;
            }
            console.error('Error occurred:', e, e.stack);
        });
};

exports.Insider = {
    queryInsider,
    queryTopList,
    querySZLatest,
    querySHLatest,
    queryMiscInsider,
};
