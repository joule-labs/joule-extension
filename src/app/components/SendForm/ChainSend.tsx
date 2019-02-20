import React from 'react';
import BN from 'bn.js';
import { connect } from 'react-redux';
import { Form, Input, Button, Radio, Alert, Icon } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { AppState } from 'store/reducers';
import AmountField from 'components/AmountField';
import Unit from 'components/Unit';
import Loader from 'components/Loader';
import SendState from './SendState';
import { getNodeChain } from 'modules/node/selectors';
import { sendOnChain, resetSendPayment, getOnChainFeeEstimates } from 'modules/payment/actions';
import { isPossibleDust } from 'utils/validators';
import './ChainSend.less';
import BalanceModal from 'components/BalanceModal';

interface StateProps {
  account: AppState['account']['account'];
  chain: ReturnType<typeof getNodeChain>;
  sendOnChainReceipt: AppState['payment']['sendOnChainReceipt'];
  isSending: AppState['payment']['isSending'];
  sendError: AppState['payment']['sendError'];
  onChainFees: AppState['payment']['onChainFees'];
  feesError: AppState['payment']['feesError'];
  isFetchingFees: AppState['payment']['isFetchingFees'];
}

interface DispatchProps {
  sendOnChain: typeof sendOnChain;
  resetSendPayment: typeof resetSendPayment;
  getOnChainFeeEstimates: typeof getOnChainFeeEstimates;
}

interface OwnProps {
  close?(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  amount: string;
  isSendAll: boolean;
  address: string;
  feeMethod: string;
  fee: number;
  isBalanceModalOpen: boolean;
}

const INITIAL_STATE = {
  amount: '',
  isSendAll: false,
  address: '',
  feeMethod: '',
  fee: 0,
  isBalanceModalOpen: false,
};

class ChainSend extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...INITIAL_STATE
    }
  }

  componentDidMount() {
    this.props.getOnChainFeeEstimates();
  }

  componentWillReceiveProps(nextProps: Props) {
    const { onChainFees } = this.props;
    if (nextProps.onChainFees !== onChainFees && nextProps.onChainFees !== null) {
      this.setState({ 
        feeMethod: 'fastestFee',
        fee: nextProps.onChainFees.fastestFee,
      });
    }
  }

  render() {
    const { 
      sendOnChainReceipt, 
      isSending, 
      sendError, 
      account, 
      onChainFees, 
      isFetchingFees, 
      feesError 
    } = this.props;
    
    // Early exit for send state
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

    const { amount, isSendAll, address, fee, feeMethod, isBalanceModalOpen } = this.state;
    const blockchainBalance = account ? account.blockchainBalance : '';
    const disabled = (!amount && !isSendAll) || !address ||
      (!!blockchainBalance && !!amount && (new BN(blockchainBalance).lt(new BN(amount))));
    const dustWarning = isPossibleDust(amount, address, fee) ? (
      <><Icon type="exclamation-circle" /> Dust warning: This amount may not be spendable</>
    ) : undefined;

    return (
      <>
        <Form
          className="ChainSend"
          layout="vertical"
          onSubmit={this.handleSubmit}
        >
          <AmountField
            label="Amount"
            amount={amount}
            onChangeAmount={this.handleChangeAmount}
            minimumSats="1"
            maximumSats={blockchainBalance}
            showMax
            required
            warn={dustWarning}
            help={(
              <small>
                Available on-chain balance: <Unit value={blockchainBalance} />
                <a onClick={this.openBalanceModal}><Icon type="info-circle" /></a>
              </small>
            )}

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
          <Form.Item label="Fee" required className="ChainSend-fees">
            {feesError && (
              <Alert type="warning" message={feesError.message} /> 
            )}
            {onChainFees && (
              <Radio.Group defaultValue={feeMethod} onChange={this.handleChangeFee}>
                <Radio.Button value="hourFee">Slow</Radio.Button>
                <Radio.Button value="halfHourFee">Normal</Radio.Button>
                <Radio.Button value="fastestFee">Fast</Radio.Button>
              </Radio.Group>
            )}
          </Form.Item>

          <div className="ChainSend-details">
            <table><tbody>
              <tr>
                <td>Amount</td>
                <td>
                  <Unit value={isSendAll ? blockchainBalance : amount} />
                </td>
              </tr>
              <tr>
                <td>Fee</td>
                <td>
                  {isFetchingFees ?
                    <Loader inline size="1rem" /> :
                    <>{feesError ? '?' : fee} <small>sats/B</small></>
                  }
                </td>
              </tr>
            </tbody></table>
          </div>          
          <div className="ChainSend-buttons">
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
        <BalanceModal
          isVisible={isBalanceModalOpen}
          handleClose={this.closeBalanceModal}
        />
      </>
    );
  }

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const { amount, isSendAll, address, fee } = this.state;
    const args = isSendAll ? { send_all: true } : { amount };
    this.props.sendOnChain({
      ...args,
      addr: address,
      sat_per_byte: fee.toString(),
    });
  };  

  private handleChangeAmount = (amount: string) => {
    const { account } = this.props;
    const blockchainBalance = account ? account.blockchainBalance : '';

    this.setState({
      amount,
      isSendAll: amount === blockchainBalance
    });
  };

  private handleChangeAddress = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ address: ev.target.value });
  };

  private handleChangeFee = (ev: RadioChangeEvent) => {
    if (this.props.onChainFees) {
      this.setState({ 
        feeMethod: ev.target.value,
        fee: this.props.onChainFees[ev.target.value], 
      });
    }
  };

  private reset = () => {
    this.setState({ ...INITIAL_STATE });
    this.props.resetSendPayment();
  };

  private openBalanceModal = () => this.setState({ isBalanceModalOpen: true });
  private closeBalanceModal = () => this.setState({ isBalanceModalOpen: false }); 
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    account: state.account.account,
    sendOnChainReceipt: state.payment.sendOnChainReceipt,
    isSending: state.payment.isSending,
    sendError: state.payment.sendError,
    onChainFees: state.payment.onChainFees,
    feesError: state.payment.feesError,
    isFetchingFees: state.payment.isFetchingFees,
    chain: getNodeChain(state),
  }),
  {
    sendOnChain,
    resetSendPayment,
    getOnChainFeeEstimates,
  },
)(ChainSend);