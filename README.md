
## `star`是什么?

`star`是 STock analysis and Research tool 的简称，主要用于股票追踪分析。`star`目前的主要作用是根据您所设定的股票目标价及当前价计算出相对该目标价的上涨空间，即(目标价-当前价)/当前价x100%，然后将此上涨空间按顺序排列方便您从中找到上涨空间最大的股票可以作为买入参考。`star`不提供股价预测和股票交易服务，目前只是单纯的计算，所以它的价值很大程度上取决于您所设定的目标价的有效性，目标价可以选择近期股票的最高价格或者分析师给出的价格，在大牛市里面这样的目标价还是比较容易达到的。`star`未来可能会加入更多功能，同时也欢迎大家反馈建议。

## 安装

`star`是基于`node.js`的所以先要安装`node.js`, 推荐最新版本的`node.js`，而且推荐 Mac/Linux系统，Windows下没测试过，理论上可以，如果具体使用过程中有问题也可以反馈;安装步骤如下：

1. 安装 [node.js](https://nodejs.org/), version >= 0.12;
1. 您还需要安装 `git`, 之后 clone `star`源码：`git clone git@github.com:hustcer/star.git`;
1. 安装依赖的 `node` 模块: `sudo npm install`;
1. 运行`star`: `./star.js`，第一次运行的时候需要加`-f`或`--file`参数指定股票数据文件，之后可以省略该参数;
1. 更多帮助参考: `./star.js --help`;

## 具体功能列表

- 设置股票的买入价、卖出价、目标价、星级、备注等，可以自动获取股票的当前价格并且计算距离目标价的上涨空间：(目标价-当前价)/当前价，上涨空间最大的股票通常也是最有利可图的，这也是本工具的最主要功能，方便快速决定值得买入的股票；
- 支持两个股票信息获取数据源：腾讯和新浪股票数据源，万一其中一个有问题可以通过`-d`或`--data`参数切换到另一个；
- 可以按照股票的代码、星级、当前价、当前涨幅、上涨空间、市值、PE、PB等条件进行升、降序排序，其中后三项排序只有在采用腾讯数据接口的时候才支持；
- 股票数据比较多的时候可以设置每次显示多少条数据(通过`-l`或`--limit`参数)，并且进行分页(通过`-p`或`--page`参数)；
- 可以设置是否关注、持有某股票，并根据这些条件进行过滤：可以显示所有股票(-a, --all)、只显示持有的股票(-o, --hold)、只显示不再关注的股票(-i, --ignore)；
- 可以通过`-e`或`--exclude`参数排除所有股票代码以300,600,002或者000开头的股票，多个前缀之间以','或者'，'分隔；
- 可以通过`-c`或`--contain`参数只显示所有股票代码以300,600,002或者000开头的股票，多个前缀之间以','或者'，'分隔；
- 可以通过`-f`或`--file`参数指定股票文件路径，并自动保存该路径，下次执行命令的时候不必重复输入；
- 可以通过`-g`或`--grep`参数对股票列表里的股票名、备注字段进行搜索、过滤，多个关键词之间以','或者'，'分隔；
- 还有更多功能正在酝酿之中，同时也欢迎大家广泛提建议；

## 股票数据文件

`star`的运行需要一个股票数据文件，如果未指定股票数据文件默认情况下会使用当前目录下的 `symbols.yaml` 文件。一个典型的股票数据文件格式说明如下：

```yaml
symbols:
  -
    name      : '掌趣科技'               # <字符串>公司名称
    code      : '300315'                # <字符串>股票代码，必填，不可错
    cheap     : 16                      # <数字>买点价位，在此价格附近买入有利可图
    expensive : 22                      # <数字>卖点价位，在此价格附近可以卖出获利了结
    target    : 23                      # <数字>目标价位
    star      : 3                       # <数字>股票评级，越高越值得购买，范围：1~5
    hold      : false                   # <true/false> true 表示当前持有该股票,反之不持有
    watch     : true                    # <true/false>是否关注此股票，如果 true 则关注，否则忽略
    comment   : '手游;高送转;自设PT'       # <字符串>行业/概念/题材等备注,后期可用于搜索过滤
  -
    name      : '启明星辰'
    code      : '002439'
    cheap     : 50
    expensive : 88
    target    : 78
    star      : 3
    hold      : false
    watch     : true
    comment   : '计算机;信息安全;腾讯合作;分荐'
```

## ToDo:

- [O] Timing
- [O] Add star display
- [O] Sorting symbols
- [O] Add display limit support
- [O] Support skip or watch
- [O] Up percentage calc
- [O] Chinese characters parsing
- [O] Ascending order
- [O] Show all symbols
- [O] Ignore support:show only ignored symbols
- [O] Fix large size response body bug.
- [O] Data source support
- [O] Show capacity info
- [O] Sort by Capacity
- [O] Show only held stocks
- [O] Exclude 300,600,002,003
- [O] Support page index parameter
- [O] Remove unused node modules
- [O] Stock code number contain prefix support
- [O] Add '-f --file' symbol file param support and save symbol file path automatically.
- [O] Auto market category
- [O] PE/PB
- [O] Grep keyword in comment
- Eslint check.
- Enable company name/code input as cmd param.
- Portfolio position profits calculation
- Symbol detail
- Market summay?
- Support conf.yaml
- Auto star calc
- Generate stock recommand list
- Query single symbol
- Calc buy point and sell point

