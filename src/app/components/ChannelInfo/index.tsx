import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Icon, Button, Modal, Input } from 'antd';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import DetailsTable, { DetailsRow } from 'components/DetailsTable';
import TransferIcons from 'components/TransferIcons';
import Copy from 'components/Copy';
import { CHANNEL_STATUS } from 'lib/lnd-http';
import { AppState } from 'store/reducers';
import { getAccountInfo } from 'modules/account/actions';
import { deactivateCharm, activateCharm } from 'modules/loop/actions';
import { closeChannel } from 'modules/channels/actions';
import { ChannelWithNode } from 'modules/channels/types';
import { channelStatusText } from 'utils/constants';
import { ellipsisSandwich, enumToClassName, makeTxUrl } from 'utils/formatters';
import './index.less';
import { charmControl } from 'utils/charm';
import Help from 'components/Help';

interface StateProps {
  account: AppState['account']['account'];
  channels: AppState['channels']['channels'];
  node: AppState['node']['nodeInfo'];
  charm: AppState['loop']['charm'];
}

interface State {
  isCharmActive: boolean;
}

const INITIAL_STATE = {
  isCharmActive: false,
};

interface DispatchProps {
  getAccountInfo: typeof getAccountInfo;
  closeChannel: typeof closeChannel;
  activateCharm: typeof activateCharm;
  deactivateCharm: typeof deactivateCharm;
}

