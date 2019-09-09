import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import { Select, Form, Button, Radio, Input } from 'antd';
import AmountField from 'components/AmountField';
import QuoteModal from './QuoteModal';
import { getChannels } from 'modules/channels/actions';
import { OpenChannelWithNode } from 'modules/channels/types';
import {
  getLoopOutQuote,
  getLoopInQuote,
  getLoopOutTerms,
  getLoopInTerms,
  resetLoop,
} from 'modules/loop/actions';
import { LOOP_TYPE } from 'utils/constants';
import { CHANNEL_STATUS } from 'lib/lnd-http';
import Loader from 'components/Loader';
import BigMessage from 'components/BigMessage';
import { RadioChangeEvent } from 'antd/lib/radio';
import './LoopForm.less';
import Help from 'components/Help';

interface StateProps {
  channels: AppState['channels']['channels'];
  url: AppState['loop']['url'];
  lib: AppState['loop']['lib'];
  loopOut: AppState['loop']['out'];
  loopIn: AppState['loop']['in'];
}

interface DispatchProps {
  getChannels: typeof getChannels;
  getLoopOutTerms: typeof getLoopOutTerms;
  getLoopInTerms: typeof getLoopInTerms;
  getLoopOutQuote: typeof getLoopOutQuote;
  getLoopInQuote: typeof getLoopInQuote;
  resetLoop: typeof resetLoop;
}

interface OwnProps {
  changeUrl(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  amount: string;
  channel: string | undefined;
  advanced: boolean;
  destination: string;
  maxSwapFee: string;
  maxMinerFee: string;
  maxPrepayAmt: string;
  sweepConfirmationTarget: string;
  quoteModalIsOpen: boolean;
  loopType: LOOP_TYPE;
}

const INITIAL_STATE = {
  amount: '',
  channel: undefined,
  advanced: false,
  destination: '',
  maxSwapFee: '0',
  maxMinerFee: '0',
  maxPrepayAmt: '0',
  sweepConfirmationTarget: '6',
  quoteModalIsOpen: false,
  loopType: LOOP_TYPE.LOOP_OUT,
};

class LoopForm extends React.Component<Props> {
  state: State = { ...INITIAL_STATE };

  componentDidMount() {
    if (!this.props.channels) {
      this.props.getChannels();
    }
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    const isOut = this.state.loopType === LOOP_TYPE.LOOP_OUT;
    const loop = isOut ? this.props.loopOut : this.props.loopIn;
    const getTerms = isOut ? this.props.getLoopOutTerms : this.props.getLoopInTerms;
    if (!loop.terms && !loop.isFetchingTerms && !loop.fetchTermsError) {
      getTerms();
    }
  }

