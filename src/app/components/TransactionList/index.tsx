import React from 'react';
import BN from 'bn.js';
import { connect } from 'react-redux';
import Loader from 'components/Loader';
import BigMessage from 'components/BigMessage';
import TransactionRow from './TransactionRow';
import { getTransactions } from 'modules/account/actions';
import { AnyTransaction } from 'modules/account/types';
import { AppState } from 'store/reducers'

interface TxRowData {
  timestamp: number;
  component: React.ReactNode;
}

interface StateProps {
  payments: AppState['account']['payments'];
  invoices: AppState['account']['invoices'];
  transactions: AppState['account']['transactions'];
  isFetchingTransactions: AppState['account']['isFetchingTransactions'];
  fetchTransactionsError: AppState['account']['fetchTransactionsError'];
  onClick?(transaction: AnyTransaction): void;
}

interface DispatchProps {
  getTransactions: typeof getTransactions;
}

type Props = StateProps & DispatchProps;

class TransactionList extends React.Component<Props> {
  componentWillMount() {
    const { payments, invoices, transactions } = this.props;
    if (!payments || !invoices || !transactions) {
      this.props.getTransactions();
    }
  }

  render() {
    const { isFetchingTransactions, fetchTransactionsError } = this.props;
    
    let content;
    if (isFetchingTransactions) {
      content = <Loader />;
    } else if (fetchTransactionsError) {
      content = (
        <BigMessage
          type="error"
          title="Failed to fetch transactions"
          message={fetchTransactionsError.message}
          button={{
            children: 'Try again',
            icon: 'reload',
            onClick: () => this.props.getTransactions(),
          }}
        />
      );
    } else {
      content = this.renderTransactionRows();
      if (!content.length) {
        content = (
          <BigMessage
            title="You have no transactions"
            message={`
              Joule only shows recent transactions, you may need to
              query your node for older ones
            `}
          />
        );
      }
    }

    return (
      <div className="TransactionsList">
        {content}
      </div>
    );
  }

  private renderTransactionRows = () => {
    const { payments, invoices, transactions, onClick } = this.props;
    if (!payments || !invoices || !transactions) {
      return [];
    }

    let rows: TxRowData[] = [];
    rows = rows.concat(
      payments.map(payment => ({
        timestamp: parseInt(payment.creation_date, 10),
        component: (
          <TransactionRow
            key={payment.payment_hash}
            source={payment}
            type="lightning"
            pubkey={payment.payment_hash}
            timestamp={parseInt(payment.creation_date, 10)}
            status="complete"
            delta={new BN(`-${payment.value_sat}`)}
            onClick={onClick}
          />
        )
      }))
    )
    rows = rows.concat(
      invoices.map(invoice => {
        const timestamp = parseInt(invoice.creation_date, 10);
        const expiry = timestamp + parseInt(invoice.expiry, 10) * 1000;
        const status = invoice.settled ? 'complete' :
          expiry < Date.now() ? 'expired' : 'pending';
          
        return {
          timestamp,
          component: (
            <TransactionRow
              key={invoice.payment_request}
              source={invoice}
              type="lightning"
              pubkey={invoice.payment_request}
              timestamp={timestamp}
              status={status}
              delta={status === 'complete' && new BN(invoice.amt_paid_sat)}
              onClick={onClick}
            />
          ),
        };
      })
    );
    rows = rows.concat(
      transactions.map(tx => ({
        timestamp: parseInt(tx.time_stamp, 10),
        component: (
          <TransactionRow
            key={tx.tx_hash}
            source={tx}
            type="bitcoin"
            pubkey={tx.dest_addresses[0]}
            timestamp={parseInt(tx.time_stamp, 10)}
            status={tx.num_confirmations > 2 ? 'complete' : 'pending'}
            delta={new BN(`-${tx.amount}`)}
            onClick={onClick}
          />
        ),
      }))
    )

    return rows.sort((r1, r2) => r2.timestamp - r1.timestamp).map(r => r.component);
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    payments: state.account.payments,
    invoices: state.account.invoices,
    transactions: state.account.transactions,
    isFetchingTransactions: state.account.isFetchingTransactions,
    fetchTransactionsError: state.account.fetchTransactionsError,
  }),
  {
    getTransactions,
  },
)(TransactionList);