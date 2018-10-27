import React from 'react';
import { Button } from 'antd';
import './style.less';

interface Props {
  handleContinue(): void;
  handleRestore(): void;
}

export default class Splash extends React.Component<Props> {
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
            <Button block size="large" type="primary" onClick={this.props.handleContinue}>
              Get started
            </Button>
            <a className="Splash-controls-restore" onClick={this.props.handleRestore}>
              Restore backup
            </a>
          </div>
        </div>
      </div>
    );
  }
}
