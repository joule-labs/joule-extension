import React from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Tabs, Alert } from 'antd';
import { AppState } from 'store/reducers';
import PromptTemplate from 'components/PromptTemplate';
import NodeInfo from 'components/PromptTemplate/NodeInfo';
import Loader from 'components/Loader';
import { getPromptArgs, confirmPrompt } from 'utils/prompt';
import { verifyMessage } from 'modules/sign/actions';

import './verify.less';

interface StateProps {
  pubkey: AppState['sign']['verifyPubkey'];
  alias: AppState['sign']['verifyAlias'];
  error: AppState['sign']['verifyError'];
}
interface DispatchProps {
  verifyMessage: typeof verifyMessage;
}

type Props = StateProps & DispatchProps;

interface State {
  isVerifying: boolean;
}

class VerifyPrompt extends React.Component<Props, State> {
  signature: string;
  msg: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      isVerifying: true,
    }

    const args = getPromptArgs<{ signature: string, msg: string }>();
    this.signature = args.signature;
    this.msg = args.msg;
  }

  componentDidUpdate(prevProps: Props) {
    const { pubkey, error } = this.props;

    if ((pubkey && pubkey !== prevProps.pubkey) ||
        (error && error !== prevProps.error)) {
          this.setState({ isVerifying: false });
    }
  }

  componentDidMount() {
    this.props.verifyMessage(this.signature, this.msg);
  }

  render() {
    const { alias, error } = this.props;
    const pubkey = this.props.pubkey || '';

    let content;
    if (this.state.isVerifying) {
      content = (
        <Loader size="5rem" />
      );
    } else {
      content = (
        <>
          <div className="VerifyPrompt">
            <NodeInfo 
              pubkey={pubkey}
              alias={alias || ''}
              className="VerifyPrompt-node"
            />
            <div className="VerifyPrompt-title">
              <h3>Signature Verification</h3>
            </div>
            <div className="VerifyPrompt-status">
              <Alert
                message={error ? error.message : 'Message Signature in Valid'}
                type={error ? 'error' : 'success'}
                showIcon
              />
            </div>
            <div className="VerifyPrompt-content">
              <Tabs defaultActiveKey="message">
                <Tabs.TabPane key="message" tab={<><Icon type="file-text"/> Message</>}>
                  <code className="VerifyPrompt-content-message">
                    {this.msg}
                  </code>
                </Tabs.TabPane>
                <Tabs.TabPane key="signature" tab={<><Icon type="file-protect"/> Signature</>}>
                  <code className="VerifyPrompt-content-message">
                    {this.signature}
                  </code>
                </Tabs.TabPane>
              </Tabs>
            </div>
            <div className="VerifyPrompt-description">
              Verification allows you to confirm a
              message was previously signed by a specific node.
            </div>
          </div>
          <div className="PromptTemplate-buttons">
            <Button
              type="primary"
              onClick={this.handleClose}
            >
              Close
            </Button>
          </div>
        </>
      );
    }

    return (
      <PromptTemplate hasNoButtons>
        {content}
      </PromptTemplate>
    );
  }

  private handleClose = () => {
    confirmPrompt({ pubkey: this.props.pubkey });
  }
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    pubkey: state.sign.verifyPubkey,
    alias: state.sign.verifyAlias,
    error: state.sign.verifyError,
  }),
  {
    verifyMessage,
  }
)(VerifyPrompt)
