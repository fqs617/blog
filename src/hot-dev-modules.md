---
title: 依赖包的热开发
description: 把私有依赖包的开发和业务系统的开发就完美的融合在一起，相互依赖，又互不干涉，提高了生产力
banner: http://7xq4yv.com1.z0.glb.clouddn.com/photo-154.jpeg
date: 2020-05-31 21:54
author: 1306503317@qq.com
---

::: tip 说明
一般情况下，开发某个nb-vue-模块可以单独clone到本地的某个目录中，然后走正常的开发方式开发，然后内部进行单元测试，但如果这个模块需要依赖某个业务系统来进行开发调试的时候，就需要跟业务系统建立直接关系，直接import系统外部的文件并不靠谱，也容易出现意想不到的异常，同时开发效率的大打折扣。

为此我们在业务系统建立了一个ghost文件夹，即`src/dev-modules`，期望实现在系统内部可以直接import，同时又可以引用业务系统本身的一些依赖和context。
:::


## 实现方式

有两种方式来实现：

#### 软链接方式

对dev-modules中的模块设置软连，和node_modules建立联系


#### webpack依赖注入

通过webpack的 `alias` 来实现依赖注入


<br>

对比两种方式，webpack这种相对好用一些，可以借助webpack自身的热更新机制，自动reload dev-modules下的文件。


## 具体开发流程

1. 在gitlab的`nbnpm`组中建立对应的repo

2. clone到业务系统中的`dev-modules`目录

3. 添加和编写模块需要的文件

4. 完成模块编写并通过测试后，发布到nbnpm server &nbsp; [[?]](/docs/tools/nbnpm-publish.html)


::: warning
`dev-modules`目录内的文件夹不在版本库中，放置在这里是临时性的，也就是说哪个业务系统需要用到某个模块来二次开发，或者是新建一个通用业务模块的时候，就可以放在这里做临时性的开发调试。

开发过程中，记得及时push代码到repo，避免代码丢失。
:::


## 注意事项

::: warning
`dev-modules`内的热开发模块采用白名单的方式加载，需要在dev-modules内创建local.js文件，内容export一个对象，包含所有允许被加入到系统的热模块名
`local.js`也不在版本库中，需要单独创建。
:::

```js
// local.js模板
// true 表示激活热开发模式，false 表示不激活
module.exports = {
  'nb-vue-activiti': true
}
```

<br>

这样，私有依赖包的开发和业务系统的开发就完美的融合在了一起，相互依赖，又互不干涉，生产力杠杠的 :smile:

<br />

最新版本的[`vue-standard`](https://note.youdao.com/web/#/file/WEB128e7ef2ef00aa48366b53f474d295f8/note/WEBa41371c480f0f42dd8aebdc851d07fe5/)模板中已经加入该特性
