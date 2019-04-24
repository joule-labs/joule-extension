import React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Form, Input, Button, Alert, message } from 'antd';
import { urlWithoutPort } from 'utils/formatters';
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
    submittedUrl: this.props.initialUrl || '',
    validation: '',
  };

  render() {
    const { error, isCheckingNode } = this.props;
    const { validation, url, submittedUrl } = this.state;
    const validateStatus = url ? validation ? 'error' : 'success' : undefined;
    // Handle accidental user input after port number
    const modUrl = submittedUrl.split(":");
    // Basically just break apart the URL
    const modPort = modUrl[2].split("/");
    // Eliminate anything after port number and bring back together
    const altUrl = `${modUrl[0]}:${modUrl[1]}:${modPort[0]}`;
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

        {error &&
          <Alert
            type="error"
            message="Failed to connect to node"
            description={<>
              <p>Request failed with the message "{error.message}"</p>
              <p>
                If you're sure you've setup your node correctly, try{' '}
                <a href={`${altUrl}/v1/getinfo`} target="_blank">
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
          disabled={!url}
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
    browser.permissions.request({
      origins: [urlWithoutPort(this.state.url)],
    }).then(accepted => {
      if (!accepted) {
        message.warn('Permission denied, connection may fail');
      }
      this.props.submitUrl(this.state.url);
      this.setState({ submittedUrl: this.state.url });
    });
  };
}