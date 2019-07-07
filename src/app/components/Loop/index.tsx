import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import './index.less';
import { getLoopOutTerms, setLoop } from 'modules/loop/actions';
import { Form, Button, Icon, Tooltip } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import AmountField from 'components/AmountField';
import InputLoopAddress from 'components/Loop/InputLoopAddress';
import QuoteModal from './QuoteModal';

interface StateProps {
  url: AppState['loop']['url'];
  lib: AppState['loop']['lib'];
  loopOutTerms: AppState['loop']['loopOutTerms'];
  loopOutQuote: AppState['loop']['loopOutQuote'];
  loopOut: AppState['loop']['loopOut'];
}

interface DispatchProps {
  getLoopOutTerms: typeof getLoopOutTerms;
  setLoop: typeof setLoop;
}

interface State {
  amount: string;
  isAnyValue: boolean;
  destination: string;
  swapRoutingFee: string;
  swapFee: string;
  minerFee: string;
  prepayAmt: string;
  channel: string;
  quoteModalIsOpen: boolean;
}

const INITIAL_STATE = {
  amount: '',
  isAnyValue: false,
  destination: '',
  swapRoutingFee: '',
  swapFee: '',
  minerFee: '',
  prepayAmt: '',
  channel: '',
  quoteModalIsOpen: false,
};

type Props = StateProps & DispatchProps;

class Loop extends React.Component<Props> {
  state: State = { ...INITIAL_STATE };

  render() {
    const { loopOutTerms } = this.props;
    const {
      isAnyValue,
      amount,
      // destination,
      // swapRoutingFee,
      // swapFee,
      // minerFee,
      // prepayAmt,
      // channel
    } = this.state;
    const actions: ButtonProps[] = [
      {
        children: (
          <>
            <Icon type="question-circle" theme="filled" /> Loop Quote
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
        <div className="Loop">
          <InputLoopAddress
            isLoopUrlSet={this.props.url}
            setLoop={this.props.setLoop}
            error={null}
            initialUrl={''}
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
              <Form
                className="LoopForm-form"
                layout="vertical"
                onSubmit={this.handleSubmit}
              >
                {/*
        // Need to make advanced feature checkbox to unhide these
        <Form.Item label="Destination">
          <Input
            type="url"
            size="small"
            value={destination}
            // onChange={this.handleChangeDestination}
            placeholder="default: lnd wallet address"
            autoFocus
          />
        </Form.Item>
        <Form.Item label="Swap Routing Fee">
          <Input
            size="small"
            value={swapRoutingFee}
            // onChange={this.handleChangeDestination}
            placeholder="xxxx sats"
            autoFocus
          />
        </Form.Item>
        <Form.Item label="Swap Fee">
          <Input
            size="small"
            value={swapFee}
            // onChange={this.handleChangeDestination}
            placeholder="xxxx sats"
            autoFocus
          />
        </Form.Item>
        <Form.Item label="Miner Fee">
          <Input
            size="small"
            value={minerFee}
            // onChange={this.handleChangeDestination}
            placeholder="xxxx sats"
            autoFocus
          />
        </Form.Item>
        <Form.Item label="Prepay Amt">
          <Input
            size="small"
            value={prepayAmt}
            // onChange={this.handleChangeDestination}
            placeholder="3eibniEINBesbnPEnv"
            autoFocus
          />
        </Form.Item>
        <Form.Item label="Channel">
          <Input
            size="small"
            value={channel}
            // onChange={this.handleChangeDestination}
            placeholder="lnd channel"
            autoFocus
          />
        </Form.Item> */}

                <AmountField
                  label="Amount"
                  amount={amount}
                  required={!isAnyValue}
                  disabled={isAnyValue}
                  onChangeAmount={this.handleChangeAmount}
                  showFiat
                />
              </Form>
            </Tooltip>
          )}
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
            amt={this.state.amount}
            isOpen={this.state.quoteModalIsOpen}
            onClose={this.openQuoteModal}
          />
        </div>
      </>
    );
  }

  private handleChangeAmount = (amount: string) => {
    this.setState({ amount });
  };

  // private handleChangeDestination = (destination: string) => {
  //   this.setState({ destination });
  // };

  private openQuoteModal = () => {
    this.setState({
      ...this.state,
      quoteModalIsOpen: this.state.quoteModalIsOpen === false ? true : false,
    });
  };
  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    // sumbit Loop request
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    url: state.loop.url,
    lib: state.loop.lib,
    loopOutTerms: state.loop.loopOutTerms,
    loopOutQuote: state.loop.loopOutQuote,
    loopOut: state.loop.loopOut,
  }),
  {
    getLoopOutTerms,
    setLoop,
  },
)(Loop);
