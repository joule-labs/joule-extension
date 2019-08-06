import React from 'react';
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { AppState } from 'store/reducers';
import { getLoopOutQuote, getLoopOut, getLoopIn } from 'modules/loop/actions';
import { Button, Icon, Alert } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import { GetLoopOutArguments, GetLoopInArguments } from 'lib/loop-http/types';

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
  amt: string;
  sct: string;
  isOpen?: boolean;
  type: string;
  dest: string;
  srf: string;
  sf: string;
  mf: string;
  pre: string;
  chan: string;
  adv: boolean;
  htlc: boolean;
  onClose(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

class QuoteModal extends React.Component<Props> {
  componentWillUpdate(nextProps: Props) {
    if (!this.props.isOpen && nextProps.isOpen) {
      // Fire even if amt is in store in case we need to cycle
      this.props.getLoopOutQuote(this.props.amt, this.props.sct);
    }
  }
  render() {
    const {
      loopQuote,
      amt,
      sct,
      adv,
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
        <>
          <div className="QuoteModal">
            <p>{`Miner fee: ${loopQuote.miner_fee} sats`}</p>
            <p>{`Prepay amt: ${
              loopQuote.prepay_amt === undefined ? '1337' : loopQuote.prepay_amt
            } sats`}</p>
            <p>{`Swap fee: ${loopQuote.swap_fee} sats`}</p>
            <p>{`Swap amt: ${amt} sats`}</p>
            <p>{`Sweep Conf. Target: ${sct}`}</p>

            {/* Default Loop  */}
            {adv === false &&
              actions.map((props, idx) => (
                <Button
                  key={idx}
                  {...props}
                  onClick={this.props.type === 'Loop Out' ? this.loopOut : this.loopIn}
                />
              ))}
            {/* Advanced Loop */}
            {adv === true &&
              actions.map((props, idx) => (
                <Button
                  key={idx}
                  {...props}
                  onClick={
                    this.props.type === 'Loop Out' ? this.advLoopOut : this.advLoopIn
                  }
                />
              ))}
          </div>
        </>
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
        <div className="QuoteModal">{content}</div>
      </Modal>
    );
  }

  private loopOut = () => {
    // get values from loopOutQuote for default loopOut
    const loopOutQuote = this.props.loopQuote;
    const loopOut = this.props.loop;
    if (loopOutQuote === null) {
      return null;
    }
    if (loopOut === null) {
      return null;
    }
    const req: GetLoopOutArguments = {
      amt: this.props.amt,
      dest: this.props.dest,
      loop_out_channel: this.props.chan,
      max_miner_fee: loopOutQuote.miner_fee,
      max_prepay_amt: loopOutQuote.prepay_amt,
      max_prepay_routing_fee: loopOutQuote.prepay_amt,
      max_swap_fee: loopOutQuote.swap_fee,
      max_swap_routing_fee: loopOutQuote.swap_fee,
      sweep_conf_target: this.props.sct,
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
    // get values from loopOutQuote for default loopOut
    const loopInQuote = this.props.loopQuote;
    const loopIn = this.props.loop;
    if (loopInQuote === null) {
      return null;
    }
    if (loopIn === null) {
      return null;
    }
    const req: GetLoopInArguments = {
      amt: this.props.amt,
      loop_in_channel: this.props.chan,
      max_miner_fee: loopInQuote.miner_fee,
      max_prepay_amt: loopInQuote.prepay_amt,
      max_prepay_routing_fee: loopInQuote.prepay_amt,
      max_swap_fee: loopInQuote.swap_fee,
      max_swap_routing_fee: loopInQuote.swap_fee,
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

  private advLoopOut = () => {
    // get values from loopOutQuote for default loopOut
    const loopOutQuote = this.props.loopQuote;
    const loopOut = this.props.loop;
    if (loopOutQuote === null) {
      return null;
    }
    if (loopOut === null) {
      return null;
    }
    const req: GetLoopOutArguments = {
      amt: this.props.amt,
      dest: this.props.dest,
      loop_out_channel: this.props.chan,
      max_miner_fee: this.props.mf,
      max_prepay_amt: this.props.pre,
      max_prepay_routing_fee: this.props.pre,
      max_swap_fee: this.props.sf,
      max_swap_routing_fee: this.props.srf,
      sweep_conf_target: this.props.sct,
    };
    this.props.getLoopOut(req);
    setTimeout(() => {
      message.info(`Attempting advanced ${this.props.type}`, 2);
    }, 1000);
    setTimeout(() => {
      this.props.onClose();
    }, 3000);
  };

  private advLoopIn = () => {
    // get values from loopOutQuote for default loopOut
    const loopInQuote = this.props.loopQuote;
    const loopIn = this.props.loop;
    if (loopInQuote === null) {
      return null;
    }
    if (loopIn === null) {
      return null;
    }
    const req: GetLoopInArguments = {
      amt: this.props.amt,
      loop_in_channel: this.props.chan,
      max_miner_fee: this.props.mf,
      max_prepay_amt: this.props.pre,
      max_prepay_routing_fee: this.props.pre,
      max_swap_fee: this.props.sf,
      max_swap_routing_fee: this.props.srf,
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
