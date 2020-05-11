---
title: Vue mixins和extend在业务中的应用小结
description: 关于mixins的一些思考和extends的对比
banner:
author: 1306503317@qq.com
date: 2020-05-06 18:14
---

有时候在开发的过程中，我们会遇到这么一类组件，他们有很多非常相似的地方，有很多相似甚至一样的方法和属性。如果是用面向对象的角度来思考，这种应该是继承自一个父类。他们之间相同的地方是继承自父类，同样的目的但是实现不同的应该是实现或者覆盖父类的方法。

::: tip
就像是人，每个人都有五官，但是长相却各有差异。都会说话，声音却因人而异。
:::

在`Vue`中，说到继承，我们一般会想到用`extend`。但是`extend`有个很大的弊端，就是他一次只能继承一个组件。如果有个组件同时依赖多个组件怎么办呢？

这个时候就轮到`mixins`上场了。`mixins`字面意思就是混合。也就是混合两个组件的选项，来达到抽取相同的地方的目的。下面我借用最近的一个业务场景，来比较一下`extend`和`mixins`的写法上的区别。

### 需求
这次主要是在基于`element-ui`的`dialog`组件的弹窗组件。

我们知道弹窗的内容是非常不固定的。但是他们还是有很多共性的：

1. 都有一个控制显示隐藏的`boolean`值；
2. 都有`close`方法；
3. 大部分都需要在提交之后通知外层页面。

大概需要的属性如下：
```javascript
// dialog.js
export default {
  data () {
    return {
      dialogVisible: false
    }
  },
  mixins: [],
  watch: {
    dialogVisible (v) {
      this.$emit('update:visible', v)
    },
    visible (v) {
      this.dialogVisible = v
    }
  },
  props: ['visible'],
  methods: {
    close (submit = false, params) {
      (submit === true) && this.$emit('on-submit', params)
      this.dialogVisible = false
    }
  }
}
```

### extend

和普通的写法不一样，这里`vue`的单文件组件并不是直接`export default`一个简单的对象。而是需要使用`Vue.extend`先继承`dialog`对象，然后再输出。

```javascript
// dialog-demo.js
import Vue from 'vue'
import dialog from 'dialog'

export default Vue.extend(dialog)({
  // 自己的选项
  template: '<el-dialog :visible.sync="dialogVisible"></el-dialog>'
  ...
})
```

### mixins

`mixins`相对简单，就是引入`dialog`然后放入到引用组件的`mixins`选项之中。

```vue
<template>
  <el-dialog :visible.sync="dialogVisible">
  ...
  </el-dialog>
</template>
<script>
import dialog from 'dialog'

export default Vue.extend(dialog)({
  mixins: [dialog, ... ]
  // 自己的选项
  ...
})
</script>
```
`mixins`选项接受一个数组，支持同时混合多个对象到目标组件当中。

### 总结

在`vue-cli`中，对于`.vue`文件，实际上`export default`出去的只是初始化`vue`组件的选项，而`extend`是直接返回的是一个`vue`组件。因此，`mixins`和`extend`在脚手架中的应用场景区分还是比较明显的。`.vue`文件中，只能是`mixins`。

而对于那种没有`template`的组件，就没有必要用`.vue`文件了。比如说[上篇文章](/blog/src/vue-upload-example.html)中的对`upload`组件的扩展。
