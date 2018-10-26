import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import PromptTemplate from 'components/PromptTemplate';
import Loader from 'components/Loader';
import BigMessage from 'components/BigMessage';
import Unit from 'components/Unit';
import Identicon from 'components/Identicon';
import { getPromptArgs, watchUntilPropChange } from 'utils/prompt';
import { unixMoment, SHORT_FORMAT } from 'utils/time';
import { sendPayment, checkPaymentRequest } from 'modules/payment/actions';
import { AppState } from 'store/reducers';
import './payment.less';

interface StateProps {
  paymentRequests: AppState['payment']['paymentRequests'];
  sendReceipt: AppState['payment']['sendReceipt'];
  isSending: AppState['payment']['isSending'];
  sendError: AppState['payment']['sendError'];
}

interface DispatchProps {
  checkPaymentRequest: typeof checkPaymentRequest;
  sendPayment: typeof sendPayment;
}

type Props = StateProps & DispatchProps;

class PaymentPrompt extends React.Component<Props> {
  paymentRequest: string;
  constructor(props: Props) {
    super(props);
    const args = getPromptArgs<{ paymentRequest: string }>();
    this.paymentRequest = args.paymentRequest;
  }

  componentWillMount() {
    this.props.checkPaymentRequest(this.paymentRequest);
  }

  render() {
    const pr = this.props.paymentRequests[this.paymentRequest] || {};

    let content;
    if (pr.data) {
      const { node, request, route } = pr.data;
      console.log(request);
      content = (
        <div className="PaymentPrompt">
          <div className="PaymentPrompt-to">
            <Identicon pubkey={node.pub_key} className="PaymentPrompt-to-avatar" />
            <div className="PaymentPrompt-to-info">
              <div className="PaymentPrompt-to-info-alias">
                {node.alias}
              </div>
              <code className="PaymentPrompt-to-info-pubkey">
                {node.pub_key.slice(0, node.pub_key.length / 2)}
                <br/>
                {node.pub_key.slice(node.pub_key.length / 2)}
              </code>
            </div>
          </div>
          <div className="PaymentPrompt-amount">
            <h4 className="PaymentPrompt-amount-label">Amount</h4>
            <div className="PaymentPrompt-amount-value">
              <Unit value={request.num_satoshis} />
            </div>
          </div>
          <div className="PaymentPrompt-description">
            <h4 className="PaymentPrompt-description-label">Description</h4>
            <div className="PaymentPrompt-description-value">
              {request.description || <em>No description</em>}
            </div>
          </div>

          <div className="PaymentPrompt-details">
            <Tabs defaultActiveKey="basics">
              <Tabs.TabPane key="basics" tab="Basics">
                <DetailsTable rows={[{
                  label: 'Fee',
                  value: <Unit value={route.total_fees} />,
                }, {
                  label: 'Total',
                  value: <Unit value={route.total_amt} />,
                }]}/>
              </Tabs.TabPane>
              <Tabs.TabPane key="details" tab="Details">
                <DetailsTable rows={[{
                  label: 'Hops',
                  value: `${route.hops.length} node(s)`,
                }, {
                  label: 'Time lock',
                  value: moment().add(route.total_time_lock, 'seconds').fromNow(true),
                }, {
                  label: 'Expires',
                  value: unixMoment(request.timestamp)
                    .add(request.expiry, 'seconds')
                    .format(SHORT_FORMAT),
                }, {
                  label: 'Fallback address',
                  value: request.fallback_addr || <em>N/A</em>,
                }]}/>
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      );
    } else if (pr.error) {
      content = (
        <BigMessage
          type="error"
          title="Failed to lookup invoice"
          message={`
            The payment request that was provided could not be looked up
            due to the following error: ${pr.error.message}
          `}
          button={{
            children: 'Try again',
            icon: 'reload',
            onClick: () => this.props.checkPaymentRequest(this.paymentRequest),
          }}
        />
      )
    } else {
      content = <Loader />;
    }

    return (
      <PromptTemplate getConfirmData={this.handleSend}>
        {content}
      </PromptTemplate>
    );
  }

  private handleSend = async () => {
    this.props.sendPayment({ payment_request: this.paymentRequest });

    const receipt = await watchUntilPropChange(
      () => this.props.sendReceipt,
      () => this.props.sendError,
    );

    if (!receipt) {
      throw new Error('Payment failed to send');
    }
    return { preimage: receipt.payment_preimage };
  };
}

interface DetailsTableProps {
  rows: Array<{ label: React.ReactNode; value: React.ReactNode; }>;
}

const DetailsTable: React.SFC<DetailsTableProps> = ({ rows }) => (
  <table className="DetailsTable">
    <tbody>
      {rows.map(r => (
        <tr className="DetailsTable-row">
          <td className="DetailsTable-row-label">{r.label}</td>
          <td className="DetailsTable-row-value">{r.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    paymentRequests: state.payment.paymentRequests,
    sendReceipt: state.payment.sendReceipt,
    isSending: state.payment.isSending,
    sendError: state.payment.sendError,
  }),
  {
    checkPaymentRequest,
    sendPayment,
  }
)(PaymentPrompt)