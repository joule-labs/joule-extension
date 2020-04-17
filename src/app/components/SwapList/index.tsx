import React from 'react';
import BN from 'bn.js';
import { connect } from 'react-redux';
import Loader from 'components/Loader';
import BigMessage from 'components/BigMessage';
import SwapRow from './SwapRow';
import { AppState } from 'store/reducers';
import { listSwaps } from 'modules/loop/actions';
import { GetSwapsResponse } from 'lib/loop-http';

interface SwapRowData {
  timestamp: number;
  component: React.ReactNode;
}

interface StateProps {
  swapInfo: AppState['loop']['swapInfo'];
  isFetchingSwaps: AppState['loop']['isFetchingSwaps'];
  fetchingSwapsError: AppState['loop']['fetchingSwapsError'];
}

interface DispatchProps {
  listSwaps: typeof listSwaps;
}

interface OwnProps {
  onClick?(swaps: GetSwapsResponse): void;
}

type Props = StateProps & DispatchProps & OwnProps;

class SwapList extends React.Component<Props> {
  componentWillMount() {
    const { swapInfo, isFetchingSwaps, fetchingSwapsError } = this.props;
    if (!swapInfo || !isFetchingSwaps || !fetchingSwapsError) {
      this.props.listSwaps();
    }
  }

  render() {
    const { isFetchingSwaps, fetchingSwapsError } = this.props;

    let content;
    if (isFetchingSwaps) {
      content = <Loader />;
    } else if (fetchingSwapsError) {
      content = (
        <BigMessage
          type="error"
          title="Failed to fetch swaps"
          message={fetchingSwapsError.message}
          button={{
            children: 'Try again',
            icon: 'reload',
            onClick: () => this.props.listSwaps(),
          }}
        />
      );
    } else {
      content = this.renderSwapRows();
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

    return <div className="SwapList">{content}</div>;
  }

  private renderSwapRows = () => {
    const { swapInfo, onClick } = this.props;
    if (!swapInfo) {
      return [];
    }

    let rows: SwapRowData[] = [];
    rows = rows.concat(
      swapInfo.swaps.map(swap => ({
        timestamp: parseInt(swap.initiation_time, 10),
        component: (
          <SwapRow
            key={swap.id_bytes}
            source={swap}
            title={swap.state}
            type={swap.type}
            htlc={swap.htlc_address}
            timestamp={parseInt(swap.initiation_time, 10)}
            status={swap.state}
            delta={new BN(`-${swap.amt}`)}
            onClick={onClick}
          />
        ),
      })),
    );

    return rows.sort((r1, r2) => r2.timestamp - r1.timestamp).map(r => r.component);
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    swapInfo: state.loop.swapInfo,
    isFetchingSwaps: state.loop.isFetchingSwaps,
    fetchingSwapsError: state.loop.fetchingSwapsError,
  }),
  {
    listSwaps,
  },
)(SwapList);
