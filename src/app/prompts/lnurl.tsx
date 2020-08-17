import React from 'react';
import { connect } from 'react-redux';
import PromptTemplate from 'components/PromptTemplate';
import {
  getPromptArgs,
  getPromptOrigin,
  watchUntilPropChange,
  OriginData,
} from 'utils/prompt';
import { removeDomainPrefix } from 'utils/formatters';
import { AppState } from 'store/reducers';
import { getNodeChain } from 'modules/node/selectors';
import { getChainRates } from 'modules/rates/selectors';
import { PaymentRequestData } from 'modules/payment/types';
import {
  sendPayment,
  resetSendPayment,
  checkPaymentRequest,
} from 'modules/payment/actions';
import AmountField from 'components/AmountField';
import PaymentRequest from 'components/PaymentRequest';
import { Denomination } from 'utils/constants';
import { fromBaseToUnit, fromUnitToBase } from 'utils/units';
import { Form, Button, Result } from 'antd';
import Loader from 'components/Loader';
import './lnurl.less';
import { getParams as getlnurlParams, LNURLPayParams } from 'js-lnurl';
import { rejectPrompt, confirmPrompt } from 'utils/prompt';

interface StateProps {
  paymentRequests: AppState['payment']['paymentRequests'];
  sendLightningReceipt: AppState['payment']['sendLightningReceipt'];
  isSending: AppState['payment']['isSending'];
  sendError: AppState['payment']['sendError'];
  denomination: AppState['settings']['denomination'];
  fiat: AppState['settings']['fiat'];
  isNoFiat: AppState['settings']['isNoFiat'];
  rates: ReturnType<typeof getChainRates>;
  chain: ReturnType<typeof getNodeChain>;
}

interface DispatchProps {
  sendPayment: typeof sendPayment;
  resetSendPayment: typeof resetSendPayment;
  checkPaymentRequest: typeof checkPaymentRequest;
}

type Props = StateProps & DispatchProps;

interface State {
  lnurlParams: LNURLPayParams;
  isLoading: boolean;
  value: string;
  denomination: Denomination;
  routedRequest: PaymentRequestData | null;
  paymentRequestValue: string;
  showMoreInfo: boolean;
}

const INITIAL_STATE = {
  lnurlParams: {} as LNURLPayParams,
  isLoading: true,
  value: '',
  denomination: Denomination.SATOSHIS,
  paymentRequestValue: '',
  routedRequest: null,
  showMoreInfo: false,
};

interface LnurlArgs {
  lnurl: string;
}

const notNilNum = (v: string | number | null | undefined): v is string | number =>
  !!v || v === 0;

class LnurlPayPrompt extends React.Component<Props, State> {
  private args: LnurlArgs;
  private origin: OriginData;

  constructor(props: Props) {
    super(props);
    const args = getPromptArgs<LnurlArgs>();
    this.args = args;
    this.origin = getPromptOrigin();
    this.state = INITIAL_STATE;
  }

  componentDidMount() {
    getlnurlParams(this.args.lnurl).then((params: any) => {
      const valueSats =
        params.minSendable === params.maxSendable ? params.maxSendable : null;
      const denomination = Denomination.SATOSHIS;
      const value = notNilNum(valueSats)
        ? fromBaseToUnit(valueSats.toString(), denomination).toString()
        : '';
      this.setState({
        lnurlParams: params,
        isLoading: false,
        value,
        denomination,
      });
    });
  }

  componentWillUnmount() {
    this.props.resetSendPayment();
  }

  componentWillUpdate(nextProps: Props) {
    const { paymentRequestValue } = this.state;
    const oldPr = this.props.paymentRequests[paymentRequestValue];
    const newPr = nextProps.paymentRequests[paymentRequestValue];

    if (newPr && newPr.data && newPr !== oldPr) {
      this.setState({ routedRequest: newPr.data });
    }
  }

