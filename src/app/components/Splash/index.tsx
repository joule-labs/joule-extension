import React from 'react';
import { Button } from 'antd';
import { browser } from 'webextension-polyfill-ts';
import './style.less';
import { RouteComponentProps, withRouter } from 'react-router-dom';

class Splash extends React.Component<RouteComponentProps> {
  componentDidMount() {
    if (process.env.APP_CONTAINER !== 'page') {
      browser.runtime.openOptionsPage().then(window.close);
    }
  }

  render() {
    return (
      <div className="Splash">
        <div className="Splash-inner">
          <h2>Joule</h2>
          <h3>Lightning-charge your browser</h3>
          {/* <Logo /> */}
          <ul>
            <li>Send payments in-browser</li>
            <li>Manage channels & transactions</li>
            <li>Auth with a decentralized identity</li>
          </ul>
          <div className="Splash-controls">
            <Button block size="large" type="primary"
                    onClick={this.navForward}>
              Get started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  private navForward = () => {
    this.props.history.push('/onboarding-node');
  };
}

export default withRouter(Splash);
