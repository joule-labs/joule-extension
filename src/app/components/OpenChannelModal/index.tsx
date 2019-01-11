import React from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Input, Button, Checkbox, message } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import AmountField from 'components/AmountField';
import { isValidConnectAddress } from 'utils/validators';
import { AppState } from 'store/reducers';
import './index.less';

interface StateProps {
  channels: AppState['channels']['channels'];
  nodeInfo: AppState['node']['nodeInfo'];
}

interface ActionProps {
  
}

interface OwnProps {
  isVisible: boolean;
  handleClose(): void;
}

type Props = StateProps & ActionProps & OwnProps;

interface State {
  address: string;
  capacity: string;
  pushAmount: string;
  isPrivate: boolean;
  isShowingAdvanced: boolean;
  isOpeningChannel: boolean;
}

const INITIAL_STATE: State = {
  address: '',
  capacity: '',
  pushAmount: '',
  isPrivate: false,
  isShowingAdvanced: false,
  isOpeningChannel: false,
};

class PeersModal extends React.Component<Props, State> {
  state: State = { ...INITIAL_STATE };

  componentWillUpdate(nextProps: Props) {
    if (nextProps.isVisible && !this.props.isVisible) {
      this.resetForm();
    }
  }

  render() {
    const { isVisible, handleClose } = this.props;
    const { address, capacity, pushAmount, isPrivate, isShowingAdvanced, isOpeningChannel } = this.state;
    const addressValidity = address
      ? isValidConnectAddress(address.trim())
        ? 'success'
        : 'error'
      : undefined;
    // const capacityError = 

    return (
      <Modal
        title="Open a New Channel"
        visible={isVisible}
        onCancel={handleClose}
        onOk={this.openChannel}
        className="OpenChannel"
        width={450}
        centered
      >
        <Form
          className="OpenChannel-form"
          layout="vertical"
          onSubmit={this.openChannel}
        >
          <Form.Item
            label="Connection info"
            validateStatus={addressValidity}
            className="OpenChannel-form-address"
            required
          >
            <Input
              value={address}
              placeholder="<pubkey>@host"
              onChange={this.handleAddressChange}
              disabled={isOpeningChannel}
              autoFocus
            />
          </Form.Item>
          <AmountField
            label="Capacity"
            amount={capacity}
            disabled={isOpeningChannel}
            onChangeAmount={this.handleCapicityChange}
            showFiat
            required
          />

          {isShowingAdvanced ? (
            <div className="OpenChannel-form-advanced">
              <AmountField
                label="Push amount"
                amount={pushAmount}
                disabled={isOpeningChannel}
                onChangeAmount={this.handlePushAmountChange}
                help={<>
                  An initial amount to send to the node. Must be less than
                  capacity. It is not advised to do this unless you know what
                  you are doing!
                </>}
                showFiat
              />
              <Checkbox
                checked={isPrivate}
                onChange={this.handleChangePrivate}
                disabled={isOpeningChannel}
              >
                Don't announce channel to network (private)
              </Checkbox>
            </div>
          ) : (
            <Button
              className="OpenChannel-form-advancedToggle"
              onClick={this.toggleAdvanced}
              type="primary"
              ghost
            >
              Show advanced fields
            </Button>
          )}
        </Form>
      </Modal>
    )
  }

  private handleAddressChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ address: ev.currentTarget.value });
  };

  private handleCapicityChange = (capacity: string) => {
    this.setState({ capacity });
  };

  private handlePushAmountChange = (pushAmount: string) => {
    this.setState({ pushAmount });
  };

  private handleChangePrivate = (ev: CheckboxChangeEvent) => {
    this.setState({ isPrivate: ev.target.checked });
  };

  private toggleAdvanced = () => {
    this.setState({ isShowingAdvanced: true });
  };

  private openChannel = (ev?: React.FormEvent<HTMLFormElement>) => {
    if (ev) {
      ev.preventDefault();
    }

    const { capacity, pushAmount, isPrivate } = this.state;
    const address = this.state.address.trim();

    if (!capacity) {
      return message.error('Capacity is required');
    }
    if (!address) {
      return message.error('Connection info is required');
    }
    if (!isValidConnectAddress(address)) {
      return message.error('Connection info is invalid');
    }

    this.setState({ isOpeningChannel: true }, () => {
      // this.props.addPeer(address);
    });
  };

  private resetForm() {
    this.setState({ ...INITIAL_STATE });
  }
}

export default connect<StateProps, ActionProps, OwnProps, AppState>(
  state => ({
    channels: state.channels.channels,
    nodeInfo: state.node.nodeInfo,
  }),
  {},
)(PeersModal);
