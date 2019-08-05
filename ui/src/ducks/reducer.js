import { combineReducers } from 'redux';

import config from './config';
import login from './login';
import layout from './app/layout';
import customResource from './app/customResource';
import namespaces from './app/namespaces';

const rootReducer = combineReducers({
  config,
  login,
  app: combineReducers({
    layout,
    customResource,
    namespaces
  })
});

export default rootReducer;
