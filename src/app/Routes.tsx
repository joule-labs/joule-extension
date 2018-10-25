import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, withRouter, RouteComponentProps } from 'react-router';
import { AppState } from 'store/reducers';
import HomePage from 'pages/home';
import OnboardingPage from 'pages/onboarding';
// import PasswordPage from 'pages/password';
import SettingsPage from 'pages/settings';

interface StateProps {
  password: AppState['crypto']['password'];
  hasSetPassword: AppState['crypto']['hasSetPassword'];
}

type Props = StateProps & RouteComponentProps;

class Routes extends React.Component<Props> {
  componentWillMount() {
    this.redirectAsNeeded();
  }

  componentDidUpdate() {
    this.redirectAsNeeded();
  }

  render() {
    return (
      <Switch>
        <Route path="/" exact render={() => 'loading'} />
        <Route path="/home" exact component={HomePage} />
        <Route path="/onboarding" exact component={OnboardingPage} />
        {/* <Route path="/password" exact component={PasswordPage} /> */}
        <Route path="/settings" exact component={SettingsPage} />
        <Route path="/*" render={() => <h1>Oh shit howd you get here</h1>} />
      </Switch>
    );
  }

  private redirectAsNeeded() {
    const { hasSetPassword, history, location } = this.props;
    if (!hasSetPassword) {
      if (location.pathname !== '/onboarding') {
        history.replace('/onboarding');
      }
    } else if (location.pathname === '/') {
      history.replace('/home');
    }
  }
}

const ConnectedRoutes = connect<StateProps, {}, {}, AppState>(
  state => ({
    hasSetPassword: state.crypto.hasSetPassword,
    password: state.crypto.password,
  })
)(Routes);

export default withRouter(ConnectedRoutes);