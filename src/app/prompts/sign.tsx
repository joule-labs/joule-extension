import React from 'react';
import { connect } from 'react-redux';
import { SignMessageResponse } from 'webln';
import { AppState } from 'store/reducers';
import PromptTemplate from 'components/PromptTemplate';
import SwapGraphic from 'components/PromptTemplate/SwapGraphic';
import {
  getPromptOrigin,
  OriginData,
  getPromptArgs,
  watchUntilPropChange,
} from 'utils/prompt';
import { signMessage } from 'modules/sign/actions';

import './sign.less';

interface StateProps {
  signReceipt: AppState['sign']['signReceipt'];
  signError: AppState['sign']['signError'];
}

interface DispatchProps {
  signMessage: typeof signMessage;
}

type Props = StateProps & DispatchProps;

class SignPrompt extends React.Component<Props> {
  message: string;

  private origin: OriginData;

  constructor(props: Props) {
    super(props);
    const args = getPromptArgs<{ message: string }>();
    this.message = args.message;
    this.origin = getPromptOrigin();
  }

  render() {
    return (
      <PromptTemplate getConfirmData={this.handleConfirm} isContentCentered>
        <div className="SignPrompt">
          <div className="SignPrompt-header">
            <SwapGraphic origin={this.origin} />
          </div>
          <div className="SignPrompt-title">
            <h3>Signature Request</h3>
          </div>
          <div className="SignPrompt-content">
            <h4 className="SignPrompt-content-label">Message to sign:</h4>
            <code className="SignPrompt-content-message">{this.message}</code>
          </div>
          <div className="SignPrompt-description">
            Signing a message with your node's private key does not disclose any
            confidential information.
          </div>
        </div>
      </PromptTemplate>
    );
  }

  private handleConfirm = async (): Promise<SignMessageResponse> => {
    this.props.signMessage(this.message);

    const reciept = await watchUntilPropChange(
      () => this.props.signReceipt,
      () => this.props.signError,
    );

    if (!reciept) {
      throw new Error('Failed to sign message');
    }
    return reciept;
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    signReceipt: state.sign.signReceipt,
    signError: state.sign.signError,
  }),
  {
    signMessage,
  },
)(SignPrompt);