  render() {
    // Early exit for send state
    const { sendLightningReceipt, isSending, sendError } = this.props;
    if (isSending) {
      return <Loader />;
    } else if (sendLightningReceipt || sendError) {
      const type = sendError ? 'error' : 'success';
      const closeButton = (
        <Button key="close" size="large" onClick={this.handleClose}>
          Close
        </Button>
      );
      return (
        <div className="SendState">
          <Result
            status={type}
            title={type === 'success' ? 'Succesfully sent!' : 'Failed to send'}
            subTitle={
              type === 'success'
                ? 'See below for more about your transaction'
                : 'See below for the full error'
            }
            extra={[closeButton]}
          >
            {sendError ||
              (sendLightningReceipt && (
                <>
                  <h3>Pre-image</h3>
                  <code>{sendLightningReceipt.payment_preimage}</code>
                </>
              ))}
          </Result>
        </div>
      );
    }

    // not in sending state

    const { value, routedRequest, lnurlParams, paymentRequestValue } = this.state;
    const requestData = this.props.paymentRequests[paymentRequestValue] || {};
    const isSubmitDisabled =
      this.state.isLoading ||
      !notNilNum(this.state.value) ||
      (routedRequest !== null && routedRequest.route === null);
    const isValueDisabled =
      lnurlParams && lnurlParams.maxSendable === lnurlParams.minSendable;

    return (
      <PromptTemplate hasNoButtons={true}>
        <div className="LnurlPayPrompt">
          <div className="LnurlPayPrompt-header">
            <div className="LnurlPayPrompt-header-icon">
              <img src={this.origin.icon} />
            </div>
            <h1 className="LnurlPayPrompt-header-title">
              <strong>Pay request from {removeDomainPrefix(this.origin.domain)}</strong>
            </h1>
          </div>
          <Form className="LnurlPayPrompt-form">
            {this.state.isLoading ? (
              <Loader size="5rem" />
            ) : (
              <div>
                <Form.Item className="LnurlPayPrompt-metadata" label="Details">
                  {this.renderMetadata()}
                </Form.Item>
                {routedRequest ? (
                  <PaymentRequest
                    routedRequest={routedRequest}
                    requestData={requestData}
                  />
                ) : (
                  <AmountField
                    label="Amount"
                    amount={value}
                    onChangeAmount={this.handleChangeValue}
                    maximumSats={lnurlParams.maxSendable.toString()}
                    minimumSats={lnurlParams.minSendable.toString()}
                    disabled={isValueDisabled}
                    required
                    autoFocus
                    showFiat
                  />
                )}

                <div className="LnurlPayPrompt-buttons">
                  <Button size="large" type="ghost" onClick={this.handleReject}>
                    Cancel
                  </Button>
                  <Button
                    onClick={this.handleSubmit}
                    type="primary"
                    size="large"
                    disabled={isSubmitDisabled}
                  >
                    {this.state.routedRequest ? 'Send' : 'Next'}
                  </Button>
                </div>
              </div>
            )}
          </Form>
        </div>
      </PromptTemplate>
    );
  }

  private handleClose = () => {
    return confirmPrompt();
  };

  private handleReject = () => {
    return rejectPrompt();
  };

  private renderMetadata = () => {
    const text: string = this.state.lnurlParams.decodedMetadata
      .filter(([typ, _]: any) => typ === 'text/plain')
      .map(([_, content]: any) => content)[0];

    const image: string = this.state.lnurlParams.decodedMetadata
      .filter(([typ, _]: any) => typ.slice(0, 6) === 'image/')
      .map(([typ, content]: any) => `data:${typ},${content}`)[0];

    return (
      <div className="LnurlPayPrompt-metadata-item">
        {image ? <img src={image} /> : null}
        <p>{text}</p>
      </div>
    );
  };

  private handleChangeValue = (value: string) => {
    this.setState({ value });
  };

  private handleSubmit = async () => {
    if (this.state.paymentRequestValue !== '') {
      return this.handleSend();
    } else {
      return this.getPaymentRequest();
    }
  };

  private handleSend = async () => {
    const value = fromUnitToBase(this.state.value, this.state.denomination);
    this.props.sendPayment({
      payment_request: this.state.paymentRequestValue,
      amt: value,
    });

    const receipt = await watchUntilPropChange(
      () => this.props.sendLightningReceipt,
      () => this.props.sendError,
    );

    if (!receipt) {
      throw new Error('Payment failed to send');
    }
    return { preimage: receipt.payment_preimage };
  };

  private getPaymentRequest = async () => {
    const { lnurlParams } = this.state;
    const value = fromUnitToBase(this.state.value, this.state.denomination);

    const callbackUrl = new URL(lnurlParams.callback);
    const queryParams = new URLSearchParams(callbackUrl.search.slice(1));
    queryParams.append('amount', value);
    callbackUrl.search = queryParams.toString();

    const r = await fetch(callbackUrl.toString());
    if (r.status >= 300) {
      throw new Error(await r.text());
    }
    const res = await r.json();

    if (res.status === 'ERROR') {
      throw new Error(res.reason);
    }
    const paymentRequestValue = res.pr;
    this.setState(
      {
        paymentRequestValue,
        showMoreInfo: false,
      },
      () => {
        if (paymentRequestValue) {
          this.props.checkPaymentRequest(paymentRequestValue);
        }
      },
    );
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    paymentRequests: state.payment.paymentRequests,
    sendLightningReceipt: state.payment.sendLightningReceipt,
    isSending: state.payment.isSending,
    sendError: state.payment.sendError,
    denomination: state.settings.denomination,
    fiat: state.settings.fiat,
    isNoFiat: state.settings.isNoFiat,
    rates: getChainRates(state),
    chain: getNodeChain(state),
  }),
  { sendPayment, resetSendPayment, checkPaymentRequest },
)(LnurlPayPrompt);
