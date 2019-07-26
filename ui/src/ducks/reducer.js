import { combineReducers } from 'redux';
import { reducer as oidcReducer } from 'redux-oidc';

import config from './config';
import layout from './app/layout';

const rootReducer = combineReducers({
  config,
  app: combineReducers({
    layout
  }),
  oidc: oidcReducer
});

export default rootReducer;
