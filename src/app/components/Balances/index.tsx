import React from 'react';
import { connect } from 'react-redux';
import { Tooltip, Progress, Tabs, Icon, Select, Alert } from 'antd';
import Statistic from 'antd/lib/statistic'; 
import Loader from 'components/Loader';
import Unit from 'components/Unit';
import Copy from 'components/Copy';
import Identicon from 'components/Identicon';
import { AppState } from 'store/reducers';
import { blockchainLogos, CHAIN_TYPE, Denomination } from 'utils/constants';
import { CHANNEL_STATUS } from 'lib/lnd-http';
import { getChannels } from 'modules/channels/actions';
import { getUtxos } from 'modules/onchain/actions';
import './index.less';
import { calculateBalanaceStats } from 'utils/balances';

interface StateProps {
  channels: AppState['channels']['channels'];
  isFetchingChannels: AppState['channels']['isFetchingChannels'];
  fetchChannelsError: AppState['channels']['fetchChannelsError'];
  utxos: AppState['onchain']['utxos'];
  isFetchingUtxos: AppState['onchain']['isFetchingUtxos'];
  fetchUtxosError: AppState['onchain']['fetchUtxosError'];
}

interface ActionProps {
  getChannels: typeof getChannels;
  getUtxos: typeof getUtxos;
}

type Props = StateProps & ActionProps;

interface State {
  denomination: Denomination;
}

class Balances extends React.Component<Props, State> {
  state: State = {
    denomination: Denomination.BITS,
  };

  componentDidMount() {
    this.props.getChannels();
    this.props.getUtxos();
  }


  render() {
    const { channels, isFetchingChannels, fetchChannelsError, utxos, isFetchingUtxos, fetchUtxosError } = this.props;

    if (isFetchingChannels || isFetchingUtxos) {
      return <Loader />;
    }

    if (fetchChannelsError || fetchUtxosError) {
      return (
        <Alert
          type="error"
          message={fetchChannelsError!.message || fetchUtxosError!.message}
        />
      );
    }

    let content;
    if (channels && utxos) {
      const stats = calculateBalanaceStats(channels, utxos);
      console.log(stats);
      content = (
        <div className="BalanceModal">
          <div className="BalanceModal-chart">
            <Select
              className="BalanceModal-chart-denoms"
              size="small"
              value="bits"
              dropdownMatchSelectWidth={false}
            >
              {['bits', 'sats', 'mBTC', 'BTC'].map(d => (
                <Select.Option key={d} value={d}>
                  {d}
                </Select.Option>
              ))}
            </Select>        
            <div className="BalanceModal-chart-metrics">
              <Statistic title="Total Wallet Balance" value={48.185212} suffix={<small>bits</small>} />
              <Statistic title="Spendable Balance" value={33.729648} suffix={<small>bits (70%)</small>} />
            </div>    
            <Tooltip
              overlayClassName="BalanceModal-chart-tip"
              title="50% Lightning / 30% Bitcoin / 20% Pending"
              placement="topRight"
              arrowPointAtCenter
            >
              <Progress
                className="BalanceModal-chart-progress"
                percent={70}
                type="dashboard"
                strokeColor="#7642ff"
                successPercent={20}
                trailColor="#ff9500"
              />
            </Tooltip>
          </div>
          <div className="BalanceModal-stats">
            <Statistic title="Pending" value={3.185212} valueStyle={{ color: '#858585' }} />
            <Statistic title="Lightning" value={26.97285} valueStyle={{ color: '#7642ff' }} />
            <Statistic title="Bitcoin" value={14.185212} valueStyle={{ color: '#ff9500' }} />
          </div>
          <div className="BalanceModal-details">
            <Tabs defaultActiveKey="pending">
              <Tabs.TabPane
                tab={<><Icon type="clock-circle"/> Pending</>}
                key="pending"
              >
                <SamplePending />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={<><Icon type="thunderbolt"/> Lightning</>}
                key="lightning"
              >
                <SampleChannels channels={this.props.channels} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={<><Icon type="link"/> Bitcoin</>}
                key="on-chain"
              >
                <SampleUtxos />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      );
    } else if (fetchChannelsError || fetchUtxosError) {
      content = fetchChannelsError!.message || fetchUtxosError!.message;
    } else {
      content = <Loader />;
    }

    return (
      <div className="BalanceModal">
        {content}
      </div>
    )
  }
}

