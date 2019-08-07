import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import './index.less';
import {
  getLoopOutTerms,
  setLoop,
  getLoopInTerms,
  setLoopIn,
} from 'modules/loop/actions';
import { ButtonProps } from 'antd/lib/button';
import { Form, Button, Icon, Radio, Tooltip, Input, Switch, message } from 'antd';
import AmountField from 'components/AmountField';
import InputLoopAddress from 'components/Loop/InputLoopAddress';
import QuoteModal from './QuoteModal';
import { Menu, Dropdown } from 'antd';
import { ChannelWithNode } from 'modules/channels/types';

interface StateProps {
  channels: AppState['channels']['channels'];
  url: AppState['loop']['url'];
  lib: AppState['loop']['lib'];
  loopTerms: AppState['loop']['loopTerms'];
  loopQuote: AppState['loop']['loopQuote'];
  loop: AppState['loop']['loop'];
  error: AppState['loop']['error'];
}

interface DispatchProps {
  getLoopOutTerms: typeof getLoopOutTerms;
  getLoopInTerms: typeof getLoopInTerms;
  setLoop: typeof setLoop;
  setLoopIn: typeof setLoopIn;
}

interface State {
  amount: string;
  advanced: boolean;
  isAnyValue: boolean;
  destination: string;
  swapRoutingFee: string;
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
  swapRoutingFee: '',
  swapFee: '0',
  minerFee: '0',
  prepayAmt: '0',
  channel: '',
  conf: '2',
  htlc: false,
  quoteModalIsOpen: false,
  loopType: 'Loop Out',
};

type Props = StateProps & DispatchProps;

class Loop extends React.Component<Props> {
  state: State = { ...INITIAL_STATE };

