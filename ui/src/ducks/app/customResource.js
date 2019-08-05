import { call, takeEvery } from 'redux-saga/effects';

import * as ApiK8s from '../../services/k8s/api';

// Actions
const FETCH_CUSTOM_RESOURCE = 'FETCH_CUSTOM_RESOURCE';
const CREATE_CUSTOM_RESOURCE = 'CREATE_CUSTOM_RESOURCE';

const UPDATE_CUSTOM_RESOURCE = 'UPDATE_CUSTOM_RESOURCE';

// Reducer
const defaultState = {
  list: []
};

export default function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case UPDATE_CUSTOM_RESOURCE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Action Creators
export const fetchCustomResourceAction = () => {
  return { type: FETCH_CUSTOM_RESOURCE };
};

export const updateCustomResourceAction = payload => {
  return { type: UPDATE_CUSTOM_RESOURCE, payload };
};

export const createCustomresourceAction = payload => {
  return { type: CREATE_CUSTOM_RESOURCE, payload };
};

// Sagas
export function* refreshCustomResource() {
  const results = yield call(ApiK8s.getCustomResource);
  if (!results.error) {
    yield call(updateCustomResourceAction, { list: results.body.items });
  }
}
export function* createCustomResource({ payload }) {
  const result = yield call(ApiK8s.createCustomResource, payload);
  if (!result.error) {
  }
}
export function* customResourceSaga() {
  yield takeEvery(FETCH_CUSTOM_RESOURCE, refreshCustomResource);
  yield takeEvery(CREATE_CUSTOM_RESOURCE, createCustomResource);
}
