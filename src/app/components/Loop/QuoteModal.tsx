import React from 'react';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import { AppState } from 'store/reducers';
import { getLoopOutQuote, getLoopOut } from 'modules/loop/actions';
import { Button, Icon } from 'antd';
import { ButtonProps } from 'antd/lib/button';

interface StateProps {
  loopOutQuote: AppState['loop']['loopOutQuote'];
}

interface DispatchProps {
  getLoopOutQuote: typeof getLoopOutQuote;
  getLoopOut: typeof getLoopOut;
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
    const actions: ButtonProps[] = [
      {
        children: (
          <>
            <Icon type="lightning" theme="filled" /> Loop
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
            <Button key={idx} {...props} onClick={this.props.getLoopOut} />
          ))}
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
    getLoopOut,
  },
)(QuoteModal);
