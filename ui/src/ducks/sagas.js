import { all, fork } from 'redux-saga/effects';
import { configSaga } from './config';
import { nodesSaga } from './app/nodes';

export default function* rootSaga() {
  yield all([fork(configSaga), fork(nodesSaga)]);
}
