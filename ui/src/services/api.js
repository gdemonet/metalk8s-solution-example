import ApiClient from './ApiClient';

let apiClient = null;
//Basic Auth
export async function authenticate(token, api_server) {
  try {
    // const response = await axios.get(api_server.url, {
    //   headers: {
    //     Authorization: 'Basic ' + token
    //   }
    // });
    // return response;
    return { token }; // TO BE REMOVED
  } catch (error) {
    return { error };
  }
}

export const logout = () => {
  localStorage.removeItem('token');
};

export function initialize(apiUrl) {
  apiClient = new ApiClient({ apiUrl });
}

export function fetchTheme() {
  return apiClient.get('/brand/theme.json');
}

export function fetchConfig() {
  return apiClient.get('/config.json');
}
