import React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Button, Form, Input, message } from 'antd';
import { urlWithoutPort } from 'utils/formatters';
import './InputLoopAddress.less';
import { setLoop, setLoopIn } from 'modules/loop/actions';

interface Props {
  initialUrl?: string | null;
  isCheckingLoop: boolean;
  error: Error | null;
  setLoop: typeof setLoop;
  setLoopIn: typeof setLoopIn;
  type: string;
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

  componentDidUpdate(nextProps: Props) {
    // Handle errors for incorrect URL
    const { error } = this.props;
    if (error !== null && nextProps.error === null) {
      message.error(`Error setting URL!`, 2);
    }
  }

  render() {
    const { validation, url } = this.state;
    const { isCheckingLoop } = this.props;
    const validateStatus = url ? (validation ? 'error' : 'success') : undefined;
    return (
      <Form className="InputLoopAddress" onSubmit={this.handleSubmit} layout="vertical">
        <Form.Item label={`Loop URL`} validateStatus={validateStatus}>
          <Input
            type="url"
            size="small"
            value={url}
            onChange={this.handleChange}
            placeholder="http://localhost:8081"
            autoFocus
          />
        </Form.Item>

        <Button
          type="primary"
          size="large"
          htmlType="submit"
          disabled={!url}
          loading={isCheckingLoop}
          block
        >
          {`Set Loop URL`}
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
    const loop = this.props;
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
        loop.setLoop(url);
        loop.setLoopIn(url);
      });
  };
}
