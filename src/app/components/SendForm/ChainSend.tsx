import React from 'react';
import BN from 'bn.js';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Icon, Tooltip } from 'antd';
import { AppState } from 'store/reducers';
import AmountField from 'components/AmountField';
import Unit from 'components/Unit';
import SendState from './SendState';
import FeeSelectField from 'components/FeeSelectField';
import { getNodeChain } from 'modules/node/selectors';
import { sendOnChain, resetSendPayment } from 'modules/payment/actions';
import { isPossibleDust } from 'utils/validators';
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
  fee: number;
}

const INITIAL_STATE = {
  amount: '',
  isSendAll: false,
  address: '',
  fee: 0,
};

class ChainSend extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
    };
  }

  render() {
    const { sendOnChainReceipt, isSending, sendError, account } = this.props;

    // Early exit for send state
    if (isSending || sendOnChainReceipt || sendError) {
      return (
        <SendState
          isLoading={isSending}
          error={sendError}
          result={
            sendOnChainReceipt && (
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
            )
          }
          back={this.props.resetSendPayment}
          reset={this.reset}
          close={this.props.close}
        />
      );
    }

    const { amount, isSendAll, address, fee } = this.state;
    const blockchainBalance = account ? account.blockchainBalance : '';
    const disabled =
      (!amount && !isSendAll) ||
      !address ||
      (!!blockchainBalance && !!amount && new BN(blockchainBalance).lt(new BN(amount)));
    const dustWarning = isPossibleDust(amount, address, fee) ? (
      <>
        <Icon type="exclamation-circle" /> Dust warning: This amount may not be spendable
      </>
    ) : undefined;

    return (
      <Form className="ChainSend" layout="vertical" onSubmit={this.handleSubmit}>
        <AmountField
          label="Amount"
          amount={amount}
          onChangeAmount={this.handleChangeAmount}
          minimumSats="1"
          maximumSats={blockchainBalance}
          showMax
          required
          warn={dustWarning}
          help={
            <small>
              Available on-chain balance: <Unit value={blockchainBalance} />
              <Tooltip title="How is this calculated?">
                <Link to="/balances">
                  <Icon type="info-circle" />
                </Link>
              </Tooltip>
            </small>
          }
        />
        <Form.Item label="Recipient" required>
          <Input
            name="address"
            value={address}
            autoComplete="off"
            onChange={this.handleChangeAddress}
            placeholder="Enter Bitcoin wallet address"
          />
        </Form.Item>

        <FeeSelectField fee={fee} onChange={this.handleChangeFee} />

        <div className="ChainSend-details">
          <table>
            <tbody>
              <tr>
                <td>Amount</td>
                <td>
                  <Unit value={isSendAll ? blockchainBalance : amount} />
                </td>
              </tr>
              <tr>
                <td>Fee</td>
                <td>
                  {!fee ? (
                    'auto'
                  ) : (
                    <>
                      {fee} <small> sats/B</small>
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="ChainSend-buttons">
          <Button size="large" type="ghost" onClick={this.reset}>
            Reset
          </Button>
          <Button htmlType="submit" type="primary" size="large" disabled={disabled}>
            Send
          </Button>
        </div>
      </Form>
    );
  }

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const { amount, isSendAll, address, fee } = this.state;
    const args = isSendAll ? { send_all: true } : { amount };
    this.props.sendOnChain({
      ...args,
      addr: address,
      sat_per_byte: fee ? fee.toString() : undefined,
    });
  };

  private handleChangeAmount = (amount: string) => {
    const { account } = this.props;
    const blockchainBalance = account ? account.blockchainBalance : '';

    this.setState({
      amount,
      isSendAll: amount === blockchainBalance,
    });
  };

  private handleChangeAddress = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ address: ev.target.value });
  };

  private handleChangeFee = (fee: number) => {
    this.setState({ fee });
  };

  private reset = () => {
    this.setState({ ...INITIAL_STATE });
    this.props.resetSendPayment();
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  (state) => ({
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
