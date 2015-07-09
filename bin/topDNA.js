#! /usr/bin/env node --harmony

/**
 * @author      hustcer
 * @license     MIT
 * @copyright   TraceInvest.com
 * @create      07/09/2015
 */
"use strict";

let _       = require('lodash'),
    colors  = require('colors'),
    async   = require('async'),
    cmd     = require('commander');

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
  .version('v0.0.1')
  .description('Private utils.')
  .option('-i, --insider'          , 'query insider tradings in batch mode.')
  .parse(process.argv);

let Actions = {
    'default' : function(){
        console.log('Check the usage infomation for more details.');
    },
    'insider' : function(){
        let Insider   = require('../lib/insider.js').Insider;
        let queryList = [{name:'泰亚股份', code:'002517'},
                         {name:'中科曙光', code:'603019'},
                         {name:'厦门信达', code:'000701'},
                         {name:'龙生股份', code:'002625'},
                         {name:'歌华有线', code:'600037'},
                         {name:'东华软件', code:'002065'},
                         {name:'博瑞传播', code:'600880'},
                         {name:'福能股份', code:'600483'},
                         {name:'中国西电', code:'601179'},
                         {name:'鲁信创投', code:'600783'},
                          {name:'二六三', code:'002467'},
                         {name:'中航动力', code:'600893'},
                         {name:'金固股份', code:'002488'},
                         {name:'黄河旋风', code:'600172'},
                         {name:'中色股份', code:'000758'},
                         {name:'梅花生物', code:'600873'},
                         {name:'海利生物', code:'603718'},
                         {name:'锦龙股份', code:'000712'},
                         {name:'中国卫星', code:'600118'},
                         {name:'中金岭南', code:'000060'},
                         {name:'大族激光', code:'002008'},
                         {name:'浙能电力', code:'600023'},
                         {name:'银泰资源', code:'000758'},
                         {name:'银江股份', code:'300020'},
                          {name:'欧菲光', code:'002456'},
                          {name:'唐人神', code:'002567'},
                         {name:'三安光电', code:'600703'},
                         {name:'中航飞机', code:'000768'},
                         {name:'航天信息', code:'600271'},
                         {name:'安信信托', code:'600816'},
                         {name:'恒生电子', code:'600570'},
                         {name:'中国医药', code:'600056'},
                         {name:'亚太股份', code:'002284'},
                          {name:'新洋丰', code:'000902'},
                         {name:'康美药业', code:'600518'},
                         {name:'腾邦国际', code:'300178'},
                         {name:'中国国旅', code:'601888'},
                         {name:'用友网络', code:'600588'},
                         {name:'民生银行', code:'600016'},
                         {name:'传化股份', code:'002010'}];

        async.eachSeries(queryList, function(q, callback){
            Insider.queryInsider(q.code, callback);
        }, function(){
            console.log('ALL DONE! O(∩_∩)O~');
        });
    }
}

let doAction = function(){
    let action = 'default';
    if(cmd.insider){  action = 'insider'; }
    Actions[action]();
};

doAction();
