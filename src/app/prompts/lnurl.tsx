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
import { SendPaymentResponse } from 'webln';
import { PaymentRequestData } from 'modules/payment/types';
import { sendPayment } from 'modules/payment/actions';
import AmountField from 'components/AmountField';
import { Denomination } from 'utils/constants';
import { fromBaseToUnit, fromUnitToBase } from 'utils/units';
import { Form } from 'antd';
import Loader from 'components/Loader';
import './lnurl.less';
import { getParams as getlnurlParams, LNURLPayParams } from 'js-lnurl';

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
}

type Props = StateProps & DispatchProps;

interface State {
  lnurlParams: LNURLPayParams;
  isLoading: boolean;
  value: string;
  denomination: Denomination;
  routedRequest: PaymentRequestData | null;
  paymentRequestValue: string;
}

const INITIAL_STATE = {
  lnurlParams: {} as LNURLPayParams,
  isLoading: true,
  value: '',
  denomination: Denomination.SATOSHIS,
  paymentRequestValue: '',
  routedRequest: null,
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

  render() {
    const isConfirmDisabled = this.state.isLoading;
    const isValueDisabled =
      this.state.lnurlParams &&
      this.state.lnurlParams.maxSendable === this.state.lnurlParams.minSendable;

    return (
      <PromptTemplate
        isConfirmDisabled={isConfirmDisabled}
        getConfirmData={this.handleConfirm}
      >
        <div className="LnurlPayPrompt">
          <div className="LnurlPayPrompt-header">
            <div className="LnurlPayPrompt-header-icon">
              <img src={this.origin.icon} />
            </div>
            <h1 className="LnurlPayPrompt-header-title">
              <strong>
                Payment request from {removeDomainPrefix(this.origin.domain)}
              </strong>
            </h1>
          </div>
          <Form className="LnurlPayPrompt-form">
            {this.state.isLoading ? (
              <Loader size="5rem" />
            ) : (
              <div>
                <AmountField
                  label="Amount"
                  amount={this.state.value}
                  onChangeAmount={this.handleChangeValue}
                  maximumSats={this.state.lnurlParams.maxSendable.toString()}
                  minimumSats={this.state.lnurlParams.minSendable.toString()}
                  disabled={isValueDisabled}
                  required
                  autoFocus
                  showFiat
                />
                <div>
                  <Form.Item className="LnurlPayPrompt-metadata" label="Details">
                    {this.renderMetadata()}
                  </Form.Item>
                </div>
              </div>
            )}
          </Form>
        </div>
      </PromptTemplate>
    );
  }

  private renderMetadata = () => {
    const text: string = this.state.lnurlParams.decodedMetadata
      .filter(([typ, _]: any) => typ === 'text/plain')
      .map(([_, content]: any) => content)[0];

    const image: string = this.state.lnurlParams.decodedMetadata
      .filter(([typ, _]: any) => typ.slice(0, 6) === 'image/')
      .map(([typ, content]: any) => `data:${typ},${content}`)[0];

    return (
      <div className="LnurlPayPrompt-metadata">
        {image ? <img src={image} /> : null}
        <p>{text}</p>
      </div>
    );
  };

  private handleChangeValue = (value: string) => {
    this.setState({ value });
  };

  private handleConfirm = async (): Promise<SendPaymentResponse> => {
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

    this.props.sendPayment({
      payment_request: res.pr,
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
  { sendPayment },
)(LnurlPayPrompt);
