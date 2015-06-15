#! /usr/bin/env node --harmony

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   TraceInvest.com
 * @create      05/18/2015
 */
"use strict";

let vm      = require('vm'),
    fs      = require('fs'),
    path    = require('path'),
    _       = require('lodash'),
    printf  = require('printf'),
    colors  = require('colors'),
    yaml    = require('js-yaml'),
    Promise = require('bluebird'),
    cmd     = require('commander');

let start   = new Date().getTime();
let Iconv   = require('iconv').Iconv;
let iconv   = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
let request = Promise.promisifyAll(require('request'));

const pkg   = require('./package.json');

// 腾讯股票数据接口: http://qt.gtimg.cn/q=
// 新浪股票数据接口: http://hq.sinajs.cn/list=
// 采用腾讯的数据接口会显示市值信息，采用新浪的接口不显示市值
let conf = {
    provider: {
        SINA: {
            url        : 'http://hq.sinajs.cn/list=',
            flag       : 'hq_str_',
            sep        : ',',
            priceIndex : 3,
            closeIndex : 2,
            capIndex   : -1,
            peIndex    : -1,
            pbIndex    : -1,
            // 公司、代码、当前价、涨跌幅、买点、卖点、目标价、上涨空间、星级、备注
            TH         : '%6s %5s  %6s %6s %5s %6s %6s %7s %3s   %-39s',
            TD         : '%6s %7s %8.2f %8.2f %% %8.2f %8.2f %8.2f %8.2f %% %4d     %-25s'
        },
        TENCENT: {
            url        : 'http://qt.gtimg.cn/q=',
            flag       : 'v_',
            sep        : '~',
            priceIndex : 3,
            closeIndex : 4,
            capIndex   : 45,
            peIndex    : 39,
            pbIndex    : 46,
            // 公司、代码、当前价、涨跌幅、买点、卖点、目标价、上涨空间、总市值、P/E、P/B、星级、备注
            TH         : '%6s   %2s  %5s %4s  %4s %4s %5s %5s  %4s  %5s  %6s %4s  %-33s',
            TD         : '%6s %6s %7.2f %6.2f %% %7.2f %7.2f %7.2f  %6.2f %% %8.2f  %7.2f %6.2f %3d   %-23s'
        }
    },
    market:{
        '000' : 'sz',
        '002' : 'sz',
        '200' : 'sz',
        '300' : 'sz',
        '600' : 'sh',
        '601' : 'sh',
        '603' : 'sh',
        '900' : 'sh'
    },
    // 默认股票数据文件名
    symbolFile  : 'symbols.yaml',
    // 默认配置文件名
    starConfFile: '.star.json',
    // 每次请求的股票数目
    chunkSize   : 20,
    // 当前使用数据源
    dataSource  : 'TENCENT',
    // 当前页面最多显示股票数目
    limit       : 25,
    // 排序方式按星级或者上涨空间排序
    sort        : {'star':'star', 'code':'code', 'price':'price', 'targetp':'pct', 'incp':'incPct', 'capacity':'capacity', 'pe':'pe', 'pb':'pb'},
    defaultSort : 'pct'
};

/**
 * Available colors are:
 * bold, italic, underline, inverse, yellow, cyan, white,
 * green, red, grey, blue, rainbow, zebra, random, magenta,
 */
const COLOR_THEME = {
    error  : 'red',
    info   : 'blue',
    data   : 'grey',
    header : 'blue',
    warn   : 'yellow',
    em     : 'magenta'
};

colors.setTheme(COLOR_THEME);

