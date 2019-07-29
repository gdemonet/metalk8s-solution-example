import { Config, Core_v1Api } from '@kubernetes/client-node';

let config, coreV1;

export const updateApiServerConfig = (url, id_token, token_type) => {
  config = new Config(url, id_token, token_type);
  coreV1 = config.makeApiClient(Core_v1Api);
};

export async function getNodes() {
  try {
    return await coreV1.listNode();
  } catch (error) {
    return { error };
  }
}
