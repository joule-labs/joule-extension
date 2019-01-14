import React from 'react';
import { connect } from 'react-redux';
import ChannelRow from './ChannelRow';
import Loader from 'components/Loader';
import BigMessage from 'components/BigMessage';
import { getChannels } from 'modules/channels/actions';
import { AppState } from 'store/reducers';
import { ChannelWithNode } from 'modules/channels/types';


interface StateProps {
  channels: AppState['channels']['channels'];
  isFetchingChannels: AppState['channels']['isFetchingChannels'];
  fetchChannelsError: AppState['channels']['fetchChannelsError'];
}

interface DispatchProps {
  getChannels: typeof getChannels;
}
interface OwnProps {
  onClick?(channel: ChannelWithNode): void;
}

type Props = StateProps & DispatchProps & OwnProps;

class ChannelList extends React.Component<Props> {
  componentWillMount() {
    if (!this.props.channels) {
      this.props.getChannels();
    }
  }

  render() {
    const { channels,
      isFetchingChannels, fetchChannelsError, onClick } = this.props;

    let content;
    if (isFetchingChannels) {
      content = <Loader />;
    } else if (channels && channels.length) {
      content = channels.map((c,i) => (
        <ChannelRow key={i}
        status={
          c.blocks_til_maturity ? "closing" :
          c.confirmation_height === 0 ? "opening" :
          c.active===true ? "active" :
          c.active===false ? "inactive" :
          "closing"
        }
        pubkey={
          c.node.pub_key === undefined
          ? c.remote_node_pub :
          c.node.pub_key
        }
        channel={c}
        onClick={onClick} />
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
    return (
      <div className="ChannelList">
        {content}
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    channels: state.channels.channels,
    isFetchingChannels: state.channels.isFetchingChannels,
    fetchChannelsError: state.channels.fetchChannelsError,
  }),
  {
    getChannels,
  },
)(ChannelList);