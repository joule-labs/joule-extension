import React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import EnterPassword from 'components/EnterPassword';
import { AppState } from 'store/reducers';
import './password.less';

interface StateProps {
  password: AppState['crypto']['password'];
}

type Props = StateProps & RouteComponentProps;

class PasswordPage extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    if (prevProps.password !== this.props.password) {
      this.props.history.replace('/');
    }
  }

  render() {
    return (
      <div className="PasswordPage">
        <div className="PasswordPage-logo">
          {/* <Logo /> */}
        </div>
        <EnterPassword />
      </div>
    );
  }
}

const ConnectedPasswordPage = connect<StateProps, {}, {}, AppState>(
  state => ({
    password: state.crypto.password,
  }),
)(PasswordPage);

export default withRouter(ConnectedPasswordPage);