  render() {
    const { loopOut, loopIn, channels } = this.props;
    const {
      amount,
      loopType,
      destination,
      maxSwapFee,
      maxMinerFee,
      maxPrepayAmt,
      channel,
      quoteModalIsOpen,
      advanced,
      sweepConfirmationTarget,
    } = this.state;

    // Show things based on selected loop type
    const isOut = loopType === LOOP_TYPE.LOOP_OUT;
    const loop = isOut ? loopOut : loopIn;
    let content;

    // Possible errors or loader states to show
    if (channels && !channels.length) {
      content = (
        <BigMessage
          type="error"
          title="No channels to loop"
          message={`
            Looping requires you to have at least one chanel open. Try opening
            a channel and coming back.
          `}
        />
      );
    } else if (loop.fetchTermsError) {
      content = (
        <BigMessage
          type="error"
          title="Failed to fetch terms"
          message={`
            The following error occured while fetching loop terms from the
            loop server: "${loop.fetchTermsError.message}"
          `}
          button={{
            children: 'Configure Loop server',
            icon: 'setting',
            onClick: this.props.changeUrl,
          }}
        />
      );
    } else if (!channels) {
      content = <Loader />;
    } else if (!loop.terms) {
      content = <Loader />;
    } else {
      // Only show open channels that can handle the minimum swap amount
      let maxSwapAmount = 0;
      const minSwapAmount = parseInt(loop.terms.min_swap_amount, 10);
      const openChannels = channels.filter(c => {
        if (c.status !== CHANNEL_STATUS.OPEN) {
          return false;
        }
        // Loop capacity depends on if we're sending or receiving
        const capacity = parseInt(isOut ? c.local_balance : c.remote_balance, 10);
        // Max swap amount is the biggest channel we have
        maxSwapAmount = Math.max(maxSwapAmount, capacity);
        // Loop out needs local balance, loop in needs remote balance
        return capacity > minSwapAmount;
      }) as OpenChannelWithNode[];

      // Adjust max swap amount if we selected a channel
      const selectedChannel = openChannels.find(c => c.chan_id === channel);
      if (selectedChannel) {
        const channelCapacity = parseInt(
          isOut ? selectedChannel.local_balance : selectedChannel.remote_balance,
          10,
        );
        maxSwapAmount = Math.min(maxSwapAmount, channelCapacity);
      }

      // Limit max swap amount to loop server's terms
      maxSwapAmount = Math.min(maxSwapAmount, parseInt(loop.terms.max_swap_amount, 10));

      // Disable submission if something's awry
      const errors = this.getFormErrors();
      const amountInt = parseInt(amount, 10);
      const isQuoteDisabled =
        !amount ||
        amountInt < minSwapAmount ||
        amountInt > maxSwapAmount ||
        !!Object.keys(errors).length;

      content = (
        <>
          <Form className="LoopForm-form" layout="vertical" onSubmit={this.handleSubmit}>
            <Form.Item
              label={
                <>
                  Loop Channel{' '}
                  <Help>
                    Select a specific channel if you want to rebalance it, otherwise the
                    Loop server will the channel with the lowest fees.
                  </Help>
                </>
              }
            >
              <Select
                value={channel}
                onChange={this.handleChangeChannel}
                placeholder="Select a channel"
                defaultActiveFirstOption
              >
                <Select.Option value="">Auto-select channel (Default)</Select.Option>
                {openChannels.map(c => (
                  <Select.Option key={c.chan_id} value={c.chan_id}>
                    {c.node.alias} ({c.local_balance} sats available)
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <AmountField
              label="Amount"
              amount={amount}
              onChangeAmount={this.handleChangeAmount}
              minimumSats={minSwapAmount}
              maximumSats={maxSwapAmount}
              showFiat
              showMax
              showConstraints
              required
            />

            {advanced && (
              <div className="LoopForm-advanced">
                {isOut && (
                  <Form.Item
                    label={
                      <>
                        Chain destination address{' '}
                        <Help>
                          Address to send looped out funds to. Defaults to a new unused
                          address from your LND node.
                        </Help>
                      </>
                    }
                    validateStatus={errors.destination && 'error'}
                    help={errors.destination}
                  >
                    <Input
                      type="text"
                      name="destination"
                      value={destination}
                      onChange={this.handleChangeField}
                      placeholder="Bitcoin wallet address"
                      autoFocus
                    />
                  </Form.Item>
                )}
                {isOut && (
                  <Form.Item
                    label={
                      <>
                        Sweep confirmation target{' '}
                        <Help>
                          How quickly you want the loop to complete. If you're willing to
                          wait longer, setting a higher value may get you lower chain
                          fees. Your Loop server needs to stay online until the Loop has
                          completed.
                        </Help>
                      </>
                    }
                    validateStatus={errors.sweepConfirmationTarget && 'error'}
                    help={errors.sweepConfirmationTarget}
                  >
                    <Input
                      name="sweepConfirmationTarget"
                      value={sweepConfirmationTarget}
                      onChange={this.handleChangeField}
                      placeholder="Minimum 2"
                      addonAfter={`blocks (~${parseInt(sweepConfirmationTarget, 10) *
                        10} minutes)`}
                      autoFocus
                    />
                  </Form.Item>
                )}
              </div>
            )}

            {isOut && !advanced && (
              <div className="LoopForm-advancedToggle">
                <Button onClick={this.toggleAdvanced} type="primary" ghost>
                  Show advanced fields
                </Button>
              </div>
            )}

            <div className="LoopForm-actions">
              <Button
                type="primary"
                disabled={isQuoteDisabled}
                size="large"
                htmlType="submit"
                icon="thunderbolt"
              >
                Get a quote
              </Button>
              <Button size="large" icon="setting" onClick={this.props.changeUrl}>
                Settings
              </Button>
            </div>
          </Form>

          <QuoteModal
            isOpen={quoteModalIsOpen}
            loopType={loopType}
            amount={amount}
            channel={channel}
            destination={advanced ? destination : undefined}
            maxSwapFee={advanced ? maxSwapFee : undefined}
            maxMinerFee={advanced ? maxMinerFee : undefined}
            maxPrepayAmount={advanced ? maxPrepayAmt : undefined}
            sweepConfirmationTarget={sweepConfirmationTarget}
            onClose={this.closeQuoteModal}
            onComplete={this.resetState}
          />
        </>
      );
    }

    return (
      <div className="LoopForm">
        <div className="LoopForm-type">
          <Radio.Group value={loopType} onChange={this.setLoopType} size="large">
            <Radio.Button value={LOOP_TYPE.LOOP_OUT}>Loop Out</Radio.Button>
            <Radio.Button value={LOOP_TYPE.LOOP_IN}>Loop In</Radio.Button>
          </Radio.Group>
        </div>
        {content}
      </div>
    );
  }

  private getFormErrors = () => {
    const { loopIn, loopOut } = this.props;
    const { loopType, advanced, sweepConfirmationTarget, destination } = this.state;
    const errors: { [key in keyof State]?: string } = {};
    const isOut = loopType === LOOP_TYPE.LOOP_OUT;
    const loop = isOut ? loopOut : loopIn;

    if (advanced) {
      // Destination errors
      if (destination) {
        // TODO: address validation. For now, rely on loopd errors.
      }

      // Sweep confirmation target errors
      const sctAmt = parseInt(sweepConfirmationTarget, 10);
      if (Number.isNaN(sctAmt)) {
        errors.sweepConfirmationTarget = 'Must be a valid number';
      } else if (loop.terms && sctAmt > loop.terms.cltv_delta) {
        errors.sweepConfirmationTarget = `Must be less than CLTV delta (${
          loop.terms.cltv_delta
        })`;
      } else if (sctAmt < 2) {
        errors.sweepConfirmationTarget = 'Must be greater than 2';
      }
    }

    return errors;
  };

  private handleChangeChannel = (channel: string) => {
    this.setState({ channel });
  };

  private handleChangeAmount = (amount: string) => {
    this.setState({ amount });
  };

  private handleChangeField = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [ev.target.name]: ev.target.value });
  };

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    this.openQuoteModal();
  };

  private openQuoteModal = () => {
    this.setState({ quoteModalIsOpen: true });
  };

  private closeQuoteModal = () => {
    this.setState({ quoteModalIsOpen: false });
  };

  private resetState = () => {
    this.props.resetLoop();
    this.setState({ ...INITIAL_STATE });
  };

  private setLoopType = (ev: RadioChangeEvent) => {
    this.setState({ loopType: ev.target.value });
  };

  private toggleAdvanced = () => {
    this.setState({ advanced: this.state.advanced === false ? true : false });
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    channels: state.channels.channels,
    url: state.loop.url,
    lib: state.loop.lib,
    loopOut: state.loop.out,
    loopIn: state.loop.in,
  }),
  {
    getChannels,
    getLoopOutTerms,
    getLoopInTerms,
    getLoopOutQuote,
    getLoopInQuote,
    resetLoop,
  },
)(LoopForm);
