import React from 'react';
import { connect } from 'react-redux';
import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { sleep } from 'utils/misc';
import { getPromptOrigin, OriginData } from 'utils/prompt';
import { addEnabledDomain, addRejectedDomain } from 'modules/settings/actions';
import PromptTemplate from 'components/PromptTemplate';
import SwapGraphic from 'components/PromptTemplate/SwapGraphic';
import './authorize.less';

interface DispatchProps {
  addEnabledDomain: typeof addEnabledDomain;
  addRejectedDomain: typeof addRejectedDomain;
}

type Props = DispatchProps;

interface State {
  rememberChoice: boolean;
}

class AuthorizePrompt extends React.Component<Props, State> {
  public state: State = {
    rememberChoice: true,
  };
  
  private origin: OriginData;

  constructor(props: Props) {
    super(props);
    this.origin = getPromptOrigin();
  }

  render() {
    const { rememberChoice } = this.state;

    return (
      <PromptTemplate
        beforeReject={this.beforeReject}
        beforeConfirm={this.beforeConfirm}
        isContentCentered
      >
        <div className="AuthorizePrompt">
          <SwapGraphic 
            origin={this.origin}
            message="wants to connect"
          />
          <h3>They want to know</h3>
          <ul>
            <li>Your node's alias & color</li>
            <li>Your node's public key</li>
          </ul>
          <h3>They'd like to be able to prompt you to</h3>
          <ul>
            <li>Send a payment</li>
            <li>Generate an invoice</li>
            <li>Sign a message</li>
          </ul>

          <div className="AuthorizePrompt-checkbox">
            <Checkbox checked={rememberChoice} onChange={this.onChangeRemember}>
              Remember my choice
            </Checkbox>
          </div>
        </div>
      </PromptTemplate>
    );
  }

  private onChangeRemember = (ev: CheckboxChangeEvent) => {
    this.setState({ rememberChoice: ev.target.checked });
  };

  private beforeReject = async () => {
    if (this.state.rememberChoice) {
      this.props.addRejectedDomain(this.origin.domain);
      await sleep(500);
    }
  };

  private beforeConfirm = async () => {
    if (this.state.rememberChoice) {
      this.props.addEnabledDomain(this.origin.domain);
      await sleep(500);
    }
  };
}

export default connect<{}, DispatchProps, {}, {}>(
  undefined,
  {
    addEnabledDomain,
    addRejectedDomain,
  },
)(AuthorizePrompt);
