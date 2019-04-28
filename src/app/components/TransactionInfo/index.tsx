import React from 'react';
import { connect } from 'react-redux';
import { Timeline, Icon } from 'antd';
import QRCode from 'qrcode.react';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import Copy from 'components/Copy';
import DetailsTable, { DetailsRow } from 'components/DetailsTable';
import TransferIcons, { TransferParty } from 'components/TransferIcons';
import BigMessage from 'components/BigMessage';
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
  node: AppState['node']['nodeInfo'];
}

interface DispatchProps {
  getAccountInfo: typeof getAccountInfo;
}

interface OwnProps {
  tx: AnyTransaction;
}

type Props = StateProps & DispatchProps & OwnProps;

class TransactionInfo extends React.Component<Props> {
  componentWillMount() {
    if (!this.props.account) {
      this.props.getAccountInfo();
    }
  }

  render() {
    const { tx, account, node } = this.props;
    if (!account) {
      return null;
    }
    // Handle testnet
    if (!node) {
      return null;
    }
    const testnet = node.testnet;
    const mUrl = 'https://blockstream.info/';
    const tUrl = 'https://blockstream.info/testnet/';
    let txUrl;
    testnet === true ? (txUrl = tUrl) : (txUrl = mUrl);
    // End handle testnet
    console.log(txUrl);
    let to: TransferParty | undefined;
    let from: TransferParty | undefined;
    let primaryCode;
    let pathEl;
    let details: DetailsRow[] = [];

    if (isPayment(tx)) {
      to = {
        name: tx.to.alias,
        icon: <Identicon pubkey={tx.to.pub_key} />,
      };
      from = {
        name: account.alias,
        icon: <Identicon pubkey={account.pubKey} />,
      };
      details = [
        {
          label: 'Amount',
          value: <Unit value={tx.value_sat} showFiat />,
        },
        {
          label: 'Fee',
          value: <Unit value={tx.fee} />,
        },
        {
          label: 'Date',
          value: unixMoment(tx.creation_date).format(LONG_FORMAT),
        },
        {
          label: 'Hops',
          value: tx.path.length,
        },
      ];
      pathEl = (
        <div className="TxInfo-route">
          <h2 className="TxInfo-route-title">Route</h2>
          <div className="TxInfo-route-routes">
            {tx.path.length ? (
              <Timeline>
                {tx.path.map(id => (
                  <Timeline.Item key={id}>
                    <code>{id}</code>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <BigMessage
                title="No route info available"
                message="This payment may be too old, and not have stored routing data"
              />
            )}
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
      details = [
        {
          label: 'Amount',
          value: tx.value ? <Unit value={tx.value} showFiat /> : <em>N/A</em>,
        },
        {
          label: 'Memo',
          value: tx.memo || <em>N/A</em>,
        },
        {
          label: 'Date',
          value: unixMoment(tx.creation_date).format(LONG_FORMAT),
        },
        {
          label: 'Expiry',
          value: unixMoment(tx.creation_date)
            .add(tx.expiry, 'seconds')
            .format(LONG_FORMAT),
        },
      ];
    } else if (isBitcoinTx(tx)) {
      details = [
        {
          label: 'Amount',
          value: <Unit value={tx.amount.replace('-', '')} showFiat />,
        },
        {
          label: 'Fee',
          value: <Unit value={tx.total_fees} />,
        },
        {
          label: 'Block height',
          value: (
            <a
              href={`${txUrl}block/${tx.block_hash}`}
              target="_blank"
              rel="noopener nofollow"
            >
              {tx.block_height}
            </a>
          ),
        },
        {
          label: 'Tx Hash',
          value: (
            <a href={`${txUrl}tx/${tx.tx_hash}`} target="_blank" rel="noopener nofollow">
              {ellipsisSandwich(tx.tx_hash, 5)}
            </a>
          ),
        },
      ];
    }

    return (
      <div className="TxInfo">
        {to && from && (
          <TransferIcons
            from={from}
            to={to}
            icon={<Icon component={TransactionArrow} />}
          />
        )}

        <DetailsTable details={details} />

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
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    account: state.account.account,
    node: state.node.nodeInfo,
  }),
  { getAccountInfo },
)(TransactionInfo);
