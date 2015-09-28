'use strict';

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   TraceInvest.com
 * @create      06/16/2015
 */
let vm      = require('vm'),
    fs      = require('fs'),
    _       = require('lodash'),
    printf  = require('printf'),
    yaml    = require('js-yaml'),
    Promise = require('bluebird'),
    cmd     = require('commander');

let start   = new Date().getTime();
let conf    = require('./conf.js').conf;
let Iconv   = require('iconv').Iconv;
let iconv   = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
let request = Promise.promisifyAll(require('request'));

let Common  = require('./common.js').Common;

/**
 * 根据条件过滤股票
 * @return {Array}          Filtered symbol list
 */
let getFilteredSymbols = function(){

    let syms    = yaml.safeLoad(fs.readFileSync(Common.getSymbolFilePath(), 'utf8')).symbols;
    let counter = _.countBy(syms, s => s.code);
    let dup     = Common.checkDup(counter);
    if(dup.dup){
        console.error(('Symbol: ' + dup.dupCode + ' is duplicate, there are ' + dup.times + ' stocks has the same code.\n').error);
        return false;
    }

    // 如果显示所有股票则不过滤掉 watch=false 的股票
    if(!cmd.all && !cmd.ignore && !cmd.hold){ syms = _.filter(syms, s => s.watch);  }
    // 只显示所有 watch=false 的股票
    if(cmd.ignore) { syms = _.filter(syms, s => !s.watch); }
    // 只显示所有 hold=true 的股票
    if(cmd.hold)   { syms = _.filter(syms, s => s.hold); }
    // 证券代码过滤排除项
    if(cmd.exclude){ syms = _.filter(syms, s => {
        let exclude = false;
        let prefixs = cmd.exclude.replace(/，/g, ',').split(',');
        _.each(prefixs, pre => {
                if(s.code.startsWith(pre)){
                    exclude = true;
                    return false;
                }
            });
        return !exclude;
    }); }
    // 证券代码过滤包含项
    if(cmd.contain){syms = _.filter(syms, s => {
        let contain = false;
        let prefixs = cmd.contain.replace(/，/g, ',').split(',');
        _.each(prefixs, pre => {
                if(s.code.startsWith(pre)){
                    contain = true;
                    return false;
                }
            });
        return contain;
    }); }
    // 证券简称、备注字段关键词过滤
    if(cmd.grep){syms = _.filter(syms, s => {
        let find = false;
        let kws  = cmd.grep.replace(/，/g, ',').split(',');
        _.each(kws, kw => {
            let reg = new RegExp(kw, 'i');
            if(reg.test(s.comment) || reg.test(s.name) || reg.test(s.code)){
                find = true;
                return false;
            }
        });
        return find;
    }); }

    // 证券简称、备注字段关键词过滤
    if(cmd.remove){syms = _.filter(syms, s => {
        let find = false;
        let kws  = cmd.remove.replace(/，/g, ',').split(',');
        _.each(kws, kw => {
            let reg = new RegExp(kw, 'i');
            if(reg.test(s.comment) || reg.test(s.name)){
                find = true;
                return true;
            }
        });
        return !find;
    }); }

    // 根据股票星级条件过滤证券代码
    if(cmd.above||cmd.above === 0){syms = _.filter(syms, s => Math.floor(s.star) >= cmd.above); }
    if(cmd.under||cmd.under === 0){syms = _.filter(syms, s => Math.floor(s.star) <= cmd.under); }

    // 过滤显示支持融资融券的股票
    if(cmd.margin){
        let rzrq = require('./rzrq.json');
        syms     = _.filter(syms, s => rzrq[s.code]);
    }

    return syms;
};

conf.limit = cmd.limit || conf.limit;

let totalSymbols;
// Set current data source
let src    = (cmd.data || '').toUpperCase();
let source = (src === 'SINA' || src === 'TENCENT') ? src : conf.dataSource;
let ds     =  conf.provider[source];

// Global symbol query results
let results = [];
// Stocks to display in current page
let page    = [];

// A client error like 400 Bad Request happened
let ClientError = e => {
    return e.code >= 400 && e.code < 500 || e.code === 'ENOTFOUND';
};

/**
 * Query symbols detail data
 * @param  {array} syms     Symbols array
 * @return {Promise}         Bluebird promise object
 */
