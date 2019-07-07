import React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Button, Form, Input, Alert, message } from 'antd';
import { urlWithoutPort } from 'utils/formatters';
import './InputLoopAddress.less';
import { setLoop } from 'modules/loop/actions';

interface Props {
  initialUrl?: string;
  error: Error | null;
  setLoop: typeof setLoop;
}

interface State {
  url: string;
  submittedUrl: string;
  validation: string;
}

export default class InputLoopAddress extends React.Component<Props, State> {
  state: State = {
    url: this.props.initialUrl || '',
    submittedUrl: this.props.initialUrl || '',
    validation: '',
  };

  render() {
    const { error } = this.props;
    const { validation, url, submittedUrl } = this.state;
    const validateStatus = url ? (validation ? 'error' : 'success') : undefined;
    return (
      <Form className="InputLoopAddress" onSubmit={this.handleSubmit} layout="vertical">
        <Form.Item label="Loop URL" validateStatus={validateStatus}>
          <Input
            type="url"
            size="small"
            value={url}
            onChange={this.handleChange}
            placeholder="http://localhost:8081"
            autoFocus
          />
        </Form.Item>

        {error && (
          <Alert
            type="error"
            message="Failed to connect to node"
            description={
              <>
                <p>Request failed with the message "{error.message}"</p>
                <p>
                  If you're sure you've setup your loop correctly, try{' '}
                  <a href={`${submittedUrl}/v1/loop/out/terms`} target="_blank">
                    clicking this link
                  </a>{' '}
                  and making sure it loads correctly. If there are SSL errors, click
                  "advanced" and proceed to accept the certificate.
                </p>
              </>
            }
            showIcon
            closable
          />
        )}

        <Button type="primary" size="large" htmlType="submit" disabled={!url} block>
          Set Loop URL
        </Button>
      </Form>
    );
  }

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const url = ev.currentTarget.value;
    let validation = '';
    try {
      // tslint:disable-next-line
      new URL(url);
    } catch (err) {
      validation = 'That doesn’t look like a valid url';
    }
    this.setState({ url, validation });
  };

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    const url = this.state.url.replace(/\/$/, '');
    ev.preventDefault();
    browser.permissions
      .request({
        origins: [urlWithoutPort(url)],
      })
      .then(accepted => {
        if (!accepted) {
          message.warn('Permission denied, connection may fail');
        }
        this.setState({ submittedUrl: url });
        this.props.setLoop(this.state.url);
      });
  };
}
