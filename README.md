
## What's star?

## Install

- Please run it on Mac/Linux platform. Windows may not supported;
- Install [node.js](https://nodejs.org/), version >= 0.12;
- Install node modules: `sudo npm install`;
- Run it with: `./star.js`;
- For more help see: `./star.js --help`;

## 功能列表

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

