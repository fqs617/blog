---
title: 'vue简单入门'
description: vue入门及常犯错误和注意点
banner: http://7xq4yv.com1.z0.glb.clouddn.com/500272767_banner.jpg
date: '2020-05-19 19:33:00'
author: 1306503317@qq.com
---
* 生命周期
* 组件
* Prop
* vuex
* 自定义指令
* 插槽
* 过滤器

::: tip 说明
 Vue.js  是一套用于构建用户界面的渐进式js框架。 Vue 的核心库只关注视图层。
:::

那，什么是渐进式框架？[参考这里](https://blog.csdn.net/crazy_banana/article/details/71079925)

::: tip
  Vue.js 的核心是一个允许采用简洁的模板语法来声明式地将数据渲染进 DOM 的系统：
:::
``` html
<div id="app">
  {{ message }}
</div>
```

``` js
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})
```
> 输出： `Hello Vue!`


## 生命周期
<img src="https://cn.vuejs.org/images/lifecycle.png">

<img src="http://7xq4yv.com1.z0.glb.clouddn.com/b.png">

::: warning
1. created阶段的ajax请求与mounted请求的区别：前者页面视图未出现，如果请求信息过多，页面会长时间处于白屏状态
2. mounted 不会承诺所有的子组件也都一起被挂载。如果你希望等到整个视图都渲染完毕，可以用 vm.$nextTick
:::


## 组件
::: tip
组件就是可被反复使用的，带有特定功能的视图。
所谓的组件化，就像玩积木一样，把封装的组件进行复用,把积木（组件）拼接在一起，构成一个复杂的页面应用程序。

组件树就是由各个组件构成的一种数据结构，它存在的意义是为了帮梳理应用程序。
:::

* 全局组件：
``` js
Vue.component('my-component-name', { /* ... */ })
```
该组件名就是 `Vue.component` 的第一个参数。

* 局部组件：
``` js
new Vue({
  components: {
    'my-footer': {template: ''}
  }
})
```
该组件名就是 `my-footer`。

### 组件名称大小写
* 定义组件名的方式有两种：
使用 kebab-case

``` js
Vue.component('my-component-name', { /* ... */ })
```

使用 PascalCase
``` js
Vue.component('MyComponentName', { /* ... */ })
```


> 你在引用这个自定义元素时两种命名法都可以使用。也就是说 `<my-component-name>` 和 `<MyComponentName>` 都是可接受的

::: warning
注意，尽管如此，直接在 DOM (即非字符串的模板) 中使用时只有 kebab-case 是有效的。
:::

## vuex状态管理
Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。（官方调试工具vue Devtools）

* vuex 的四个核心概念分别是

`The state tree`：Vuex 使用单一状态树，用一个对象就包含了全部的应用层级状态。至此它便作为一个『唯一数据源(SSOT)』而存在。这也意味着，每个应用将仅仅包含一个 store 实例。单状态树让我们能够直接地定位任一特定的状态片段，在调试的过程中也能轻易地取得整个当前应用状态的快照。

`Getters`：用来从 store 获取 Vue 组件数据。

`Mutators`：事件处理器用来驱动状态的变化。

`Actions`：可以给组件使用的函数，以此用来驱动事件处理器 mutations

Vuex和简单的全局对象是不同的，当Vuex从store中读取状态值的时候，若状态发生了变化，那么相应的组件也会高效的更新。并且，改变store中状态的唯一途径就是提交commit mutations。这样便于我们跟踪每一次状态的变化。只要发生了状态的变化，一定伴随着mutation的提交。

```js
// 如果再模块化构建系统中，请确保在开头调用了 Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})
```

安装 Vuex 之后，创建一个 store。创建过程直截了当——仅需要提供一个初始 state 对象和一些 mutations：
```js
store.commit('increment')

console.log(store.state.count) // -> 1
```

## Prop
每个 prop 都有指定的值类型,可以以对象形式列出 prop，这些属性的名称和值分别是 prop 各自的名称和类型.
```js
export default {
  props: {
    title: String,
    likes: Number,
    isPublished: Boolean,
    commentIds: Array,
    author: Object
  }
}
```

## 自定义指令

```js
Vue.directive('change', {
  bind: function (el,bindings) {
    // 首次调用
  },
  update: function (el,bindings) {
   // 只要是有数据变化，都会调用
  },
  unbind: function () {
    // 解绑
  }
})
```

使用：
```html

<any v-change="count"></any>
```

## 插槽
单个slot使用最简单，也是最常用的，当我们定义了一个子组件，父组件在使用的这个组件的时候，想在内部自定义一些初始化数据，这时候就可以用slot实现。

```html
<div><slot></slot></div>
```

## 过滤器
::: tip
过滤器是针对一些数据 进行筛选、过滤、格式化等相关的处理，变成我们想要的数据。
过滤器的本质 就是一个带有参数带有返回值的方法。
:::

* 过滤器的创建和使用
1. 创建
```js
Vue.filter('myFilter', (v) => { return '处理后的结果'})
```
2. 使用
```html
<any>{{expression | myFilter}}</any>
```
* 如何在调用过滤器时，完成参数的发送和接受
1. 发送
```html

<any>{{expression | myFilter(参数1, 参数2)}}</any>
```
2. 接受
```js
Vue.filter('myFilter', (v1, v2) => { return '处理后的结果'})
```
