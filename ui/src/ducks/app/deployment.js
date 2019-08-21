import { call, select } from 'redux-saga/effects';

import * as ApiK8s from '../../services/k8s/api';

const DEPLOYMENT_VERSION_LABEL = 'metalk8s.scality.com/solution-version';
const DEPLOYMENT_NAME_LABEL = 'metalk8s.scality.com/solution-name';
const PART_OF_SOLUTION_LABEL = 'app.kubernetes.io/part-of';


// Sagas
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
