import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, withRouter, RouteComponentProps } from 'react-router';
import { hot } from 'react-hot-loader/root';
import Loader from 'components/Loader';
import OnboardingPrompt from 'prompts/onboarding';
import AuthorizePrompt from 'prompts/authorize';
import PaymentPrompt from 'prompts/payment';
import InvoicePrompt from 'prompts/invoice';
import SignPrompt from 'prompts/sign';
import VerifyPrompt from 'prompts/verify';
import { getPromptType } from 'utils/prompt';
import { AppState } from 'store/reducers';

interface StateProps {
  hasSetPassword: AppState['crypto']['hasSetPassword'];
}

type Props = StateProps & RouteComponentProps;

class Routes extends React.Component<Props> {
  componentWillMount() {
    const { hasSetPassword, history, location } = this.props;
    if (!hasSetPassword) {
      if (location.pathname !== '/onboarding') {
        history.replace('/onboarding');
        return;
      }
    }

    const type = getPromptType();
    this.props.history.replace(`/${type}`);
  }

  render() {
    return (
      <Switch>
        <Route path="/" exact render={() => <Loader />} />
        <Route path="/onboarding" exact component={OnboardingPrompt} />
        <Route path="/authorize" exact component={AuthorizePrompt} />
        <Route path="/payment" exact component={PaymentPrompt} />
        <Route path="/invoice" exact component={InvoicePrompt} />
        <Route path="/sign" exact component={SignPrompt} />
        <Route path="/verify" exact component={VerifyPrompt} />
        <Route path="/*" render={() => <h1>How'd you get here you sneaky beast</h1>} />
      </Switch>
    );
  }
}

const ConnectedRoutes = connect<StateProps, {}, {}, AppState>(
  state => ({
    hasSetPassword: state.crypto.hasSetPassword,
  }),
)(Routes);

export default withRouter(hot(ConnectedRoutes));