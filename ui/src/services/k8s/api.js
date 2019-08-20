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
