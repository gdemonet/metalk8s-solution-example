import { call, put, takeEvery, select } from 'redux-saga/effects';

import * as ApiK8s from '../../services/k8s/api';
import history from '../../history';

// Constants
const LABEL_COMPONENT = 'app.kubernetes.io/component';
const LABEL_NAME = 'app.kubernetes.io/name';
const LABEL_PART_OF = 'app.kubernetes.io/part-of';
const LABEL_VERSION = 'app.kubernetes.io/version';
const SOLUTION_NAME = 'example-solution';
const DEPLOYMENT_NAME = 'example-operator';
const OPERATOR_NAME = 'example-solution-operator';

// Actions
const FETCH_DEPLOYMENT = 'FETCH_DEPLOYMENT';
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
  const result = yield call(ApiK8s.getDeploymentForAllNamespaces);

  if (!result.error) {
    const deployments = result.body.items.filter(
      item =>
        item.metadata.labels &&
        item.metadata.labels[LABEL_PART_OF] === SOLUTION_NAME
    );

    const flattenedItems = deployments.map(item => ({
      name: item.metadata.name,
      namespace: item.metadata.namespace,
      image: item.spec.template.spec.containers['0'].image,
      version:
        (item.metadata.labels && item.metadata.labels[LABEL_VERSION]) || ''
    }));

    yield put(updateDeployementAction({ list: flattenedItems }));
  }
}

export function* editDeployement({ payload }) {
  const registry_prefix = yield select(state => state.config.registry_prefix);
  const { version, name, namespace } = payload;
  const body = operatorDeployment(registry_prefix, version);
  const result = yield call(ApiK8s.updateDeployement, body, namespace, name);
  if (!result.error) {
    yield call(refreshDeployements);
    yield call(history.push, `/customResource`);
  }
}

export function* createDeployment(namespaces, operator_version) {
  const registry_prefix = yield select(state => state.config.registry_prefix);
  const body = operatorDeployment(registry_prefix, operator_version);
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
      serviceAccountName: DEPLOYMENT_NAME,
      spec: {
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
