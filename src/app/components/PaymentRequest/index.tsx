import React from 'react';
import { Alert } from 'antd';
import './style.less';

import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import { unixMoment, SHORT_FORMAT } from 'utils/time';
import moment from 'moment';
import Loader from 'components/Loader';
import { PaymentRequestData } from 'modules/payment/types';

import { PaymentRequestState } from 'modules/payment/types';

interface Props {
  routedRequest: PaymentRequestData | null;
  requestData: PaymentRequestState;
}

interface State {
  showMoreInfo: boolean;
}

const INITIAL_STATE = {
  showMoreInfo: false,
};

export default class PaymentRequest extends React.Component<Props, State> {
  state: State = INITIAL_STATE;

  render() {
    const { showMoreInfo } = this.state;
    const { requestData, routedRequest } = this.props;

    const expiry =
      requestData.data &&
      unixMoment(requestData.data.request.timestamp).add(
        requestData.data.request.expiry,
        'seconds',
      );

    return (
      <div className="PaymentRequest">
        {routedRequest ? (
          <div className="PaymentRequest-payment">
            <div className="PaymentRequest-payment-node">
              <Identicon
                pubkey={routedRequest.node.pub_key}
                className="PaymentRequest-payment-node-avatar"
              />
              <div className="PaymentRequest-payment-node-info">
                <div className="PaymentRequest-payment-node-info-alias">
                  {routedRequest.node.alias}
                </div>
                <code className="PaymentRequest-payment-node-info-pubkey">
                  {routedRequest.node.pub_key}
                </code>
              </div>
            </div>
            {routedRequest.route ? (
              <div className="PaymentRequest-payment-details">
                <table>
                  <tbody>
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
                        {requestData.isLoading ? (
                          <Loader inline size="1rem" />
                        ) : (
                          <Unit value={routedRequest.route.total_fees} />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Total</td>
                      <td>
                        {requestData.isLoading ? (
                          <Loader inline size="1rem" />
                        ) : (
                          <Unit value={routedRequest.route.total_amt} />
                        )}
                      </td>
                    </tr>
                    {showMoreInfo && (
                      <>
                        <tr>
                          <td>Hops</td>
                          <td>{routedRequest.route.hops.length} node(s)</td>
                        </tr>
                        <tr>
                          <td>Time lock</td>
                          <td>
                            {moment()
                              .add(routedRequest.route.total_time_lock, 'seconds')
                              .fromNow(true)}
                          </td>
                        </tr>
                        <tr>
                          <td>Expires</td>
                          <td>{expiry && expiry.format(SHORT_FORMAT)}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
                {!showMoreInfo && (
                  <a
                    className="PaymentRequest-payment-details-more"
                    onClick={() => this.setState({ showMoreInfo: true })}
                  >
                    More info
                  </a>
                )}
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
          ''
        )}
      </div>
    );
  }
}
