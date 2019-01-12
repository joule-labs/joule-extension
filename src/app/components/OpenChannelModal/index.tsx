import React from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Input, Button, Checkbox, Icon, Alert, message } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Result from 'ant-design-pro/lib/Result';
import AmountField from 'components/AmountField';
import { isValidConnectAddress } from 'utils/validators';
import { openChannel } from 'modules/channels/actions';
import { AppState } from 'store/reducers';
import './index.less';

interface StateProps {
  channels: AppState['channels']['channels'];
  newChannelTxIds: AppState['channels']['newChannelTxIds'];
  openChannelError: AppState['channels']['openChannelError'];
  account: AppState['account']['account'];
}

interface ActionProps {
  openChannel: typeof openChannel;
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
  successfulTxId: string | null;
  error: Error | null;
}

const INITIAL_STATE: State = {
  address: '',
  capacity: '',
  pushAmount: '',
  isPrivate: false,
  isShowingAdvanced: false,
  isOpeningChannel: false,
  successfulTxId: null,
  error: null,
};

class PeersModal extends React.Component<Props, State> {
  state: State = { ...INITIAL_STATE };

  componentWillUpdate(nextProps: Props, nextState: State) {
    const {isVisible, newChannelTxIds, openChannelError } = nextProps;
    const { isOpeningChannel, address } = nextState;

    if (isVisible && !this.props.isVisible) {
      this.resetForm();
    }

    if (isOpeningChannel) {
      if (newChannelTxIds[address]) {
        this.setState({
          successfulTxId: newChannelTxIds[address],
          isOpeningChannel: false,
        });
      }
      else if (openChannelError && this.props.openChannelError !== openChannelError) {
        this.setState({
          error: openChannelError,
          isOpeningChannel: false,
        });
      }
    }
  }

  render() {
    const { isVisible, handleClose, account } = this.props;
    const {
      address,
      capacity,
      pushAmount,
      isPrivate,
      isShowingAdvanced,
      isOpeningChannel,
      successfulTxId,
      error,
    } = this.state;
    const addressValidity = address
      ? isValidConnectAddress(address.trim())
        ? 'success'
        : 'error'
      : undefined;

    let content;
    let hideFooter = false;
    if (successfulTxId) {
      content = (
        <Result
          type="success"
          title="Channel transaction sent"
          description="Your channel should be ready in about an hour, once your transaction has been confirmed"
          actions={[
            <Button key="back" size="large" onClick={this.resetForm}>
              Open another
            </Button>,
            <Button
              key="view"
              size="large"
              type="primary"
              href={`https://blockstream.info/tx/${successfulTxId}`}
              target="_blank"
              rel="noopener nofollow"
            >
              <Icon type="link" /> View transaction
            </Button>,
          ]}
        />
      );
      hideFooter = true;
    } else {
      content = (
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
            maximumSats={account ? account.blockchainBalance : undefined}
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
          {error &&
            <Alert
              type="error"
              message="Failed to open channel"
              description={error.message}
              closable
            />
          }
        </Form>
      );
    }

    return (
      <Modal
        title="Open a New Channel"
        visible={isVisible}
        onCancel={handleClose}
        onOk={this.openChannel}
        confirmLoading={isOpeningChannel}
        className="OpenChannel"
        width={450}
        footer={hideFooter ? '' : undefined}
        centered
      >
        {content}
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

    if (!address) {
      return message.error('Connection info is required');
    }
    if (!capacity) {
      return message.error('Capacity is required');
    }
    if (!isValidConnectAddress(address)) {
      return message.error('Connection info is invalid');
    }

    this.setState({
      error: null,
      isOpeningChannel: true,
    }, () => {
      this.props.openChannel({
        address,
        capacity,
        isPrivate,
        // Don't send empty string
        pushAmount: pushAmount || undefined,
      });
    });
  };

  private resetForm() {
    this.setState({ ...INITIAL_STATE });
  }
}

export default connect<StateProps, ActionProps, OwnProps, AppState>(
  state => ({
    channels: state.channels.channels,
    newChannelTxIds: state.channels.newChannelTxIds,
    openChannelError: state.channels.openChannelError,
    account: state.account.account,
  }),
  { openChannel },
)(PeersModal);
