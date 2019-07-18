import React from 'react';
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { AppState } from 'store/reducers';
import { getLoopOutQuote, getLoopOut } from 'modules/loop/actions';
import { Button, Icon, Alert } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import { GetLoopOutArguments } from 'lib/loop-http/types';

interface StateProps {
  loopOutQuote: AppState['loop']['loopOutQuote'];
  loopOut: AppState['loop']['loopOut'];
  error: AppState['loop']['error'];
  hasPassword: boolean;
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
  componentWillUpdate(nextProps: Props) {
    if (!this.props.isOpen && nextProps.isOpen) {
      // Fire even if amt is in store in case we need to cycle
      this.props.getLoopOutQuote(this.props.amt);
    }
  }
  render() {
    const {
      loopOutQuote,
      amt,
      adv,
      isOpen,
      onClose,
      type,
      hasPassword,
      error,
    } = this.props;
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
    const isVisible = !!isOpen && !!(hasPassword || error);

    let content;
    if (loopOutQuote.miner_fee !== '') {
      content = (
        <>
          <div className="QuoteModal">
            <p>{`Miner fee: ${loopOutQuote.miner_fee} sats`}</p>
            <p>{`Prepay amt: ${loopOutQuote.prepay_amt} sats`}</p>
            <p>{`Swap fee: ${loopOutQuote.swap_fee} sats`}</p>
            <p>{`Swap amt: ${amt} sats`}</p>

            {/* Default Loop  */}
            {adv === false &&
              actions.map((props, idx) => (
                <Button key={idx} {...props} onClick={this.loopOut} />
              ))}
            {/* Advanced Loop */}
            {adv === true &&
              actions.map((props, idx) => (
                <Button key={idx} {...props} onClick={this.advLoopOut} />
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
    const loopOutQuote = this.props.loopOutQuote;
    const loopOut = this.props.loopOut;
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
    };
    this.props.getLoopOut(req);
    setTimeout(() => {
      message.info(`Attempting ${this.props.type}`, 2);
    }, 3000);
    setTimeout(() => {
      this.props.onClose();
    }, 5000);
  };

  private advLoopOut = () => {
    // get values from loopOutQuote for default loopOut
    const loopOutQuote = this.props.loopOutQuote;
    const loopOut = this.props.loopOut;
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
    };
    this.props.getLoopOut(req);
    setTimeout(() => {
      message.info(`Attempting advanced ${this.props.type}`, 2);
    }, 3000);
    setTimeout(() => {
      this.props.onClose();
    }, 5000);
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    hasPassword: !!state.crypto.password,
    loopOutQuote: state.loop.loopOutQuote,
    loopOut: state.loop.loopOut,
    error: state.loop.error,
  }),
  {
    getLoopOutQuote,
    getLoopOut,
  },
)(QuoteModal);
