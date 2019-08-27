import { call, put, takeEvery, select } from 'redux-saga/effects';

import * as ApiK8s from '../../services/k8s/api';
import history from '../../history';

const CREATE_DEPLOYMENT = 'CREATE_DEPLOYMENT';
const UPDATE_DEPLOYMENT = 'UPDATE_DEPLOYMENT';
const EDIT_DEPLOYMENT = 'EDIT_DEPLOYMENT';

export const DEPLOYMENT_VERSION_LABEL = 'app.kubernetes.io/version';
const DEPLOYMENT_NAME_LABEL = 'app.kubernetes.io/name';
export const PART_OF_SOLUTION_LABEL = 'app.kubernetes.io/part-of';

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

export const createDeploymentAction = () => {
  return { type: CREATE_DEPLOYMENT };
};

export const updateDeploymentAction = payload => {
  return { type: UPDATE_DEPLOYMENT, payload };
};

export const editDeploymentAction = payload => {
  return { type: EDIT_DEPLOYMENT, payload };
};

// Sagas
export function* fetchSolutionDeployments() {
  const results = yield call(ApiK8s.getSolutionDeployment);
  if (!results.error) {
    yield put(
      updateDeploymentAction({
        list: results.body.items.map(item => {
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
  return results;
}

export function* editDeployment(version, name, namespace) {
  const registry_prefix = yield select(
    state => state.config.api.registry_prefix
  );
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
              image: `${registry_prefix}/example-solution-${version}/example-solution-operator:${version}`,
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
  const result = yield call(ApiK8s.updateDeployment, body, namespace, name);
  if (!result.error) {
    yield call(history.push, `/customResource`);
  }
  return result;
}

export function* createDeployment(namespaces, operator_version) {
  const registry_prefix = yield select(
    state => state.config.api.registry_prefix
  );
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
  yield takeEvery(CREATE_DEPLOYMENT, createDeployment);
  yield takeEvery(EDIT_DEPLOYMENT, editDeployment);
}