  render() {
    const { url, loopTerms, channels, error } = this.props;

    if (channels === null || loopTerms === null) {
      return null;
    }

    // Only return channels with enough loot
    const openChannels = channels.filter(
      o =>
        o.status === 'OPEN' &&
        parseInt(o.local_balance, 10) > parseInt(loopTerms.min_swap_amount, 10),
    );

    // Get channels to choose from
    const items = openChannels.map(c => (
      <Menu.Item
        key={c.channel_point}
        onClick={() => this.handleSetChannelId(c.channel_point, openChannels)}
      >
        {`${c.node.alias} => ${c.local_balance} sats available`}
      </Menu.Item>
    ));
    const menu = <Menu>{items}</Menu>;

    // Destructure the state
    const {
      isAnyValue,
      amount,
      loopType,
      destination,
      swapRoutingFee,
      swapFee,
      minerFee,
      prepayAmt,
      channel,
      quoteModalIsOpen,
      advanced,
      conf,
      htlc,
    } = this.state;
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
          <InputLoopAddress
            setLoop={this.props.setLoop}
            setLoopIn={this.props.setLoopIn}
            error={error}
            initialUrl={this.props.url}
            type={loopType}
          />
          {loopTerms.swap_fee_base !== '' && (
            <Tooltip
              overlayClassName="Loop-terms-tip"
              title={`
                Base fee: ${loopTerms.swap_fee_base} sats |
                Fee rate: ${loopTerms.swap_fee_rate} sats |
                Prepay amt: ${
                  loopTerms.prepay_amt === undefined ? '1337' : loopTerms.prepay_amt
                }
                Min Swap amt: ${loopTerms.min_swap_amount} sats |
                Max Swap amt: ${loopTerms.max_swap_amount} sats |
                CLTV delta: ${loopTerms.cltv_delta}
              `}
              placement="topRight"
              arrowPointAtCenter
            >
              <br />
              <Button
                className="Loop-form-advancedToggle"
                onClick={this.toggleAdvanced}
                type="primary"
                ghost
              >
                {this.state.advanced === true
                  ? 'Hide advanced fields'
                  : 'Show advanced fields'}
              </Button>
            </Tooltip>
          )}
          <Form className="Loop" layout="vertical">
            {url !== null && (
              <Form.Item>
                <Dropdown overlay={menu}>
                  <a className="ant-dropdown-link" href="#">
                    Select Channel
                  </a>
                </Dropdown>
              </Form.Item>
            )}
            {advanced === true && loopType === 'Loop Out' && (
              <Form.Item>
                <Input
                  type="text"
                  size="small"
                  onChange={this.handleChangeDestination}
                  placeholder="off-chain address"
                  autoFocus
                />
              </Form.Item>
            )}
            {advanced === true && loopType === 'Loop Out' && (
              <Form.Item label="">
                <Input
                  size="small"
                  onChange={this.handleChangeSwapRoutingFee}
                  placeholder="swap routing fee"
                  autoFocus
                />
              </Form.Item>
            )}
            {advanced === true && (
              <Form.Item>
                <Input
                  width="50%"
                  size="small"
                  onChange={this.handleChangeSwapFee}
                  placeholder="swap fee"
                  autoFocus
                />
              </Form.Item>
            )}
            {advanced === true && (
              <Form.Item>
                <Input
                  size="small"
                  onChange={this.handleChangeMinerFee}
                  placeholder="miner fee"
                  autoFocus
                />
              </Form.Item>
            )}
            {advanced === true && loopType === 'Loop Out' && (
              <Form.Item>
                <Input
                  size="small"
                  onChange={this.handleChangePrepayAmt}
                  placeholder="prepay amt"
                  autoFocus
                />
              </Form.Item>
            )}
            {advanced === true && loopType === 'Loop Out' && (
              <Form.Item>
                <Input
                  size="small"
                  onChange={this.handleChangeConfTarget}
                  placeholder="sweep confirmation target"
                  autoFocus
                />
              </Form.Item>
            )}
            {advanced === true && loopType === 'Loop In' && (
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
                <Button
                  key={idx}
                  {...props}
                  onMouseOver={
                    this.state.advanced === true
                      ? this.props.getLoopOutTerms
                      : this.props.getLoopInTerms
                  }
                  onClick={this.openQuoteModal}
                />
              ))}
          </div>
          <QuoteModal
            amt={amount}
            isOpen={quoteModalIsOpen}
            onClose={this.openQuoteModal}
            type={loopType}
            dest={destination}
            srf={swapRoutingFee}
            sf={swapFee}
            mf={minerFee}
            pre={prepayAmt}
            chan={channel}
            adv={advanced}
            htlc={htlc}
            /**
             * TODO update as needed for future iterations
             * of loop
             */
            sct={this.state.loopType === 'Loop Out' ? conf : ''}
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
    const id = jsonClone[key].chan_id;
    message.success('Channel set successfully!');
    this.setState({ channel: id });
  }

  private handleChangeAmount = (amount: string) => {
    this.setState({ amount });
  };

  private handleChangeDestination = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ destination: ev.currentTarget.value });
  };

  private handleChangeSwapRoutingFee = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ swapRoutingFee: ev.currentTarget.value });
  };

  private handleChangeSwapFee = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ swapFee: ev.currentTarget.value });
  };

  private handleChangeMinerFee = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ minerFee: ev.currentTarget.value });
  };

  private handleChangePrepayAmt = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ prepayAmt: ev.currentTarget.value });
  };

  private handleChangeConfTarget = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ conf: ev.currentTarget.value });
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
    this.setState({ loopType: 'Loop Out' });
  };

  private setLoopInType = () => {
    this.setState({ loopType: 'Loop In' });
  };

  private toggleAdvanced = () => {
    this.setState({ advanced: this.state.advanced === false ? true : false });
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    channels: state.channels.channels,
    url: state.loop.url,
    lib: state.loop.lib,
    loopTerms: state.loop.loopTerms,
    loopQuote: state.loop.loopQuote,
    loop: state.loop.loop,
    error: state.loop.error,
  }),
  {
    getLoopOutTerms,
    getLoopInTerms,
    setLoop,
    setLoopIn,
  },
)(Loop);
