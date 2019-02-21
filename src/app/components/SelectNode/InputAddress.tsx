import React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Alert, Button, Form, Input, message } from 'antd';
import { urlWithoutPort } from 'utils/formatters';
import './InputAddress.less';
import { checkNode } from 'modules/node/actions';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import TitleTemplate from 'components/SelectNode/TitleTemplate';

interface StateProps {
  isNodeChecked: AppState['node']['isNodeChecked'];
  isCheckingNode: AppState['node']['isCheckingNode'];
  nodeInfo: AppState['node']['nodeInfo'];
  checkNodeError: AppState['node']['checkNodeError'];
}

interface DispatchProps {
  checkNode: typeof checkNode;
}

interface OwnProps {
  initialUrl?: string;

  onComplete?(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  url: string;
  submittedUrl: string;
  validation: string;
  checkRequested: boolean;
}

class InputAddress extends React.Component<Props, State> {
  state: State = {
    url: this.props.initialUrl || '',
    submittedUrl: this.props.initialUrl || '',
    validation: '',
    checkRequested: false,
  };

  componentDidUpdate() {
    if (this.state.checkRequested && this.props.isNodeChecked && this.props.onComplete) {
      this.props.onComplete();
    }
  }

  render() {
    const {checkNodeError, isCheckingNode} = this.props;
    const {validation, url, submittedUrl} = this.state;
    const validateStatus = url ? validation ? 'error' : 'success' : undefined;
    const help = (url && validation) || (
      <>
        You must provide the REST API address. Must begin with{' '}
        <code>http://</code> or <code>https://</code>, and specify a port if
        it's not 80 or 443.
      </>
    );
    return (
      <div>
        <TitleTemplate title={'Provide a URL'}/>
        <Form className="InputAddress" onSubmit={this.handleSubmit}
              layout="vertical">
          <Form.Item label="Node URL" help={help}
                     validateStatus={validateStatus}>
            <Input
              type="url"
              size="large"
              value={url}
              onChange={this.handleChange}
              placeholder="http://localhost:8080"
              autoFocus
            />
          </Form.Item>

          {checkNodeError &&
          <Alert
              type="error"
              message="Failed to connect to node"
              description={<>
                <p>Request failed with the message
                  "{checkNodeError.message}"</p>
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
            disabled={!url}
            loading={isCheckingNode}
            block
          >
            Connect
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
    this.setState({url, validation, checkRequested: false});
  };


  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    browser.permissions.request({
      origins: [urlWithoutPort(this.state.url)]
    }).then(accepted => {
      if (!accepted) {
        message.warn('Permission denied, connection may fail');
      }
      this.props.checkNode(this.state.url);
      this.setState({submittedUrl: this.state.url, checkRequested: true});
    });
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    isNodeChecked: state.node.isNodeChecked,
    isCheckingNode: state.node.isCheckingNode,
    nodeInfo: state.node.nodeInfo,
    checkNodeError: state.node.checkNodeError
  }),
  {
    checkNode
  }
)(InputAddress);