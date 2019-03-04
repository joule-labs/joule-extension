import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Icon, Button, Modal } from 'antd';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import { CHANNEL_STATUS } from 'lib/lnd-http';
import { AppState } from 'store/reducers';
import { getAccountInfo } from 'modules/account/actions';
import { closeChannel } from 'modules/channels/actions';
import { ChannelWithNode } from 'modules/channels/types';
import { channelStatusText } from 'utils/constants';
import { ellipsisSandwich, enumToClassName } from 'utils/formatters';
import './style.less';

interface StateProps {
  account: AppState['account']['account'];
}

interface DispatchProps {
  getAccountInfo: typeof getAccountInfo;
  closeChannel: typeof closeChannel;
}

interface OwnProps {
  channel: ChannelWithNode;
  close?(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface DetailRow {
  label: string;
  value: React.ReactNode;
}

class ChannelInfo extends React.Component<Props> {
  componentDidMount() {
    if (!this.props.account) {
      this.props.getAccountInfo();
    }
  }

  render() {
    const { account, channel } = this.props;
    if (!account) {
      return null;
    }

    let statusClass = `is-${enumToClassName(channel.status)}`;
    if (channel.status === CHANNEL_STATUS.OPEN) {
      statusClass = `${statusClass} is-${channel.active ? 'active' : 'inactive'}`;
    }
    
    return (
      <div className="ChannelInfo">
        <div className="ChannelInfo-parties">
          <div className="ChannelInfo-parties-party is-from">
            <div className="ChannelInfo-parties-party-icon">
              <Identicon pubkey={account.pubKey} />
            </div>
            <div className="ChannelInfo-parties-party-name">
              {account.alias || account.pubKey}
            </div>
          </div>
          <div className="ChannelInfo-parties-arrow">
            <Icon type="swap" />
          </div>
          <div className="ChannelInfo-parties-party is-to">
            <div className="ChannelInfo-parties-party-icon">
              <Identicon pubkey={channel.node.pub_key} />
              <div className={`ChannelInfo-parties-party-icon-status ${statusClass}`} />
            </div>
            <div className="ChannelInfo-parties-party-name">
              {channel.node.alias || channel.node.pub_key}
            </div>
          </div>
        </div>

        <table className="ChannelInfo-details">
          <tbody>
            {this.getChannelDetails().map(d => (
              <tr className="TxInfo-details-row" key={d.label}>
                <td className="TxInfo-details-row-label">{d.label}</td>
                <td className="TxInfo-details-row-value">{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TODO: show button when LND issue #2730 is resolved */}
        {channel.status === CHANNEL_STATUS.OPEN && (
          <div className="ChannelInfo-actions" style={{ display: 'none' }}>
            <Button
              type="danger"
              size="large"
              block
              ghost
              onClick={this.closeChannel}
            >
              Close Channel
            </Button>
          </div>
        )}
      </div>
    );
  }

  private getChannelDetails = (): DetailRow[] => {
    const { channel } = this.props;

    const txLink = (txid: string) => (
      <a
          href={`https://blockstream.info/tx/${txid}`}
          target="_blank"
          rel="noopener nofollow"
        >
          {ellipsisSandwich(txid, 5)}
        </a>
    );

    const fundingTx = channel.channel_point.split(':')[0];
    // details shared by all channel statuses
    const details: DetailRow[] = [{
      label: 'Status',
      value: channelStatusText[channel.status],
    }, {
      label: 'Capacity',
      value: <Unit value={channel.capacity} showFiat />,
    }, {
      label: 'Local Balance',
      value: <Unit value={channel.local_balance} showFiat />,
    }, {
      label: 'Remote Balance',
      value: <Unit value={channel.remote_balance} showFiat />,
    }, {
      label: 'Funding Tx',
      value: txLink(fundingTx),
    }];

    if (channel.status === CHANNEL_STATUS.OPEN) {
      details.push({
        label: 'Total Sent',
        value: <Unit value={channel.total_satoshis_sent} showFiat />,
      }, {
        label: 'Total Received',
        value: <Unit value={channel.total_satoshis_received} showFiat />,
      });
    } else if (channel.status === CHANNEL_STATUS.CLOSING) {
      details.push({
        label: 'Closing Tx',
        value: txLink(channel.closing_txid),  
      });
    } else if (channel.status === CHANNEL_STATUS.FORCE_CLOSING) {
      details.push({
        label: 'Closing in',
        value: <>
          <span>{channel.blocks_til_maturity} blocks</span>
          <span className="Unit-secondary">
            ~{moment().add(channel.blocks_til_maturity * 10, 'minutes').fromNow(true)}
          </span>
        </>
      }, {
        label: 'Closing Tx',
        value: txLink(channel.closing_txid),  
      });
    }

    return details;
  }

  private closeChannel = () => {
    Modal.confirm({
      title: 'Are you sure?',
      content: `
        We'll attempt to close the channel cooperatively. If this
        fails, you will be given the option to force the
        channel closed.
      `,
      onOk: () => {
        const [fundingTxId, outputIndex] = this.props.channel.channel_point.split(':')
        this.props.closeChannel(fundingTxId, outputIndex);
      },
    });
  }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    account: state.account.account,
  }),
  { 
    getAccountInfo,
    closeChannel
  },
)(ChannelInfo);