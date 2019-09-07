import React from 'react';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import { AppState } from 'store/reducers';
import { getLoopOutQuote, loopOut, loopIn, getLoopInQuote } from 'modules/loop/actions';
import { Button, Alert } from 'antd';
import { LoopOutArguments, LoopInArguments } from 'lib/loop-http/types';
import { LOOP_TYPE } from 'utils/constants';
import Loader from 'components/Loader';
import DetailsTable from 'components/DetailsTable';
import './QuoteModal.less';

interface StateProps {
  out: AppState['loop']['out'];
  in: AppState['loop']['in'];
}

interface DispatchProps {
  getLoopOutQuote: typeof getLoopOutQuote;
  getLoopInQuote: typeof getLoopInQuote;
  loopOut: typeof loopOut;
  loopIn: typeof loopIn;
}

interface OwnProps {
  loopType: LOOP_TYPE;
  amount: string;
  channel?: string;
  isOpen?: boolean;
  destination?: string;
  maxSwapFee?: string;
  maxMinerFee?: string;
  maxPrepayAmount?: string;
  sweepConfirmationTarget?: string;
  htlc?: boolean;
  onClose(): void;
  onComplete(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

class QuoteModal extends React.Component<Props> {
  componentWillUpdate(nextProps: Props) {
    const p = this.props;
    if (!p.isOpen && nextProps.isOpen) {
      const action =
        p.loopType === LOOP_TYPE.LOOP_OUT ? p.getLoopOutQuote : p.getLoopInQuote;
      action(p.amount, p.sweepConfirmationTarget);
    }
  }

  render() {
    const { loopType, amount, isOpen, onClose, onComplete } = this.props;

    const isOut = loopType === LOOP_TYPE.LOOP_OUT;
    const loop = isOut ? this.props.out : this.props.in;

    let content;
    if (loop.isFetchingTerms || loop.isLooping) {
      content = (
        <div className="QuoteModal-loader">
          <Loader />
        </div>
      );
    } else if (loop.fetchQuoteError) {
      content = (
        <Alert
          type="error"
          message="Failed to get quote"
          description={loop.fetchQuoteError.message}
          showIcon
        />
      );
    } else if (loop.loopError) {
      content = (
        <Alert
          type="error"
          message="Failed to start loop"
          description={loop.loopError.message}
          showIcon
        />
      );
    } else if (loop.loopReceipt) {
      const details = [
        {
          label: 'Loop ID',
          value: loop.loopReceipt.id,
        },
        {
          label: 'HTLC Address',
          value: loop.loopReceipt.htlc_address,
        },
      ];
      content = (
        <>
          <h2>Your loop has been submitted</h2>
          <DetailsTable details={details} />
          <p>
            It will take some time for the on-chain transactions to show up, so don't
            worry if your balances don't seem correct for the next few hours.
          </p>
          <Button type="primary" size="large" onClick={onComplete}>
            OK
          </Button>
        </>
      );
    } else if (loop.quote) {
      const totalFees =
        parseInt(loop.quote.miner_fee, 10) + parseInt(loop.quote.swap_fee, 10);
      const details = [
        {
          label: 'Miner fee (Estimate)',
          value: `~${loop.quote.miner_fee} sats`,
          help: `
            Amount in on-chain fees to do the loop. Miner fees may be more
            than quoted if the transaction doesn't confirm within the sweep
            window.
          `,
        },
        {
          label: 'Swap fee',
          value: `${loop.quote.swap_fee} sats`,
          help: `
            How much the Loop liquidity provider is charging for their service.
          `,
        },
        {
          label: 'Prepay fee',
          value: `${loop.quote.prepay_amt} sats`,
          help: `
            Some of the swap fee is prepaid to avoid spam and abuse of the
            Loop liquidity provider. This goes towards the total swap fee.
            This will not be refunded if the swap doesn't complete.
          `,
        },
        {
          label: 'Total fees',
          value: `${totalFees} sats`,
        },
      ];
      content = (
        <>
          <DetailsTable details={details} />
          <div className="QuoteModal-buttons">
            <Button
              size="large"
              type="primary"
              onClick={isOut ? this.loopOut : this.loopIn}
              block
            >
              {`Start looping ${isOut ? 'out' : 'in'} ${amount} sats`}
            </Button>
          </div>
        </>
      );
    }

    return (
      <Modal
        title="Loop Quote"
        visible={isOpen}
        onCancel={onClose}
        footer={null}
        closable={!loop.isLooping && !loop.loopReceipt}
        centered
      >
        <div className="QuoteModal">{content}</div>
      </Modal>
    );
  }

  private loopOut = () => {
    const p = this.props;
    const { quote } = p.out;
    if (!quote) {
      return null;
    }

    const req: LoopOutArguments = {
      amt: p.amount,
      dest: p.destination,
      loop_out_channel: p.channel,
      max_miner_fee: p.maxMinerFee || quote.miner_fee,
      max_prepay_amt: p.maxPrepayAmount || quote.prepay_amt,
      max_prepay_routing_fee: p.maxPrepayAmount || quote.prepay_amt,
      max_swap_fee: p.maxSwapFee || quote.swap_fee,
      max_swap_routing_fee: p.maxSwapFee || quote.swap_fee,
      sweep_conf_target: p.sweepConfirmationTarget,
    };
    p.loopOut(req);
  };

  private loopIn = () => {
    // get values from loopInQuote for default loopIn
    const p = this.props;
    const { quote } = p.in;
    if (!quote) {
      return null;
    }

    const req: LoopInArguments = {
      amt: p.amount,
      loop_in_channel: p.channel,
      max_miner_fee: p.maxMinerFee || quote.miner_fee,
      max_swap_fee: p.maxSwapFee || quote.swap_fee,
      external_htlc: p.htlc,
    };
    this.props.loopIn(req);
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    out: state.loop.out,
    in: state.loop.in,
  }),
  {
    getLoopOutQuote,
    getLoopInQuote,
    loopIn,
    loopOut,
  },
)(QuoteModal);
