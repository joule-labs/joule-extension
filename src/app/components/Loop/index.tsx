import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import './index.less';
import { getLoopOutTerms, setLoop } from 'modules/loop/actions';
import { ButtonProps } from 'antd/lib/button';
import { Form, Button, Icon, Radio, Tooltip, Input } from 'antd';
import AmountField from 'components/AmountField';
import InputLoopAddress from 'components/Loop/InputLoopAddress';
import QuoteModal from './QuoteModal';

interface StateProps {
  url: AppState['loop']['url'];
  lib: AppState['loop']['lib'];
  loopOutTerms: AppState['loop']['loopOutTerms'];
  loopOutQuote: AppState['loop']['loopOutQuote'];
  loopOut: AppState['loop']['loopOut'];
  error: AppState['loop']['error'];
}

interface DispatchProps {
  getLoopOutTerms: typeof getLoopOutTerms;
  setLoop: typeof setLoop;
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
  channel: '0',
  conf: '2',
  quoteModalIsOpen: false,
  loopType: 'Loop Out',
};

type Props = StateProps & DispatchProps;

class Loop extends React.Component<Props> {
  state: State = { ...INITIAL_STATE };

  render() {
    const { loopOutTerms, error } = this.props;
    if (loopOutTerms === null) {
      return null;
    }
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

    if (loopOutTerms === null) {
      return null;
    }

    return (
      <>
        <div>
          <Radio.Group defaultValue="a" size="large">
            <Radio.Button value="a" onClick={this.setLoopOutType}>
              Loop Out
            </Radio.Button>
            <Radio.Button value="b" disabled={true} onClick={this.setLoopInType}>
              Loop In
            </Radio.Button>
            <Radio.Button value="b" disabled={true}>
              Loop Monitor
            </Radio.Button>
          </Radio.Group>
        </div>
        <div className="Loop">
          <InputLoopAddress
            setLoop={this.props.setLoop}
            error={error}
            initialUrl={this.props.url}
            type={this.state.loopType}
          />
          {loopOutTerms.swap_fee_base !== '' && (
            <Tooltip
              overlayClassName="Loop-terms-tip"
              title={`
                Base fee: ${loopOutTerms.swap_fee_base} sats |
                Fee rate: ${loopOutTerms.swap_fee_rate} sats |
                Prepay amt: ${loopOutTerms.prepay_amt} sats |
                Min Swap amt: ${loopOutTerms.min_swap_amount} sats |
                Max Swap amt: ${loopOutTerms.max_swap_amount} sats |
                CLTV delta: ${loopOutTerms.cltv_delta}
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
          {advanced === true && (
            <Form className="Loop" layout="vertical">
              <Form.Item>
                <Input
                  type="text"
                  size="small"
                  onChange={this.handleChangeDestination}
                  placeholder="off-chain address"
                  autoFocus
                />
              </Form.Item>
              <Form.Item>
                <Input
                  type="text"
                  size="small"
                  onChange={this.handleChangeChannel}
                  placeholder="channel id"
                  autoFocus
                />
              </Form.Item>
              <Form.Item label="">
                <Input
                  size="small"
                  onChange={this.handleChangeSwapRoutingFee}
                  placeholder="swap routing fee"
                  autoFocus
                />
              </Form.Item>
              <Form.Item>
                <Input
                  width="50%"
                  size="small"
                  onChange={this.handleChangeSwapFee}
                  placeholder="swap fee"
                  autoFocus
                />
              </Form.Item>
              <Form.Item>
                <Input
                  size="small"
                  onChange={this.handleChangeMinerFee}
                  placeholder="miner fee"
                  autoFocus
                />
              </Form.Item>
              <Form.Item>
                <Input
                  size="small"
                  onChange={this.handleChangePrepayAmt}
                  placeholder="prepay amt"
                  autoFocus
                />
              </Form.Item>
              <Form.Item>
                <Input
                  size="small"
                  onChange={this.handleChangeConfTarget}
                  placeholder="sweep confirmation target"
                  autoFocus
                />
              </Form.Item>
            </Form>
          )}
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
              parseInt(this.state.amount, 10) >
                parseInt(loopOutTerms.min_swap_amount, 10) &&
              parseInt(this.state.amount, 10) <
                parseInt(loopOutTerms.max_swap_amount, 10) &&
              actions.map((props, idx) => (
                <Button
                  key={idx}
                  {...props}
                  onMouseOver={this.props.getLoopOutTerms}
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
            sct={conf}
          />
        </div>
      </>
    );
  }

  private handleChangeAmount = (amount: string) => {
    this.setState({ amount });
  };

  private handleChangeChannel = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ channel: ev.currentTarget.value });
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

  private openQuoteModal = () => {
    this.setState({
      ...this.state,
      quoteModalIsOpen: this.state.quoteModalIsOpen === false ? true : false,
    });
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
    url: state.loop.url,
    lib: state.loop.lib,
    loopOutTerms: state.loop.loopOutTerms,
    loopOutQuote: state.loop.loopOutQuote,
    loopOut: state.loop.loopOut,
    error: state.loop.error,
  }),
  {
    getLoopOutTerms,
    setLoop,
  },
)(Loop);
