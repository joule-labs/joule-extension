import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Tabs, Input, Select } from 'antd';
import { SendPaymentResponse } from 'webln';
import PromptTemplate from 'components/PromptTemplate';
import NodeInfo from 'components/PromptTemplate/NodeInfo';
import Loader from 'components/Loader';
import BigMessage from 'components/BigMessage';
import Unit from 'components/Unit';
import { getPromptArgs, watchUntilPropChange } from 'utils/prompt';
import { unixMoment, SHORT_FORMAT } from 'utils/time';
import { fromBaseToUnit, fromUnitToBase } from 'utils/units';
import { Denomination, denominationSymbols } from 'utils/constants';
import { typedKeys } from 'utils/ts';
import { sendPayment, checkPaymentRequest } from 'modules/payment/actions';
import { PaymentRequestData } from 'modules/payment/types';
import { AppState } from 'store/reducers';
import './payment.less';
import { getNodeChain } from 'modules/node/selectors';

interface StateProps {
  paymentRequests: AppState['payment']['paymentRequests'];
  sendLightningReceipt: AppState['payment']['sendLightningReceipt'];
  isSending: AppState['payment']['isSending'];
  sendError: AppState['payment']['sendError'];
  denomination: AppState['settings']['denomination'];
  chain: ReturnType<typeof getNodeChain>;
}

interface DispatchProps {
  checkPaymentRequest: typeof checkPaymentRequest;
  sendPayment: typeof sendPayment;
}

type Props = StateProps & DispatchProps;

interface State {
  value: string;
  denomination: Denomination;
  routedRequest: PaymentRequestData | null;
  isLatestRoute: boolean;
}

class PaymentPrompt extends React.Component<Props, State> {
  paymentRequest: string;
  checkRequestTimeout: any;

  constructor(props: Props) {
    super(props);
    const args = getPromptArgs<{ paymentRequest: string }>();
    this.paymentRequest = args.paymentRequest;
    this.state = {
      value: '',
      denomination: props.denomination,
      routedRequest: null,
      isLatestRoute: false,
    };
  }

  componentWillMount() {
    this.props.checkPaymentRequest(this.paymentRequest);
  }

  componentWillUpdate(nextProps: Props) {
    const { denomination } = this.state;
    const oldPr = this.props.paymentRequests[this.paymentRequest];
    const newPr = nextProps.paymentRequests[this.paymentRequest];

    if (newPr && newPr.data && newPr !== oldPr) {
      this.setState({
        routedRequest: newPr.data,
        // Only consider latest route if we're replacing one...
        isLatestRoute: !!this.state.routedRequest,
      });

      if (newPr.data.request.num_satoshis) {
        const value = fromBaseToUnit(
          newPr.data.request.num_satoshis,
          denomination,
        ).toString();
        this.setState({
          value,
          // ...but if a payment came with the request, it's a latest route
          isLatestRoute: true,
        });
      }
    }
  }

  render() {
    const { routedRequest } = this.state;
    const { chain } = this.props;
    const pr = this.props.paymentRequests[this.paymentRequest] || {};
    let isConfirmDisabled = true;

    let content;
    if (routedRequest) {
      const { node, request, route } = routedRequest;
      const { value, denomination, isLatestRoute } = this.state;
      if (value || request.num_satoshis) {
        isConfirmDisabled = false;
      }

      content = (
        <div className="PaymentPrompt">
          <NodeInfo pubkey={node.pub_key} alias={node.alias} />
          <div className="PaymentPrompt-amount">
            <h4 className="PaymentPrompt-amount-label">Amount</h4>
            {request.num_satoshis ? (
              <div className="PaymentPrompt-amount-value">
                <Unit value={request.num_satoshis} showFiat />
              </div>
            ) : (
              <Input.Group size="large" compact>
                <Input
                  size="large"
                  value={value}
                  onChange={this.handleChangeValue}
                  placeholder="Enter an amount"
                  step="any"
                  autoFocus
                />
                <Select
                  size="large"
                  onChange={this.handleChangeDenomination}
                  value={denomination}
                  dropdownMatchSelectWidth={false}
                >
                  {typedKeys(Denomination).map(d => (
                    <Select.Option key={d} value={d}>
                      {denominationSymbols[chain][d]}
                    </Select.Option>
                  ))}
                </Select>
              </Input.Group>
            )}
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
                <DetailsTable
                  rows={[
                    {
                      label: 'Fee',
                      isLarge: true,
                      value: isLatestRoute ? (
                        <Unit value={route.total_fees} showFiat />
                      ) : (
                        <Loader inline size="1.3rem" />
                      ),
                    },
                    {
                      label: 'Total',
                      isLarge: true,
                      value: isLatestRoute ? (
                        <Unit value={route.total_amt} showFiat />
                      ) : (
                        <Loader inline size="1.3rem" />
                      ),
                    },
                  ]}
                />
              </Tabs.TabPane>
              <Tabs.TabPane key="details" tab="Details">
                <DetailsTable
                  rows={[
                    {
                      label: 'Hops',
                      value: isLatestRoute ? (
                        `${route.hops.length} node(s)`
                      ) : (
                        <Loader inline size="1.3rem" />
                      ),
                    },
                    {
                      label: 'Time lock',
                      value: moment()
                        .add(route.total_time_lock, 'seconds')
                        .fromNow(true),
                    },
                    {
                      label: 'Expires',
                      value: unixMoment(request.timestamp)
                        .add(request.expiry, 'seconds')
                        .format(SHORT_FORMAT),
                    },
                    {
                      label: 'Fallback address',
                      value: request.fallback_addr || <em>N/A</em>,
                    },
                  ]}
                />
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
      );
    } else {
      content = <Loader />;
    }

    return (
      <PromptTemplate
        isConfirmDisabled={isConfirmDisabled}
        getConfirmData={this.handleSend}
      >
        {content}
      </PromptTemplate>
    );
  }

  private handleChangeValue = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      value: ev.target.value,
      isLatestRoute: false,
    });
    clearTimeout(this.checkRequestTimeout);
    if (ev.target.value) {
      this.checkRequestTimeout = setTimeout(() => {
        this.props.checkPaymentRequest(
          this.paymentRequest,
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

  private handleSend = async (): Promise<SendPaymentResponse> => {
    this.props.sendPayment({
      payment_request: this.paymentRequest,
      amt: fromUnitToBase(this.state.value, this.state.denomination),
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

interface DetailsTableProps {
  rows: {
    label: React.ReactNode;
    value: React.ReactNode;
    isLarge?: boolean;
  }[];
}

const DetailsTable: React.SFC<DetailsTableProps> = ({ rows }) => (
  <table className="DetailsTable">
    <tbody>
      {rows.map(r => (
        <tr key={r.label} className={`DetailsTable-row ${r.isLarge ? 'is-large' : ''}`}>
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
    sendLightningReceipt: state.payment.sendLightningReceipt,
    isSending: state.payment.isSending,
    sendError: state.payment.sendError,
    denomination: state.settings.denomination,
    chain: getNodeChain(state),
  }),
  {
    checkPaymentRequest,
    sendPayment,
  },
)(PaymentPrompt);
