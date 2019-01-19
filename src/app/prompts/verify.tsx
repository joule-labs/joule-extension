import React from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Alert } from 'antd';
import { AppState } from 'store/reducers';
import PromptTemplate from 'components/PromptTemplate';
import Logo from 'static/images/logo.png';
import { getPromptOrigin, OriginData, getPromptArgs, confirmPrompt } from 'utils/prompt';
import { verifyMessage } from 'modules/sign/actions';

import './verify.less';

interface StateProps {
  isVerifyValid: AppState['sign']['isVerifyValid'];
  verifyPubkey: AppState['sign']['verifyPubkey'];
  verifyError: AppState['sign']['verifyError'];
}
interface DispatchProps {
  verifyMessage: typeof verifyMessage;
}

type Props = StateProps & DispatchProps;
class VerifyPrompt extends React.Component<Props> {
  signature: string;
  msg: string;

  private origin: OriginData;

  constructor(props: Props) {
    super(props);
    const args = getPromptArgs<{ signature: string, msg: string }>();
    this.signature = args.signature;
    this.msg = args.msg;
    this.origin = getPromptOrigin();
  }

  render() {
    const { verifyPubkey, verifyError } = this.props;

    return (
      <PromptTemplate
        isContentCentered
        hasNoButtons
      >
        <div className="VerifyPrompt">
          <div className="VerifyPrompt-graphic">
            <div className="VerifyPrompt-graphic-icon">
              <img src={this.origin.icon || ''} />
            </div>
            <div className="VerifyPrompt-graphic-divider">
              <Icon type="swap" />
            </div>
            <div className="VerifyPrompt-graphic-icon">
              <img src={Logo} />
            </div>
          </div>
          <h2 className="VerifyPrompt-title">
            <strong>{this.origin.name}</strong>
            wants your verification
          </h2>
          <p className="VerifyPrompt-text">
            Verification allows you to verify that a
            message was previously signed by a specific node
          </p>
          {!verifyError && !verifyPubkey && 
            <> 
              <h3>Message to sign</h3>
              <p className="VerifyPrompt-message">
                {this.msg}
              </p>
              <p className="VerifyPrompt-message">
                {this.signature}
              </p>
            </>
          }
          {verifyPubkey && 
            <>
              <p>
                <Alert
                  type="success"
                  message="Verification Success"
                  showIcon
                  closable
                />
              </p>
              <h3>Signer Public Key</h3>
              <p className="VerifyPrompt-message">
                {verifyPubkey}
              </p>
            </>
          }
          {verifyError && 
            <Alert
              type="error"
              message="Failed to verify message"
              description={<>
                <p>{verifyError.message}</p>
              </>}
              showIcon
              closable
            />
          }
        </div>
        <div className="PromptTemplate-buttons">
          {!verifyError && !verifyPubkey && 
            <>
              <Button
                onClick={this.handleClose}
              >
                Cancel
              </Button>
              <Button
                  type="primary"
                  onClick={this.handleConfirm}
                  // loading={isConfirming}
              >
                Verify
              </Button>
            </>
          }
          {verifyPubkey && 
              <Button
              type="primary"
              onClick={this.handleClose}
            >
              Close
            </Button>
        }
        </div>
      </PromptTemplate>
    );
  }

  private handleConfirm = () => {
    this.props.verifyMessage(this.signature, this.msg);
  }

  private handleClose = () => {
    confirmPrompt(this.props.verifyPubkey);
  }
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    isVerifyValid: state.sign.isVerifyValid,
    verifyPubkey: state.sign.verifyPubkey,
    verifyError: state.sign.verifyError,
  }),
  {
    verifyMessage,
  }
)(VerifyPrompt)
