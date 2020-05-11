---
title: '从0发布一个react native的组件 - 上'
description: rn组件发布的一些注意点
banner: http://ow9iy2y8z.bkt.clouddn.com/timg.jpeg
date: '2020-05-09 11:01:40'
author: 1306503317@qq.com
---

我们先写一个简单的组件

```js
import { TextInput } from 'react-native'

export default (props) => {
  return (
    <TextInput {...props} />
  )
}
```

写好组件后，需要创建一个目录nb-rn-element作为npm的模块。在目录运行 __npm init__ 终端会提示一系列问题，如模块的名称（必须是全镜像源唯一的）、版本号和license等；填写完毕后会输入入口文件 __index.js__，生成 __package.json__

```json
{
  "name": "nb-rn-element",
  "version": "1.0.0",
  "description": "A react native component for ...",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": ""
}
```

目录结构如果图所示：

![](http://ow9iy2y8z.bkt.clouddn.com/WechatIMG180.jpeg)

下一步需要设置组件所需的依赖， 在 __index.js__ 中 __import react-native__，由于用到了JSX，还需要导入 __react__，开发的组件中用到了这两个模块，App项目中也会同时用到，如果通过依赖的方式直接安装 __react__ 和 __react native__，导入 __nb-rn-element__ 的模块会同时存在多份副本，__peerDependencies__ 可以解决这个问题，npm通过 __peerDependencies__ 告知使用此组件的App项目哪些模块本组件也同样用到

npm暂时没有自动添加至package.json的方式，需要手动填入：

```json
{
  "name": "nb-rn-element",
  "version": "1.0.0",
  "description": "A react native component for ...",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "",
  "peerDependencies": {
    "react": ">= 15.x",
    "react-native": ">= 0.53.x"
  }
}
```

由于 react native 挂接babel， 组件中也需要挂接 babel ，但不需要安装 babel ，仅需要通知消费模块组件中也用到了babel即可，组件目录中输入如下：

```sh
npm install -D babel-preset-react-native

touch .babelrc
```

同时创建 __.babelrc__ 文件

```json
{
  "presets": ["react-native"]
}
```

至此可以通过 __nbnpm publish__ 发布组件了，然后在项目工程中通过nbnpm安装，这里注意目前nbnpm install module是会创建symlink，而react native由于watchman和delta bundles目前不支持symlink方式，所以需要做如下处理

```sh
# 第一种方式
$ npm i nb-rn-element --save http://gitlab.newban.cn/nbnpm/nb-rn-element.git
# https://gitlab.newban.cn/nbfe/nb-rn-elements

# 第二种方式
$ nbnpm i nb-rn-element --save
$ rm -rf node_modules/nb-rn-element
$ mv node_modules/_nb-rn-element@1.0.6@nb-rn-element node_modules/nb-rn-element

$ react-native link nb-rn-element # only native module
```

如果在组件开发过程中需要测试我们的组件是否可用，可以通过 npm install -D react react-native 导入到devDependencies即可

