'use strict';

// 腾讯股票数据接口: http://qt.gtimg.cn/q=
// 新浪股票数据接口: http://hq.sinajs.cn/list=
// 采用腾讯的数据接口会显示市值信息，采用新浪的接口不显示市值
let conf = {
    provider: {
        SINA: {
            url      : 'http://hq.sinajs.cn/list=',
            flag     : 'hq_str_',
            sep      : ',',
            nameIdx  : 0,
            priceIdx : 3,
            openIdx  : 1,
            closeIdx : 2,
            lowIdx   : 5,
            highIdx  : 4,
            capIdx   : -1,
            peIdx    : -1,
            pbIdx    : -1,
            // 公司、代码、当前价、涨跌幅、买点、卖点、目标价、上涨空间、星级、备注
            TH       : '%6s %5s  %6s %6s %5s %6s %6s %7s %6s     %-39s',
            TD       : '%6s %7s %8.2f %8.2f %% %8.2f %8.2f %8.2f %8.2f %% %9s     %-25s',
            // 公司、代码、当前价、涨跌、涨跌%、最低、最高、开盘价、上次收盘、总市值、P/E、P/B
            queryTH  : '%6s %4s %7s %4s %5s %5s %5s %6s %5s %5s %7s %6s ',
            queryTD  : '%6s %7s %7.2f %7.2f %6.2f %% %7.2f %7.2f %7.2f %7.2f %11.2f %7.2f %6.2f'
        },
        TENCENT: {
            url      : 'http://qt.gtimg.cn/q=',
            flag     : 'v_',
            sep      : '~',
            nameIdx  : 1,
            priceIdx : 3,
            openIdx  : 5,
            closeIdx : 4,
            lowIdx   : 34,
            highIdx  : 33,
            capIdx   : 45,
            peIdx    : 39,
            pbIdx    : 46,
            // 公司、代码、当前价、涨跌幅、买点、卖点、目标价、上涨空间、总市值、P/E、P/B、星级、备注
            TH       : '%6s   %2s  %5s %4s  %4s %4s %5s %5s  %4s  %5s  %6s %6s    %-33s',
            TD       : '%6s %6s %7.2f %6.2f %% %7.2f %7.2f %7.2f  %6.2f %% %8.2f  %7.2f %6.2f %8s   %-23s',
            // 公司、代码、当前价、涨跌、涨跌%、最低、最高、开盘价、上次收盘、总市值、P/E、P/B
            queryTH  : '%6s %4s %7s %4s %5s %5s %5s %6s %5s %5s %7s %6s ',
            queryTD  : '%6s %7s %7.2f %7.2f %6.2f %% %7.2f %7.2f %7.2f %7.2f %11.2f %7.2f %6.2f'
        }
    },
    cal:{
        url      : 'http://yunvs.com/neican/calendar.html',
        timeout  : 50000,
        encoding : null,
        TH       : '%7s %7s %23s',
        selector : '#tab',
        headers  : {
            'Host' : 'yunvs.com'
        }
    },
    market:{
        '000' : 'sz',
        '002' : 'sz',
        '200' : 'sz',   // 深圳B股
        '300' : 'sz',
        '600' : 'sh',
        '601' : 'sh',
        '603' : 'sh',
        '900' : 'sh'    // 上海B股
    },
    insider: {
        'sz' : {
            url      : 'http://www.szse.cn/szseWeb/FrontController.szse',
            method   : 'POST',
            endKey   : 'txtEnd',
            beginKey : 'txtStart',
            codeKey  : 'txtDMorJC',
            span     : '12m',
            encoding : null,
            timeout  : 50000,
            selector : '#REPORTID_tab1',
            // 证券简称,代码,交易人,变动股数,均价,结存股数,填报日期,变动原因,高管姓名,关系,职务
            TH       : '%6s %5s %5s %8s %4s %6s %9s %8s %5s %4s %6s',
            TD       : '%6s %7s %5s %11s %7s %12s %13s %6s %5s %5s %6s',
            headers  : {
                'Host'    : 'www.szse.cn',
                'Origin'  : 'http://www.szse.cn'
            },
            catalog  : {
                '000' : '1801_zb',              // 深圳主板
                '002' : '1801_sme',             // 深中小企业板
                '300' : '1801_nm'               // 深创业板
            },
            qs       : {
                'ACTIONID'      : 7,
                'AJAX'          : 'AJAX-TRUE',
                'REPORT_ACTION' : 'search',
                'tab1PAGENUM'   : 1,                // 查询页码
                'txtStart'      : '',               // 变动开始日期
                'txtEnd'        : '',               // 变动截止日期
                'txtGgxm'       : '',               // 董监高姓名
                'txtDMorJC'     : '',               // 证券代码
                'TABKEY'        : 'tab1',           // 请求返回HTML片断填充的表对应ID后缀，其前缀为‘REPORTID_’，则填充到 "#REPORTID_tab1"
                'CATALOGID'     : '1801_sme'        // '1801_sme'对应中小企业板，'1801_nm'对应创业板，'1801_zb'对应深圳主板，'1801_cxda'对应所有板块
            }
        },
        'sh' : {
            url      : 'http://query.sse.com.cn/commonQuery.do',
            method   : 'GET',
            endKey   : 'END_DATE',
            beginKey : 'BEGIN_DATE',
            codeKey  : 'COMPANY_CODE',
            span     : '12m',
            json     : true,
            timeout  : 50000,
            //  证券简称,代码,交易人,变动股数,均价,结存股数,变动日期,填报日期,变动原因,职务
            TH       : '%6s %3s %7s %8s %4s %7s %9s %7s %8s %8s',
            TD       : '%6s %7s %5s %11s %8.2f %12s %12s %12s %8s %8s',
            headers  : {
                'Host'    : 'query.sse.com.cn',
                'Referer' : 'http://www.sse.com.cn/disclosure/listedinfo/credibility/change/'
            },
            qs       : {
                'jsonCallBack'       : 'jsonpCallback77077',
                'sqlId'              : 'COMMON_SSE_XXPL_CXJL_SSGSGFBDQK_S',
                'isPagination'       : false,           // 是否分页，默认true
                'COMPANY_CODE'       : '',              // 公司代码
                'NAME'               : '',              // 董监高姓名
                'BEGIN_DATE'         : '',              // 变动开始日期
                'END_DATE'           : '',              // 变动截止日期
                'pageHelp.pageSize'  : 15,              // 分页大小/每页展示的记录数目，默认15
                'pageHelp.cacheSize' : 5                // 每次查询的分页数目，默认5
            }
        },
        'traceinvest.com' : {
            insider: {
                url      : 'http://traceinvest.com/api/star',
                method   : 'GET',
                json     : true,
                timeout  : 50000,
                //  证券简称 ,代码,交易人,变动股数,均价,结存股数,变动日期,变动原因,职务
                TH       : '%6s %3s %7s %8s %4s %7s %9s %8s %8s',
                TD       : '%6s %7s %5s %11s %8.2f %12s %12s %8s %8s',
                qs       : {
                    span   : '',    // 1m~6m, 1~30d, 股票代码存在的时候可以不设查询起止时间, 股票代码不存在的时候最多可以查询最近六个月的持股变动数据
                    code   : '',    // 需要查询的股票代码，可以为空
                    page   : 1,     // 当前查询的分页，默认查询第一页
                    limit  : 20,    // 每个分页的记录数目，默认 20
                    market : '',    // 指定市场类型:SZM-深圳主板, SZGEM-深圳创业板, SZSME-深圳中小企业板, SHM-上海主板，可以为空
                    from   : '',    // 查询起始时间，可以为空
                    to     : ''     // 查询终止时间，可以为空
                }
            },
            top: {
                url      : 'http://traceinvest.com/api/star/top',
                method   : 'GET',
                json     : true,
                timeout  : 50000,
                //  证券简称, 代码, 均价, 交易股数, 交易总额
                TH       : '%7s %5s %5s %8s %10s',
                TD       : '%6s %8s %9.2f %15s %20s',
                qs       : {
                    span  : '3m',               // query time span:1m~12m
                    order : 'top_buy_value'     // 'top_buy_value' or 'top_sell_value'
                }
            }
        }
    },
    // 默认股票数据文件名
    symbolFile  : 'symbols.yaml',
    // 默认配置文件名
    starConfFile: '.star.json',
    // 每次请求的股票数目
    chunkSize   : 25,
    // 当前使用数据源
    dataSource  : 'TENCENT',
    // 当前页面最多显示股票数目
    limit       : 25,
    // 排序方式按星级或者上涨空间排序
    sort        : {
        'pe'       :'pe',
        'pb'       :'pb',
        'star'     :'star',
        'code'     :'code',
        'price'    :'price',
        'targetp'  :'pct',
        'bdiff'    :'bdiff',
        'sdiff'    :'sdiff',
        'incp'     :'incPct',
        'capacity' :'capacity'
    },
    defaultSort : 'pct'
};

// Number format for numeral
conf.numeral = {
    delimiters: {
        thousands : ',',
        decimal   : '.'
    },
    abbreviations: {
        thousand : '千',
        million  : '百万',
        billion  : '十亿',
        trillion : '兆'
    },
    ordinal: function () {
        return '.';
    },
    currency: {
        symbol: '¥'
    }
};

conf.fmt = {
    common  : '0,0',
    flot    : '0,0.00',
    money   : '$ 0,0.00',
    inDate  : 'YYYY/MM/DD',
    outDate : 'YYYY-MM-DD',
    cnDate  : 'YYYY年MM月DD日'
};

exports.conf = conf;
