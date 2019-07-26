import { combineReducers } from 'redux';

import config from './config';
import login from './login';
import layout from './app/layout';

const rootReducer = combineReducers({
  config,
  login,
  app: combineReducers({
    layout
  })
});

export default rootReducer;
