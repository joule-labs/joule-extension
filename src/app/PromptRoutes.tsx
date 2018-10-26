import React from 'react';
import { Switch, Route, withRouter, RouteComponentProps } from 'react-router';
import Loader from 'components/Loader';
import AuthorizePrompt from 'prompts/authorize';
import PaymentPrompt from 'prompts/payment';
import InvoicePrompt from 'prompts/invoice';
import SignPrompt from 'prompts/sign';
import VerifyPrompt from 'prompts/verify';
import { getPromptType } from 'utils/prompt';


class Routes extends React.Component<RouteComponentProps> {
  componentWillMount() {
    const type = getPromptType();
    this.props.history.replace(`/${type}`);
  }

  render() {
    return (
      <Switch>
        <Route path="/" exact render={() => <Loader />} />
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

export default withRouter(Routes);