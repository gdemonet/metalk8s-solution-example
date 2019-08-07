import { call, put, takeEvery } from 'redux-saga/effects';

import * as ApiK8s from '../../services/k8s/api';
import { createDeployment } from './customResource';
import history from '../../history';

// Actions
const FETCH_NAMESPACES = 'FETCH_NAMESPACES';
const CREATE_NAMESPACES = 'CREATE_NAMESPACES';

const UPDATE_NAMESPACES = 'UPDATE_NAMESPACES';

// Reducer
const defaultState = {
  list: []
};

export default function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case UPDATE_NAMESPACES:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Action Creators
export const fetchNamespacesAction = () => {
  return { type: FETCH_NAMESPACES };
};

export const updateNamespacesAction = payload => {
  return { type: UPDATE_NAMESPACES, payload };
};

export const createNamespacesAction = payload => {
  return { type: CREATE_NAMESPACES, payload };
};

// Sagas
export function* createNamespaces({ payload }) {
  const body = {
    metadata: {
      name: payload.name
    }
  };
  const result = yield call(ApiK8s.createNamespace, body);
  if (!result.error) {
    yield call(fetchNamespaces);
    const createDeploymentResult = yield call(
      createDeployment,
      payload.name,
      payload.operator_version
    );
    if (!createDeploymentResult.error) {
      yield call(history.push, `/customResource`);
    }
  }
}

export function* fetchNamespaces() {
  const results = yield call(ApiK8s.getNamespaces);
  if (!results.error) {
    yield put(updateNamespacesAction({ list: results.body.items }));
  }
}

export function* namespacesSaga() {
  yield takeEvery(CREATE_NAMESPACES, createNamespaces);
  yield takeEvery(FETCH_NAMESPACES, fetchNamespaces);
}
