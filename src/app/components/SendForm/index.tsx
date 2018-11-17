import React from 'react';
import { Radio, Icon } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import LightningSend from './LightningSend';
import BigMessage from 'components/BigMessage';
import './style.less';

interface Props {
  close?(): void;
}

interface State {
  type: 'lightning' | 'bitcoin';
}

export default class SendForm extends React.Component<Props, State> {
  state: State = {
    type: 'lightning',
  };

  render() {
    const { type } = this.state;
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
            <Icon type="link" /> Bitcoin
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