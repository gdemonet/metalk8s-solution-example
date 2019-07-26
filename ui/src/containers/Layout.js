import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { ThemeProvider } from 'styled-components';
import { matchPath } from 'react-router';
import { Layout as CoreUILayout } from '@scality/core-ui';
import { withRouter, Switch, Route } from 'react-router-dom';

import Welcome from '../components/Welcome';
import PrivateRoute from './PrivateRoute';
import { toggleSidebarAction } from '../ducks/app/layout';
import CallbackPage from './LoginCallback';
import userManager from '../utils/userManager';

class Layout extends Component {
  logout(event) {
    event.preventDefault();
    userManager.removeUser(); // removes the user data from sessionStorage
  }

  render() {
    const applications = [];

    const help = [
      {
        label: this.props.intl.messages.about,
        onClick: () => {
          this.props.history.push('/about');
        }
      }
    ];

    const sidebar = {
      expanded: this.props.sidebar.expanded,
      actions: [
        {
          label: this.props.intl.messages.nodes,
          icon: <i className="fas fa-server" />,
          onClick: () => {
            this.props.history.push('/');
          },
          active: matchPath(this.props.history.location.pathname, {
            path: '/',
            exact: true,
            strict: true
          })
        }
      ]
    };

    const user = {
      name:
        this.props.user &&
        this.props.user.profile &&
        this.props.user.profile.name + ' ' + this.props.user.profile.email,
      actions: [
        { label: this.props.intl.messages.log_out, onClick: this.logout }
      ]
    };

    const navbar = {
      onToggleClick: this.props.toggleSidebar,
      toggleVisible: true,
      productName: this.props.intl.messages.product_name,
      applications,
      help,
      user: this.props.user ? user : null,
      logo: (
        <img
          alt="logo"
          src={process.env.PUBLIC_URL + '/brand/assets/branding.svg'}
        />
      )
    };

    return (
      <ThemeProvider theme={this.props.theme}>
        <CoreUILayout sidebar={sidebar} navbar={navbar}>
          <Switch>
            <PrivateRoute exact path="/about" component={Welcome} />
            <PrivateRoute exact path="/" component={Welcome} />
            <Route exact path="/callback" component={CallbackPage} />
          </Switch>
        </CoreUILayout>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  user: state.oidc.user,
  sidebar: state.app.layout.sidebar,
  theme: state.config.theme
});

const mapDispatchToProps = dispatch => {
  return {
    toggleSidebar: () => dispatch(toggleSidebarAction())
  };
};

export default injectIntl(
  withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(Layout)
  )
);
