---
title: 用npm-hook postinstall来解决实际问题
description: 在项目中巧妙的利用postinstall可以很方便的帮我们处理一些棘手的问题
banner: https://pic.newban.cn/1554691320349__8126016902568582.jpeg
author: 1306503317@qq.com
date: 2019-04-09 17:30
---

npm 官方提供了两个实用的hook：`pre` 和 `post`，比如 prebuild和postbuild，prepublish和postpublish等等

```json
{
  "scripts": {
    "build": "node build.js",
    "prebuild": "node prebuild.js",
    "postbuild": "node postbuild.js"
  }
}
```
当我们执行 `npm run build` 的时候，实际上npm是按照以下顺序执行的：

```bash
$ npm run prebuild && npm run build && npm run postbuild
```

这样，我们可以很方便的在依赖包安装前后来做一些操作，比如预处理操作，比如清理操作等。

接下来以WBS里的富文本编辑器 `nb-vue-wbs-rich-editor` 模块为例，来说下 `postinstall` 如何在实际业务中巧妙的解决棘手问题。


#### 场景

从wbs242起，富文本编辑器从 wangEditor，改成了 `tinyMCE`，tinyMCE有个问题，
就是它的主题和皮肤部分是通过内部脚本来创建html标签加载的，需要指定固定地址或CDN地址来加载指定的样式文件。
这样的话就只能通过静态文件夹中的方式，把tinyMCE的样式放到工程的static目录中，不经过构建脚本处理，浏览器直接访问资源。

通过情况下，需要开发同学安装完依赖包后，手动把主题样式文件copy到static目录下。但在 “能自动绝不手动” 的前提下，
还是要找到自动化的处理方式，而 `postinstall` 就是一个比较好的方式。

`postinstall` 动作会在依赖包安装后执行，借助这个特性，我们可以在 post install 的时候通过脚本把主题文件copy到项目中。
这样一个看似很麻烦的工程问题，就巧妙的化解成几行代码就搞定的文件copy问题。


<br />

关于更多的相关用法，可以参考官方文档 [package.json详解](https://docs.npmjs.com/files/package.json)
