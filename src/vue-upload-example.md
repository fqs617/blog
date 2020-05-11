---
title: upload组件开发记录
description: 一个简单的upload组件的开发和扩展记录
banner: https://fac-assets.newban.cn/cbedd0e5-1f60-4255-99b3-8ccfe0805438
author: 1306503317@qq.com
date: 2020-05-06 11:09
---

### 简单的upload组件

项目中需要一个如下结构的文件上传组件，因为项目中没有找到合适的，所以决定自己写一个。
<img src="https://fac-assets.newban.cn/69039db2-9bd0-42dc-aebf-34f28ebd419c"/>

这个组件大体上包括三个部分，我们可以快速的写出以下的结构
```XHTML
<button/>
<tip/>
<img-list/>
```
结构出来了之后，我们再加上自己的样式，实现每个模块就能够把这个组件的`UI`样式完成了。接下来就是怎么去实现功能。

因为`upload`作为一个表单元素，所以最好能做到调用的时候能使用`v-model`绑定我们的数据。其实`v-model`指令实际上是是使用`value`属性和`input`事件来实现的。代码结构大概如下：

::: tip
因为要考虑到上传多张的情况。所以再定义一个`max-length`的属性，而`value`也应该是有数组和字符串两种情况，分别对应上传单张和多张的情况。
:::

```javascript
props: {
  ...
  // 最大文件数
  maxLength: {
    type: Number,
    default: 1
  },
  // 当是一张的时候value是字符串
  // 当是多张的时候value是数组
  value: [String, Array],
  ...
},
methods: {
  ...
  // 上传文件api
  uploadApi () {},
  // 上传成功之后的回调
  resolvePath (path) {
    if (this.maxLength > 1) {
      const imgArray = [...this.value]
      imgArray.push(path)
      this.$emit('input', imgArray)
    } else {
      this.$emit('input', path)
    }
  },
  ...
}
```

之后我们再补全上传图片的逻辑，这个组件就基本完成了。我们通过下面的方式即可调用我们的组件：
```XHTML
<upload v-model="imgs" :max-length="2">
```
看起来还不错，不过用起来的时候就会发现，这个组件其实写的非常的死板。比如说，我们不想要上传图片了，或者说我们触发上传的不再用`button`了。我们的组件就等于是废了。

### 拆分

其实个人理解，组件划分的越细，他的可塑性就越强。就像是细胞一样，我们可以用组件来组成我们想要的组件。

照着这个想法，我们再来看看这个图片上传的组件。我们不难发现，其实这个组件还可以分为下面两部分。

<img src="https://fac-assets.newban.cn/fb9f2fa9-8b1d-4858-948b-7736092b3abd"/>

我们可以定义一个变量`listType`定制我们的文件列表的样式，也可以用它来控制是否需要这个文件列表。再用一个变量`fileType`来控制这个组件上传的文件类型。接下来我们就来拆分。

这里要介绍一个`vue`的标签[`component`](https://cn.vuejs.org/v2/api/#component)，这个标签根据`is`的值来决定，哪个组件被渲染。
我们还需要一个`computed`或者是`filter`来计算出使用哪个列表组件（其实是`computed`更加合适，不过我组件中用的是`filter`）。

假设有两种列表组件`text`和`picture`，代码大致如下：
```vue
<template>
<div class="button-upload">
  <button/>
  <tip/>
  <component :is="fileType | typeFilter" />
</div>
</template>
// script
<script>
// import
...
export default {
  ...
  props: {
    ...
    listType: {
      type: String,
      default: 'picture'
    },
    fileType: {
      // 文件对象file 文件类型type(pdf、video、audio、image)
      // 默认image
      type: String,
      default: 'image'
    },
    ...
  }
  filter: {
    typeFilter (type) {
      switch (type) {
        case 'text':
          return 'textList'
        case 'picture':
        default:
          return 'pictureList'
      }
    }
  },
  components: {
    pictureList,
    textList
  }
}
</script>
```

这个时候我们就可以把文件列表从我们的组件之中分离出来，以后想要别的样式的文件列表，我们只需要新写一个列表的样式，然后导入就OK了。

因为是统一使用`component`标签，那么，所有的`list`就必须要遵循一个标准。
::: tip
这个其实在后台开发很常见，一般称之为`抽象类`，我姑且叫它`抽象组件`（其实还是一个类，后面会说到）。也就是事先定义好这个组件的方法和属性，而不去关心它内部的实现，调用的时候只要按照约定的格式传入数据即可。
:::

### 扩展

后面有个业务，也是文件上传，但是它要回传的就不是图片的地址；而是拿到图片地址之后再创建一个附件，然后返回的附件id，才是我们所需要的`value`。这个时候，如果重新写一个`upload`组件，显得太笨；不写的话完全拿到外面处理，我们想要做到下面的文件列表和附件的上传状态保持一致就很难。这时候就需要扩展我们的组件。

就想前面说的，组件实际上是个对象。我们可以继承，重写父类的方法。而这次需求和普通的`upload`组件主要有以下几点差别：

upload|attachment
-|-
`value`是`fileUrl`| `value`是一个包含`attachmentId`和`fileUrl`的对象
`uploadApi`返回地址之后就触发`input`事件|`uploadApi`之后还需要调用上传附件接口之后再触发`input`事件
`list`组件的数据通过`value`计算出来|`list`组件的数据通过`value`的某个属性计算出来

和普通的类继承不同，`Vue`有自己的类继承的方法[`extend`](https://cn.vuejs.org/v2/api/#extends)。因此我们可以做出如下调整：
```javascript
// import upload,Vue
...

/**
 * 附件数据结构
 */
class Attachment {
  constructor ({ ... }) {
    ...
  }
}

const AttachmentUpload = Vue.extend(upload).extend({
  computed: {
    // 计算list的所需数据
    imgArray () {
      ...
    }
  },
  methods: {
    // 重写resolvePath方法。这里接收到回传的地址之后再调用addAttachment方法然后再触发input事件
    resolvePath (res) {
      // 调用上传附件
      this.addAttachment({ uri, fileName }).then(attachment => {
        const { id } = attachment
        attachmentArray.push(new Attachment({id, uri, fileName}))
        this.$emit('input', attachmentArray)
      })
    },
    // 上传附件的方法
    async addAttachment ({uri, fileName}) {
      //upload attachment
      ...
      //return attachment
      return res.param
    }
  }
})

export default AttachmentUpload

```
好了，这样我们就可以实现我们想要的新的组件了。

### 总结

个人觉得：组件应该和积木一样，粒度一定要切分的足够合理。这样才能最大化的复用。但是拆分的太细又会导致组件过于复杂，有的时候会牵一发而动全身。当然，很多时候都是在实践当中慢慢优化的。

最后分享出最近看到的饿了么前端架构师林奚在[GMTC2018](https://gmtc.geekbang.org/)上分享的[《Vue组件库建设实践》的ppt](https://fac-assets.newbank.cn/9df582df-47ed-468c-a99a-be63a02f0684)。
