import React from 'react';
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { AppState } from 'store/reducers';
import { getLoopOutQuote, getLoopOut, getLoopIn } from 'modules/loop/actions';
import { Button, Icon, Alert } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import { GetLoopOutArguments, GetLoopInArguments } from 'lib/loop-http/types';
import { LOOP_TYPE } from 'utils/constants';

interface StateProps {
  loopQuote: AppState['loop']['loopQuote'];
  loop: AppState['loop']['loop'];
  error: AppState['loop']['error'];
  hasPassword: boolean;
}

interface DispatchProps {
  getLoopOutQuote: typeof getLoopOutQuote;
  getLoopOut: typeof getLoopOut;
  getLoopIn: typeof getLoopIn;
}

interface OwnProps {
  amount: string;
  sweepConfirmationTarget: string;
  isOpen?: boolean;
  type: string;
  destination: string;
  swapFee: string;
  minerFee: string;
  prepayAmount: string;
  channel: string;
  advanced: boolean;
  htlc: boolean;
  onClose(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

class QuoteModal extends React.Component<Props> {
  componentWillUpdate(nextProps: Props) {
    if (!this.props.isOpen && nextProps.isOpen) {
      // Fire even if amt is in store in case we need to cycle
      this.props.getLoopOutQuote(this.props.amount, this.props.sweepConfirmationTarget);
    }
  }
  render() {
    const {
      loopQuote,
      amount,
      sweepConfirmationTarget,
      isOpen,
      onClose,
      type,
      hasPassword,
      error,
    } = this.props;
    if (loopQuote === null) {
      return null;
    }
    const actions: ButtonProps[] = [
      {
        children: (
          <>
            <Icon type="lightning" theme="filled" /> {`${type}`}
          </>
        ),
        type: 'primary' as any,
      },
    ];
    if (loopQuote === null) {
      return null;
    }
    const isVisible = !!isOpen && !!(hasPassword || error);

    let content;
    if (loopQuote.miner_fee !== '') {
      content = (
        <div className="QuoteModal">
          <p>{`Miner fee: ${loopQuote.miner_fee} sats`}</p>
          <p>{`Prepay amt: ${
            loopQuote.prepay_amt === undefined ? '1337' : loopQuote.prepay_amt
          } sats`}</p>
          <p>{`Swap fee: ${loopQuote.swap_fee} sats`}</p>
          <p>{`Swap amt: ${amount} sats`}</p>
          <p>{`Sweep Conf. Target: ${sweepConfirmationTarget}`}</p>
          {actions.map((props, idx) => (
            <Button
              key={idx}
              {...props}
              onClick={
                this.props.type === LOOP_TYPE.LOOP_OUT ? this.loopOut : this.loopIn
              }
            />
          ))}
        </div>
      );
    } else if (error) {
      content = (
        <Alert
          type="error"
          message="Failed to get quote"
          description={error.message}
          showIcon
        />
      );
    }
    return (
      <Modal
        title={`${type} Quote`}
        visible={isVisible}
        onCancel={onClose}
        okButtonProps={{ style: { display: 'none' } }}
        centered
      >
        <div className="QuoteModal-content">{content}</div>
      </Modal>
    );
  }

  private loopOut = () => {
    // get values from loopOutQuote for default loopOut
    const loopOutQuote = this.props.loopQuote;
    const loopOut = this.props.loop;
    const { advanced, minerFee, prepayAmount, swapFee } = this.props;
    if (loopOutQuote === null) {
      return null;
    }
    if (loopOut === null) {
      return null;
    }
    const req: GetLoopOutArguments = {
      amt: this.props.amount,
      dest: this.props.destination,
      loop_out_channel: this.props.channel,
      max_miner_fee: advanced ? minerFee : loopOutQuote.miner_fee,
      max_prepay_amt: advanced ? prepayAmount : loopOutQuote.prepay_amt,
      max_prepay_routing_fee: advanced ? prepayAmount : loopOutQuote.prepay_amt,
      max_swap_fee: advanced ? swapFee : loopOutQuote.swap_fee,
      max_swap_routing_fee: advanced ? swapFee : loopOutQuote.swap_fee,
      sweep_conf_target: this.props.sweepConfirmationTarget,
    };
    this.props.getLoopOut(req);
    setTimeout(() => {
      message.info(`Attempting ${this.props.type}`, 2);
    }, 1000);
    setTimeout(() => {
      this.props.onClose();
    }, 3000);
  };

  private loopIn = () => {
    // get values from loopOutQuote for default loopIn
    const loopInQuote = this.props.loopQuote;
    const loopIn = this.props.loop;
    const { advanced, minerFee, swapFee } = this.props;
    if (loopInQuote === null) {
      return null;
    }
    if (loopIn === null) {
      return null;
    }
    const req: GetLoopInArguments = {
      amt: this.props.amount,
      loop_in_channel: this.props.channel,
      max_miner_fee: advanced ? minerFee : loopInQuote.miner_fee,
      max_swap_fee: advanced ? swapFee : loopInQuote.swap_fee,
      external_htlc: this.props.htlc,
    };

    this.props.getLoopIn(req);
    setTimeout(() => {
      message.info(`Attempting ${this.props.type}`, 2);
    }, 1000);
    setTimeout(() => {
      this.props.onClose();
    }, 3000);
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    hasPassword: !!state.crypto.password,
    loopQuote: state.loop.loopQuote,
    loop: state.loop.loop,
    error: state.loop.error,
  }),
  {
    getLoopOutQuote,
    getLoopIn,
    getLoopOut,
  },
)(QuoteModal);
