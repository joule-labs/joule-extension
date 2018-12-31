import React from 'react';
import { connect } from 'react-redux';
import ChannelRow from './ChannelRow';
import Loader from 'components/Loader';
import BigMessage from 'components/BigMessage';
import { getChannels } from 'modules/channels/actions';
import { getPendingChannels } from 'modules/pending-channels/actions';
import { AppState } from 'store/reducers';
import { ChannelWithNode } from 'modules/channels/types';
import { PendingChannelWithNode } from 'modules/pending-channels/types';
import ForceClosingChannelRow from './ForceClosingChannelRow';
import WaitClosingChannelRow from './WaitClosingChannelRow';
import PendingOpenChannelRow from './PendingOpenChannelRow';

interface StateProps {
  channels: AppState['channels']['channels'];
  forceClosingChannels: AppState['pendingChannels']['forceClosingChannels'];
  waitClosingChannels: AppState['pendingChannels']['waitClosingChannels'];
  pendingOpenChannels: AppState['pendingChannels']['pendingOpenChannels'];
  isFetchingChannels: AppState['channels']['isFetchingChannels'];
  fetchChannelsError: AppState['channels']['fetchChannelsError'];
}

interface DispatchProps {
  getChannels: typeof getChannels;
  getPendingChannels: typeof getPendingChannels;
}

interface OwnProps {
  onClick?(channel: ChannelWithNode): void;
}

interface OwnProps {
  onClick?(forceClosingChannels: PendingChannelWithNode): void;
}

interface OwnProps {
  onClick?(waitClosingChannels: PendingChannelWithNode): void;
}

interface OwnProps {
  onClick?(pendingOpenChannels: PendingChannelWithNode): void;
}
type Props = StateProps & DispatchProps & OwnProps;

class ChannelList extends React.Component<Props> {
  componentWillMount() {
    if (!this.props.channels) {
      this.props.getChannels();
      this.props.getPendingChannels();
    }
  }

  render() {
    const { channels, forceClosingChannels, waitClosingChannels, pendingOpenChannels,
      isFetchingChannels, fetchChannelsError, onClick } = this.props;

    let content;
    let pfcContent;
    let pwcContent;
    let pocContent;
    if (isFetchingChannels) {
      content = <Loader />;
    } else if (channels && channels.length) {
      content = channels.map(c => (
        <ChannelRow key={c.chan_id} status={c.active===true?"active":"inactive"} 
        pubkey={c.node.pub_key} channel={c} onClick={onClick} />
      ));
    } if (forceClosingChannels && forceClosingChannels.length>0) {
      pfcContent = forceClosingChannels.map(c => (
        <ForceClosingChannelRow key={c.closing_txid} 
        status="closing" pubkey={c.channel.remote_node_pub} forceClosingChannel={c} onClick={onClick} />
      ));
    }
      if (waitClosingChannels && waitClosingChannels.length>0) {
        pwcContent = waitClosingChannels.map(c => (
          <WaitClosingChannelRow key={c.channel.channel_point} 
          status="closing" pubkey={c.channel.remote_node_pub} waitClosingChannel={c} onClick={onClick} />
        ));
      } if (pendingOpenChannels && pendingOpenChannels.length>0) {
          pocContent = pendingOpenChannels.map(c => (
            <PendingOpenChannelRow key={c.channel.channel_point} 
            status="opening" pubkey={c.channel.remote_node_pub} pendingOpenChannel={c} onClick={onClick} />
          ));
    } else if (fetchChannelsError) {
      content = (
        <BigMessage
          type="error"
          title="Failed to fetch channels"
          message={fetchChannelsError.message}
          button={{
            children: 'Try again',
            icon: 'reload',
            onClick: () => this.props.getChannels(),
          }}
        />
      );
    } else {
      content = (
        <BigMessage
          title="You have no open channels"
          message="Once you start opening channels, you’ll be able to view and manage them here"
        />
      );
    }
    if (forceClosingChannels && forceClosingChannels.length) {
      pfcContent = forceClosingChannels.map(c => (
        <ForceClosingChannelRow key={c.closing_txid}
        status="closing" pubkey={c.channel.remote_node_pub} forceClosingChannel={c} onClick={onClick} />
      ));
    }
    if (waitClosingChannels && waitClosingChannels.length) {
        pwcContent = waitClosingChannels.map(c => (
          <WaitClosingChannelRow key={c.channel.channel_point}
          status="closing" pubkey={c.channel.remote_node_pub} waitClosingChannel={c} onClick={onClick} />
        ));
      }
      if (pendingOpenChannels && pendingOpenChannels.length) {
        pocContent = pendingOpenChannels.map(c => (
          <PendingOpenChannelRow key={c.channel.channel_point} 
          status="opening" pubkey={c.channel.remote_node_pub} pendingOpenChannel={c} onClick={onClick} />
        ));
      }

    return (
      <div className="ChannelList">
        {pfcContent}
        {pwcContent}
        {pocContent}
        {content}
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    channels: state.channels.channels,
    forceClosingChannels: state.pendingChannels.forceClosingChannels,
    waitClosingChannels: state.pendingChannels.waitClosingChannels,
    pendingOpenChannels: state.pendingChannels.pendingOpenChannels,
    isFetchingChannels: state.channels.isFetchingChannels,
    fetchChannelsError: state.channels.fetchChannelsError,
  }),
  {
    getChannels, getPendingChannels
  },
)(ChannelList);