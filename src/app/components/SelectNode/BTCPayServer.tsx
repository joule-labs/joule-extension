import React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Form, Input, Button, message } from 'antd';
import './BTCPayServer.less';

export interface BTCPayServerConfig {
  chainType: string;
  type: string;
  cryptoCode: string;
  uri: string;
  macaroon: string;
  readonlyMacaroon?: string;
}

interface Props {
  error?: Error | null;
  submitConfig(config: BTCPayServerConfig): void;
}

interface State {
  configData: string;
  isSubmitting: boolean;
}

export default class BTCPayServer extends React.Component<Props, State> {
  state: State = {
    configData: '',
    isSubmitting: false,
  };

  componentWillUpdate(nextProps: Props) {
    if (nextProps.error && this.props.error !== nextProps.error) {
      message.error(nextProps.error.message);
    }
  }

  render() {
    const { configData, isSubmitting } = this.state;
    const url = this.getConfigDataUrl(configData);
    const error = configData && !url ? 'Invalid config data' : undefined;

    return (
      <div className="BTCPayServer">
        <p>
          Follow these steps to connect your BTCPay Server to Joule. Your node must be
          fully synced in order to get connection details.
        </p>
        <ol className="BTCPayServer-steps">
          <li>Navigate to your BTCPayServer and log in as an admin</li>
          <li>Go to Server Settings &gt; Services &gt; LND Rest - See information</li>
          <li>Click "See QR Code information" and copy the QR Code data</li>
          <li>Paste the data below:</li>
        </ol>
        <Form
          className="BTCPayServer-form"
          onSubmit={this.handleSubmit}
          layout="vertical"
        >
          <Form.Item
            label="Connect data"
            help={error}
            validateStatus={error ? 'error' : url ? 'success' : undefined}
          >
            <Input
              size="large"
              value={configData}
              onChange={this.handleChange}
              placeholder="config=https://yourserver.lndyn.com/lndconfig/12345/lnd.config"
              autoFocus
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            disabled={!url}
            loading={isSubmitting}
            block
          >
            Submit
          </Button>
        </Form>
        <div className="BTCPayServer-help">
          Want to learn more about BTCPay Server?{' '}
          <a
            href="https://github.com/btcpayserver/btcpayserver"
            target="_blank"
            rel="noopener nofollow"
          >
            Click here
          </a>
          .
        </div>
      </div>
    );
  }

  private getConfigDataUrl(data: string) {
    const url = data.replace('config=', '');
    try {
      return new URL(url);
    } catch (err) {
      return false;
    }
  }

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ configData: ev.currentTarget.value });
  };

  private handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const url = this.getConfigDataUrl(this.state.configData);
    this.setState({ isSubmitting: true });

    if (url) {
      try {
        const accepted = await browser.permissions.request({
          origins: [`${url.origin}/`],
        });
        if (!accepted) {
          message.warn('Permission denied, connection may fail', 2);
        }
        const response = await fetch(url.href);
        const json = await response.json();
        const lndConfig = json.configurations.find((conf: BTCPayServerConfig) => {
          return conf.type === 'lnd-rest';
        });

        if (!lndConfig) {
          console.error('No LND configuration found in configurations:', json);
          message.error('No LND configuration found', 2);
        }
        this.props.submitConfig(lndConfig);
      } catch (err) {
        console.error(err);
        message.error('Failed to connect to BTCPay Server', 2);
      }
    } else {
      message.error('Invalid config data', 2);
    }

    this.setState({ isSubmitting: false });
  };
}
