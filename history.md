
## Change History

### v0.3.9

- Update node modules: async, blessed-contrib, js-yaml, lodash and eslint.
- Update node modules: async, bluebird, moment, eslint and blessed-contrib.
- Update node modules: eslint,eslint-plugin-import,eslint-config-airbnb,js-yaml,lodash,moment and request.
- Update node modules:async,blessed-contrib,lodash,moment and request.
- Unescape html entities and collapse whitespace of fin cal by using strman.
- Update eslint and fix eslint check.
- Update node.js modules:async, eslint and eslint-plugin-import.
- Update node modules:bluebird, iconv and strman.
- Update node modules: strman, eslint, eslint-plugin-import and gulp-eslint.
- Add `sloc` counter task for gulp.
- Use numbro instead of numeral.
- Update node modules: moment, request and strman.
- Update node modules: async, eslint-plugin-import and eslint.
- Update node modules: async, lodash, numbro and request.
- Update node modules: lodash, eslint-plugin-import, eslint-config-airbnb and eslint.
- Fix eslint check issues.
- Update node modules: lodash, gulp-imagemin, eslint-plugin-import, eslint-config-airbnb and eslint.
- Update numbro, bluebird, cheerio and eslint.
- Update bluebird, lodash, moment and request.

### v0.3.8

- Update bluebird and lodash.
- Fix help content output for node.js V6+;
- Update node.js modules: async, eslint, eslint-plugin-import, gulp-imagemin and js-yaml.

### v0.3.7

- Fix SZ market insider trading query for the DOM structure has been changed.

### v0.3.6

- Add insider trading query support for quotes start with `001`.
- Fix finance calendar: remove redundant spaces, etc.
- Add quotes begin with `001` to SZ market.
- Update node modules:lodash,request and blessed-contrib.
- Fix eslint checking warnings.
- Update node modules:bluebird, js-yaml and moment.
- Update node modules:blessed-contrib,bluebird,imagemin-pngquant and lodash.
- Update node modules:cheerio,js-yaml,lodash,moment,request and bluebird.

### v0.3.5

- Fix javascript coding style.
- Update lodash to v4.0.0: change _.pluck,_.trimRight,_.trimLeft,_.padRight, etc.
- Update node modules:async, js-yaml and moment.
- Use columnify to replace printf.
- Remove grunt tasks.
- Update node modules:cheerio,js-yaml,lodash,moment,request and bluebird.
- Fix eslint check warnings.
- Update node modules:blessed-contrib,bluebird,imagemin-pngquant and lodash.
- Update node modules:bluebird, js-yaml and moment.
- Update node modules:lodash,request and blessed-contrib.
- Update node modules:lodash,async.
- Add quotes begin with `001` to SZ market.

### v0.3.3

- Update node modules:bluebird, commander, js-yaml, blessed-contrib and request.
- Add gulp building tasks.
- Update async to v1.5.0.
- Update blessed-contrib to v2.5.1.
- Update node modules:blessed-contrib,js-yaml,request.
- Use 'SystemDrive' instead of 'USERPROFILE' in `process.env` for windows users to store conf file.
- Use template string of ES6 instead of string concat, node.js v4.0.0 or greater required.
- Update node modules:async, blessed-contrib and moment.


### v0.3.2

- Add float number support for star.
- Update node.js module: js-yaml.
- Fix #41:Add filter margin symbols support.
- Update node modules:bluebird, iconv and request.

### v0.3.1

- Fix pagination bugs for insider trading query with specified security code.
- Update node module request to 2.61.0.
- Add grep from security code feature in stock trace.

### v0.3.0

- Fix Insider trading query paging bug.
- Update node.js modules:blessed@0.1.20,blessed-contrib@2.3.3,grunt-eslint@17.0.0.
- Update node.js module:lodash@3.10.1.
- Add insider trading query for none specific stocks.
- Add `--market` support while querying insider tradings:SZM-深圳主板, SZGEM-深圳创业板, SZSME-深圳中小板, SHM-上海主板.
- Add `-i --top-buy` param to query top buy value of insider tradings, time span support: 1m~12m.
- Add `-i --top-sell` param to query top sell value of insider tradings, time span support: 1m~12m.
- Add grunt task for image optimization.
- Update node.js module:async,blessed,grunt-eslint,iconv.

