---
title: 'Vue项目优化之组件按需加载'
description: Vue组件按需加载
banner: http://7xq4yv.com1.z0.glb.clouddn.com/500821993.jpg
date: '2020-06-30 15:07:30'
author: 1306503317@qq.com
---

:::tip
大家都知道，我们在用vue做项目的时候，最核心的部分便是组件。
一个大型的项目，我们可能需要将应用拆分为多个小模块，并且只在需要的时候才从服务器加载一个模块。
为了让事情更简单， `Vue.js` 允许将组件定义为一个工厂函数，动态地解析组件的定义。`Vue.js` 只在组件需要渲染时触发工厂函数，并且把结果缓存起来，用于后面的再次渲染。
:::

使用 `vue-cli` 构建的项目, 在默认情况下, 执行 `npm run build`  会将所有的js代码打包为一个整体。
打包位置是 `dist/static/js/app.[contenthash].js`，这个文件是非常大，可能几兆或者几十兆，加载会很慢。

所以我们需要分模块打包，然后再按模块加载，这样就会提高页面加载速度。

> 以前我们在页面中局部引入组件的时候，会这样做：

```js
<script>
import Schedule from '@/pages/coms/oa/schedule'
import Task from '@/pages/coms/oa/task'
import Approve from '@/pages/coms/oa/approve',
import News from '@/pages/coms/oa/news'
export default {
  components: {
    Schedule,
    Task,
    Approve,
    News
  }
}
</script>
```

这个时候，在页面第一次请求的时候，把相关组件块的js打包在一起，如下图：

<img src="http://7xq4yv.com1.z0.glb.clouddn.com/loader-pre.jpeg">

如果组件比较少，那么打包之后的文件一般也比较小，如果组件比较多且复杂，那么打包之后的文件就会严重拖页面加载速度的后腿。

> 那么，我们就可以使用按需加载组建的方法来提升页面加载速度，直接提供一个返回 `Promise` 的函数，如下：

当使用`局部注册`的时候:
```js
<script>
export default {
  components: {
    Schedule: () => import('@/pages/coms/oa/schedule'),
    Task: () => import('@/pages/coms/oa/task'),
    Approve: () => import('@/pages/coms/oa/approve'),
    News: () => import('@/pages/coms/oa/news')
  }
}
</script>
```
当时用`全局注册`的时候:
```js
  Vue.component(
    Schedule: () => import('@/pages/coms/oa/schedule'),
    Task: () => import('@/pages/coms/oa/task'),
    Approve: () => import('@/pages/coms/oa/approve'),
    News: () => import('@/pages/coms/oa/news')
  )
```
这个时候，我们点击查看哪部分，就会加载哪部分，如下图：

<img src="http://7xq4yv.com1.z0.glb.clouddn.com/loader-after.jpeg">

效果显而易见。
