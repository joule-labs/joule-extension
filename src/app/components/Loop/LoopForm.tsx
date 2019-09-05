import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import './index.less';
import {
  Menu,
  Select,
  Form,
  Button,
  Icon,
  Radio,
  Collapse,
  Input,
  Switch,
  message,
} from 'antd';
const { Panel } = Collapse;
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
  advanced: boolean;
  isAnyValue: boolean;
  destination: string;
  swapFee: string;
  minerFee: string;
  prepayAmt: string;
  channel: string;
  conf: string;
  htlc: boolean;
  quoteModalIsOpen: boolean;
  loopType: LOOP_TYPE;
}

const INITIAL_STATE = {
  amount: '0',
  advanced: false,
  isAnyValue: false,
  destination: '',
  swapFee: '0',
  minerFee: '0',
  prepayAmt: '0',
  channel: '',
  conf: '2',
  htlc: false,
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
      isAnyValue,
      amount,
      loopType,
      destination,
      swapFee,
      minerFee,
      prepayAmt,
      channel,
      quoteModalIsOpen,
      advanced,
      conf,
      htlc,
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
      const minSwapAmount = parseInt(loop.terms.min_swap_amount, 10);
      const maxSwapAmount = parseInt(loop.terms.max_swap_amount, 10);

      const openChannels = channels.filter(c => {
        if (c.status !== CHANNEL_STATUS.OPEN) {
          return false;
        }
        // Loop out needs local balance, loop in needs remote balance
        return isOut
          ? parseInt(c.local_balance, 10) > minSwapAmount
          : parseInt(c.remote_balance, 10) > minSwapAmount;
      }) as OpenChannelWithNode[];

      const loopTermsText = (
        <>
          <strong>Base Fee</strong> : {loop.terms.swap_fee_base} sats <br />
          <strong>Fee Rate</strong> : {loop.terms.swap_fee_rate} sats <br />
          <strong>Prepay Amount</strong> : {loop.terms.prepay_amt} sats <br />
          <strong> Min Swap Amount</strong> : {loop.terms.min_swap_amount} sats <br />
          <strong>Max Swap Amount</strong> : {loop.terms.max_swap_amount} sats <br />
          <strong>CLTV Delta</strong> : {loop.terms.cltv_delta} blocks
        </>
      );

      const amountInt = parseInt(amount, 10);
      const isQuoteDisabled =
        !amount || amountInt < minSwapAmount || amountInt > maxSwapAmount;

      content = (
        <>
          <div className="LoopForm-terms">
            {loop.terms.swap_fee_base !== '' && (
              <Collapse bordered={false} defaultActiveKey={['1']}>
                <Panel header={`View ${loopType} Terms`} key="1">
                  <p>{loopTermsText}</p>
                </Panel>
              </Collapse>
            )}
          </div>

          <Button
            className="LoopForm-advancedToggle"
            onClick={this.toggleAdvanced}
            type="primary"
            ghost
          >
            {this.state.advanced ? 'Hide advanced fields' : 'Show advanced fields'}
          </Button>

          <Form className="LoopForm-form" layout="vertical">
            <Form.Item>
              <Select defaultValue="Select Channel">
                {openChannels.map(c => (
                  <Menu.Item
                    key={c.chan_id}
                    onClick={() => this.handleSetChannelId(c.chan_id)}
                  >
                    {`${c.node.alias} (${c.local_balance} sats available)`}
                  </Menu.Item>
                ))}
              </Select>
            </Form.Item>
            <AmountField
              label="Amount"
              amount={amount}
              required={!isAnyValue}
              disabled={isAnyValue}
              onChangeAmount={this.handleChangeAmount}
              showFiat
            />

            <div className="Loop-actions">
              <Button
                type="primary"
                onClick={this.openQuoteModal}
                disabled={isQuoteDisabled}
              >
                <Icon type="question-circle" theme="filled" /> {`${loopType} Quote`}
              </Button>
            </div>

            {advanced && (
              <div className="LoopForm-advanced">
                {isOut && (
                  <Form.Item>
                    <Input
                      type="text"
                      size="small"
                      name={destination}
                      onChange={this.handleChangeField}
                      placeholder="Off-chain address"
                      autoFocus
                    />
                  </Form.Item>
                )}
                <Form.Item>
                  <Input
                    width="50%"
                    size="small"
                    name={swapFee}
                    onChange={this.handleChangeField}
                    placeholder="Swap fee"
                    autoFocus
                  />
                </Form.Item>
                <Form.Item>
                  <Input
                    size="small"
                    name={minerFee}
                    onChange={this.handleChangeField}
                    placeholder="Miner fee"
                    autoFocus
                  />
                </Form.Item>
                {isOut && (
                  <Form.Item>
                    <Input
                      size="small"
                      name={prepayAmt}
                      onChange={this.handleChangeField}
                      placeholder="Prepay amount"
                      autoFocus
                    />
                  </Form.Item>
                )}
                {isOut && (
                  <Form.Item>
                    <Input
                      size="small"
                      name={conf}
                      onChange={this.handleChangeField}
                      placeholder="Sweep conf. target"
                      autoFocus
                    />
                  </Form.Item>
                )}
                {!isOut && (
                  <span>
                    <p>External HTLC?</p>
                    <Form.Item>
                      <Switch
                        checkedChildren="true"
                        unCheckedChildren="false"
                        onChange={this.handleChangeHtlc}
                      />
                    </Form.Item>
                  </span>
                )}
              </div>
            )}
          </Form>

          <QuoteModal
            isOpen={quoteModalIsOpen}
            loopType={loopType}
            amount={amount}
            destination={destination}
            swapFee={swapFee}
            minerFee={minerFee}
            prepayAmount={prepayAmt}
            channel={channel}
            advanced={advanced}
            htlc={htlc}
            sweepConfirmationTarget={conf}
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

  private handleSetChannelId(channel: string) {
    this.setState({ channel });
  }

  private handleChangeAmount = (amount: string) => {
    this.setState({ amount });
  };

  private handleChangeField = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: ev.currentTarget.value });
  };

  private handleChangeHtlc = (htlc: boolean) => {
    this.setState({ htlc });
  };

  private openQuoteModal = () => {
    if (this.state.channel === '') {
      message.warn('Please set Channel', 2);
    } else {
      this.setState({ quoteModalIsOpen: true });
    }
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
