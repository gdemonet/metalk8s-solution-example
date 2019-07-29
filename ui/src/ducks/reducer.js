import { combineReducers } from 'redux';
import { reducer as oidcReducer } from 'redux-oidc';

import config from './config';
import layout from './app/layout';
import nodes from './app/nodes';

const rootReducer = combineReducers({
  config,
  app: combineReducers({
    layout,
    nodes
  }),
  oidc: oidcReducer
});

export default rootReducer;
