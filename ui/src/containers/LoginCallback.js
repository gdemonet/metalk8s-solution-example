import React from 'react';
import { connect } from 'react-redux';
import { CallbackComponent } from 'redux-oidc';
import userManager from '../utils/userManager';

class CallbackPage extends React.Component {
  render() {
    return (
      <CallbackComponent
        userManager={userManager}
        successCallback={user => {
          const path = (user.state && user.state.path) || '/';
          this.props.history.push(path);
        }}
        errorCallback={error => {
          this.props.history.push('/');
          console.error(error);
        }}
      >
        <div>Redirecting...</div>
      </CallbackComponent>
    );
  }
}

export default connect()(CallbackPage);
