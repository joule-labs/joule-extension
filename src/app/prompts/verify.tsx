import React from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Tabs, Drawer } from 'antd';
import { AppState } from 'store/reducers';
import PromptTemplate from 'components/PromptTemplate';
import { getPromptArgs, confirmPrompt } from 'utils/prompt';
import { verifyMessage } from 'modules/sign/actions';

import './verify.less';
import Identicon from 'components/Identicon';
import Loader from 'components/Loader';

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
  showDrawer: boolean;
}

class VerifyPrompt extends React.Component<Props, State> {
  signature: string;
  msg: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      isVerifying: true,
      showDrawer: false,
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
      const status = !error ? {
        cls: 'is-valid',
        icon: 'safety',
        msg: 'Message Signature is Valid',
      } : {
        cls: 'is-invalid',
        icon: 'exclamation-circle',
        msg: error.message,
      };
      content = (
        <>
          <div className="VerifyPrompt">          
            <div className="VerifyPrompt-node">
              <Identicon 
                pubkey={pubkey || ''}
                className="VerifyPrompt-node-avatar"
              />
              <div className="VerifyPrompt-node-info">
                <div className="VerifyPrompt-node-info-alias">
                  {alias}
                </div>
                <code className="VerifyPrompt-node-info-pubkey">
                  {pubkey.slice(0, pubkey.length / 2)}
                  <br/>
                  {pubkey.slice(pubkey.length / 2)}
                </code>
              </div>
            </div>
            <div className="VerifyPrompt-title">
              <h3>Signature Verification</h3>
            </div>
            <div className="VerifyPrompt-status">
              <div className={`VerifyPrompt-status-badge ${status.cls}`}>
                <Icon type={status.icon} className="VerifyPrompt-status-badge-icon" />
                <span className="VerifyPrompt-status-badge-msg">{status.msg}</span>
              </div>
              <Button
                icon="file-text"
                size="small"
                onClick={this.toggleDrawer}
              >Details</Button>
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
          <Drawer
            visible={this.state.showDrawer}
            placement="right"
            onClose={this.toggleDrawer}
            width="92%"
            title="Verification Details"
            className="VerifyPrompt-drawer"
          >
            <Tabs defaultActiveKey="message">
              <Tabs.TabPane key="message" tab={<><Icon type="mail"/> Message</>}>
                <code className="VerifyPrompt-drawer-message">
                  {this.msg}
                </code>
              </Tabs.TabPane>
              <Tabs.TabPane key="signature" tab={<><Icon type="file-protect"/> Signature</>}>
                <code className="VerifyPrompt-drawer-message">
                  {this.signature}
                </code>
              </Tabs.TabPane>
            </Tabs>
          </Drawer>
        </>
      );
    }

    return (
      <PromptTemplate hasNoButtons>
        {content}
      </PromptTemplate>
    );
  }

  private toggleDrawer = () => this.setState({ showDrawer: !this.state.showDrawer })

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
