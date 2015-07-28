
## 常见问题

1. 执行`star`命令时提示：`/usr/bin/env: node --harmony: No such file or directory`

    对于这个问题可以参考 [这里](https://github.com/joyent/node/issues/3911) 的解决方案，如果这里提供的方法仍然不能解决该问题可以考虑从源码安装，然后有两种办法：

    - 把star.js里面的 `#!/usr/bin/env node --harmony` 改成 `#!/usr/local/bin/node --harmony`，然后执行`./star.js`;
    - 或者不做修改，直接执行`node ./star.js`, 前面始终加上`node`;

2. 从源码执行`./star.js`命令时提示：`SyntaxError: Unexpected strict mode reserved word`

    解决办法可以参考 [这里](https://github.com/hustcer/star/issues/24), 即通过执行 `node --harmony ./star.js` 命令，手工启用对 `harmony` 支持。
当然这个命令过于复杂可以在`~/.bashrc`里面加个 `alias`, 比如：`alias star='node --harmony /Users/hustcer/oWork/star/star.js'`，然后执行下 `source ~/.bashrc`就可以直接通过 `star` 命令进行调用了。

3. 查询深市股票——以`000,002,300`开头的股票的高管持股变动情况的时候，提示：`系统正忙，请稍后再试!`

    这个是由于深交所的高管持股变动查询接口异常造成的，可以用浏览器打开 [此链接](http://www.szse.cn/main/mainboard/jgxxgk/djggfbd/), 手工执行一次查询，成功后再用`star`查询高管持股变动，通常情况下可以成功。
