import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Form, Input, Select, Button, Icon, Alert } from 'antd';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import Loader from 'components/Loader';
import SendState from './SendState';
import { unixMoment, SHORT_FORMAT } from 'utils/time';
import { Denomination, denominationSymbols } from 'utils/constants';
import { fromUnitToBase, fromBaseToUnit } from 'utils/units';
import { typedKeys } from 'utils/ts';
import { checkPaymentRequest, sendPayment, resetSendPayment } from 'modules/payment/actions';
import { PaymentRequestData } from 'modules/payment/types';
import { AppState } from 'store/reducers';
import './LightningSend.less';

interface StateProps {
  paymentRequests: AppState['payment']['paymentRequests'];
  sendReceipt: AppState['payment']['sendReceipt'];
  isSending: AppState['payment']['isSending'];
  sendError: AppState['payment']['sendError'];
  denomination: AppState['settings']['denomination'];
}

interface DispatchProps {
  checkPaymentRequest: typeof checkPaymentRequest;
  sendPayment: typeof sendPayment;
  resetSendPayment: typeof resetSendPayment;
}

interface OwnProps {
  close?(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  paymentRequestValue: string;
  showMoreInfo: boolean;
  routedRequest: PaymentRequestData | null;
  value: string;
  denomination: Denomination;
}

const INITIAL_STATE = {
  paymentRequestValue: '',
  showMoreInfo: false,
  routedRequest: null,
  value: '',
};

class LightningSend extends React.Component<Props, State> {
  private checkRequestTimeout: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
      denomination: props.denomination,
    }
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
    const { sendReceipt, isSending, sendError } = this.props;
    if (isSending || sendReceipt || sendError) {
      return (
        <SendState
          isLoading={isSending}
          error={sendError}
          result={sendReceipt && (
            <>
              <h3>Pre-image</h3>
              <code>{sendReceipt.payment_preimage}</code>
            </>
          )}
          back={this.props.resetSendPayment}
          reset={this.reset}
          close={this.props.close}
        />
      );
    }

    const { paymentRequestValue, showMoreInfo, value, denomination, routedRequest } = this.state;
    const requestData = this.props.paymentRequests[paymentRequestValue] || {};
    const prStatus = requestData.isLoading ? 'validating' :
      requestData.error ? 'error' :
        requestData.data ? 'success' : undefined;
    const prHelp = requestData.error ? requestData.error.message : undefined;
    const expiry = requestData.data && unixMoment(requestData.data.request.timestamp)
      .add(requestData.data.request.expiry, 'seconds');
    const hasExpired = expiry && expiry.isBefore(moment.now());
    const disabled = !requestData.data || !!hasExpired ||
      (!requestData.data.request.num_satoshis && !value);

