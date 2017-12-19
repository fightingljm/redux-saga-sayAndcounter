# redux-saga

### 一、Redux-Saga介绍

redux-saga 是一个旨在于在React/Redux应用中更好、更易地解决异步操作（action）的库。主要模块是 saga 会像一个分散的支线在你的应用中单独负责解决异步的action（类似于后台运行的进程）。详细移步：[Redux-saga](https://github.com/redux-saga/redux-saga)

redux-saga相当于在Redux原有数据流中多了一层，对Action进行监听，捕获到监听的Action后可以派生一个新的任务对state进行维护（当然也不是必须要改变State，可以根据项目的需求设计），通过更改的state驱动View的变更。图如下所示：

![图片](https://github.com/fightingljm/myblog/blob/master/src/image/saga1.png)

用过redux-thunk的人会发现，redux-saga 其实和redux-thunk做的事情类似，都是可以处理异步操作和协调复杂的dispatch。不同点在于：

Sagas 是通过 Generator 函数来创建的，意味着可以用同步的方式写异步的代码；
Thunks 是在 action 被创建时才调用，Sagas 在应用启动时就开始调用，监听action 并做相应处理； （通过创建 Sagas 将所有的异步操作逻辑收集在一个地方集中处理）
启动的任务可以在任何时候通过手动取消，也可以把任务和其他的 Effects 放到 race 方法里可以自动取消；

### 二、入门demo

```bash
$ git clone https://github.com/fightingljm/redux-saga-sayAndcounter.git
# $ git checkout redux-tool-saga // 切到有redux tool的分支配合chorme 的 Redux DevTools 工具查看逻辑更清晰

$ yarn  //下载依赖
$ yarn run hello //先看项目文件中的hello
```

sagas启动server成功后view-on: http://192.168.1.104:9966/

可看到如下界面，一个简单的例子，点击say hello按钮展示 hello，点击say goodbye按钮展示goodbye。
可注意看右边栏的Action变化和console控制台的输出。

![图片](https://github.com/fightingljm/myblog/blob/master/src/image/saga2.png)

sagas.js  关键代码

```js
import { takeEvery } from 'redux-saga';

export function* helloSaga() {
  console.log('Hello Sagas!');
}

export default function* watchIncrementAsync() {
    yield* takeEvery('SAY_HELLO', helloSaga);
}
```

这里sagas创建了一个 `watchIncrementAsync` 监听 `SAY_HELLO的Action`，派生一个新的任务——在控制台打印出“Hello Sagas!”通过这例子可以理解redux-saga大致做的事情。

该项目中还有一个计数器的简单例子。

```bash
$ npm start //即可查看Counter的例子
```

sagas.js关键代码

```js
// 一个工具函数：返回一个 Promise，这个 Promise 将在 1 秒后 resolve
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// Our worker Saga: 将异步执行 increment 任务
export function* incrementAsync() {
    yield delay(1000);
      yield put({ type: 'INCREMENT' });
}

// Our watcher Saga: 在每个 INCREMENT_ASYNC action 调用后，派生一个新的 incrementAsync 任务
export default function* watchIncrementAsync() {
      yield* takeEvery('INCREMENT_ASYNC', incrementAsync);
}
```

计数器例子的单元测试 sagas.spec.js 关键代码

```js
import test from 'tape';
import { put, call } from 'redux-saga/effects'
import { incrementAsync, delay } from './sagas'

test('incrementAsync Saga test', (assert) => {
  const gen = incrementAsync()

  assert.deepEqual(
    gen.next().value,
    call(delay, 1000),
    'incrementAsync Saga must call delay(1000)'
  )

  assert.deepEqual(
    gen.next().value,
    put({type: 'INCREMENT'}),
    'incrementAsync Saga must dispatch an INCREMENT action'
  )

  assert.deepEqual(
    gen.next(),
    { done: true, value: undefined },
    'incrementAsync Saga must be done'
  )

  assert.end()
});
```

由于 redux-saga 是用 ES6的 `Generators` 实现异步，`incrementAsync 是一个 Generator 函数`，所以当我们在 middleware 之外运行它，会返回一个易预见的遍历器对象,  这一点应用在单元测试中更容易写unit。

redux-saga能做的不只是可以做以上例子的事情。

实际上 redux-saga 所有的任务都通用 yield Effects 来完成。它为各项任务提供了各种 Effect 创建器，可以是：

- 调用一个异步函数；
- 发起一个 action 到 Store；
- 启动一个后台任务或者等待一个满足某些条件的未来的 action。

### 三、redux-sagas的使用

- 组合sagas  (yield Sagas) —— 实际上和redux-thunk 的dispatch 一个action类似

```js
function* fetchPosts() {
  yield put( actions.requestPosts() )
  const products = yield call(fetchApi, '/products')
  yield put( actions.receivePosts(products) )
}

function* watchFetch() {
  while ( yield take(FETCH_POSTS) ) {
    yield call(fetchPosts) // waits for the fetchPosts task to terminate
  }
}
```

当 yield 一个 call 至 Generator，Saga 将等待 Generator 处理结束， 然后以返回的值恢复执行

- 任务取消 ——  一旦任务被 fork，可以使用 yield cancel(task) 来中止任务执行。
取消正在运行的任务，将抛出 SagaCancellationException 错误。

![图片](https://github.com/fightingljm/myblog/blob/master/src/image/saga3.png)

- 同时执行多个任务

```js
const [users, repos] = yield [
    call(fetch, '/users'),
    call(fetch, '/repos')
]
```

- 使用辅助函数管理 Effects 之间的并发。

```js
function* takeEvery(pattern, saga, ...args) {
  while(true) const action = yield take(pattern)
    yield fork(saga, ...args.concat(action))
  }
}
```

### 四、Redux-Saga优点

- 流程拆分更细，异步的action 以及特殊要求的action（更复杂的action）都在sagas中做统一处理，流程逻辑更清晰，模块更干净；
- 以用同步的方式写异步代码，可以做一些async 函数做不到的事情 (无阻塞并发、取消请求)
- 能容易地测试 Generator 里所有的业务逻辑
- 可以通过监听Action 来进行前端的打点日志记录，减少侵入式打点对代码的侵入程度

### 五、带来的问题和可接受性

- action 任务拆分更细，原有流程上相当于多了一个环节。对开发者的设计和抽象拆分能力更有要求，代码复杂性也有所增加。
- 异步请求相关的问题较难调试排查

[原文地址](https://juejin.im/post/58eb4100ac502e006c45d5c9)
