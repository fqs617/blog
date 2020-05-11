---
title: '从0发布一个react native的组件 - 下'
description: 带有原生模块桥接的rn组件发布需要注意的点
banner: http://ow9iy2y8z.bkt.clouddn.com/timg1816.jpeg
date: '2020-05-15 18:01:40'
author: 1306503317@qq.com
---

react native一个优势的点就是可以桥接原生组件提高App性能，本文主要讲解如何发布一个桥接原生组件的react native组件

首先需要通过npm安装react-native/react-native-cli/react-native-create-library模块

```sh
$ npm install -g react-native-cli
$ npm install -g react-native-create-library
```

可以通过react-native-create-library快速创建，如下：

```sh
# 命令参数具体查看 https://github.com/frostney/react-native-create-library
$ react-native-create-library nb-rn-utils --module-prefix '' --package-identifier 'cn.utils'
```

也可以手动重新创建，手动创建流程需要先按照[上篇](https://github.com/fqs617/blog/src/developing-module-for-react-native.html)初始化 __nb-rn-utils__，进入 __nb-rn-utils__, 在工程中初始化样例代码

```sh
$ cd nb-rn-utils
$ react-native init example # 也可以通过 react-native-create-library 直接初始化 example
```

## android

手动创建时，在 nb-rn-utils 工程中还需要新建android library工程，对于不熟悉android工程创建的童鞋可能较为复杂，可以直接拷贝 http://gitlab.newbank.cn/nbnpm/nb-rn-utils.git 中的android文件夹，需要修改 AndroidManifest.xml 的 package 属性和相关 java 文件的 package ，package 名称通常为 cn.newbank.xxx ，xxx 表示此组件功能，随后将原有的java文件删除或者在原有的代码上修改

此处我们重新创建原生模块 __UtilsModule__

```java
package cn.newban.utils;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import java.util.UUID;

public class UtilsModule extends ReactContextBaseJavaModule {

  private final ReactApplicationContext reactContext;

  public UtilsModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {// 注意这里是桥接输出的名称，通常以NB开头
    return "NBUtils";
  }

  @ReactMethod
  public void getUUID(Callback callback) {// 此处做了一个uuid生成函数
    String uuid = UUID.randomUUID().toString();

    callback.invoke(uuid);
  }

}

```

__getName__ 函数用于返回一个字符串名字，这个名字在 JavaScript 端标记此模块。这里我们把这个模块命名为 NBUtils，这样就可以在 JavaScript 中通过 NativeModules.NBUtils 访问到这个模块，module写完后再注册模块。

创建一个 __Package__ 类 __UtilsPackage__

```java
public class UtilsPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
      return Arrays.<NativeModule>asList(new UtilsModule(reactContext));
    }

    public List<Class<? extends JavaScriptModule>> createJSModules() { // 新版rn模块不用再实现此方法
      return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
      return Collections.emptyList();
    }
}
```

至此 android 端基本完毕，执行下述命令，如编译成功表明无误

```sh
$ cd android
$ chmod 777 gradlew
$ ./gradlew assembleRelease
```

## ios

同上直接拷贝一份空的ios工程并进行重命名，通过xcode打开工程，单击工程名和相关文件名可以修改

__NBUtils.h__

```objc
#ifndef NBUtilss_h
#define NBUtilss_h

#import <React/RCTBridgeModule.h>

@interface NBUtils : NSObject <RCTBridgeModule>

@end

#endif /* NBUtilss_h */
```

__NButils.m__

```objc
#import "NBUtils.h"

@implementation NBUtils

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE(); // 括号内可以写模块名，不填则直接返回对象名

// 此处 export 方法
RCT_EXPORT_METHOD(getUUID:(RCTResponseSenderBlock)callback)
{
    NSString *uuid = [[NSUUID UUID] UUIDString];
    callback(@[uuid]);
}

@end
```

上述写完后，在Build Settings的Header Search Paths里增加

- $(SRCROOT)/../../../React
- $(SRCROOT)/../../react-native/React

并将上述两个改为 __recursive__，测试编译是否成功即可

## react native

随后在 __index.js__ 桥接如下：

```js
import { NativeModules } from 'react-native'

const { NBUtils } = NativeModules

function getUUID(callback) {
  if (callback) {
    NBUtils.getUUID(callback)
  }
  else {
    return new Promise((resolve, reject) => {
      NBUtils.getUUID(resolve)
    })
  }
}

export {
  getUUID
}
```

## 验证

上述组件写完后最重要的步骤需要验证，在example的package.json增加：

```json
{
  "name": "example",
  "version": "0.0.1",
  "scripts": {
    "start": "node node_modules/react-native/local-cli/cli.js start",
    "test": "jest"
  },
  "dependencies": {
    "react": "16.3.1",
    "react-native": "0.55.4",
    "nb-rn-utils": "file:../" // 此处添加库
  },
  "devDependencies": {
    "babel-jest": "23.0.1",
    "babel-preset-react-native": "4.0.0",
    "jest": "23.1.0",
    "react-test-renderer": "16.3.1"
  },
  "jest": {
    "preset": "react-native"
  }
}
```

安装必要组件并link:

```sh
$ npm i
$ react-native link
```

修改App.js，测试__getUUID__方法:

```js
export default class App extends Component<Props> {

  constructor(props) {
    super(props)

    this.state = {
      uuid: ""
    }
  }

  async onGenerateUUID() {
    this.setState({ uuid: await getUUID() })
  }

  render() {
    const { uuid } = this.state
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit App.js
        </Text>
        <Text style={styles.instructions}>
          {instructions}
        </Text>
        <TouchableOpacity onPress={()=>this.onGenerateUUID()}
        style={{width: 240, height: 40, borderWidth: 1}}
        >
          <Text style={{fontSize: 15}}>{uuid || '生产uuid'}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
```

分别打开 example 中 android 和 ios 的工程分别运行验证无误后可以进行组件发布了









