---
title: 快速上手 redux
description: react/react-native 中使用 redux
banner: https://static.oschina.net/uploads/img/201712/28115613_e4W2.jpg
author: 1306503317@qq.com
date: 2019-05-29 19:30
---

#快速上手 redux
##react/react-native 中使用 redux
(适用于对 react/RN 有一定基础了解的童鞋)

[redux 官网](https://www.redux.org.cn) ###图片说明数据流向
![图片alt](https://static.oschina.net/uploads/img/201712/28115514_j1VV.jpg)

###这个图片很形象
![图片alt](https://static.oschina.net/uploads/img/201712/28115613_e4W2.jpg)

### 使用步骤

### Step 1 Install

- npm install --save redux
- npm install --save react-redux

### Step2 新建目录结构 redux 文件夹

```
    |--redux
        |--actions
            |--type.js    存放各种action的类型常量
            |--user.js    有关user的action的creator
            |--wallet.js  有关wallet的action的creator
            |--...
        |--reducers
            |--root.js    根reducer，将其它的reducer全组装起来
            |--user.js    处理有关user action的reducer
            |--wallet.js  处理有关Wallet action的reducer
            |--...
        |--store
            |--getStore.js  store的初始化

```

### Step3 编写 type.js 和各种 action.js

- 把各种能想到的动作写下来，比如用户的登录、退出和钱包的创建和删除，那么先把这些 type 定义在 type.js 里

```
    //user
    export const USER_LOGIN="USER_LOGIN"
    export const USER_LOGOUT="USER_LOGOUT"
    ...

    //wallet
    export const WALLET_ADD="WALLET_ADD"
    export const WALLET_DEL="WALLET_DEL"
    ...
```

- 把具体的 action 和它的 creator 函数写出来，action 的 type 属性是必须的，其它则是它携带的信息量。为了清楚，不同类型分别放在不同的 js 文件。

```
    //user.js
    import * as TYPES from './types';
    export function loginUser(user) {
    	return {
    		'type': TYPES.USER_LOGIN,
    		'user': user,
    	}
    }
    ...

    //wallet.js
    export function addWallet(new_wallet) {
    	return {
    		'type': TYPES.WALLET_DEL,
    		'new_wallet': new_wallet,
    	}
    }

```

### Step3 编写相应的 reducer 纯函数，并将它们组合成根 reducer 函数

- 纯函数是指同样的输入一定会获得同样的输出，所以如果有类似于 date.now()及 math.random()一类的函数不可以使用。
- 为了代码清楚，可以为每一种类型的 action 创建一个 reducer。
- 每个 reducer 接受当前状态和一个 action，返回下一个状态

```
    //user.js
    import * as TYPES from '../actions/types';

    const initialState = {
    	someone_login: false,
    	login_user:null,          //初始无人登录
    };

    export default function userReducer(state = initialState, action) {

    	switch (action.type) {
    		case TYPES.USER_LOGIN:
    			return {
    				someone_login: true,
    	            login_user:action.user,  //返回新状态：有人登录，登录者为action携带的user属性
    			};
    			break;

    		case TYPES.USER_LOGOUT:
    			return {
    				someone_login: false,
    	            login_user:null,  //返回新状态，无人登录
    			};
    			break;
    		default:
    			return state;
    	}
    }

    //wallet.js
    import * as TYPES from '../actions/types';

    const initialState = {
    	walletList: [],   //初始钱包列表为空
    };

    export default function walletReducer(state = initialState, action) {

    	switch (action.type) {
    		case TYPES.WALLET_DELETED:
    		    //todo：循环state.walletList，根据action.address删除掉相应wallet，得到一个新的wallet,newWallet.

    			return {
    				walletList: newlist,
    			};
    			break;

    		case TYPES.WALLET_ADD:
    			var newlist = state.walletList;
    			newlist.push(action.newWallet);
    			//先进行处理，将新加入的钱包push到新列表中

    			return {
    				walletList: newlist,//返回新状态：加入新钱包后的钱包列表
    			};
    			break;
    		default:
    			return state;
    	}
    }

```

- 使用 redux 包的 combineReducers，将 reducer 组合成根 reducer

```
    import { combineReducers } from 'redux';
    import walletReducer from './wallet';
    import userReducer from './user';

    export default rootReducer = combineReducers({
        walletStates: walletReducer,
        userStates: userReducer,
    })
```

### Step 4 生成唯一的 store，也是 app 的唯一数据源

- 使用 redux 包的 createStore 函数，以根 reducer 为参数生成 store

```
//getStore.js
    import { createStore, applyMiddleware } from 'redux';
    import rootReducer from '../reducers/root';

    let store = createStore(rootReducer);
    export const getStore = () => {
        return store;
    }
```

### Step 5 在根组件上包上<Provider store={store}></Provider>

- 在你的根 js 文件上，获取之前生成的 store

```
    let store=getStore()
```

-在你的根组件<Root/>外包上<Provider>并将 store 作为 props 传递给它。Provider 来自于 react-redux 包

```
    <Provider store={store}>
        <Root/>
    </Provider>
```

### Step 6 在你相关的组件上选择要关联的 state 并用 react-redux 包的 connect 函数 connect 一下

- 其实现在 store 里已经存储了你所要的 state 了，在前面的例子里，store.walletState 就是与 wallet 相关的 state，store.userState 就是与 user 相关的 state。（就是根 reducer 里的属性名）
- 在 connect 之前，先要选出要使用的 state，因为没必要用到全部的

```
    const mapStateToProps = store => {
      return {
        walletState: store.walletState,
      }
    }
```

- 然后在我们的组件里，不要直接输出我们已经写好的组件，而是输出 connect 过的组件

```
    import { connect } from 'react-redux';

    class your_component extends PureComponent {
        render(){
            return(
                ...
            )
        }
    }
    //不输出上面你写好的组件

    const mapStateToProps = store => {
      return {
        walletState: store.walletState,
      }
    }
    //而是输出connect过的选好state的组件
    export default connect(mapStateToProps)(your_component);

```

### Step 7 在 connect 过的组件里就可以引用 state 和通过 dispatch(action)来刷新状态和界面了

- 在 connect 过的组件里使用 state

```
    wallet_list=this.props.walletState.walletList
```

- 在 connect 过的组件的某个点击事件里更新状态

```
    onPress={()=>{
        new_wallet={}
        new_wallet.address="xxxxxxxxxxxx"
        new_wallet.name="xxxx"
        new_wallet.privateKey="xxxx"
        this.props.dispatch(addWallet(new_wallet)
    }}
```

> addWallet 是个 action creator，它生成一个 action{'type':"WALLET_ADD",'new_wallet':new_wallet},携带了我们关于 new_wallet 的信息。
> dispatch 之后呢，reducer 会根据目前的 state 和这个 action 生成新的 state，随后 redux 会刷新界面。
