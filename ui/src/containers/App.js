import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { IntlProvider, addLocaleData } from 'react-intl';
import locale_en from 'react-intl/locale-data/en';
import locale_fr from 'react-intl/locale-data/fr';
import '@fortawesome/fontawesome-free/css/all.css';
import { OidcProvider } from 'redux-oidc';

import translations_en from '../translations/en';
import translations_fr from '../translations/fr';

import Layout from './Layout';
import Loader from '../components/Loader';

import { fetchConfigAction } from '../ducks/config';
import { store } from '../index';

const messages = {
  en: translations_en,
  fr: translations_fr
};

addLocaleData([...locale_en, ...locale_fr]);

class App extends Component {
  componentDidMount() {
    document.title = messages[this.props.config.language].product_name;
    this.props.fetchConfig();
  }

  render() {
    const { language, api, theme, userManager } = this.props.config;

    return theme && api && userManager ? (
      <OidcProvider store={store} userManager={userManager}>
        <IntlProvider locale={language} messages={messages[language]}>
          <Layout />
        </IntlProvider>
      </OidcProvider>
    ) : (
      <Loader />
    );
  }
}

const mapStateToProps = state => ({
  config: state.config
});

const mapDispatchToProps = dispatch => {
  return {
    fetchConfig: () => dispatch(fetchConfigAction())
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
