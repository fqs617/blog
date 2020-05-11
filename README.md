#my博客系统

> 基于vuePress，旨在提供一个书写技术文档的开放平台

## 用法

*在src文件夹下创建.md文档
文档头部应当使用YAML Front Matter,注明文档的相关说明*

```yaml

---
title: '文章标题'
description: '文章描述，blablabla...'
banner: 'http://some-image-url' // banner地址需要一个可访问的网络图片地址，可以用七牛免费存储
date: '2020-05-05 21:01:40'
---
```
除此之外，其他部分正常写.md文档即可。
