import ApiClient from '../ApiClient';
import {
  Config,
  CoreV1Api,
  CustomObjectsApi,
  AppsV1Api
} from '@kubernetes/client-node';

let config;
let coreV1;
let customObjects;
let k8sApiClient = null;
let appsV1Api;

export function initialize(apiUrl) {
  k8sApiClient = new ApiClient({ apiUrl });
}

//Basic Auth
export function authenticate(token) {
  return k8sApiClient.get('/api/v1', null, {
    headers: {
      Authorization: 'Basic ' + token
    }
  });
}

export const updateApiServerConfig = (url, token) => {
  config = new Config(url, token, 'Basic');
  coreV1 = config.makeApiClient(CoreV1Api);
  customObjects = config.makeApiClient(CustomObjectsApi);
  appsV1Api = config.makeApiClient(AppsV1Api);
};

export async function getCustomResource() {
  try {
    // We want to change this hardcoded data later
    return await customObjects.listClusterCustomObject(
      'solution.com',
      'v1alpha1',
      'examples'
    );
  } catch (error) {
    return { error };
  }
}

export async function createCustomResource(body, namespaces) {
  try {
    return await customObjects.createNamespacedCustomObject(
      'solution.com',
      'v1alpha1',
      namespaces,
      'examples',
      body
    );
  } catch (error) {
    return { error };
  }
}

export async function updateCustomResource(body, namespaces, name) {
  try {
    return await customObjects.patchNamespacedCustomObject(
      'solution.com',
      'v1alpha1',
      namespaces,
      'examples',
      name,
      body,
      {
        headers: {
          'Content-Type': 'application/merge-patch+json'
        }
      }
    );
  } catch (error) {
    return { error };
  }
}

export async function updateDeployement(body, namespaces, name) {
  try {
    return await customObjects.patchNamespacedCustomObject(
      'solution.com',
      'v1alpha1',
      namespaces,
      'examples',
      name,
      body,
      {
        headers: {
          'Content-Type': 'application/merge-patch+json'
        }
      }
    );
  } catch (error) {
    return { error };
  }
}

export async function createNamespace(body) {
  try {
    return await coreV1.createNamespace(body);
  } catch (error) {
    return { error };
  }
}

export async function getNamespaces() {
  try {
    return await coreV1.listNamespace();
  } catch (error) {
    return { error };
  }
}

export async function getDeploymentForAllNamespaces() {
  try {
    return await appsV1Api.listDeploymentForAllNamespaces();
  } catch (error) {
    return { error };
  }
}

export async function createNamespacedDeployment(namespaces, body) {
  try {
    return await appsV1Api.createNamespacedDeployment(namespaces, body);
  } catch (error) {
    return { error };
  }
}
