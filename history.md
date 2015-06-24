
## Change History

### v0.0.1

- Add stock price query and price-targetPrice percentage calc.
- Add sort by star or price-targetPrice percentage support.
- Add yaml data format support.
- Add stock counter.

### v0.0.2

- Add display limit support.
- Add watch support.
- Add display limit param from cli.
- Add up percent display and sorting support.
- Fix character encoding bugs.
- Add sort in ascending order support.
- Add show all stock support.
- Add show only ignored symbols support.

### v0.1.0

- Fix large size response body bug.
- Add data source parameter support.
- Show capacity info when use tencent data source.
- Add sort by capacity feature.
- Add show only holded stocks feature.
- Fix percentage calculation bug of halted stocks.
- Add exclude code with prefix such as 300,600,002 and 003 etc.
- Add sort by price and code support.

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

### v0.1.16

- Update bluebird to v2.9.30.
- Add `-L, --lte`, `-G, --gte`, `-U, --under`, `-A, --above` support, check help for more details.
- Fix page undefined bug.
- Add eslint for js linting, and fix some lint problems.
- Some code refactor.
- Fix paging limit bug.

### v0.1.18

- Add query symbol basic info by symbol's code feature.
- Update node modules: request and grunt-eslint.
- Add watch feature with automatic price update.


