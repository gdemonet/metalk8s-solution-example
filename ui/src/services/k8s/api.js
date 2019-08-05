import ApiClient from '../ApiClient';
import { Config, Core_v1Api, Custom_objectsApi } from '@kubernetes/client-node';

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
  coreV1 = config.makeApiClient(Core_v1Api);
  customObjects = config.makeApiClient(Custom_objectsApi);
};

export async function getCustomResource() {
  try {
    // We want to change this hardcoded data later
    return await customObjects.listClusterCustomObject(
      'example.solution.com',
      'v1alpha1',
      'examples'
    );
  } catch (error) {
    return { error };
  }
}

export async function createCustomResource(body) {
  try {
    return await customObjects.createClusterCustomObject(
      'example.solution.com',
      'v1alpha1',
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
