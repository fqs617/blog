---
title: WBS中心化和去中心化
description: WBS迭代到目前为止，已经非常庞大，作为一个大中心，大多业务（或者叫分中心，业务中心）都要挂在上面，随着业务不断扩大，还有新增的业务线，导致系统肥胖，引发很多问题。
banner: http://7xq4yv.com1.z0.glb.clouddn.com/coding.jpg
date: 2020-05-31 21:03
author: 1306503317@qq.com
---

::: tip 背景
WBS迭代到目前为止，已经非常庞大，作为一个大中心，大多业务（或者叫分中心，业务中心）都要挂在上面，随着业务不断扩大，还有新增的业务线，导致系统肥胖，引发很多问题。

其中一个比较大的问题，就是各个业务中心要更新产品功能，需要按WBS大中心的时间表排期等位，过程漫长，分中心很多情况下希望能及时的更新和优化产品服务，快速迭代。
同时WBS一次迭代内容过多，也增加客户生产环境出错的概率。这种情况下，去中心化就是一个不错的方案。
:::

::: warning 去中心好处
1. 保留WBS大中心的核心功能，减轻大中心压力
2. 各分中心单独把控自己的更新迭代频率，更加灵活
3. 一定程度上减少更新出错概率
:::


## 面临的问题

WBS的后端同事已经做了很多工作，比如逐渐的拆分后端服务，剥离出一些公共服务，比如统一授权的`NS`服务等等。

对前端来说，也需要做一系列的调整，首先是各个分中心从代码层面独立出去，内部的路由控制，以及打包上线等操作单独处理。这个过程会面临一些问题：

* 如何拆分模块才能保证WBS大中心和各个分中心的兼容，既要互相兼容，又要相互独立
* 如何保证WBS大中心和各个分中心的视觉统一和交互统一

<img src="http://7xq4yv.com1.z0.glb.clouddn.com/wbs.png">

解决掉这些问题，才能保证大中心和分中心的和谐运行。

目前有两种方案可选：

#### # iframe方式

WBS大中心采用iframe方式，统一管理左侧主导航、顶部Header以及底部Footer部分，Main-Container部分由各中心提供独立域名的服务。

:smile:： 主导航之类的公共部分可以直接服用wbs现有代码，分中心只需关注具体的业务模块即可

:worried:： iframe兼容性不够好，高度自适应也容易出问题，对于复杂场景下的跨域、cookie等都会有一些潜在问题，`同时分中心无法作为一个完整独立的服务提供给三方使用`。


#### # 模块化方式

大中心和分中心高度模块化，基础模块和通用模块大中心统一维护，如`utils`、`validator`等基础服务模块, 同时提供统一的通用组件，
如`Form`、`Configurable-table`等，另外还有一些通用业务组件，比如滑屏切换功能等等。再一个就是从页面层面拆分模块，比如`Navigation`、`Header`、`Footer`等。

:smile:：便于维护和更新，大中心和分中心能很好地协同，同时能保证视觉统一和交互统一，搞好之后可以让整套WBS扩展性有质的提升

:worried:：有一定的拆分难度，需要处理的基础模块较多，同时需要对UI层面的模块做统一的规划和处理，时间上也会长一些


::: warning 综合考虑
不管是从目前还是长期来看，`模块化` 的方式应该是更合适一些，尽管有一些挑战，时间上也耗费多一些，但综合来说还是值得的，可以产出一套扩展性强，团队之间能无缝协作的系统。
:::


## 具体做法

#### 拆分系统功能模块

主要是按照系统的功能模块进行拆分，可以分为：

* 左侧主导航（Navigation）
* 顶部导航栏（Navbar/Header）
* 右侧内容区（Main-Container）

每个分中心的系统都包含有以上三个完整的模块，其中Navigation和Navbar统一封装，WBS大中心和分中心公用这部分layout

<img src="http://7xq4yv.com1.z0.glb.clouddn.com/page-module.png">

Navigation和Navbar的封装要考虑到内部数据针对不同中心、不同数据的兼容能力。

#### 拆分公共服务模块

这部分大多是一些基础的通用模块，每个分中心的很多地方可能都会用到，需要做到良好的封装，目前来看，需要封装以下基础模块：

* `Http Request`（Vue-resource/Axios）
* `Utils`
* `Filter`
* `Validator`
* `Directive`
* `Mixins`
* `Signature`


#### 拆分基础组件

基础组件比较多，主要是 `src/components` 目录下的组件，包含UI组件和业务组件，如Form, Configurable-table, Field-Transfer, Upload等等。
这些都需要进行封装，以便分中心系统引入使用。这里有两种方式：

1. 比较零散但可以归为一类的组件，可以作为一个模块发布，在模块内部提供不同的export来导出。
比如wbs中现有的组件`select-job`和`select-tab`都是select，可以放到一个名为`nb-vue-wbs-select`的模块中，
模块对外提供`nb-vue-wbs-select/job`和`nb-vue-wbs-select/tab`两个export

```js
import SelectJob from 'nb-vue-wbs-select/job'
import SelectTab from 'nb-vue-wbs-select/tab'
```

2. 功能较为独立，同时较为复杂的，可以单独封装成一个组件。比如 From组件，可以单独封装为 `nb-vue-wbs-form`


#### 拆分UI模块

UI模块主要是对现有的css进行规划和拆分，抽离出公共的Layout部分，wbs统一维护这部分基础基础模块，其他分中心直接引入使用。

* `nb-style-wbs-helpers`（helpers相关）
* `nb-style-wbs-media`（media, responsive）
* `nb-style-wbs-mixins`（common functions for less/sass etc.）
* `nb-style-wbs-variables`（global variables）

同时也可以提供一个`nb-style-wbs-style-base`模块来统一引入以上几个模块

<br />
<hr />
<br />

WBS作为一个大中心，统一维护底层基础组件，包括Layout部分，各中心import基础模块，在这个基础上结合分中心业务进行开发，相互协作，同时又互相独立。
