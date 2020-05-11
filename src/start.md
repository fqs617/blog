---
title: '欢迎使用NBFE博客'
description:  Blog 新鲜出炉，欢迎前端同学使用
banner: http://7xq4yv.com1.z0.glb.clouddn.com/start.jpg
date: '2020-05-30 21:01:40'
author: 1306503317@qq.com
---

::: tip
经过一段时间的酝酿，还有加班加点， Blog成功上线。

在平时的工作中，大家一边忙业务开发，一边忙着前端周边生态建设，过程中肯定会有一些想法和思考，
搭建这个博客就是希望有个内部平台，能把这些点点滴滴记录下来，一起讨论，互励共勉。
:::


## 博客用法

* 先clone博客的代码

* 然后在本地按照script提示来启动dev环境

* 创建 `markdown` 文件，编写文章内容

* commit，然后提交到远端repo

<br>

文档头部应当使用`YAML Front Matter`，注明文档的相关说明

```yaml
---
title: '文章标题'
description: '文章描述，blablabla...'
banner: 'http://some-image-url' // banner地址需要一个可访问的网络图片地址，可以用七牛免费存储
date: '2020-05-29 21:01:40'
---
```

除此之外，其他部分正常写.md文档即可


## 其他

为了方便写博客，我们提供了一个 `blog` 命令，挂载到公司的 `nb-cli` 上，可以很方便的创建一个初始markdown文件，包含标题，描述，封面图片以及日期信息

`nb-cli` 需要升级到v2.1.0及以上版本，更新方式[看这里](https://note.youdao.com/web/#/file/WEBe2a1ecff49080f06aaab438c48853961/note/WEB83d036d6ed9867f354a18fef57e78e97/)

```bash
$ nb blog <markdown-file-name>

# eg: nb blog example.md
# or: nb blog example
```

执行命令后，命令行会提示你输入标题、描述等信息，按照提示输入即可，之后你当前的目录里就会出现一个刚创建的md文件。

<img src="http://7xq4yv.com1.z0.glb.clouddn.com/example2.png">
