import { call, put, takeEvery, select } from 'redux-saga/effects';
import { mergeTheme } from '@scality/core-ui/dist/utils';
import * as defaultTheme from '@scality/core-ui/dist/style/theme';
import { loadUser, createUserManager } from 'redux-oidc';

import * as Api from '../services/api';
import * as ApiK8s from '../services/k8s/api';
import { store } from '../index';

// Actions
const SET_LANG = 'SET_LANG';
export const SET_THEME = 'SET_THEME';
const FETCH_THEME = 'FETCH_THEME';
const FETCH_CONFIG = 'FETCH_CONFIG';
export const SET_API_CONFIG = 'SET_API_CONFIG';

export const UPDATE_API_CONFIG = 'UPDATE_API_CONFIG';
const SET_USER_MANAGER_CONFIG = 'SET_USER_MANAGER_CONFIG';
const SET_USER_MANAGER = 'SET_USER_MANAGER';

// Reducer
const defaultState = {
  language: 'en',
  theme: {},
  api: null,
  userManagerConfig: {
    client_id: 'kubernetes',
    redirect_uri: 'http://localhost:8000/callback',
    response_type: 'id_token',
    scope: 'openid profile email offline_access',
    authority: '',
    loadUserInfo: false,
    post_logout_redirect_uri: '/'
  },
  userManager: null
};

export default function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case SET_LANG:
      return { ...state, language: action.payload };
    case SET_THEME:
      return { ...state, theme: action.payload };
    case SET_API_CONFIG:
      return { ...state, api: action.payload };
    case SET_USER_MANAGER_CONFIG:
      return {
        ...state,
        userManagerConfig: {
          ...state.userManagerConfig,
          authority: action.payload
        }
      };
    case SET_USER_MANAGER:
      return { ...state, userManager: action.payload };
    default:
      return state;
  }
}

// Action Creators
export function setLanguageAction(newLang) {
  return { type: SET_LANG, payload: newLang };
}

export function setThemeAction(theme) {
  return { type: SET_THEME, payload: theme };
}

export function fetchThemeAction() {
  return { type: FETCH_THEME };
}

export function fetchConfigAction() {
  return { type: FETCH_CONFIG };
}

export function setApiConfigAction(conf) {
  return { type: SET_API_CONFIG, payload: conf };
}

export function setUserManagerConfigAction(conf) {
  return { type: SET_USER_MANAGER_CONFIG, payload: conf };
}

export function setUserManagerAction(conf) {
  return { type: SET_USER_MANAGER, payload: conf };
}

export function updateAPIConfigAction(payload) {
  return { type: UPDATE_API_CONFIG, payload };
}

// Sagas
export function* fetchTheme() {
  const result = yield call(Api.fetchTheme);
  if (!result.error) {
    result.brand = mergeTheme(result, defaultTheme);
    yield put(setThemeAction(result));
  }
}

export function* fetchConfig() {
  yield call(Api.initialize, process.env.PUBLIC_URL);
  const result = yield call(Api.fetchConfig);
  if (!result.error && result.oidc_provider_url) {
    yield put(setUserManagerConfigAction(result.oidc_provider_url));
    const userManagerConfig = yield select(
      state => state.config.userManagerConfig
    );
    yield put(setUserManagerAction(createUserManager(userManagerConfig)));
    const userManager = yield select(state => state.config.userManager);
    yield call(loadUser, store, userManager);
    yield call(fetchTheme);
    yield put(setApiConfigAction(result));
  }
}

export function* updateApiServerConfig({ payload }) {
  const api = yield select(state => state.config.api);
  yield call(
    ApiK8s.updateApiServerConfig,
    api.url,
    payload.id_token,
    payload.token_type
  );
}

export function* configSaga() {
  yield takeEvery(FETCH_THEME, fetchTheme);
  yield takeEvery(FETCH_CONFIG, fetchConfig);
  yield takeEvery(UPDATE_API_CONFIG, updateApiServerConfig);
}
