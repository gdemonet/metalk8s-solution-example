import * as ApiK8s from '../../services/k8s/api';
import { call, put, takeEvery } from 'redux-saga/effects';

// Actions
const FETCH_NODES = 'FETCH_NODES';
const UPDATE_NODES = 'UPDATE_NODES';

// Reducer
const defaultState = {
  list: []
};

export default function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case UPDATE_NODES:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Action Creators
export const fetchNodesAction = () => {
  return { type: FETCH_NODES };
};

export const updateNodesAction = payload => {
  return { type: UPDATE_NODES, payload };
};

export function* fetchNodes() {
  const results = yield call(ApiK8s.getNodes);
  if (!results.error) {
    yield put(
      updateNodesAction({
        list: results.body.items.map(node => ({
          name: node.metadata.name,
          cpu: node.status.capacity.cpu,
          memory: node.status.capacity.memory,
          pods: node.status.capacity.pods
        }))
      })
    );
  }
}

export function* nodesSaga() {
  yield takeEvery(FETCH_NODES, fetchNodes);
}
