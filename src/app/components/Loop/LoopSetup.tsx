import React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Button, Form, Input, Alert, message } from 'antd';
import { urlWithoutPort } from 'utils/formatters';
import { setLoop } from 'modules/loop/actions';
import { AppState } from 'store/reducers';
import './LoopSetup.less';
import { connect } from 'react-redux';

interface StateProps {
  url: AppState['loop']['url'];
  isCheckingUrl: AppState['loop']['isCheckingUrl'];
  error: AppState['loop']['checkUrlError'];
}

interface DispatchProps {
  setLoop: typeof setLoop;
}

interface OwnProps {
  onSubmitUrl(url: string): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  url: string;
  submittedUrl: string;
  validation: string;
}

class LoopSetup extends React.Component<Props, State> {
  state: State = {
    url: this.props.url || '',
    submittedUrl: this.props.url || '',
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
    const { isCheckingUrl } = this.props;
    const validateStatus = url ? (validation ? 'error' : 'success') : undefined;
    return (
      <div className="LoopSetup">
        <Alert
          className="LoopSetup-guide"
          type="info"
          message="Setting up Loop With Joule"
          description={
            <>
              <p>
                Lightning Loop is a non-custodial self hosted way to bridge and balance on
                and off chain funds for a small fee.
              </p>
              <p>
                In order to use Loop, you must run your own Loop server, similar to
                running your own Lightning node. You can find setup and installation
                instructions on the{' '}
                <a href="https://github.com/lightninglabs/loop" target="_blank">
                  Loop GitHub project
                </a>
                .
              </p>
              <p>
                You will then need to connect Joule to your Loop RPC interface via the
                REST API, which runs on <strong>port 8081</strong> by default.
              </p>
            </>
          }
        />
        <Form className="LoopSetup-form" onSubmit={this.handleSubmit} layout="vertical">
          <Form.Item label="Loop API URL" validateStatus={validateStatus}>
            <Input
              type="url"
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
            loading={isCheckingUrl}
            block
          >
            Set Loop URL
          </Button>
        </Form>
      </div>
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
    ev.preventDefault();
    const url = this.state.url.replace(/\/$/, '');

    browser.permissions
      .request({
        origins: [urlWithoutPort(url)],
      })
      .then(accepted => {
        if (!accepted) {
          message.warn('Permission denied, connection may fail');
        }
        this.setState({ submittedUrl: url });
        this.props.setLoop(url);
      });
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    url: state.loop.url,
    isCheckingUrl: state.loop.isCheckingUrl,
    error: state.loop.checkUrlError,
  }),
  { setLoop },
)(LoopSetup);
