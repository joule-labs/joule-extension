import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import './index.less';
import { setLoop } from 'modules/loop/actions';
import { ButtonProps } from 'antd/lib/button';
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
import InputLoopAddress from 'components/Loop/InputLoopAddress';
import QuoteModal from './QuoteModal';
import { ChannelWithNode } from 'modules/channels/types';
import { LOOP_TYPE } from 'utils/constants';

interface StateProps {
  channels: AppState['channels']['channels'];
  isCheckingLoop: AppState['loop']['isCheckingLoop'];
  url: AppState['loop']['url'];
  lib: AppState['loop']['lib'];
  loopOutTerms: AppState['loop']['loopOutTerms'];
  loopInTerms: AppState['loop']['loopInTerms'];
  loopQuote: AppState['loop']['loopQuote'];
  loop: AppState['loop']['loop'];
  error: AppState['loop']['error'];
}

interface DispatchProps {
  setLoop: typeof setLoop;
}

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
  loopType: string;
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

type Props = StateProps & DispatchProps;

class Loop extends React.Component<Props> {
  state: State = { ...INITIAL_STATE };

  componentDidMount() {
    const loopUrl = this.props.url;
    if (loopUrl !== null) {
      this.props.setLoop(loopUrl);
    }
  }
  render() {
    const {
      url,
      loopOutTerms,
      loopInTerms,
      channels,
      isCheckingLoop,
      error,
    } = this.props;

    if (channels === null || !loopOutTerms || !loopInTerms) {
      return null;
    }

    // Only return channels with enough loot for looping out
    const openChannelsLoopOut = channels.filter(
      o =>
        o.status === 'OPEN' &&
        parseInt(o.local_balance, 10) > parseInt(loopOutTerms.min_swap_amount, 10),
    );
    // Only return channels with enough loot for looping in
    const openChannelsLoopIn = channels.filter(
      o =>
        o.status === 'OPEN' &&
        parseInt(o.capacity, 10) - parseInt(o.local_balance, 10) >
          parseInt(loopInTerms.min_swap_amount, 10),
    );

    // Get channels to choose from
    const loopOutItems = openChannelsLoopOut.map(c => (
      <Menu.Item
        key={c.channel_point}
        onClick={() => this.handleSetChannelId(c.channel_point, openChannelsLoopOut)}
      >
        {`${c.node.alias} => ${c.local_balance} sats available`}
      </Menu.Item>
    ));
    const loopInItems = openChannelsLoopIn.map(c => (
      <Menu.Item
        key={c.channel_point}
        onClick={() => this.handleSetChannelId(c.channel_point, openChannelsLoopIn)}
      >
        {`${c.node.alias} => ${c.local_balance} sats available`}
      </Menu.Item>
    ));

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

    const loopItems = loopType === LOOP_TYPE.LOOP_OUT ? loopOutItems : loopInItems;
    const loopMenu = <Select defaultValue={'Select Channel'}>{loopItems}</Select>;

    const loopTerms = loopType === LOOP_TYPE.LOOP_OUT ? loopOutTerms : loopInTerms;
    const loopTermsText = (
      <>
        <strong>Base Fee</strong> : {loopTerms.swap_fee_base} sats <br />
        <strong>Fee Rate</strong> : {loopTerms.swap_fee_rate} sats <br />
        <strong>Prepay Amount</strong> :{' '}
        {loopTerms.prepay_amt === undefined ? '1337' : loopTerms.prepay_amt} sats <br />
        <strong> Min Swap Amount</strong> : {loopTerms.min_swap_amount} sats <br />
        <strong>Max Swap Amount</strong> : {loopTerms.max_swap_amount} sats <br />
        <strong>CLTV Delta</strong> : {loopTerms.cltv_delta} blocks
      </>
    );

    const actions: ButtonProps[] = [
      {
        children: (
          <>
            <Icon type="question-circle" theme="filled" /> {`${loopType} Quote`}
          </>
        ),
        type: 'primary' as any,
      },
    ];

    if (loopTerms === null) {
      return null;
    }

    return (
      <>
        <div>
          <Radio.Group defaultValue="a" size="large">
            <Radio.Button value="a" onClick={this.setLoopOutType}>
              Loop Out
            </Radio.Button>
            <Radio.Button value="b" onClick={this.setLoopInType}>
              Loop In
            </Radio.Button>
          </Radio.Group>
        </div>
        <div className="Loop">
          {url === null && (
            <InputLoopAddress
              setLoop={this.props.setLoop}
              isCheckingLoop={isCheckingLoop}
              error={error}
              initialUrl={this.props.url}
              type={loopType}
            />
          )}
          <div className="Loop-terms">
            {loopTerms.swap_fee_base !== '' && (
              <Collapse bordered={false} defaultActiveKey={['1']}>
                <Panel header="View Loop Terms" key="1">
                  <p>{loopTermsText}</p>
                </Panel>
              </Collapse>
            )}
          </div>
          <br />
          <Button
            className="Loop-form-advancedToggle"
            onClick={this.toggleAdvanced}
            type="primary"
            ghost
          >
            {this.state.advanced ? 'Hide advanced fields' : 'Show advanced fields'}
          </Button>
          <Form className="Loop" layout="vertical">
            {url !== null && <Form.Item>{loopMenu}</Form.Item>}
            {advanced && loopType === LOOP_TYPE.LOOP_OUT && (
              <Form.Item>
                <Input
                  type="text"
                  size="small"
                  name={destination}
                  onChange={this.handleChangeField}
                  placeholder="off-chain address"
                  autoFocus
                />
              </Form.Item>
            )}
            {advanced && (
              <Form.Item>
                <Input
                  width="50%"
                  size="small"
                  name={swapFee}
                  onChange={this.handleChangeField}
                  placeholder="swap fee"
                  autoFocus
                />
              </Form.Item>
            )}
            {advanced && (
              <Form.Item>
                <Input
                  size="small"
                  name={minerFee}
                  onChange={this.handleChangeField}
                  placeholder="miner fee"
                  autoFocus
                />
              </Form.Item>
            )}
            {advanced && loopType === LOOP_TYPE.LOOP_OUT && (
              <Form.Item>
                <Input
                  size="small"
                  name={prepayAmt}
                  onChange={this.handleChangeField}
                  placeholder="prepay amt"
                  autoFocus
                />
              </Form.Item>
            )}
            {advanced && loopType === LOOP_TYPE.LOOP_OUT && (
              <Form.Item>
                <Input
                  size="small"
                  name={conf}
                  onChange={this.handleChangeField}
                  placeholder="sweep confirmation target"
                  autoFocus
                />
              </Form.Item>
            )}
            {advanced && loopType === LOOP_TYPE.LOOP_IN && (
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
          </Form>
          <AmountField
            label="Amount"
            amount={amount}
            required={!isAnyValue}
            disabled={isAnyValue}
            onChangeAmount={this.handleChangeAmount}
            showFiat
          />
          <div className="Loop-actions">
            {/* Don't allow for quote until amount greater than min swap amount is entered and less than max swap amount*/}
            {this.state.amount !== null &&
              this.state.amount !== undefined &&
              parseInt(this.state.amount, 10) > parseInt(loopTerms.min_swap_amount, 10) &&
              parseInt(this.state.amount, 10) < parseInt(loopTerms.max_swap_amount, 10) &&
              actions.map((props, idx) => (
                <Button key={idx} {...props} onClick={this.openQuoteModal} />
              ))}
          </div>
          <QuoteModal
            amount={amount}
            isOpen={quoteModalIsOpen}
            onClose={this.openQuoteModal}
            type={loopType}
            destination={destination}
            swapFee={swapFee}
            minerFee={minerFee}
            prepayAmount={prepayAmt}
            channel={channel}
            advanced={advanced}
            htlc={htlc}
            /**
             * TODO update as needed for future iterations
             * of loop
             */
            sweepConfirmationTarget={
              this.state.loopType === LOOP_TYPE.LOOP_OUT ? conf : ''
            }
          />
        </div>
      </>
    );
  }

  private handleSetChannelId(point: string, openChannels: ChannelWithNode[]) {
    // Work-around to grab channel id and pass to Loop API
    const match = openChannels.filter(id => id.channel_point === point);
    const keys = Object.keys(match);
    const jsonClone = JSON.parse(JSON.stringify(match));
    const key = keys[0];
    const channelId = jsonClone[key].chan_id;
    message.success('Channel set successfully!');
    this.setState({ channel: channelId });
  }

  private handleChangeAmount = (amount: string) => {
    this.setState({ amount });
  };

  private handleChangeField = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: ev.currentTarget.value });
  };

  private handleChangeHtlc = (checked: boolean) => {
    this.setState({
      htlc: checked,
    });
  };

  private openQuoteModal = () => {
    if (this.state.channel === '') {
      message.warn('Please set Channel', 2);
    } else {
      this.setState({
        ...this.state,
        quoteModalIsOpen: this.state.quoteModalIsOpen === false ? true : false,
      });
    }
  };

  private setLoopOutType = () => {
    this.setState({ loopType: LOOP_TYPE.LOOP_OUT });
  };

  private setLoopInType = () => {
    this.setState({ loopType: LOOP_TYPE.LOOP_IN });
  };

  private toggleAdvanced = () => {
    this.setState({ advanced: this.state.advanced === false ? true : false });
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    channels: state.channels.channels,
    isCheckingLoop: state.loop.isCheckingLoop,
    url: state.loop.url,
    lib: state.loop.lib,
    loopOutTerms: state.loop.loopOutTerms,
    loopInTerms: state.loop.loopInTerms,
    loopQuote: state.loop.loopQuote,
    loop: state.loop.loop,
    error: state.loop.error,
  }),
  {
    setLoop,
  },
)(Loop);
