import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import Exception from 'ant-design-pro/lib/Exception';
import { AppState } from 'store/reducers';
import HomePage from 'pages/home';
import OnboardingPage from 'pages/onboarding';
// import PasswordPage from 'pages/password';
import SettingsPage from 'pages/settings';
import Template from 'components/Template';

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
      <Template>
        <Switch>
          <Route path="/" exact render={() => 'loading'} />
          <Route path="/home" exact component={HomePage} />
          <Route path="/onboarding" exact component={OnboardingPage} />
          {/* <Route path="/password" exact component={PasswordPage} /> */}
          <Route path="/settings" exact component={SettingsPage} />
          <Route path="/*" render={() => (
            <Exception
              type="404"
              title="You look lost"
              desc="We're not sure how you got here, but there's nothing good here!"
              actions={(
                <div>
                  <Link to="/home">
                    <Button type="primary" size="large">Back to home</Button>
                  </Link>
                  <a
                    href="https://github.com/wbobeirne/joule-extension/issues"
                    target="_blank"
                    rel="noopener nofollow"
                  >
                    <Button size="large">Report an issue</Button>
                  </a>
                </div>
              )}
            />
          )} />
        </Switch>
      </Template>
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