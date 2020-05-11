---
title: 一分钟了解koa中间件套路
description: 快速了解koa的中间件原理和用法
banner: http://7xq4yv.com1.z0.glb.clouddn.com/500177873_banner.jpg
author: 1306503317@qq.com
date: 2020-05-06 10:08
---

“

Koa 是一个新的 web 框架，由 Express 原班人马打造， 致力于成为 web 应用和 API 开发领域中的一个更小、更富有表现力、更健壮的基石。 通过利用 async 函数，Koa 帮你丢弃回调函数，并有力地增强错误处理。 Koa 并没有捆绑任何中间件， 只提供了一套优雅的方法，可以快速方便地编写服务端应用程序。

”

这篇文章抓药讲koa的中间件，也就是常说的 `middleware`

## Express & Koa

```js
// express
app.use(function (req, res, next) {})

// koa
app.use(function (ctx, next) {})
```

两者在外层都是按顺序来执行的，不同的是内部调用顺序不一样，这有很大区别。

在express中，middleware是基于Connect中间件框架来实现的，是一个线性模型，也就是一个一个的按顺序往下执行。它只能在 next 调用前处理需要做的事情，一旦调用了next，当前中间件就会脱离整个调用的环节，应用会继续往下走。
而在koa中，中间件是堆栈的形式，在koa源码中有这样一段代码：

```js
this.middleware.push(fn)
```

显然中间件是一个队列，队列内部会根据 `stack` 的方式进栈出栈排序，然后依次执行，这里next有很重要的角色，它决定了一部分的顺序。
在请求开始的时候，请求会先处理中间件内部next调用地方之前的逻辑，处理完后继续移交控制给 response 中间件。当一个中间件调用 next() 则该函数暂停并将控制传递给定义的下一个中间件。当在下游没有更多的中间件执行后，堆栈将展开并且每个中间件恢复执行上游行为。

这个过程有人称为是 ”洋葱圈”：

<img src="http://7xq4yv.com1.z0.glb.clouddn.com/cong.png">

很形象，request层先进，直到没有request后就停止执行（最终没有next的调用），然后就开始response出栈，依次向外“回游”。

这里有个地方需要注意，在穿越洋葱圈的过程中，如果哪个中间件没有调用next，则意味着请求在这里终止，将会从这里“回游”。


举个例子，我们要记录一个请求耗费的时间。

在express中，要实现这个小功能，非常麻烦，你需要监听 response stream。而在koa中，分分钟搞定：

```js
// middleware 1
app.use(async (ctx, next) => {
    console.log(`Request`, `${ctx.request.method} => ${ctx.request.url}`)
    await next()
})

// middleware 2
app.use(async (ctx, next) => {
  console.log(`Started tracking...`)
  const start = Date.now()

  await next()

  // 当进栈的所有中间件都处理完后，开始这部分出栈的处理逻辑
  const time = (Date.now() - start) + `ms`
  console.log(`Tracking response time:`, time)
})
```

将会得到以下结果：
```log
- Request GET => /api/v1/test
- Started tracking...
- Tracking response time: 1024ms
```

几行代码就搞定了，非常方便好用。


再来看另外一个例子，我们要检测用户的权限，如果没有权限就给出 403 状态：

```js
// checkUserPermission是一个可以检测用户权限的方法
app.use(async (ctx, next) => {
  if (await checkUserPermission(ctx)) {
    await next()
  } else {
    ctx.response.status = 403
    // 或者加上其他对无权限的处理逻辑
    // 输出错误页面，转给其他error handler处理，anyway，非常方便
  }
})
```

检测到用户有权限的时候，就调用next()，这样把控制权交给后续中间件来继续处理，如果没权限就不再调用next，应用终止下游中间件的处理。