cmd
  .version(pkg.version)
  .option('-a, --all'          , 'display all stocks.')
  .option('-o, --hold'         , 'display all held stocks.')
  .option('-i, --ignore'       , 'display all ignored stocks.')
  .option('-r, --reverse'      , 'sort stocks in ascending order according to designated field.')
  .option('-l, --limit <n>'    , 'set total display limit of current page.', parseInt)
  .option('-p, --page  <n>'    , 'specify the page index to display.', parseInt)
  .option('-d, --data  <data>' , 'specify data provider, should be "sina" or "tencent".')
  .option('-f, --file  <file>' , 'specify symbol file path.')
  .option('-L, --lte   <pct> ' , 'filter the symbols whose upside potential is lower than or equal to the specified percentage.', parseInt)
  .option('-G, --gte   <pct> ' , 'filter the symbols whose upside potential is greater than or equal to the specified percentage.', parseInt)
  .option('-U, --under <star>' , 'filter the symbols whose star is under or equal to the specified star value.', parseInt)
  .option('-A, --above <star>' , 'filter the symbols whose star is above or equal to the specified star value.', parseInt)
  .option('-g, --grep  <kw>  ' , 'specify the keyword to grep in name or comment, multiple keywords should be separated by ",".')
  .option('-e, --exclude <pre>', 'exclude stocks whose code number begin with: 300,600,002 or 000, etc. multiple prefixs can be\n' + ' '.repeat(20) +
                                 ' used and should be separated by ",". ')
  .option('-c, --contain <pre>', 'display stocks whose code number begin with: 300,600,002 or 000, etc. multiple prefixs can be\n' + ' '.repeat(20) +
                                 ' used and should be separated by ",". ')
  .option('-s, --sort <sort>'  , 'specify sorting field, could be sorted by: code/star/price/targetp/incp/capacity/pe/pb to sort\n' + ' '.repeat(20) +
                                 ' stocks by code, star, price, price to target percent, price increase percent, capacity, pe and\n' + ' '.repeat(20) +
                                 ' pb separately. and sort by capacity/pe/pb only works while using tencent data source.')
  .parse(process.argv);

let getUserHome = function () {
    return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};

/**
 * 获取股票文件路径，路径查找规则如下：
 * 1. 如果传入股票文件路径参数则将其保存到用户目录的隐藏文件里面，下次可以重复使用不必每次都输入;
 * 2. 如果没有传入股票文件路径参数则先读取配置文件里面的路径参数，读取不到默认找 'symbols.yaml' 文件;
 * @return {String} 股票文件路径
 */
let getSymbolFilePath = function(){
    let symbolFile   = '';
    let starConf     = {};
    let starConfPath = path.join(getUserHome(), conf.starConfFile);
    let confExist    = fs.existsSync(starConfPath);

    if(cmd.file){
        symbolFile = cmd.file;
        starConf   = confExist ? require(starConfPath): {};
        starConf.symbolFile = symbolFile;
        fs.writeFile(starConfPath, JSON.stringify(starConf, null, 4), (e) => {if (e) throw e; });
        return symbolFile;
    }
    if(confExist){
        starConf   = require(starConfPath);
        symbolFile = starConf.symbolFile || conf.symbolFile;
        return symbolFile;
    }
    return conf.symbolFile;
};

/**
 * 根据条件过滤股票
 * @param  {Array} symbols  Symbol list
 * @return {Array}          Filtered symbol list
 */
let getFilteredSymbols = function(symbols){

    // 如果显示所有股票则不过滤掉 watch=false 的股票
    if(!cmd.all && !cmd.ignore && !cmd.hold){ symbols = _.filter(symbols, s => s.watch);  }
    // 只显示所有 watch=false 的股票
    if(cmd.ignore){ symbols = _.filter(symbols, s => !s.watch); }
    // 只显示所有 hold=true 的股票
    if(cmd.hold){ symbols = _.filter(symbols, s => s.hold); }
    // 股票代码过滤排除项
    if(cmd.exclude){ symbols = _.filter(symbols, s => {
        let exclude = false;
        let prefixs = cmd.exclude.replace(/，/g, ',').split(',');
        _.each(prefixs, pre => {
                if(s.code.startsWith(pre)){
                    exclude = true;
                    return false;
                }
            });
        return !exclude;
    })}
    // 股票代码过滤包含项
    if(cmd.contain){symbols = _.filter(symbols, s => {
        let contain = false;
        let prefixs = cmd.contain.replace(/，/g, ',').split(',');
        _.each(prefixs, pre => {
                if(s.code.startsWith(pre)){
                    contain = true;
                    return false;
                }
            });
        return contain;
    })}
    // 备注字段关键词过滤
    if(cmd.grep){symbols = _.filter(symbols, s => {
        let find = false;
        let kws  = cmd.grep.replace(/，/g, ',').split(',');
        _.each(kws, kw => {
            let reg = new RegExp(kw, 'i');
            if(reg.test(s.comment) || reg.test(s.name)){
                find = true;
                return false;
            }
        })
        return find;
    })}

    // 根据股票星级条件过滤股票代码
    if(cmd.above||cmd.above === 0){symbols = _.filter(symbols, s => s.star >= cmd.above);}
    if(cmd.under||cmd.under === 0){symbols = _.filter(symbols, s => s.star <= cmd.under);}

    return symbols;
};

