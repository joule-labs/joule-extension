import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'antd';
import { SignMessageResponse } from 'webln/lib/provider';
import { AppState } from 'store/reducers';
import PromptTemplate from 'components/PromptTemplate';
import Logo from 'static/images/logo.png';
import { getPromptOrigin, OriginData, getPromptArgs, watchUntilPropChange } from 'utils/prompt';
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
      <PromptTemplate
        getConfirmData={this.handleConfirm}
        isContentCentered
      >
        <div className="SignPrompt">
          <div className="SignPrompt-graphic">
            <div className="SignPrompt-graphic-icon">
              <img src={this.origin.icon || ''} />
            </div>
            <div className="SignPrompt-graphic-divider">
              <Icon type="swap" />
            </div>
            <div className="SignPrompt-graphic-icon">
              <img src={Logo} />
            </div>
          </div>
          <h2 className="SignPrompt-title">
            <strong>{this.origin.name}</strong>
            wants your signature
          </h2>
          <p className="SignPrompt-text">
            Signing a message with your node's private 
            key does not disclose any confidential information.
          </p>
          <h3>Message to sign</h3>
          <p className="SignPrompt-message">
            {this.message}
          </p>
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
    return { signedMessage: reciept.signedMessage };
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    signReceipt: state.sign.signReceipt,
    signError: state.sign.signError,
  }),
  {
    signMessage,
  }
)(SignPrompt)
