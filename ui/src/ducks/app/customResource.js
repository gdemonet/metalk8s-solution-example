import { call, put, takeEvery } from 'redux-saga/effects';

import * as ApiK8s from '../../services/k8s/api';
import history from '../../history';

// Actions
const FETCH_CUSTOM_RESOURCE = 'FETCH_CUSTOM_RESOURCE';
const CREATE_CUSTOM_RESOURCE = 'CREATE_CUSTOM_RESOURCE';

const UPDATE_CUSTOM_RESOURCE = 'UPDATE_CUSTOM_RESOURCE';
const EDIT_CUSTOM_RESOURCE = 'EDIT_CUSTOM_RESOURCE';

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

export const editCustomResourceAction = payload => {
  return { type: EDIT_CUSTOM_RESOURCE, payload };
};

export const createCustomresourceAction = payload => {
  return { type: CREATE_CUSTOM_RESOURCE, payload };
};

// Sagas
export function* refreshCustomResource() {
  //yield call(ApiK8s.getNamespacedDeployment);
  const results = yield call(ApiK8s.getCustomResource);
  if (!results.error) {
    yield put(
      updateCustomResourceAction({
        list: results.body.items.map(cr => {
          return {
            name: cr.metadata.name,
            namespace: cr.metadata.namespace,
            replicas: cr.spec.replicas,
            version: cr.spec.version
          };
        })
      })
    );
  }
}
export function* createCustomResource({ payload }) {
  const { name, namespaces, replicas, ...rest } = payload;
  const body = {
    apiVersion: 'solution.com/v1alpha1',
    kind: 'Example',
    metadata: {
      name: name
    },
    spec: {
      replicas: parseInt(replicas, 10),
      ...rest
    }
  };
  const result = yield call(ApiK8s.createCustomResource, body, namespaces);
  if (!result.error) {
    yield call(refreshCustomResource);
    yield call(history.push, `/customResource`);
  }
}
export function* editCustomResource({ payload }) {
  const { name, namespaces, replicas, ...rest } = payload;
  const body = {
    apiVersion: 'solution.com/v1alpha1',
    kind: 'Example',
    metadata: {
      name: name
    },
    spec: {
      replicas: parseInt(replicas, 10),
      ...rest
    }
  };
  const result = yield call(
    ApiK8s.updateCustomResource,
    body,
    namespaces,
    name
  );
  if (!result.error) {
    yield call(refreshCustomResource);
    yield call(history.push, `/customResource`);
  }
}

export function* customResourceSaga() {
  yield takeEvery(FETCH_CUSTOM_RESOURCE, refreshCustomResource);
  yield takeEvery(CREATE_CUSTOM_RESOURCE, createCustomResource);
  yield takeEvery(EDIT_CUSTOM_RESOURCE, editCustomResource);
}
