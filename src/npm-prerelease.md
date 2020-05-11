---
title: 在nbnpm中使用prerelease
description: 当我们通过nbnpm发布依赖包的时候，都会先用 `npm version` 命令来更新依赖包的版本号，最常用的就是 major\minor\patch 三种，实际上还有其他几个非常有用的version-tag
banner: http://7xq4yv.com1.z0.glb.clouddn.com/input.jpeg
author: 1306503317@qq.com
date: 2020-05-07 20:59
---


::: tip
当我们通过nbnpm发布依赖包的时候，都会先用 `npm version` 命令来更新依赖包的版本号，最常用的就是 major\minor\patch 三种，
实际上还有其他几个非常有用的version-tag
:::

```bash
npm version [major | minor | patch | premajor | preminor | prepatch | prerelease]
```

在这里重点说下 `prerelease`。

大多场景下，我们会发布一个稳定的版本，比如 `1.0.1` 之类的，根据npm依赖更新的规则，大多数项目的dependencies都会更新到最新的稳定版。
但是在有些情况下，我们希望能发布一个alpha或beta版本来进行小范围公测，作为下一个稳定版本的过渡的版。`prerelease` 可以很方便的搞定这个事情。


我们通过一个简单的demo来了解这个过程。

#### 1. 发布一个叫 `nb-test` 的依赖包

```bash
# 初始版本为 v1.0.0
$ nbnpm publish

# v1.0.0版本发布
```


#### 2. 更新内容，发布第二个patch版本

```bash
# 执行version命令，跳一个版本
$ npm version patch
$ nbnpm publish

# 版本自动变更到 v1.0.1，这是nb-test当前的稳定版(latest)
```


#### 3. 更新内容，发布一个prerelease版本

```bash
$ npm version prerelease
$ nbnpm publish --tag beta

# 此时版本变更到 v1.0.1-0，这就是第一个prerelease版本
```

通过 `nbnpm info` 命令可以看到，稳定版本依然是 `v1.0.1`，但同时多了一个 `beta` 版本

```js
{
  'dist-tags': { beta: '1.0.1-0', latest: '1.0.1' }
}
```

这个时候，多数项目依然是默认安装稳定版的 `v1.0.1` 版本，如果哪个项目想单独尝试预发布版本，可以通过以下命令安装：

```bash
$ nbnpm install nb-test@beta

# 这样就会把beta指向的 v1.0.1-0 版本安装到项目中，而其他正常安装的项目，都是 v1.0.1版本
```


#### 4. 把prerelease版本变更成稳定版本

```bash
# 当prerelease版本稳定后，就可以变更成稳定版

$ nbnpm dist-tag add nb-test@1.0.1-0 latest
```

这样 `v1.0.1-0` 就变成稳定版本，如果万一，万一线上有没考虑到的bug，又来不及修复，可以通过dist-tag命令来优雅降级：

```bash
$ nbnpm dist-tag add nb-test@1.0.1 latest
```

此时 `v1.0.1` 又重新变成默认的最新版本，而无需再publish新的版本，同时把影响降到最低，非常方便实用。