    return (
      <Form className="LightningSend" onSubmit={this.handleSubmit}>
        <Form.Item
          validateStatus={prStatus}
          help={prHelp}
          className="LightningSend-pr"
          label="Payment Request"
        >
          <Input.TextArea
            className="LightningSend-pr-input"
            placeholder="lnsb50n1pdqe782had78abffvqjhe..."
            value={paymentRequestValue}
            onChange={this.handleChangePaymentRequest}
            rows={5}
            autoFocus
          />
          {!paymentRequestValue &&
            <Button size="small" className="LightningSend-pr-qr">
              <Icon type="qrcode" />
            </Button>
          }
        </Form.Item>

        {expiry && hasExpired &&
          <Alert
            style={{ marginBottom: '1rem' }}
            type="warning"
            message="This invoice has expired"
            description={`
              This invoice expired ${expiry.format(SHORT_FORMAT)}.
              You'll need to have a new one generated.
            `}
            showIcon
          />
        }

        {routedRequest ? (
          <div className="LightningSend-payment">
            <div className="LightningSend-payment-node">
              <Identicon
                pubkey={routedRequest.node.pub_key}
                className="LightningSend-payment-node-avatar"
              />
              <div className="LightningSend-payment-node-info">
                <div className="LightningSend-payment-node-info-alias">
                  {routedRequest.node.alias}
                </div>
                <code className="LightningSend-payment-node-info-pubkey">
                  {routedRequest.node.pub_key}
                </code>
              </div>
            </div>
            {!routedRequest.request.num_satoshis && (
              <div className="LightningSend-payment-value">
                <Input.Group compact>
                  <Input
                    type="number"
                    name="value"
                    value={value}
                    onChange={this.handleChangeValue}
                    autoFocus
                    placeholder="1000"
                    step="any"
                  />
                  <Select
                    onChange={this.handleChangeDenomination}
                    value={denomination}
                    dropdownMatchSelectWidth={false}
                  >
                    {typedKeys(Denomination).map(d => (
                      <Select.Option key={d} value={d}>
                        {denominationSymbols[d]}
                      </Select.Option>
                    ))}
                  </Select>
                </Input.Group>
              </div>
            )}
            {routedRequest.route ? (
              <div className="LightningSend-payment-details">
                <table><tbody>
                  {routedRequest.request.num_satoshis && (
                    <tr>
                      <td>Amount</td>
                      <td>
                        <Unit value={routedRequest.request.num_satoshis} />
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td>Fee</td>
                    <td>
                      {requestData.isLoading ?
                        <Loader inline size="1rem" /> :
                        <Unit value={routedRequest.route.total_fees} />
                      }
                    </td>
                  </tr>
                  <tr>
                    <td>Total</td>
                    <td>
                      {requestData.isLoading ?
                        <Loader inline size="1rem" /> :
                        <Unit value={routedRequest.route.total_amt} />
                      }
                      
                    </td>
                  </tr>
                  {showMoreInfo &&
                    <>
                      <tr>
                        <td>Hops</td>
                        <td>{routedRequest.route.hops.length} node(s)</td>
                      </tr>
                      <tr>
                        <td>Time lock</td>
                        <td>{
                          moment()
                          .add(routedRequest.route.total_time_lock, 'seconds')
                          .fromNow(true)
                        }</td>
                      </tr>
                      <tr>
                        <td>Expires</td>
                        <td>{expiry && expiry.format(SHORT_FORMAT)}</td>
                      </tr>
                    </>
                  }
                </tbody></table>
                {!showMoreInfo &&
                  <a
                    className="LightningSend-payment-details-more"
                    onClick={() => this.setState({ showMoreInfo: true })}
                  >
                    More info
                  </a>
                }
              </div>
            ) : (
              <Alert
                style={{ marginBottom: '1rem' }}
                type="error"
                message="No route available"
                description={`
                  There is no route between you and {requestNode.alias}.
                  You can try opening a channel with them and trying again.
                `}
              />
            )}
          </div>
        ) : (
          <div className="LightningSend-placeholder">
            Enter a payment request to continue
          </div>
        )}

        <div className="LightningSend-buttons">
          <Button size="large" type="ghost" onClick={this.reset}>
            Reset
          </Button>
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            disabled={disabled}
          >
            Send
          </Button>
        </div>
      </Form>
    );
  }

  private handleChangePaymentRequest = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    const paymentRequestValue = ev.currentTarget.value;
    this.setState({
      paymentRequestValue,
      showMoreInfo: false,
    }, () => {
      if (paymentRequestValue) {
        this.props.checkPaymentRequest(paymentRequestValue);
      }
    });
  };

  private handleChangeValue = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: ev.target.value });
    clearTimeout(this.checkRequestTimeout);
    if (ev.target.value) {
      this.checkRequestTimeout = setTimeout(() => {
        this.props.checkPaymentRequest(
          this.state.paymentRequestValue,
          fromUnitToBase(this.state.value, this.state.denomination),
        );
      }, 300);
    }
  };

  private handleChangeDenomination = (val: any) => {
    const denomination = val as Denomination;
    const value = fromBaseToUnit(
      fromUnitToBase(this.state.value, this.state.denomination),
      denomination,
    );
    this.setState({
      denomination,
      value,
    });
  };
  
  private handleSubmit = () => {
    this.props.sendPayment({
      payment_request: this.state.paymentRequestValue,
      amt: !!this.state.value ? this.state.value : undefined,
    });
  };

  private reset = () => {
    this.setState({ ...INITIAL_STATE });
    this.props.resetSendPayment();
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    paymentRequests: state.payment.paymentRequests,
    sendReceipt: state.payment.sendReceipt,
    isSending: state.payment.isSending,
    sendError: state.payment.sendError,
    denomination: state.settings.denomination,
  }),
  {
    checkPaymentRequest,
    sendPayment,
    resetSendPayment,
  },
)(LightningSend);
