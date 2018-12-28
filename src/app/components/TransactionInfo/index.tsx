import React from 'react';
import { connect } from 'react-redux';
import { Timeline, Icon } from 'antd';
import QRCode from 'qrcode.react';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import Copy from 'components/Copy';
import { ellipsisSandwich } from 'utils/formatters';
import { getAccountInfo } from 'modules/account/actions';
import { AnyTransaction } from 'modules/account/types';
import { isPayment, isInvoice, isBitcoinTx } from 'utils/typeguards';
import { unixMoment, LONG_FORMAT } from 'utils/time';
import { AppState } from 'store/reducers';
import TransactionArrow from 'static/images/transaction-arrow.svg';
import './style.less';

interface StateProps {
  account: AppState['account']['account'];
}

interface DispatchProps {
  getAccountInfo: typeof getAccountInfo;
}

interface OwnProps {
  tx: AnyTransaction;
}

type Props = StateProps & DispatchProps & OwnProps;

interface DetailRow {
  label: string;
  value: React.ReactNode;
}

interface TransactionParty {
  name: React.ReactNode;
  icon: React.ReactNode;
}

class TransactionInfo extends React.Component<Props> {
  componentWillMount() {
    if (!this.props.account) {
      this.props.getAccountInfo();
    }
  }

  render() {
    const { tx, account } = this.props;
    if (!account) {
      return null;
    }

    let to: TransactionParty | undefined;
    let from: TransactionParty | undefined;
    let primaryCode;
    let pathEl;
    let details: DetailRow[] = [];

    if (isPayment(tx)) {
      to = {
        name: tx.to.alias,
        icon: <Identicon pubkey={tx.to.pub_key} />
      };
      from = {
        name: account.alias,
        icon: <Identicon pubkey={account.pubKey} />,
      };
      details = [{
        label: 'Amount',
        value: <Unit value={tx.value_sat} showFiat />,
      }, {
        label: 'Fee',
        value: <Unit value={tx.fee} />,
      }, {
        label: 'Date',
        value: unixMoment(tx.creation_date).format(LONG_FORMAT),
      }, {
        label: 'Hops',
        value: tx.path.length,
      }];
      pathEl = (
        <div className="TxInfo-route">
          <h2 className="TxInfo-route-title">Route</h2>
          <div className="TxInfo-route-routes">
            <Timeline>
              {tx.path.map(id => (
                <Timeline.Item key={id}>
                  <code>{id}</code>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        </div>
      );
    } else if (isInvoice(tx)) {
      primaryCode = tx.payment_request;
      to = {
        name: account.alias,
        icon: <Identicon pubkey={account.pubKey} />,
      };
      from = {
        name: 'Unknown',
        icon: (
          <div className="Identicon">
            <Icon type="question" />
          </div>
        ),
      };
      details = [{
        label: 'Amount',
        value: tx.value ? <Unit value={tx.value} showFiat /> : <em>N/A</em>,
      }, {
        label: 'Memo',
        value: tx.memo || <em>N/A</em>,
      }, {
        label: 'Date',
        value: unixMoment(tx.creation_date).format(LONG_FORMAT),
      }, {
        label: 'Expiry',
        value: unixMoment(tx.creation_date)
          .add(tx.expiry, 'seconds')
          .format(LONG_FORMAT),
      }];
    } else if (isBitcoinTx(tx)) {
      details = [{
        label: 'Amount',
        value: <Unit value={tx.amount.replace('-', '')} showFiat />,
      }, {
        label: 'Fee',
        value: <Unit value={tx.total_fees} />,
      }, {
        label: 'Block height',
        value: (
          <a
            href={`https://blockstream.info/block/${tx.block_hash}`}
            target="_blank"
            rel="noopener nofollow"
          >
            {tx.block_height}
          </a>
        ),
      }, {
        label: 'Tx Hash',
        value: (
          <a
            href={`https://blockstream.info/tx/${tx.tx_hash}`}
            target="_blank"
            rel="noopener nofollow"
          >
            {ellipsisSandwich(tx.tx_hash, 5)}
          </a>
        ),
      }];
    }

    return (
      <div className="TxInfo">
        {to && from && (
          <div className="TxInfo-parties">
            <div className="TxInfo-parties-party is-from">
              <div className="TxInfo-parties-party-icon">
                {from.icon}
              </div>
              <div className="TxInfo-parties-party-name">
                {from.name}
              </div>
            </div>
            <div className="TxInfo-parties-arrow">
              <Icon component={TransactionArrow} />
            </div>
            <div className="TxInfo-parties-party is-to">
              <div className="TxInfo-parties-party-icon">
                {to.icon}
              </div>
              <div className="TxInfo-parties-party-name">
                {to.name}
              </div>
            </div>
          </div>
        )}

        <table className="TxInfo-details">
          <tbody>
            {details.map(d => (
              <tr className="TxInfo-details-row" key={d.label}>
                <td className="TxInfo-details-row-label">{d.label}</td>
                <td className="TxInfo-details-row-value">{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {primaryCode && (
          <>
            <div className="TxInfo-qr">
              <QRCode value={primaryCode} size={180} />
            </div>
            <Copy text={primaryCode}>
              <code className="TxInfo-copy">{primaryCode}</code>
            </Copy>
          </>
        )}

        {pathEl}
      </div>
    )
  }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    account: state.account.account,
  }),
  { getAccountInfo },
)(TransactionInfo);