import React from 'react';
import BN from 'bn.js';
import { connect } from 'react-redux';
import { Form, Input, Button, Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { AppState } from 'store/reducers';
import AmountField from 'components/AmountField';
import Unit from 'components/Unit';
import SendState from './SendState';
import { blockchainDisplayName } from 'utils/constants';
import { getNodeChain } from 'modules/node/selectors';
import { sendOnChain, resetSendPayment } from 'modules/payment/actions';
import './ChainSend.less';

interface StateProps {
  account: AppState['account']['account'];
  chain: ReturnType<typeof getNodeChain>;
  sendOnChainReceipt: AppState['payment']['sendOnChainReceipt'];
  isSending: AppState['payment']['isSending'];
  sendError: AppState['payment']['sendError'];
}

interface DispatchProps {
  sendOnChain: typeof sendOnChain;
  resetSendPayment: typeof resetSendPayment;
}

interface OwnProps {
  close?(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  amount: string;
  isSendAll: boolean;
  address: string;
}

const INITIAL_STATE = {
  amount: '',
  isSendAll: false,
  address: '',
};

class ChainSend extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...INITIAL_STATE
    }
  }

  render() {
    // Early exit for send state
    const { sendOnChainReceipt, isSending, sendError, account, chain } = this.props;
    if (isSending || sendOnChainReceipt || sendError) {
      return (
        <SendState
          isLoading={isSending}
          error={sendError}
          result={sendOnChainReceipt && (
            <>
              <h3>Transaction ID</h3>
              <a
                href={`https://blockstream.info/tx/${sendOnChainReceipt.txid}`}
                target="_blank"
                rel="noopener nofollow"
              >
                {sendOnChainReceipt.txid}
              </a>
            </>
          )}
          back={this.props.resetSendPayment}
          reset={this.reset}
          close={this.props.close}
        />
      );
    }

    const { amount, isSendAll, address } = this.state;
    const blockchainBalance = account ? account.blockchainBalance : '';
    const disabled = (!amount && !isSendAll) || !address ||
      (!!blockchainBalance && !!amount && (new BN(blockchainBalance).lt(new BN(amount))));

    return (
      <Form
        className="BitcoinSend"
        layout="vertical"
        onSubmit={this.handleSubmit}
      >
        <AmountField
          label="Amount"
          amount={amount}
          maximumSats={blockchainBalance}
          onChangeAmount={this.handleChangeAmount}
          required={!isSendAll}
          disabled={isSendAll}
          showFiat
        />
        <div className="BitcoinSend-sendAll">
          <Checkbox onChange={this.handleChangeSendAll} checked={isSendAll}>
            Send all
            {account && <strong> <Unit value={blockchainBalance} /> </strong>}
            in {blockchainDisplayName[chain]} wallet
          </Checkbox>
        </div>
        <Form.Item label="Recipient" required>
          <Input
            name="address"
            value={address}
            autoComplete="off"
            onChange={this.handleChangeAddress}
            placeholder="Enter Bitcoin wallet address"
          />
        </Form.Item>

        <div className="BitcoinSend-buttons">
          <Button size="large" type="ghost" onClick={this.reset}>
            Reset
          </Button>
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            disabled={disabled}
          >
            Send
          </Button>
        </div>
      </Form>
    );
  }

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const { amount, isSendAll, address } = this.state;
    const args = isSendAll ? { send_all: true } : { amount };
    this.props.sendOnChain({
      ...args,
      addr: address,
    });
  };  

  private handleChangeAmount = (amount: string) => {
    this.setState({ amount });
  };

  private handleChangeSendAll = (ev: CheckboxChangeEvent) => {
    this.setState({ isSendAll: ev.target.checked, amount: '' });
  };

  private handleChangeAddress = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ address: ev.target.value });
  };

  private reset = () => {
    this.setState({ ...INITIAL_STATE });
    this.props.resetSendPayment();
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    account: state.account.account,
    sendOnChainReceipt: state.payment.sendOnChainReceipt,
    isSending: state.payment.isSending,
    sendError: state.payment.sendError,
    chain: getNodeChain(state),
  }),
  {
    sendOnChain,
    resetSendPayment,
  },
)(ChainSend);