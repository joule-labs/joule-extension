import React from 'react';
import { connect } from 'react-redux';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router';
import { cryptoActions } from 'modules/crypto';
import { AppState } from 'store/reducers';
import './onboarding.less';
import Splash from 'components/Splash';
import SelectType from 'components/SelectNode/SelectType';
import InputAddress from 'components/SelectNode/InputAddress';
import UploadMacaroon from 'components/SelectNode/UploadMacaroons';
import BTCPayServer from 'components/SelectNode/BTCPayServer';
import ConfirmNode from 'components/SelectNode/ConfirmNode';
import CreatePassword from 'components/CreatePassword';
import LightningApp from 'components/SelectNode/LightningApp';

export enum PATH {
  SPLASH = '/onboarding',
  SELECT_NODE = '/onboarding/select-node',
  INPUT_ADDRESS = '/onboarding/input-address',
  LIGHTNING_APP = '/onboarding/lightning-app',
  BTCPAY_SERVER = '/onboarding/btcpay-server',
  UPLOAD_MACAROON = '/onboarding/upload-macaroon',
  CONFIRM_NODE = '/onboarding/confirm-node',
  PASSWORD = '/onboarding/password'
}

interface DispatchProps {
  generateSalt: typeof cryptoActions['generateSalt'];
}

type Props = DispatchProps & RouteComponentProps;

class OnboardingPage extends React.Component<Props, {}> {

  componentDidMount() {
    this.props.generateSalt();
  }

  render() {
    return (
      <div className="Onboarding-content">
        <Switch>
          <Route exact path={PATH.SPLASH} render={() => <Splash onComplete={() => this.nav(PATH.SELECT_NODE)}/>} />
          <Route exact path={PATH.SELECT_NODE} render={() => <SelectType onComplete={this.nav} />} />
          <Route exact path={PATH.INPUT_ADDRESS} render={() => <InputAddress onComplete={() => this.nav(PATH.UPLOAD_MACAROON)}/>} />
          <Route exact path={PATH.LIGHTNING_APP} render={() => <LightningApp onComplete={() => this.nav(PATH.UPLOAD_MACAROON)}/>} />
          <Route exact path={PATH.BTCPAY_SERVER} render={() => <BTCPayServer onComplete={() => this.nav(PATH.CONFIRM_NODE)}/>} />
          <Route exact path={PATH.UPLOAD_MACAROON} render={() => <UploadMacaroon onComplete={() => this.nav(PATH.CONFIRM_NODE)} />} />
          <Route exact path={PATH.CONFIRM_NODE} render={() => <ConfirmNode onComplete={() => this.nav(PATH.PASSWORD)} onCancel={() => this.nav(PATH.SPLASH)}/>} />
          <Route exact path={PATH.PASSWORD} render={() => <CreatePassword onComplete={() => this.props.history.replace('/home')} />} />
        </Switch>
      </div>
    );
  }

  nav = (link: string) => {
    this.props.history.push(link);
  }
}

const ConnectedOnboardingPage = connect<{}, DispatchProps, {}, AppState>(
  null,
  {
    generateSalt: cryptoActions.generateSalt
  }
)(OnboardingPage);

export default withRouter(ConnectedOnboardingPage);
