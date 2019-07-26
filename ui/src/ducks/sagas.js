import { all, fork } from 'redux-saga/effects';
import { configSaga } from './config';

export default function* rootSaga() {
  yield all([fork(configSaga)]);
}
