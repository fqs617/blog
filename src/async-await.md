---
title: async/await的用法及误区
description: async/await的用法以及误区
banner: http://7xq4yv.com1.z0.glb.clouddn.com/229265_banner.jpg
author: 1306503317@qq.com
date: 2020-05-05 11:09
---

在ES5中写js，一般都躲不掉 `callback hell` 这个神奇的现象，直到出现 `Generator` 函数。

`yield` 就是Generator函数最基本的用法，配合 * 标识符，实现异步请求，同步写法。这种方法的问题在于不够语义化，所以就出现了 async / await。

async实际上是Generator函数的语法糖，以此来表明函数内部会使用await来实现异步请求，这样可以通过同步的方式来处理异步流程,
使得代码变得简洁，更加扁平，提高可读性。

常规用法：

```js
const hello = async () => {
  let res1 = await getResult1()
  let res2 = await getResult2(res1)

  console.log(res2)
}
hello()
```

或者是在vue实例内部来用async/await方式：

```js
export default {
  created async () {
    await this.$store.dispatch('FETCH_TABLE_HEADER')
    this.list = await this.$store.dispatch('FETCH_TABLE_LIST')
  }
}
```

### 需要注意的地方

async/await带来方便的同时，也时常存在一些误区，以下几个场景是比较常见的情况：


#### 1. async函数返回值

考虑下面代码的运行结果：

```js
const hello1 = () => {
  return 123
}

const hello2 = async () => {
  return 123
}

hello1()
hello2()
```

::: warning 结果
一般情况下大家可能会认为两个函数执行后都返回 123，但实际上 hello1 返回123，而 hello2 则返回一个 `Promise` 对象。
这就是async处理后的结果，被async加持后，函数会返回一个Promise对象，不管内部有没有用到await。
:::


#### 2. 没区分好同步和异步的时机

考虑一下场景：

```js
const getResults = async () => {
  let res1 = await fetchResult1()
  let res2 = await fetchResult2()
  let res3 = await fetchResult3()
  // fetchResult1、fetchResult2以及fetchResult3并没有参数依赖
  // 不需要某个返回数据的结果作为请求的参数
}
getResults()
```

这种情况下，这里的async/await实际上会使页面的渲染变慢，三次请求按顺序依次进行，并没有利用好http并行加载的特性。原因是内部的三个方法并没有相互依赖，
fetchResult2的请求不需要fetchResult1的结果作为参数，那他们两个就可以并行加载，单纯从解决`callback hell`角度出发的话，Promise其实已经可以解决。

上面的场景，我们可以改用下面的方式：

```js
const getResults = () => {
  Promise.all([
    fetchResult1(),
    fetchResult2(),
    fetchResult3()
  ]).then(results => {
    let res1 = results[0]
    let res2 = results[1]
    let res3 = results[2]

    console.log(res1, res2, res3)
  })
}
getResults()
```

这样浏览器就会采用并发请求的方式发送三个请求，等三个请求都完成了，Promise.all会统一返回结果集，能带来可感知的速度提升。


#### 3. 循环中使用async/await

```js
let arr = [1, 2, 3, 4, 5]
arr.forEach(async item => {
  await fs.getData(item)
})
```

上边这段代码，实际执行结果其实是并发执行，并不是按顺序getData的继发执行，如果实际场景遇到类似情况，可以采用for循环来处理：

```js
const getAllDatas = async () => {
  let arr = [1, 2, 3, 4, 5]
  for (let item of arr) {
    await fs.getData(item)
  }
}
getAllDatas()
```

关于for循环和forEach之类循环内部的细节区别，可以自行google


以上的三点需要在实际的项目中多加注意，尤其第二点。用好async/await会让代码更易读，更有条理，逻辑上也更好些，但如果不注意细节，滥用的话就超鸡影响页面性能。
