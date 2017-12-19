import "babel-polyfill"

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'

import Greeting from './Greeting'
import reducer from './reducers'

import createSagaMiddleware from 'redux-saga'
import mySaga from "./sagas";

const sagaMiddleware = createSagaMiddleware()

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
    // composeEnhancers(
    //     applyMiddleware(sagaMiddleware))
)

sagaMiddleware.run(mySaga)

const action = (type, msg) => store.dispatch({type, msg})

function render() {
  ReactDOM.render(
    <Greeting
      value={store.getState()}
      onSayHello={() => action('SAY_HELLO', "Hello!")}
      onSayGoodbye={() => action('SAY_GOODBYE', "Good bye!")} />,
    document.getElementById('root')
  )
}

render()
store.subscribe(render)
