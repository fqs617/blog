---
title: WBS原型框架实现细节
description: wbs-prototype 内部对原有wbs的框架做了拆分，粒度很细，基于之前的业务特性，从项目结构到构建脚本，再到基础样式，甚至layout都做了封装，发布到nbnpm server， 可以很方便的更新某一个模块或组件
banner: http://7xq4yv.com1.z0.glb.clouddn.com/prototype.jpeg
date: 2020-05-31 21:16
author: 1306503317@qq.com
---

::: tip 背景
在`wbs`的业务链中，`wbs`作为大中心，它内部会挂载很多 `分中心` 系统，
这些分中心系统要和wbs大中心保持UI以及通用组件的一致，同时也要保证基础交互的一致，这就需要wbs在框架底层要对分中心做限制。

比较好的一种做法就是把底层内容细粒度化，然后彻底封装底层，分中心不再关注组件的依赖注入、基础UI以及dev和build脚本，
只需要继承基础框架，直接写分中心业务即可。同时底层的良好封装，也会让之后的大中心和分中心同步更新成为可能。

这就是 `wbs-prototype` 的使命。
:::

详细背景介绍[看这里](https://fe.newban.cn/wiki/docs/vue/wbs-modular.html)


## 简介

`wbs-prototype` 内部对原有wbs的框架做了拆分，粒度很细，基于之前的业务特性，从项目结构到构建脚本，再到基础样式，甚至layout都做了封装，发布到nbnpm server，
可以很方便的更新某一个模块或组件。

wbs的拆分细节和更新日志可以 [查阅这里](https://fe.newban.cn/wiki/docs/vue/wbs-update.html)

#### `nb-template-wbs-prototype`

`nb-template-wbs-prototype` 就是对 `wbs-prototype` 做了一层包装，作为一个模板，可以很方便的通过 `nb-cli` 生成一份 `wbs-prototype` 项目。

```bash
$ nb init wbs-prototype <project-name>
```

## 核心细节

`wbs-prototype` 在内部会先加载main.js，然后在入口中会优先加载一些基础的模块和组件，然后会载入对外暴露的配置hook，
框架底层会对二者的信息做类似 `merge` 的操作，比如 `store` 和 `router` 部分就是最典型的部分。

根目录里没有原来的src目录，直接放置了 `components`、`common`、`pages`、`routers` 和 `store` 几个目录，分别对标之前框架里src目录下的结构。

`static` 目录实际上就是之前框架根目录里的 static，用法一直，放置一些静态资源，图片什么的。

<br>

另外根目录下还有其他几个目录分别有以下用途：

* `config` 系统配置信息，项目初始化之后，可以把config/local.sample.js文件cp一份，命名成`local.js`，该文件会覆盖config中的配置，同时它不在版本库中。

* `dev-modules` 本地的依赖包热开发文件夹，具体用法 [参考这里](https://note.youdao.com/web/#/file/WEB79c03efb142587dd5963ffea1ac54135/note/WEB3cf2fb0b502d88bd898ab71dfc9dd1a4/)


<br>

以上的这些文件夹，`nb-vue-wbs-prototype` 内部会监听他们的变动，同时自动注入依赖。



## 本地开发和构建prod版本

为了方便业务系统中使用，我们对构建脚本部分也做了必要的封装，编写了 `wbs` bin命令，可以启动本地开发server和构建生产环境版本。

`dev` 和 `build` 模式通过设置参数，可以自动导入 config 配置

```json
"scripts": {
  "dev": "wbs dev --dev --prod",
  "build": "wbs build --dev --prod --config"
}
```

```bash
$ npm run dev
$ npm run build
```

`--dev` 和 `--prod` 参数为是否打印development和production环境的配置信息

`--confg` 参数为是否打印dev或build脚本具体加载的客户端配置信息

默认情况下，三个参数均不开启，如果开发调试过程中需要debug，可以临时添加参数来开启。

<br>

除此之外，如果想对build脚本做更为详细的配置，可以进入根目录下的 `.build` 目录，这个是预留的一个目录，可以对dev和build做更为详细的配置，但通常情况下，wbs bin命令已经够用了。

```js
import InitStore from 'nb-vue-wbs-prototype/build/dev-server'
import path from 'path'

// 假定该文件是在根目录下的 build 目录中，所以 .. 跳到上层
const resolve = dir => path.join(__dirname, '..', dir || '')

devServer({
  // 系统的根目录
  appRoot: resolve(),
  // 扩展vendor
  vendor: [],
  // build输出的文件路径(cdn地址)
  // 通常配置为 '/' , 如果有cdn服务，可直接配置为cdn服务器地址
  assetsPublicPath: '/',
  // build文件输出目录
  assetsRoot: resolve('dist'),
  // 哪个目录需要使用babel-loader处理，可以配置在这里
  // 默认情况下，根目录下的 components/pages/routers/store 已经加入babel-loader处理逻辑
  // 配置的时候直接写文件夹名称即可
  babelResolve: [],
  logger: {
    // 是否打印 dev config
    dev: true,
    // 是否打印 prod config
    prod: true
  }
}).then(server => {
  server.start()
})
```



## 组件和模块编写要求

组件在编写的时候注意以下规则：

* 组件或模块采用 `nb-vue-wbs-` 作为前缀

* 如果是样式组件，前缀采用 `nb-style-wbs-` 作为前缀

* 可以直接采用ES6语法来编写

* 组件或模块内要有完整目录结构，要包含 .gitignore、package.json和README.md文件

* README.md中要写清楚组件的用法、参数、方法等，最好再写个demo

* 内部如果需要import其他wbs组件或模块，安装的时候记得加上 `--save` 参数

<br>

发布nbnpm模块的方法，[请参考这里](https://note.youdao.com/web/#/file/WEBe2a1ecff49080f06aaab438c48853961/note/WEBee89894fe949634998354aaa919a6e88/)



## 其他

对于底层的通用组件，wbs组统一维护更新，并配套编写变更日志。各个分中心可以根据具体情况来选择发布依赖包，或者是直接在 `components` 中编写系统内部组件。

一般来说，如果某个组件各中心都可能会用到，就要考虑采用依赖包的方式。