interface OwnProps {
  channel: ChannelWithNode;
  close?(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

class ChannelInfo extends React.Component<Props> {
  state: State = { ...INITIAL_STATE };

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

    let closeCommand = '';
    if (channel.status === CHANNEL_STATUS.OPEN) {
      const txInfo = channel.channel_point.split(':');
      closeCommand = `lncli closechannel ${txInfo[0]} ${txInfo[1]}`;
    }

    return (
      <div className="ChannelInfo">
        <TransferIcons
          from={{
            icon: <Identicon pubkey={account.pubKey} />,
            name: account.alias || account.pubKey,
          }}
          icon={<Icon type="swap" />}
          to={{
            icon: <Identicon pubkey={channel.node.pub_key} />,
            name: channel.node.alias || channel.node.pub_key,
            statusClass,
          }}
        />

        <DetailsTable details={this.getChannelDetails()} />

        {/* TODO: show button instead of instructions when LND issue #2730 is resolved */}
        {channel.status === CHANNEL_STATUS.OPEN && (
          <div className="ChannelInfo-actions" style={{ display: 'none' }}>
            <Button type="danger" size="large" block ghost onClick={this.closeChannel}>
              Close Channel
            </Button>
          </div>
        )}
        {channel.status === CHANNEL_STATUS.OPEN && (
          <div className="ChannelInfo-close">
            <div className="ChannelInfo-close-instructions">
              Ready to <strong>close the channel</strong>? Run this:
            </div>
            <Input
              className="ChannelInfo-close-command"
              value={closeCommand}
              readOnly
              addonAfter={
                <Copy text={closeCommand}>
                  <span>
                    <Icon type="copy" /> Copy
                  </span>
                </Copy>
              }
            />
          </div>
        )}
      </div>
    );
  }

  private getChannelDetails = (): DetailsRow[] => {
    const { channel, node, charm, account } = this.props;

    const isChannelCharmEligible =
      account != null &&
      parseInt(account.blockchainBalance, 10) >= parseInt(channel.capacity, 10) * 0.5;
    const isCharmAlreadyActive =
      charm !== null &&
      channel.channel_point === charm.point &&
      charm !== null &&
      charm.isCharmEnabled;
    const txLink = (txid: string) => (
      <a
        href={node ? makeTxUrl(txid, node.chains[0], node.testnet) : ''}
        target="_blank"
        rel="noopener nofollow"
      >
        {ellipsisSandwich(txid, 5)}
      </a>
    );

    const fundingTx = channel.channel_point.split(':')[0];
    // details shared by all channel statuses
    const details: DetailsRow[] = [
      {
        label: 'Status',
        value: channelStatusText[channel.status],
      },
      {
        label: 'CHARM',
        value: (
          <>
            {isChannelCharmEligible && !isCharmAlreadyActive ? (
              <>
                <Button ghost type="primary" onClick={this.toggleCharm}>
                  {charm != null &&
                  channel.channel_point === charm.point &&
                  charm.isCharmEnabled
                    ? 'enabled'
                    : !this.state.isCharmActive
                    ? 'disabled'
                    : 'enabled'}
                </Button>
              </>
            ) : isChannelCharmEligible && isCharmAlreadyActive ? (
              <>
                <Button type="primary" onClick={this.forceDeactivateCHARM}>
                  deactivate
                </Button>{' '}
                <Button disabled type="primary" onClick={this.toggleCharm}>
                  {charm != null &&
                  channel.channel_point === charm.point &&
                  charm.isCharmEnabled
                    ? 'enabled'
                    : !this.state.isCharmActive
                    ? 'disabled'
                    : 'enabled'}
                </Button>
              </>
            ) : (
              <></>
            )}{' '}
            <Help>
              Joule's Channel Automated Rebalancing and Liquidity Management - CHARM -
              checks your on-chain funds for at least 50% of the channel capacity for
              eligibility. Only one channel can have CHARM activated and can be identified
              by the purple progress bar.
            </Help>
          </>
        ),
      },
      {
        label: 'Capacity',
        value: <Unit value={channel.capacity} showFiat />,
      },
      {
        label: 'Local Balance',
        value: <Unit value={channel.local_balance} showFiat />,
      },
      {
        label: 'Remote Balance',
        value: <Unit value={channel.remote_balance} showFiat />,
      },
      {
        label: 'Funding Tx',
        value: txLink(fundingTx),
      },
    ];

    if (channel.status === CHANNEL_STATUS.OPEN) {
      details.push(
        {
          label: 'Total Sent',
          value: <Unit value={channel.total_satoshis_sent} showFiat />,
        },
        {
          label: 'Total Received',
          value: <Unit value={channel.total_satoshis_received} showFiat />,
        },
      );
    } else if (channel.status === CHANNEL_STATUS.CLOSING) {
      details.push({
        label: 'Closing Tx',
        value: txLink(channel.closing_txid),
      });
    } else if (channel.status === CHANNEL_STATUS.FORCE_CLOSING) {
      details.push(
        {
          label: 'Closing in',
          value: (
            <>
              <span>{channel.blocks_til_maturity} blocks</span>
              <span className="Unit-secondary">
                ~
                {moment()
                  .add(channel.blocks_til_maturity * 10, 'minutes')
                  .fromNow(true)}
              </span>
            </>
          ),
        },
        {
          label: 'Closing Tx',
          value: txLink(channel.closing_txid),
        },
      );
    }

    return details;
  };

  private closeChannel = () => {
    Modal.confirm({
      title: 'Are you sure?',
      content: `
        We'll attempt to close the channel cooperatively. If this
        fails, you will be given the option to force the
        channel closed.
      `,
      onOk: () => {
        const [fundingTxId, outputIndex] = this.props.channel.channel_point.split(':');
        this.props.closeChannel(fundingTxId, outputIndex);
      },
    });
  };

  /**
   * toggle CHARM activation for a particular channel
   */
  private toggleCharm = () => {
    const isCharmActivated = this.state.isCharmActive;
    this.setState({ isCharmActive: isCharmActivated === false ? true : false });
    deactivateCharm();
    this.callCharmControl();
  };

  /**
   * force deactivate CHARM
   */
  private forceDeactivateCHARM = () => {
    this.setState({ isCharmActive: false });
    this.props.deactivateCharm();
  };

  /**
   * Method to activate/inactivate CHARM
   */
  private callCharmControl = () => {
    /* CHARM: if the on-chain wallet is less than 50% of channel capacity, hide it
        currently only one channel can be CHARM enabled at a time
        display for CHARM eligibility requirements will show if ineligible
    */
    const { account, charm, channels, channel } = this.props;
    // initial CHARM eligibility check
    const capacityCheck = parseInt(channel.capacity, 10) * 0.5;
    const onChainFunds = account != null ? parseInt(account.blockchainBalance, 10) : 0;
    const isCharmEligible = onChainFunds >= capacityCheck ? true : false;
    const isCharmEnabled =
      charm != null && charm.point === channel.channel_point
        ? charm.isCharmEnabled
        : false;
    const control = charmControl(channels, channel, isCharmEligible);
    if (isCharmEligible && !this.state.isCharmActive) {
      this.props.activateCharm(control);
    }
    if (isCharmEligible && isCharmEnabled) {
      this.props.deactivateCharm();
    }
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    account: state.account.account,
    channels: state.channels.channels,
    node: state.node.nodeInfo,
    charm: state.loop.charm,
    in: state.loop.in,
    out: state.loop.out,
  }),
  {
    getAccountInfo,
    closeChannel,
    activateCharm,
    deactivateCharm,
  },
)(ChannelInfo);
