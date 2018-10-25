import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Form, Input, Button, Icon, Alert } from 'antd';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import SendState from './SendState';
import { checkPaymentRequest, sendPayment, resetSendPayment } from 'modules/payment/actions';
import { AppState } from 'store/reducers';
import { unixMoment, SHORT_FORMAT } from 'utils/time';
import './LightningSend.less';

interface StateProps {
  paymentRequests: AppState['payment']['paymentRequests'];
  sendReceipt: AppState['payment']['sendReceipt'];
  isSending: AppState['payment']['isSending'];
  sendError: AppState['payment']['sendError'];
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
}

const INITIAL_STATE: State = {
  paymentRequestValue: '',
  showMoreInfo: false,
};

class LightningSend extends React.Component<Props, State> {
  state = { ...INITIAL_STATE };

  componentWillUnmount() {
    this.props.resetSendPayment();
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

    const {
      paymentRequestValue,
      showMoreInfo,
    } = this.state;
    const requestData = this.props.paymentRequests[paymentRequestValue] || {};
    const prStatus = requestData.isLoading ? 'validating' :
      requestData.error ? 'error' :
        requestData.data ? 'success' : undefined;
    const prHelp = requestData.error ? requestData.error.message : undefined;
    const expiry = requestData.data && unixMoment(requestData.data.request.timestamp)
      .add(requestData.data.request.expiry, 'seconds');
    const hasExpired = expiry && expiry.isBefore(moment.now());

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

        {requestData.data ? (
          <div className="LightningSend-payment">
            <div className="LightningSend-payment-node">
              <Identicon
                pubkey={requestData.data.node.pub_key}
                className="LightningSend-payment-node-avatar"
              />
              <div className="LightningSend-payment-node-info">
                <div className="LightningSend-payment-node-info-alias">
                  {requestData.data.node.alias}
                </div>
                <code className="LightningSend-payment-node-info-pubkey">
                  {requestData.data.node.pub_key}
                </code>
              </div>
            </div>
            {requestData.data.route ? (
              <div className="LightningSend-payment-details">
                <table><tbody>
                  <tr>
                    <td>Amount</td>
                    <td><Unit value={requestData.data.request.num_satoshis} /></td>
                  </tr>
                  <tr>
                    <td>Fee</td>
                    <td><Unit value={requestData.data.route.total_fees} /></td>
                  </tr>
                  <tr>
                    <td>Total</td>
                    <td><Unit value={requestData.data.route.total_amt} /></td>
                  </tr>
                  {showMoreInfo &&
                    <>
                      <tr>
                        <td>Hops</td>
                        <td>{requestData.data.route.hops.length} node(s)</td>
                      </tr>
                      <tr>
                        <td>Time lock</td>
                        <td>{
                          moment()
                          .add(requestData.data.route.total_time_lock, 'seconds')
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
            disabled={!requestData.data || !!hasExpired}
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

  private handleSubmit = () => {
    this.props.sendPayment({
      payment_request: this.state.paymentRequestValue
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
  }),
  {
    checkPaymentRequest,
    sendPayment,
    resetSendPayment,
  },
)(LightningSend);