export default connect<StateProps, ActionProps, {}, AppState>(
  state => ({
    channels: state.channels.channels,
    isFetchingChannels: state.channels.isFetchingChannels,
    fetchChannelsError: state.channels.fetchChannelsError,
    utxos: state.onchain.utxos,
    isFetchingUtxos: state.onchain.isFetchingUtxos,
    fetchUtxosError: state.onchain.fetchUtxosError,
  }),
  {
    getChannels,
    getUtxos,
  },
)(Balances);



const SamplePending: React.SFC = () => {
  const chainTxns = [
    { addr: 'rb3hoBam7mRSrFmrXNbcfictfNWui1yNge', amount: '2373430' },
    { addr: 'sb1qn0fdgu6vcns8tk7ztd6dtuaygwha36fh9ypums', amount: '-1860486' },
  ];
  const opening = [
    { local_balance: '8537593', node: { alias: 'bob', pub_key: '0219d5320e67f71bc2843254932d3e58cd19d4a7059b132e76382be8834b8fa78b' }},
    { local_balance: '1869475', node: { alias: '', pub_key: '02a9d5320e67f71bc2843254932d3e58cd19d4a7059b132e76382be8834b8fdfse' }},
  ];
  const closing = [
    { local_balance: '8537593', node: { alias: 'charlie', pub_key: '02a9d5320e67f711c2843254932d3e58cd19d4a7059b132e76382be8834b8fmghg' }},
  ];

  return (
    <>
      <div className="BalanceModal-details-header">
        <span>2 On-chain Transactions</span>
        <span>3.83472 <small>bits</small></span>
      </div>
      {chainTxns.map((r, i) => (
        <div key={r.amount} className="BalanceModal-details-row">
          <div className="BalanceModal-details-row-icon is-big">
            <Icon component={blockchainLogos[CHAIN_TYPE.BITCOIN]} />
          </div>
          <div className="BalanceModal-details-row-info">
            <Tooltip title={r.addr}>
              <Copy text={r.addr} name="wallet address">
                  <code>{r.addr}</code>
              </Copy>
            </Tooltip>
            <div className="BalanceModal-details-row-info-comment">
              {i+2} confirmations remaining (~{(+2)*10} minutes)
            </div>
          </div>
          <div className={`BalanceModal-details-row-amount is-${i === 0 ? 'positive' : 'negative'}`}>
            <Unit value={r.amount} showPlus />
          </div>
        </div>
      ))}

      <div className="BalanceModal-details-header">
        <span>2 Channels Opening</span>
        <span>9.83472 <small>bits</small></span>
      </div>
      {opening.map((c, i) => (
        <div key={i} className="BalanceModal-details-row">
          <div className="BalanceModal-details-row-icon is-big">
            <Identicon className="ChannelRow-avatar-img" pubkey={c.node.pub_key} />
          </div>
          <div className="BalanceModal-details-row-info">
            <code>{c.node.alias || c.node.pub_key}</code>
            <div className="BalanceModal-details-row-info-comment">
              {i+1} confirmations remaining (~{(+1)*10} minutes)
            </div>
          </div>
          <div className="BalanceModal-details-row-amount">
            <Unit value={c.local_balance} />
          </div>
        </div>
      ))}

      <div className="BalanceModal-details-header">
        <span>1 Channel Closing</span>
        <span>9.83472 <small>bits</small></span>
      </div>
      {closing.map((c, i) => (
        <div key={i} className="BalanceModal-details-row">
          <div className="BalanceModal-details-row-icon is-big">
            <Identicon className="ChannelRow-avatar-img" pubkey={c.node.pub_key} />
          </div>
          <div className="BalanceModal-details-row-info">
            <code>{c.node.alias || c.node.pub_key}</code>
            <div className="BalanceModal-details-row-info-comment">
              {i+2} confirmations remaining (~{(+2)*10} minutes)
            </div>
          </div>
          <div className="BalanceModal-details-row-amount">
            <Unit value={c.local_balance} />
          </div>
        </div>
      ))}
    </>
  );
}

