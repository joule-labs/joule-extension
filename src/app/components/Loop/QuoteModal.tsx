import React from 'react';
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { AppState } from 'store/reducers';
import { getLoopOutQuote, getLoopOut } from 'modules/loop/actions';
import { Button, Icon } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import { GetLoopOutArguments } from 'lib/loop-http/types';

interface StateProps {
  loopOutQuote: AppState['loop']['loopOutQuote'];
  loopOut: AppState['loop']['loopOut'];
  error: AppState['loop']['error'];
}

interface DispatchProps {
  getLoopOutQuote: typeof getLoopOutQuote;
  getLoopOut: typeof getLoopOut;
}

interface OwnProps {
  amt: string;
  isOpen?: boolean;
  type: string;
  dest: string;
  srf: string;
  sf: string;
  mf: string;
  pre: string;
  chan: string;
  adv: boolean;
  onClose(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

class QuoteModal extends React.Component<Props> {
  componentDidUpdate() {
    const { loopOutQuote, loopOut, isOpen, type, amt, error } = this.props;
    if (loopOutQuote === null) {
      return null;
    }
    if (loopOut === null) {
      return null;
    }
    const swapFee = loopOutQuote.swap_fee;
    if (swapFee === null) {
      return null;
    }
    if (isOpen === true && swapFee === '') {
      this.props.getLoopOutQuote(amt);
    }
    if (loopOut.id !== '') {
      message.info(`Attempting ${type} to htlc: ${loopOut.htlc_address}`, 10);
      this.props.onClose();
    }
    if (error !== null) {
      message.error(`Error: ${error}`, 10);
      this.props.onClose();
    }
  }
  render() {
    const { loopOutQuote, amt, isOpen, onClose, type } = this.props;
    if (loopOutQuote === null) {
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
    if (loopOutQuote === null) {
      return null;
    }
    const isVisible = !!isOpen;

    // Placeholders to keep the modal the right size
    const content = (
      <>
        <div className="QuoteModal">
          <p>{`Miner fee: ${loopOutQuote.miner_fee} sats |
               Prepay amt: ${loopOutQuote.prepay_amt} sats |
               Swap fee: ${loopOutQuote.swap_fee} sats |
               Swap amt: ${amt} sats`}</p>
          {actions.map((props, idx) => (
            <Button key={idx} {...props} onClick={this.loopOut} />
          ))}
        </div>
      </>
    );

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
    const loopOutQuote = this.props.loopOutQuote;
    if (loopOutQuote === null) {
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
    };
    this.props.getLoopOut(req);
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    loopOutQuote: state.loop.loopOutQuote,
    loopOut: state.loop.loopOut,
    error: state.loop.error,
  }),
  {
    getLoopOutQuote,
    getLoopOut,
  },
)(QuoteModal);
