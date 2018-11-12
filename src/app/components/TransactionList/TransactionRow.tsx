import React from 'react';
import BN from 'bn.js';
import moment from 'moment';
import classnames from 'classnames';
import { Tooltip, Icon } from 'antd';
import Identicon from 'components/Identicon';
import { AnyTransaction } from 'modules/account/types';
import { isInvoice, isBitcoinTx } from 'utils/typeguards';
import BitcoinLogo from 'static/images/bitcoin.svg';
import './TransactionRow.less';

interface Props {
  source: AnyTransaction;
  title: React.ReactNode;
  type: 'bitcoin' | 'lightning';
  timestamp: number;
  status: 'complete' | 'pending' | 'rejected' | 'expired';
  pubkey?: string;
  delta?: BN | false | null;
  onClick?(source: AnyTransaction): void;
}


export default class TransactionRow extends React.Component<Props> {
  render() {
    const { pubkey, timestamp, status, delta, onClick, source, title } = this.props;

    let icon;
    if (pubkey) {
      icon = <Identicon className="TransactionRow-avatar-img" pubkey={pubkey} />;
    } else if (isInvoice(source)) {
      icon = (
        <div className="TransactionRow-avatar-img is-icon is-invoice">
          <Icon type="audit" />
        </div>
      );
    } else if (isBitcoinTx(source)) {
      icon = (
        <div className="TransactionRow-avatar-img is-icon is-bitcoin">
          <Icon component={BitcoinLogo} />
        </div>
      );
    }

    return (
      <div
        className={classnames("TransactionRow", onClick && 'is-clickable')}
        onClick={this.handleClick}
      >
        <div className="TransactionRow-avatar">
          {icon}
          <Tooltip title={status}>
            <div className={`TransactionRow-avatar-status is-${status}`} />
          </Tooltip>
        </div>
        <div className="TransactionRow-info">
          <div className="TransactionRow-info-title">{title}</div>
          <div className="TransactionRow-info-time">
            {moment.unix(timestamp).format('MMM Mo, LT')}
          </div>
        </div>
        {delta &&
          <div className={
            classnames(`TransactionRow-delta is-${delta.gtn(0) ? 'positive' : 'negative'}`)
          }>
            {delta.gtn(0) && '+'}{delta.toString()} sats
          </div>
        }
      </div>
    )
  }

  private handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.source);
    }
  };
}