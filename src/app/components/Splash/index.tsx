import React from 'react';
import { Button } from 'antd';
import { browser } from 'webextension-polyfill-ts';
import { getAppContainer } from 'utils/globals';
import './style.less';

interface Props {
  handleContinue(): void;
}

export default class Splash extends React.Component<Props> {
  componentDidMount() {
    if (getAppContainer() === 'page') {
      browser.storage.local.get('skipSplash').then(value => {
        if (value && value.skipSplash) {
          browser.storage.local.remove('skipSplash').then(() => {
            this.handleContinue();
          });
        }
      });
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
            <Button block size="large" type="primary" onClick={this.handleContinue}>
              Get started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  private handleContinue = () => {
    if (getAppContainer() === 'page') {
      this.props.handleContinue();
    } else {
      browser.storage.local.set({ skipSplash: true }).then(() => {
        browser.runtime.openOptionsPage();
        setTimeout(window.close, 100);
      });
    }
  };
}
