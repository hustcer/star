#! /usr/bin/env node --harmony

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   TraceInvest.com
 * @create      05/18/2015
 */
"use strict";

let _       = require('lodash'),
    colors  = require('colors'),
    Promise = require('bluebird'),
    cmd     = require('commander');

const pkg   = require('./package.json');
let   conf  = require('./lib/conf.js').conf;

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
  .usage('[options]' + ' OR'.em + ' star code1,code2，code3...，codeN')
  .description('Star is a command line tool for STock Analysis and Research.')
  .option('-a, --all'          , 'display all stocks.')
  .option('-o, --hold'         , 'display all held stocks.')
  .option('-C, --cal'          , 'display finance calendar.')
  .option('-I, --ignore'       , 'display all ignored stocks.')
  .option('-i, --insider <c>'  , 'display insider trading records of specified stocks.')
  .option('-w, --watch [c1...]', 'watch specified stocks or watch all the stocks in watch list.')
  .option('-r, --reverse'      , 'sort stocks in ascending order according to designated field.')
  .option('-l, --limit <n>'    , 'set total display limit of current page.', parseInt)
  .option('-p, --page  <n>'    , 'specify the page index to display.', parseInt)
  .option('-d, --data  <data>' , 'specify data provider, should be one of "sina" or "tencent".')
  .option('-f, --file  <file>' , 'specify the symbol file path.')
  .option('--from <2014/06/01>', 'specify the beginning date of insider tradings.')
  .option('--to <2015/07/09>'  , 'specify the ending date of insider tradings.')
  .option('--span <3m>'        , 'specify the month span of insider tradings ahead of today, should be 1m~24m.')
  .option('-L, --lte   <pct> ' , 'filter the symbols whose upside potential is lower than or equal to the specified percentage.', parseInt)
  .option('-G, --gte   <pct> ' , 'filter the symbols whose upside potential is greater than or equal to the specified percentage.', parseInt)
  .option('-U, --under <star>' , 'filter the symbols whose star is under or equal to the specified star value.', parseInt)
  .option('-A, --above <star>' , 'filter the symbols whose star is above or equal to the specified star value.', parseInt)
  .option('-g, --grep  <kw>  ' , 'specify the keyword to grep in name or comment, multiple keywords should be separated by ",".')
  .option('-e, --exclude <pre>', 'exclude stocks whose code number begin with: 300,600,002 or 000, etc. multiple prefixs can be\n' + ' '.repeat(20) +
                                 ' used and should be separated by "," or "，". ')
  .option('-c, --contain <pre>', 'display stocks whose code number begin with: 300,600,002 or 000, etc. multiple prefixs can be\n' + ' '.repeat(20) +
                                 ' used and should be separated by "," or "，". ')
  .option('-s, --sort <sort>'  , 'specify sorting field, could be sorted by: code/star/price/targetp/incp/capacity/pe/pb to sort\n' + ' '.repeat(20) +
                                 ' stocks by code, star, price, price to target percent, price increase percent, capacity, PE and\n' + ' '.repeat(20) +
                                 ' PB separately. and sort by capacity/pe/pb only works while using tencent data source.')
  .parse(process.argv);

let action  = 'TRACE';

let actions = {
    'WATCH'  : function(){

        let Watch = require('./lib/watch.js').Watch;
        Watch.doWatch(cmd.watch);

    },
    'CAL' : function(){

        let Cal = require('./lib/cal.js').Cal;
        Cal.showCal();

    },
    'INSIDER': function(){

        let async   = require('async');
        let Insider = require('./lib/insider.js').Insider;
        let query   = cmd.insider.replace(/，/g, ',');
        let symbols = query.split(',');
        if(symbols.length > 20){
            console.error('The queried symbols should be no more than 20 one time.'.error);
            return false;
        }

        async.eachSeries(symbols, function(c, callback){
            Insider.queryInsider(c, callback);
        }, function(){
            console.log('ALL DONE!');
        });

    },
    'QUERY'  : function(){

        let Query = require('./lib/query.js').Query;
        Query.doQuery(cmd.args[0]);

    },
    'TRACE'  : function(){

        let Trace   = require('./lib/trace.js').Trace;
        let symbols = Trace.getFilteredSymbols();
        let symList = _.chunk(symbols, conf.chunkSize);

        Promise
            .resolve(symList)
            .each(syms => Trace.querySymbols(syms))
            .then(()   => Trace.printResults())
            .then(()   => Trace.printSummary());

    }
};

let doCmd = function() {

    if(cmd.watch)  {  action = 'WATCH';    }
    if(cmd.insider){  action = 'INSIDER';  }
    if(cmd.cal)    {  action = 'CAL';      }

    if(cmd.args.length === 1 ){

      action = 'QUERY';

    }else if (cmd.args.length > 1) {

      console.error('Input error, please try again, or run "star -h" for more help.'.error);
      return false;
    }

    actions[action]();
};

// Get the Job Done!
doCmd();


