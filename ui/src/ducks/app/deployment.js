import { call, put, takeEvery, select } from 'redux-saga/effects';

import * as ApiK8s from '../../services/k8s/api';
import history from '../../history';

// Constants
const LABEL_COMPONENT = 'app.kubernetes.io/component';
const LABEL_NAME = 'app.kubernetes.io/name';
export const LABEL_PART_OF = 'app.kubernetes.io/part-of';
const LABEL_VERSION = 'app.kubernetes.io/version';
const SOLUTION_NAME = 'example-solution';
const DEPLOYMENT_NAME = 'example-operator';
const OPERATOR_NAME = 'example-solution-operator';

const CREATE_DEPLOYMENT = 'CREATE_DEPLOYMENT';
const UPDATE_DEPLOYMENT = 'UPDATE_DEPLOYMENT';
const EDIT_DEPLOYMENT = 'EDIT_DEPLOYMENT';

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
  const result = yield call(ApiK8s.getSolutionDeployment);

  if (!result.error) {
    const deployments = result.body.items.filter(
      item => item.metadata.name === DEPLOYMENT_NAME
    );

    const flattenedItems = deployments.map(item => ({
      name: item.metadata.name,
      namespace: item.metadata.namespace,
      image: item.spec.template.spec.containers['0'].image,
      version:
        (item.metadata.labels && item.metadata.labels[LABEL_VERSION]) || ''
    }));

    yield put(updateDeploymentAction({ list: flattenedItems }));
  }
  return result;
}

export function* editDeployment(version, name, namespace) {
  const registry_prefix = yield select(
    state => state.config.api.registry_prefix
  );

  const body = operatorDeployment(registry_prefix, version);
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

  const body = operatorDeployment(registry_prefix, operator_version);
  const result = yield call(
    ApiK8s.createNamespacedDeployment,
    namespaces,
    body
  );
  return result;
}

// Helpers
const operatorImage = (registryPrefix, version) =>
  `${registryPrefix}/${SOLUTION_NAME}-${version}/example-solution-operator:${version}`;

const operatorLabels = version => ({
  app: DEPLOYMENT_NAME,
  [LABEL_NAME]: DEPLOYMENT_NAME,
  [LABEL_VERSION]: version,
  [LABEL_COMPONENT]: 'operator',
  [LABEL_PART_OF]: SOLUTION_NAME
});

const operatorDeployment = (registryPrefix, version) => ({
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {
    name: DEPLOYMENT_NAME,
    labels: operatorLabels(version)
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        name: OPERATOR_NAME
      }
    },
    template: {
      metadata: {
        labels: {
          name: OPERATOR_NAME
        }
      },
      spec: {
        serviceAccountName: DEPLOYMENT_NAME,
        containers: [
          {
            name: OPERATOR_NAME,
            image: operatorImage(registryPrefix, version),
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
                value: OPERATOR_NAME
              },
              {
                name: 'REGISTRY_PREFIX',
                value: registryPrefix
              }
            ]
          }
        ]
      }
    }
  }
});

export function* deploymentSaga() {
  yield takeEvery(CREATE_DEPLOYMENT, createDeployment);
  yield takeEvery(EDIT_DEPLOYMENT, editDeployment);
}
