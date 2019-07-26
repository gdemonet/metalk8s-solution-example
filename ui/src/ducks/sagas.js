import { all, fork } from 'redux-saga/effects';
import { configSaga } from './config';
import { authenticateSaga } from './login';

export default function* rootSaga() {
  yield all([fork(configSaga), fork(authenticateSaga)]);
}
