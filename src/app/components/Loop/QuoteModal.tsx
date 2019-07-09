import React from 'react';
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { AppState } from 'store/reducers';
import { getLoopOutQuote, getLoopOut } from 'modules/loop/actions';
import { Button, Icon } from 'antd';
import { ButtonProps } from 'antd/lib/button';

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
  srf: string | null;
  sf: string;
  mf: string;
  pre: string;
  chan: string | null;
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
    const {
      loopOutQuote,
      amt,
      isOpen,
      onClose,
      type,
      srf,
      /*sf, mf,*/ pre,
      dest,
      chan,
    } = this.props;
    if (loopOutQuote === null) {
      return null;
    }
    const defaultRequest = {
      amt,
      dest,
      max_swap_routing_fee: srf,
      max_prepay_routing_fee: pre,
      max_swap_fee: loopOutQuote.swap_fee,
      max_prepay_amt: loopOutQuote.prepay_amt,
      max_miner_fee: loopOutQuote.miner_fee,
      loop_out_channel: chan,
    };
    /*
    const advancedRequest = {
      amount: amt,
      dest,
      srf,
      sf,
      mf,
      pre,
      chan,
    }
    */
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
    const loop =
      type === 'Loop Out'
        ? this.props.getLoopOut
        : () => {
            console.log('Loop In - Coming Soon!');
          };
    // Placeholders to keep the modal the right size
    const content = (
      <>
        <div className="QuoteModal">
          <p>{`Miner fee: ${loopOutQuote.miner_fee} sats |
               Prepay amt: ${loopOutQuote.prepay_amt} sats |
               Swap fee: ${loopOutQuote.swap_fee} sats |
               Swap amt: ${amt} sats`}</p>
          {actions.map((props, idx) => (
            <Button key={idx} {...props} onClick={(): any => loop(defaultRequest)} />
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
