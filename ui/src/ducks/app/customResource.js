import { call, put, takeEvery, select } from 'redux-saga/effects';

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
  const { name, namespaces, ...rest } = payload;
  const body = {
    apiVersion: 'solution.com/v1alpha1',
    kind: 'Example',
    metadata: {
      name: name
    },
    spec: {
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
  const { name, namespaces, ...rest } = payload;
  const body = {
    apiVersion: 'solution.com/v1alpha1',
    kind: 'Example',
    metadata: {
      name: name
    },
    spec: {
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

export function* createDeployment(namespaces, operator_version) {
  const registry_prefix = yield select(state => state.config.registry_prefix);
  const body = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'example-operator'
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          name: 'example-operator'
        }
      },
      template: {
        metadata: {
          labels: {
            name: 'example-operator'
          }
        },
        spec: {
          serviceAccountName: 'example-operator',
          containers: [
            {
              name: 'example-operator',
              image: `${registry_prefix}/example-solution-operator:${operator_version}`,
              command: ['example-operator'],
              imagePullPolicy: 'Always',
              env: [
                {
                  name: 'WATCH_NAMESPACE',
                  valueFrom: {
                    fieldRef: {
                      fieldPath: 'metadata.namespace'
                    }
                  }
                },
                {
                  name: 'POD_NAME',
                  valueFrom: {
                    fieldRef: {
                      fieldPath: 'metadata.name'
                    }
                  }
                },
                {
                  name: 'OPERATOR_NAME',
                  value: 'example-operator'
                }
              ]
            }
          ]
        }
      }
    }
  };
  const result = yield call(
    ApiK8s.createNamespacedDeployment,
    namespaces,
    body
  );
  return result;
}

export function* customResourceSaga() {
  yield takeEvery(FETCH_CUSTOM_RESOURCE, refreshCustomResource);
  yield takeEvery(CREATE_CUSTOM_RESOURCE, createCustomResource);
  yield takeEvery(EDIT_CUSTOM_RESOURCE, editCustomResource);
}
