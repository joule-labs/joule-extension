import React from 'react';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import { AppState } from 'store/reducers';
import { getLoopOutQuote } from 'modules/loop/actions';

interface StateProps {
  loopOutQuote: AppState['loop']['loopOutQuote'];
}

interface DispatchProps {
  getLoopOutQuote: typeof getLoopOutQuote;
}

interface OwnProps {
  amt: string;
  isOpen?: boolean;
  onClose(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

class QuoteModal extends React.Component<Props> {
  componentDidUpdate() {
    const loopOutQuote = this.props.loopOutQuote;
    if (loopOutQuote === null) {
      return null;
    }
    const swapFee = loopOutQuote.swap_fee;
    if (swapFee === null) {
      return null;
    }
    if (this.props.isOpen === true && swapFee === '') {
      this.props.getLoopOutQuote(this.props.amt);
    }
  }
  render() {
    const { loopOutQuote, amt, isOpen, onClose } = this.props;
    if (loopOutQuote === null) {
      return null;
    }
    const isVisible = !!isOpen;
    // Placeholders to keep the modal the right size
    const content = (
      <>
        <div className="QuoteModal">
          <code>Miner fee: {loopOutQuote.miner_fee} </code>
          <code>Prepay amt: {loopOutQuote.prepay_amt} </code>
          <code>Swap fee: {loopOutQuote.swap_fee} </code>
          <code>Swap amt: {amt} </code>
        </div>
      </>
    );

    return (
      <Modal
        title={'Loop Quote'}
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
  }),
  {
    getLoopOutQuote,
  },
)(QuoteModal);
