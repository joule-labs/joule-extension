import React from 'react';
import BN from 'bn.js';
import moment from 'moment';
import classnames from 'classnames';
import { Tooltip, Icon } from 'antd';
import Identicon from 'components/Identicon';
import './TransactionRow.less';
import { AnyTransaction } from 'modules/account/types';

interface Props {
  source: AnyTransaction;
  type: 'bitcoin' | 'lightning';
  pubkey: string;
  timestamp: number;
  status: 'complete' | 'pending' | 'rejected' | 'expired';
  delta?: BN | false | null;
  onClick?(source: AnyTransaction): void;
}

export default class TransactionRow extends React.Component<Props> {
  render() {
    const { pubkey, type, timestamp, status, delta } = this.props;
    return (
      <div className="TransactionRow">
        <div className="TransactionRow-avatar">
          <Identicon className="TransactionRow-avatar-img" pubkey={pubkey} />
          <Tooltip title={status}>
            <div className={`TransactionRow-avatar-status is-${status}`} />
          </Tooltip>
        </div>
        <div className="TransactionRow-info">
          <div>{type}</div>
          <div>{moment.unix(timestamp).fromNow()}</div>
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
}