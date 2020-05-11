---
title: 内部系统单点登录服务 - Passport
description: Passport 为公司内部系统提供基于JIRA账号的单点登录服务，方便我们登录各个内部系统
banner: http://7xq4yv.com1.z0.glb.clouddn.com/security.jpeg
author: 1306503317@qq.com
date: 2208-05-28 20:16
---

::: tip 关于 Passport
公司产品复杂度越来越高，需要的周边服务也越来越多，除了业务本身以外，我们还需要一些辅助系统和工具，来帮我我们更好的驱动业务。

比如提测系统、前端错误监控系统、APP热更系统、上线发布系统，甚至内部报表系统等等，这些内部系统或者工具都能提高和解放生产力。

而 `Passport` 就是这些内部系统的一个单点登录服务，我们用JIRA账号来登录各个内部系统。
:::


Passport是基于 express + mongodb + redis 经典组合来设计的

## 服务地址

登入：`http://passport.newban.in`

登出：`http://passport.newban.in/api/v1/logout`   (api类型，post方式)

个人中心：`http://passport.newban.in/profile`


```js
request({
  url: `http://passport.newban.in/api/v1/logout`,
  method: `POST`,
  params: {access_token: `ACCESS_TOKEN_HERE`}
})

// 登出接口的入参有三种方式:
//  1. Authorization Bearer
//  2. cookie
//  3. query params
```


## 原理和应用

内部系统统一用 `passport.newban.in` 来登录，passport通过连接公司的LDAP SERVER，然后通过统一一级域名的方式来实现。

具体实现方式如下：

* 发送http重定向请求到 `https://passport.newban.in?continue={your return url}` 到passport

* 用户等过 LDAP 登录成功后，passport会把登录token写入cookie到内部系统一级域名 `passport.newban.in` 域下，然后重定向到参数 `continue` 所传递的 return url 上，通常这个地址是某内部系统自己的登录模块地址

* token名称默认为 `access_token`

* 在内部系统收到重定向请求后，需要请求passport的鉴权接口来确认token是否合法

接口地址为：`https://passport.newban.in/api/v1/verify`

```js
request.post({
  url: `https://passport.newban.in/api/v1/verify?access_token=${TOKEN}`
})

// response
{
  success: true,
  data: {/* USER OBJECT */},
  error: null
}
```
