import React from 'react';
import { connect } from 'react-redux';
import { Tooltip, Progress, Tabs, Icon, Select, Alert } from 'antd';
import Statistic from 'antd/lib/statistic';
import Loader from 'components/Loader';
import { AppState } from 'store/reducers';
import {
  Denomination,
  denominationSymbols,
  blockchainDisplayName,
} from 'utils/constants';
import { getNodeChain } from 'modules/node/selectors';
import { getChannels } from 'modules/channels/actions';
import { getUtxos } from 'modules/onchain/actions';
import { calculateBalanaceStats, BalanceStats } from 'utils/balances';
import { fromBaseToUnit } from 'utils/units';
import { typedKeys } from 'utils/ts';
import BalanceDetails from './BalanceDetails';
import './index.less';

interface StateProps {
  denomination: AppState['settings']['denomination'];
  channels: AppState['channels']['channels'];
  isFetchingChannels: AppState['channels']['isFetchingChannels'];
  fetchChannelsError: AppState['channels']['fetchChannelsError'];
  utxos: AppState['onchain']['utxos'];
  isFetchingUtxos: AppState['onchain']['isFetchingUtxos'];
  fetchUtxosError: AppState['onchain']['fetchUtxosError'];
  chain: ReturnType<typeof getNodeChain>;
}

interface ActionProps {
  getChannels: typeof getChannels;
  getUtxos: typeof getUtxos;
}

type Props = StateProps & ActionProps;

interface State {
  denomination: Denomination;
  stats: BalanceStats | null;
}

class Balances extends React.Component<Props, State> {
  state: State = {
    denomination: this.props.denomination,
    stats: null,
  };

  componentDidMount() {
    this.props.getChannels();
    this.props.getUtxos();
  }

  componentDidUpdate() {
    const { isFetchingChannels, channels, isFetchingUtxos, utxos } = this.props;
    // only calculate the stats one time when we have the channels & utxos
    // this approach avoids calculating the stats on every render if the
    // call to calculateBalanaceStats was inside of the render method
    if (
      !isFetchingChannels &&
      !isFetchingUtxos &&
      channels &&
      utxos &&
      !this.state.stats
    ) {
      this.setState({
        stats: calculateBalanaceStats(channels, utxos),
      });
    }
  }

