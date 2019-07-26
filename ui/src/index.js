import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { Router } from 'react-router-dom';
import createSagaMiddleware from 'redux-saga';
import { OidcProvider, loadUser } from 'redux-oidc';

import './index.css';
import App from './containers/App';
import * as serviceWorker from './serviceWorker';
import reducer from './ducks/reducer';
import sagas from './ducks/sagas';
import history from './history';
import userManager from './utils/userManager';

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const sagaMiddleware = createSagaMiddleware();
const enhancer = composeEnhancers(applyMiddleware(sagaMiddleware));
const store = createStore(reducer, enhancer);

sagaMiddleware.run(sagas);

loadUser(store, userManager);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <OidcProvider store={store} userManager={userManager}>
        <App />
      </OidcProvider>
    </Router>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