### v0.2.8

- Add sort by `bdiff` feature to sort stocks by `(s.price - s.cheap)/s.price`.
- Add sort by `sdiff` feature to sort stocks by `(s.price - s.expensive)/s.price`.
- Add `--remove` param to remove the symbols from result with the specified keywords in name or comment.
- Update node modules: moment to 2.10.6.

### v0.2.7

- Add `--lteb [pct]` support to query symbols that make 100*(s.price - s.cheap)/s.price <= pct.
- Add `--gtes [pct]` support to query symbols that make 100*(s.price - s.expensive)/s.price >= pct.
- Update node modules:blessed,blessed-contrib,moment,request.

### v0.2.6

- Make `star -wo` or `star -w -o` to watch held stocks.
- Use moment 'zh-cn' locale instead of const days to format dayOfWeek output in finance cal.
- Update node.js modules:async@~1.4.0,blessed@~0.1.14,blessed-contrib@~2.3.1.
- Add `--lteb` and `--gtes` support to filter the stocks whose current price is lower than buy price or greater than sell price.
- Fix bug of query none exist symbols.

### v0.2.5

- Fix Trailing comma bugs when run `star *` cmds.
- Set conf.chunkSize from 20 to 25.
- Improve console output string padding problem.
- Add support for query latest insider tradings.
- Add latest insider trading summary limit.
- Update request timeout error msg for SZ market insider trading query.


### v0.2.4

- Update blessed-contrib to v2.2.1
- Trim inline tabs of events in finance calendar.
- Update bluebird to v2.9.34.
- Add trace symbol duplication check.


### v0.2.3

- Add finance calendar feature.
- Add day of week field for finance calendar.


### v0.2.2

- Publish star to npm and cnpm.


### v0.2.0

- Update node modules: blessed@0.1.7/lodash@3.10.0/bluebird@2.9.32/grunt-eslint@16.0.0
- Add insider trading query feature.
- Add `--from`, `--to`, `--span` param for insider trading query.
- Fix no trading records output.
- Refactor star.js.
- Add multiple symbol insider trading query support.
- Add watch symbols fallback.
- Fix HOLDSTOCK_NUM NaN bug.
- Set max limit to be 20 for insider trading query.
- Update readme.md and publish star to npm registry.


### v0.1.18

- Add query symbol basic info by symbol's code feature.
- Update node modules: request and grunt-eslint.
- Add watch feature with automatic price update.
- Update blessed-contrib to v2.2.0


### v0.1.16

- Update bluebird to v2.9.30.
- Add `-L, --lte`, `-G, --gte`, `-U, --under`, `-A, --above` support, check help for more details.
- Fix page undefined bug.
- Add eslint for js linting, and fix some lint problems.
- Some code refactor.
- Fix paging limit bug.


### v0.1.2

- Add paging support.
- Remove unused node modules.
- Update node modules:bluebird,colors,lodash and grunt-eslint.
- Add Stock code number contain certain prefix support.
- Add '-f --file' symbol file param support and save symbol file path automatically.
- Remove market property for symbols
- Add P/E and P/B property for each symbol while using tencent data source.
- Grep keyword in comment support.
- Add multiple grepping keywords support.
- Add company name search support.
- Params could be separated by both ',' and '，'.
- Update node modules:iconv, printf, request and grunt-eslint.


### v0.1.0

- Fix large size response body bug.
- Add data source parameter support.
- Show capacity info when use tencent data source.
- Add sort by capacity feature.
- Add show only holded stocks feature.
- Fix percentage calculation bug of halted stocks.
- Add exclude code with prefix such as 300,600,002 and 003 etc.
- Add sort by price and code support.


### v0.0.2

- Add display limit support.
- Add watch support.
- Add display limit param from cli.
- Add up percent display and sorting support.
- Fix character encoding bugs.
- Add sort in ascending order support.
- Add show all stock support.
- Add show only ignored symbols support.


### v0.0.1

- Add stock price query and price-targetPrice percentage calc.
- Add sort by star or price-targetPrice percentage support.
- Add yaml data format support.
- Add stock counter.


