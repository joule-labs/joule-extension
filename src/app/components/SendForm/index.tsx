import React from 'react';
import { Radio, Icon } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import LightningSend from './LightningSend';
import BigMessage from 'components/BigMessage';
import { AppState } from 'store/reducers';
import './style.less';
import { connect } from 'react-redux';

interface StateProps {
  settings: AppState['settings'];
  blockchainDisplayName: AppState['node']['blockchainDisplayName'];
}

interface OwnProps {
  close?(): void;
}

type Props = StateProps & OwnProps;

interface State {
  type: 'lightning' | 'bitcoin';
}

class SendForm extends React.Component<Props, State> {
  state: State = {
    type: 'lightning',
  };

  render() {
    const { type } = this.state;
    const { blockchainDisplayName } = this.props;

    const form = type === 'lightning' ? (
      <LightningSend close={this.props.close} />
    ) : (
      <BigMessage
        title="Not yet supported"
        message="You'll have to send directly from your node for now. Sorry!"
      />
    );

    return (
      <div className="SendForm">
        <div className="SendForm-type">
          <Radio.Group value={type} onChange={this.handleTypeChange}>
            <Radio.Button value="lightning">
              <Icon type="thunderbolt" /> Lighting
            </Radio.Button>
            <Radio.Button>
            <Icon type="link" /> {blockchainDisplayName}
            </Radio.Button>
          </Radio.Group>
        </div>
        <div className="SendForm-form">
          {form}
        </div>
      </div>
    )
  }

  private handleTypeChange = (ev: RadioChangeEvent) => {
    this.setState({ type: ev.target.value });
  };
}

export default connect<{}, {}, OwnProps, AppState>(state => ({
  blockchainDisplayName: state.node.blockchainDisplayName,
}))(SendForm);