  render() {
    const { fetchChannelsError, fetchUtxosError, chain } = this.props;
    const { stats, denomination } = this.state;
    const denomText = denominationSymbols[chain][denomination];

    let content;
    if (stats) {
      const statsClass = this.getStatsClassName(stats);

      content = (
        <>
          <div className="Balances-chart">
            <Select
              className="Balances-chart-denoms"
              size="small"
              value={denomination}
              dropdownMatchSelectWidth={false}
              onChange={this.handleChangeDenomination}
            >
              {typedKeys(Denomination).map(d => (
                <Select.Option key={d} value={d}>
                  {denominationSymbols[chain][d]}
                </Select.Option>
              ))}
            </Select>
            <div className="Balances-chart-metrics">
              <Statistic
                title="Total Wallet Balance"
                value={parseFloat(fromBaseToUnit(stats.total, denomination))}
                suffix={<small>{denomText}</small>}
              />
              <Statistic
                title={`Spendable Balance (${stats.spendablePercent}%)`}
                value={parseFloat(fromBaseToUnit(stats.spendable, denomination))}
                suffix={<small>{denomText}</small>}
              />
            </div>
            <Tooltip
              overlayClassName="Balances-chart-tip"
              title={`
                ${stats.pendingPercent}% Pending /
                ${stats.channelPercent}% Lightning /
                ${stats.onchainPercent}% ${blockchainDisplayName[chain]}
              `}
              placement="topRight"
              arrowPointAtCenter
            >
              <Progress
                className="Balances-chart-progress"
                percent={stats.channelPercent + stats.pendingPercent}
                type="circle"
                strokeColor="#7642ff"
                strokeLinecap="square"
                successPercent={Math.max(
                  0.1,
                  100 - stats.channelPercent - stats.onchainPercent,
                )}
                trailColor="#ff9500"
                format={() => `${stats.spendablePercent}%`}
              />
            </Tooltip>
          </div>
          <div className="Balances-stats">
            <Statistic
              title="Pending"
              value={parseFloat(fromBaseToUnit(stats.pendingTotal, denomination))}
              valueStyle={{ color: '#858585' }}
              className={statsClass}
              suffix={denomText}
            />
            <Statistic
              title="Lightning"
              value={parseFloat(fromBaseToUnit(stats.channelTotal, denomination))}
              valueStyle={{ color: '#7642ff' }}
              className={statsClass}
              suffix={denomText}
            />
            <Statistic
              title={blockchainDisplayName[chain]}
              value={parseFloat(fromBaseToUnit(stats.onchainTotal, denomination))}
              valueStyle={{ color: '#ff9500' }}
              className={statsClass}
              suffix={denomText}
            />
          </div>
          <div className="Balances-details">
            <Tabs defaultActiveKey={stats.pendingPercent ? 'pending' : 'lightning'}>
              <Tabs.TabPane
                tab={
                  <>
                    <Icon type="clock-circle" /> Pending
                  </>
                }
                key="pending"
              >
                <BalanceDetails
                  groups={stats.pendingDetails}
                  chain={chain}
                  denomination={denomination}
                  emptyMessage="All of your funds are available to spend immediately"
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <>
                    <Icon type="thunderbolt" /> Lightning
                  </>
                }
                key="lightning"
              >
                <BalanceDetails
                  groups={stats.channelDetails}
                  chain={chain}
                  denomination={denomination}
                  emptyMessage="Open some channels to enjoy the Lightning experience"
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <>
                    <Icon type="link" /> {blockchainDisplayName[chain]}
                  </>
                }
                key="on-chain"
              >
                <BalanceDetails
                  groups={stats.onchainDetails}
                  chain={chain}
                  emptyMessage="Fund your on-chain wallet to view your UTXOs"
                  denomination={denomination}
                />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </>
      );
    } else if (fetchChannelsError || fetchUtxosError) {
      const message = fetchChannelsError
        ? fetchChannelsError.message
        : fetchUtxosError
        ? fetchUtxosError.message
        : 'Unable to fetch balance data';
      content = <Alert type="error" message={message} />;
    } else {
      content = <Loader />;
    }

    return <div className="Balances">{content}</div>;
  }

  private handleChangeDenomination = (value: any) => {
    this.setState({ denomination: value as Denomination });
  };

  // helper function used to shrink the stats font sizes
  // based on how big (in length) the largest value is
  private getStatsClassName(stats: BalanceStats) {
    const statsClasses: { [key: number]: string } = {
      4: 'is-small', // 12+ digits in sats, +1000BTC
      3: 'is-medium', // 9-11 digits in sats, 1-999BTC
      2: 'is-large', // 6-8 digits in sats, 1-100M sats
    };
    const longest = Math.max(
      stats.pendingTotal.length,
      stats.channelTotal.length,
      stats.onchainTotal.length,
    );
    return statsClasses[Math.floor(longest / 3)] || '';
  }
}

export default connect<StateProps, ActionProps, {}, AppState>(
  state => ({
    denomination: state.settings.denomination,
    channels: state.channels.channels,
    isFetchingChannels: state.channels.isFetchingChannels,
    fetchChannelsError: state.channels.fetchChannelsError,
    utxos: state.onchain.utxos,
    isFetchingUtxos: state.onchain.isFetchingUtxos,
    fetchUtxosError: state.onchain.fetchUtxosError,
    chain: getNodeChain(state),
  }),
  {
    getChannels,
    getUtxos,
  },
)(Balances);
