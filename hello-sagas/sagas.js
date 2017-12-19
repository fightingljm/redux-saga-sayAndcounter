import { takeEvery } from 'redux-saga';

export function* helloSaga() {
  console.log('Hello Sagas!');
}

export default function* watchIncrementAsync() {
    yield* takeEvery('SAY_HELLO', helloSaga);
}