const SampleChannels: React.SFC<{channels: AppState['channels']['channels']}> = ({ channels }) => {
  // my balances in active/inactive channels
  return channels && (
    <>
      <div className="BalanceModal-details-header">
        <span>1 Inactive Channel</span>
        <span>1.83472 <small>bits</small></span>
      </div>
      <div key={123} className="BalanceModal-details-row">
        <div className="BalanceModal-details-row-icon">
          <Identicon className="ChannelRow-avatar-img" pubkey={'02a9d5320e67f71bc2843254932d3e58cd19d4a7059b132e76382be8834b8fa78b'} />
        </div>
        <div className="BalanceModal-details-row-info">
            <code>{'02a9d5320e67f71bc2843254932d3e58cd19d4a7059b132e76382be8834b8fa78b'}</code>
        </div>
        <div className="BalanceModal-details-row-amount">
          <Unit value={'1834720'} />
        </div>
        <div className="BalanceModal-details-row-close">
          <Tooltip title="Close Channel" placement="topRight" arrowPointAtCenter>
            <Icon type="stop" />
          </Tooltip>
        </div>
      </div>
      <div className="BalanceModal-details-header">
        <span>3 Active Channels</span>
        <span>26.97285 <small>bits</small></span>
      </div>
      {channels.filter(c => c.status === CHANNEL_STATUS.OPEN).map((c, i) => (
        <div key={i} className="BalanceModal-details-row">
          <div className="BalanceModal-details-row-icon">
            <Identicon className="ChannelRow-avatar-img" pubkey={c.node.pub_key} />
          </div>
          <div className="BalanceModal-details-row-info">
              <code>{c.node.alias || c.node.pub_key}</code>
          </div>
          <div className="BalanceModal-details-row-amount">
            <Unit value={c.local_balance} />
          </div>
          <div className="BalanceModal-details-row-close">
            <Tooltip title="Close Channel" placement="topRight" arrowPointAtCenter>
              <Icon type="stop" />
            </Tooltip>
          </div>
        </div>
      ))}
    </>
  );
}


const SampleUtxos: React.SFC = () => {
  // pull utxos from API
  // list only the ones with 1+ confs
  const addrs = [
    'sb1qkk70ljajzjq3gdk0wvk8tnaumf664qyjedqdz4',
    'rb3hoBam7mRSrFmrXNbcfictfNWui1yNge',
    'sb1qn0fdgu6vcns8tk7ztd6dtuaygwha36fh9ypums',
    'rr7pyGm3xNoMDu195VH3tTXDhp9qxPwFB6',
    'renZmHwHb6ThqE12pmvbSwfYhnS2ZPDGXA',
  ];
  const chainTxns = Array.from(Array(10).keys(), i => ({
    addr: addrs[i % addrs.length],
    amount: (Math.floor(Math.random() * 100000000) + 1).toString()
  }));

  return (
    <>
      <div className="BalanceModal-details-header">
        <span>10 Confirmed UTXOs</span>
        <span>387.97285 <small>bits</small></span>
      </div>
      {chainTxns.map(r => (
        <div key={r.amount} className="BalanceModal-details-row">
          <div className="BalanceModal-details-row-icon">
            <Icon component={blockchainLogos[CHAIN_TYPE.BITCOIN]} />
          </div>
          <div className="BalanceModal-details-row-info">
            <Tooltip title={r.addr}>
              <Copy text={r.addr} name="wallet address">
                  <code>{r.addr}</code>
              </Copy>
            </Tooltip>
          </div>
          <div className="BalanceModal-details-row-amount">
            <Unit value={r.amount} />
          </div>
        </div>
      ))}
    </>
  );
};
