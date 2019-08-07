import { combineReducers } from 'redux';

import config from './config';
import login from './login';
import layout from './app/layout';
import customResource from './app/customResource';
import namespaces from './app/namespaces';
import notifications from './app/notifications';

const rootReducer = combineReducers({
  config,
  login,
  app: combineReducers({
    layout,
    customResource,
    namespaces,
    notifications
  })
});

export default rootReducer;