let querySymbols = function(syms){

    let query = _.map(syms, x => conf.market[x.code.substr(0,3)] + x.code).join(',');

    return request.getAsync(ds.url + query, {encoding:null}).spread(function(resp, body) {

        vm.runInThisContext(iconv.convert(body).toString());

        _.each(syms, function(s){
            let splits = vm.runInThisContext(ds.flag + conf.market[s.code.substr(0,3)] + s.code).split(ds.sep);
            // 对于停牌股票价格以上个交易日收盘价格为准
            s.close    = +splits[ds.closeIdx];
            s.price    = +splits[ds.priceIdx] || s.close;
            s.pct      = ((s.target - s.price)/s.price) * 100;
            s.incPct   = ((s.price - s.close)/s.close) * 100;
            s.capacity = (ds.capIdx > -1)? +splits[ds.capIdx]: 0;
            s.pe       = (ds.peIdx > -1)? +splits[ds.peIdx]: 0;
            s.pb       = (ds.pbIdx > -1)? +splits[ds.pbIdx]: 0;
            s.bdiff    = 100*(s.price - s.cheap)/s.price;
            s.sdiff    = 100*(s.price - s.expensive)/s.price;
        });
        results = results.concat(syms);

    }).catch(ClientError, function(e) {
        console.error(e);
    });
};

/**
 * Print query and calc results
 */
let printResults = function(){

    // This clears the console and puts the cursor at 0,0:
    // console.log("\u001b[2J\u001b[0;0H");
    process.stdout.write("\u001b[2J\u001b[0;0H");

    // 根据上涨空间条件过滤证券代码
    if(cmd.lte||cmd.lte === 0){ results = _.filter(results, s => s.pct <= cmd.lte); }
    if(cmd.gte||cmd.gte === 0){ results = _.filter(results, s => s.pct >= cmd.gte); }

    // 筛选当前价小于等于适合买入的便宜价格的股票或者相对便宜价格涨幅小于指定百分比的股票，此处分母所以选择当前价主要为了减小因为cheap price的随意性而带来的误差
    if(cmd.lteb||cmd.lteb === 0){
        results = _.filter(results, s => {
            if(cmd.lteb === true){ return s.price <= s.cheap; }
            return cmd.lteb >= s.bdiff;
        });
    }
    // 筛选当前价大于等于适合卖出的昂贵价格的股票或者相对昂贵价格涨幅大于指定百分比的股票，此处分母所以选择当前价主要为了减小因为expensive price的随意性而带来的误差
    if(cmd.gtes||cmd.gtes === 0){
        results = _.filter(results, s => {
            if(cmd.gtes === true){ return s.price >= s.expensive; }
            return cmd.gtes <= s.sdiff;
        });
    }

    let ascending = cmd.reverse ? 1:-1;
    // Default sort by percent
    let sort      = conf.sort[cmd.sort]|| conf.defaultSort;
    // Sorting by sort field in descent order
    results       = _.sortBy(results, s => ascending*s[sort]);

    totalSymbols  = results.length;

    // Split stocks into chunks and display the page with index page
    if(!cmd.all){

        let chunks = _.chunk(results, conf.limit);
        if(!cmd.page || cmd.page < 0){
            page = chunks[0];
        }else if(cmd.page >= chunks.length){
            page = chunks[chunks.length-1];
        }else{
            page = chunks[cmd.page];
        }
    }else{
        page = results;
    }

    if(source === 'SINA'){
        console.log('\n', printf(ds.TH, '公司','代码','当前价','涨跌幅','买点','卖点','目标价','上涨空间','星级','备注').underline.header);
    }else{
        console.log('\n', printf(ds.TH, '公司','代码','当前价','涨跌幅','买点','卖点','目标价','上涨空间','总市值','P/E','P/B','星级','备注').underline.header);
    }

    _.each(page, function(s){
        s.name = s.name.padOutput(8, 'left');
        s.star = (s.star === Math.floor(s.star)) ? s.star : printf('%.4f', s.star);

        if(source === 'SINA'){
            console.log(printf(ds.TD,s.name,s.code,s.price,s.incPct,s.cheap,s.expensive,s.target,s.pct,s.star,s.comment));
        }else{
            console.log(printf(ds.TD,s.name,s.code,s.price,s.incPct,s.cheap,s.expensive,s.target,s.pct,s.capacity,s.pe,s.pb,s.star,s.comment));
        }
    });
};

/**
 * Print summary info
 */
let printSummary = function(){

    let end     = new Date().getTime();
    // 计算当前页面数据的起始序号
    let fromIdx = Math.min(Math.ceil(results.length/conf.limit)-1, cmd.page||0)*conf.limit;
    fromIdx     = fromIdx >= 0 ? fromIdx: 0;

    console.log('\n', ' '.repeat(135).underline.yellow);

    console.log(' '.repeat(35) + 'Done!'.header, '总计:', (totalSymbols + '').em,
                '只股票, 当前显示第', (fromIdx + '-' + (fromIdx + (page||[]).length)).em, '只, 操作耗时:',
                ((end - start) + ' ms').em, ' '.repeat(18),'By TraceInvest.com\n' );
};

exports.Trace = {
    getFilteredSymbols : getFilteredSymbols,
    querySymbols       : querySymbols,
    printResults       : printResults,
    printSummary       : printSummary
};