let rawSyms = yaml.safeLoad(fs.readFileSync(getSymbolFilePath(), 'utf8')).symbols;

let symbols = getFilteredSymbols(rawSyms);

let totalSymbols = symbols.length;

conf.limit = cmd.limit || conf.limit;

// Default sort by percent
let sort   = conf.sort[cmd.sort]|| conf.defaultSort;
// Set current data source
let src    = (cmd.data || '').toUpperCase();
let source = (src === 'SINA' || src === 'TENCENT') ? src : conf.dataSource;
let ds     =  conf.provider[source];

// Global symbol query results
let results = [];
// Stocks to display in current page
let page    = [];

// A client error like 400 Bad Request happened
let ClientError = e => e.code >= 400 && e.code < 500;

/**
 * Query symbols detail data
 * @param  {array} symbols   Symbols array
 * @return {Promise}         Bluebird promise object
 */
let querySymbols = function(symbols){

    let query = _.map(symbols, x => conf.market[x.code.substr(0,3)] + x.code).join(',');

    return request.getAsync(ds.url + query, {encoding:null}).spread(function(resp, body) {

        vm.runInThisContext(iconv.convert(body).toString());

        _.each(symbols, function(s){
            let splits = eval(ds.flag + conf.market[s.code.substr(0,3)] + s.code).split(ds.sep);
            // 对于停牌股票价格以上个交易日收盘价格为准
            s.close    = +splits[ds.closeIndex];
            s.price    = +splits[ds.priceIndex] || s.close;
            s.pct      = ((s.target - s.price)/s.price) * 100;
            s.incPct   = ((s.price - s.close)/s.close) * 100;
            s.capacity = (ds.capIndex > -1)? +splits[ds.capIndex]: 0;
            s.pe       = (ds.peIndex > -1)? +splits[ds.peIndex]: 0;
            s.pb       = (ds.pbIndex > -1)? +splits[ds.pbIndex]: 0;
        });
        results = results.concat(symbols);

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

    // 根据上涨空间条件过滤股票代码
    if(cmd.lte||cmd.lte === 0){results = _.filter(results, s => s.pct <= cmd.lte);}
    if(cmd.gte||cmd.gte === 0){results = _.filter(results, s => s.pct >= cmd.gte);}

    let ascending = cmd.reverse ? 1:-1;
    // Sorting by sort field in descent order
    results = _.sortBy(results, s => ascending*s[sort]);

    totalSymbols = results.length;

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
        // Fix the padding of company name with 3 characters
        if(s.name.length === 3){ s.name = ' '.repeat(4) + s.name; }

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

    console.log('\n', ' '.repeat(135).underline.yellow);

    console.log(' '.repeat(35) + 'Done!'.header, '总计:', (totalSymbols + '').em,
                '只股票, 当前显示第', (fromIdx + '-' + (fromIdx + page.length)).em, '只, 操作耗时:',
                ((end - start) + ' ms').em, ' '.repeat(18),'By TraceInvest.com\n' );
};

let action = function() {

    let symList = _.chunk(symbols, conf.chunkSize);

    Promise
        .resolve(symList)
        .each(syms => querySymbols(syms))
        .then(()   => printResults())
        .then(()   => printSummary());
};

// Do the work!
action();


