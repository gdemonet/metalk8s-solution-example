import React from 'react';
import { connect } from 'react-redux';
import { CallbackComponent } from 'redux-oidc';
import userManager from '../utils/userManager';
import { updateAPIConfigAction } from '../ducks/config';

class CallbackPage extends React.Component {
  render() {
    return (
      <CallbackComponent
        userManager={userManager}
        successCallback={user => {
          this.props.updateAPIConfig(user);
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

const mapDispatchToProps = dispatch => {
  return {
    updateAPIConfig: user => dispatch(updateAPIConfigAction(user))
  };
};

export default connect(
  null,
  mapDispatchToProps
)(CallbackPage);
