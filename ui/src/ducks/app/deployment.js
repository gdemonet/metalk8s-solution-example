import { call, put, takeEvery, select } from 'redux-saga/effects';

import * as ApiK8s from '../../services/k8s/api';
import history from '../../history';

// Actions
const FETCH_DEPLOYMENT = 'FETCH_DEPLOYMENT';
const UPDATE_DEPLOYMENT = 'UPDATE_DEPLOYMENT';
const EDIT_DEPLOYMENT = 'EDIT_DEPLOYMENT';
const DEPLOYMENT_VERSION_LABEL = 'metalk8s.scality.com/solution-version';
const DEPLOYMENT_NAME_LABEL = 'metalk8s.scality.com/solution-name';
const PART_OF_SOLUTION_LABEL = 'app.kubernetes.io/part-of';

// Reducer
const defaultState = {
  list: []
};

export default function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case UPDATE_DEPLOYMENT:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Action Creators
export const fetchDeployementAction = () => {
  return { type: FETCH_DEPLOYMENT };
};

export const updateDeployementAction = payload => {
  return { type: UPDATE_DEPLOYMENT, payload };
};

export const editDeployementAction = payload => {
  return { type: EDIT_DEPLOYMENT, payload };
};

// Sagas
export function* refreshDeployements() {
  const results = yield call(ApiK8s.getDeploymentForAllNamespaces);
  if (!results.error) {
    yield put(
      updateDeployementAction({
        list: results.body.items
          .filter(
            item =>
              item.metadata.labels &&
              item.metadata.labels[PART_OF_SOLUTION_LABEL] ===
                'example-solution'
          )
          .map(item => {
            return {
              name: item.metadata.name,
              namespace: item.metadata.namespace,
              image: item.spec.template.spec.containers['0'].image,
              version:
                (item.metadata.labels &&
                  item.metadata.labels[DEPLOYMENT_VERSION_LABEL]) ||
                ''
            };
          })
      })
    );
  }
}

export function* editDeployement({ payload }) {
  const registry_prefix = yield select(state => state.config.registry_prefix);
  const { version, name, namespace } = payload;
  const body = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: name,
      labels: {
        [DEPLOYMENT_VERSION_LABEL]: version
      }
    },
    spec: {
      template: {
        spec: {
          containers: [
            {
              name: 'example-operator',
              image: `${registry_prefix}/example-solution-operator:${version}`,
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
                },
                {
                  name: 'REGISTRY_PREFIX',
                  value: `${registry_prefix}`
                }
              ]
            }
          ]
        }
      }
    }
  };
  const result = yield call(ApiK8s.updateDeployement, body, namespace, name);
  if (!result.error) {
    yield call(refreshDeployements);
    yield call(history.push, `/customResource`);
  }
}

export function* createDeployment(namespaces, operator_version) {
  const registry_prefix = yield select(state => state.config.registry_prefix);
  const body = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'example-operator',
      labels: {
        [DEPLOYMENT_VERSION_LABEL]: operator_version,
        [DEPLOYMENT_NAME_LABEL]: 'ExampleSolution',
        [PART_OF_SOLUTION_LABEL]: 'example-solution'
      }
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
              image: `${registry_prefix}/example-solution-${version}/example-solution-operator:${operator_version}`,
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
                },
                {
                  name: 'REGISTRY_PREFIX',
                  value: `${registry_prefix}`
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

export function* deploymentSaga() {
  yield takeEvery(FETCH_DEPLOYMENT, refreshDeployements);
  yield takeEvery(EDIT_DEPLOYMENT, editDeployement);
}
