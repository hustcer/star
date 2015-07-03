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
            TH       : '%6s %5s  %6s %6s %5s %6s %6s %7s %3s   %-39s',
            TD       : '%6s %7s %8.2f %8.2f %% %8.2f %8.2f %8.2f %8.2f %% %4d     %-25s',
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
            TH       : '%6s   %2s  %5s %4s  %4s %4s %5s %5s  %4s  %5s  %6s %4s  %-33s',
            TD       : '%6s %6s %7.2f %6.2f %% %7.2f %7.2f %7.2f  %6.2f %% %8.2f  %7.2f %6.2f %3d   %-23s',
            // 公司、代码、当前价、涨跌、涨跌%、最低、最高、开盘价、上次收盘、总市值、P/E、P/B
            queryTH  : '%6s %4s %7s %4s %5s %5s %5s %6s %5s %5s %7s %6s ',
            queryTD  : '%6s %7s %7.2f %7.2f %6.2f %% %7.2f %7.2f %7.2f %7.2f %11.2f %7.2f %6.2f'
        }
    },
    cal:{
        url      : 'http://yunvs.com/neican/calendar.html',
        TH       : '%9s %27s %9s',
        TD       : '%9s %27s %9s',
        selector : '#tab'
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

exports.conf = conf;
