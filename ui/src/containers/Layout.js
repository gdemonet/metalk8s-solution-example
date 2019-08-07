import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { ThemeProvider } from 'styled-components';
import { matchPath } from 'react-router';
import { Layout as CoreUILayout, Notifications } from '@scality/core-ui';
import { withRouter, Switch } from 'react-router-dom';

import { removeNotificationAction } from '../ducks/app/notifications';
import CustomResource from './CustomResource';
import NamespacesCreateForm from './NamespacesCreation';
import CustomresourceCreation from './CustomresourceCreation';
import CustomresourceEdit from './CustomresourceEdit';
import DeployementEdit from './DeployementEdit';
import { fetchCustomResourceAction } from '../ducks/app/customResource';
import { fetchNamespacesAction } from '../ducks/app/namespaces';
import { fetchDeployementAction } from '../ducks/app/deployment';

import Welcome from '../components/Welcome';
import PrivateRoute from './PrivateRoute';
import { logoutAction } from '../ducks/login';
import { toggleSidebarAction } from '../ducks/app/layout';

class Layout extends Component {
  componentDidMount() {
    this.props.fetchNamespaces();
    this.props.fetchCustomResource();
    this.props.fetchDeployement();

    this.interval = setInterval(() => {
      this.props.fetchCustomResource();
      this.props.fetchDeployement();
    }, 15000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
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

    const user = {
      name: this.props.user && this.props.user.username,
      actions: [
        { label: this.props.intl.messages.log_out, onClick: this.props.logout }
      ]
    };

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

    const navbar = {
      onToggleClick: this.props.toggleSidebar,
      toggleVisible: true,
      productName: this.props.intl.messages.product_name,
      applications,
      help,
      user: this.props.user && user,
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
          <Notifications
            notifications={this.props.notifications}
            onDismiss={this.props.removeNotification}
          />
          <Switch>
            <PrivateRoute exact path="/about" component={Welcome} />
            <PrivateRoute
              exact
              path="/customResource"
              component={CustomResource}
            />
            <PrivateRoute
              exact
              path="/customResource/:id/edit"
              component={CustomresourceEdit}
            />
            <PrivateRoute
              exact
              path="/deployment/:id/edit"
              component={DeployementEdit}
            />
            <PrivateRoute
              exact
              path="/customResource/create"
              component={CustomresourceCreation}
            />
            <PrivateRoute
              exact
              path="/namespaces/create"
              component={NamespacesCreateForm}
            />
            <PrivateRoute exact path="/" component={CustomResource} />
          </Switch>
        </CoreUILayout>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  user: state.login.user,
  sidebar: state.app.layout.sidebar,
  theme: state.config.theme,
  notifications: state.app.notifications.list
});

const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(logoutAction()),
    toggleSidebar: () => dispatch(toggleSidebarAction()),
    fetchNamespaces: () => dispatch(fetchNamespacesAction()),
    fetchCustomResource: () => dispatch(fetchCustomResourceAction()),
    fetchDeployement: () => dispatch(fetchDeployementAction()),
    removeNotification: uid => dispatch(removeNotificationAction(uid))
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
