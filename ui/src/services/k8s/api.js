import ApiClient from '../ApiClient';
import { Config, CoreV1Api, CustomObjectsApi } from '@kubernetes/client-node';

let config;
let coreV1;
let customObjects;
let k8sApiClient = null;

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
