import React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Button, Form, Input, message } from 'antd';
import { urlWithoutPort } from 'utils/formatters';
import './InputLoopAddress.less';
import { setLoop } from 'modules/loop/actions';

interface Props {
  initialUrl?: string;
  error: Error | null;
  setLoop: typeof setLoop;
  isLoopUrlSet: string | null;
  type: string | null;
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
    const { validation, url } = this.state;
    const { type } = this.props;
    const validateStatus = url ? (validation ? 'error' : 'success') : undefined;
    return (
      <Form className="InputLoopAddress" onSubmit={this.handleSubmit} layout="vertical">
        <Form.Item label={`${type} URL`} validateStatus={validateStatus}>
          <Input
            type="url"
            size="small"
            value={url}
            onChange={this.handleChange}
            placeholder="http://localhost:8081"
            autoFocus
          />
        </Form.Item>

        <Button type="primary" size="large" htmlType="submit" disabled={!url} block>
          {`Set ${type} URL`}
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
        setTimeout(() => {
          if (this.props.isLoopUrlSet === null) {
            message.error('Failed to set Loop URL!', 2);
            // Need error handling and reset URL entry here!
          } else {
            message.success('Successfully set Loop URL!', 2);
          }
        }, 1000);
      });
  };
}
