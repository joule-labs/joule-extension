import React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Form, Input, Button, Alert, message } from 'antd';
import './InputAddress.less';

interface Props {
  initialUrl?: string;
  error: Error | null;
  isCheckingNode?: boolean;
  submitUrl(url: string): void;
}

interface State {
  url: string;
  submittedUrl: string;
  validation: string;
}

export default class InputAddress extends React.Component<Props, State> {
  state: State = {
    url: this.props.initialUrl || '',
    submittedUrl: 'https://localhost:8080',
    validation: '',
  };

  render() {
    const { error, isCheckingNode, initialUrl } = this.props;
    const { validation, url, submittedUrl } = this.state;
    const validateStatus = url ? validation ? 'error' : 'success' : undefined;
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    const help = (url && validation) || (
      <>
        You must provide the REST API address. Must begin with{' '}
        <code>http://</code> or <code>https://</code>, and specify a port if
        it's not 80 or 443.
      </>
    );
    return (
      <Form className="InputAddress" onSubmit={this.handleSubmit} layout="vertical">
        <Form.Item label="Node URL" help={help} validateStatus={validateStatus}>
          <Input
            type="url"
            size="large"
            value={url}
            onChange={this.handleChange}
            placeholder="http://localhost:8080"
            autoFocus
          />
        </Form.Item>

        {error && isFirefox &&
          <Alert
            type="warning"
            message="Attention Firefox user"
            description={<>
              <p>
                Firefox has an issue where addons cannot bypass cross-origin
                request prevention. If you are running lnd or the Lightning App,
                you will be unable to connect to your node.
              </p>
              <p>
                You will either have to setup a proxy server for your node that
                has CORS headers configured, or you will have to use another
                supported browser such as Chrome or Opera.
              </p>
            </>}
            showIcon
            closable
          />
        }
        {error &&
          <Alert
            type="error"
            message="Failed to connect to node"
            description={<>
              <p>Request failed with the message "{error.message}"</p>
              <p>
                If you're sure you've setup your node correctly, try{' '}
                <a href={`${submittedUrl}/v1/getinfo`} target="_blank">
                  clicking this link
                </a>{' '}
                and making sure it loads correctly. If there are SSL errors,
                click "advanced" and proceed to accept the certificate.
              </p>
            </>}
            showIcon
            closable
          />
        }

        <Button
          type="primary"
          size="large"
          htmlType="submit"
          disabled={!url || url === initialUrl}
          loading={isCheckingNode}
          block
        >
          Connect
        </Button>
      </Form>
    )
  }

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const url = ev.currentTarget.value;
    let validation = '';
    try {
      // tslint:disable-next-line
      new URL(url);
    } catch(err) {
      validation = 'That doesn’t look like a valid url';
    }
    this.setState({ url, validation });
  };

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const url = new URL(this.state.url);
    browser.permissions.request({
      origins: [`${url.origin}/`]
    }).then(accepted => {
      if (!accepted) {
        message.warn('Permission denied, connection may fail');
      }
      this.props.submitUrl(this.state.url);
      this.setState({ submittedUrl: this.state.url });
    });
  };
}