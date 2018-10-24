import React from 'react';
import { connect } from 'react-redux';
import ChannelRow from './ChannelRow';
import Loader from 'components/Loader';
import BigMessage from 'components/BigMessage';
import { getChannels } from 'modules/channels/actions';
import { AppState } from 'store/reducers';

interface StateProps {
  channels: AppState['channels']['channels'];
  isFetchingChannels: AppState['channels']['isFetchingChannels'];
  fetchChannelsError: AppState['channels']['fetchChannelsError'];
}

interface DispatchProps {
  getChannels: typeof getChannels;
}

type Props = StateProps & DispatchProps;

class ChannelList extends React.Component<Props> {
  componentWillMount() {
    if (!this.props.channels) {
      this.props.getChannels();
    }
  }

  render() {
    const { channels, isFetchingChannels, fetchChannelsError } = this.props;

    let content;
    if (isFetchingChannels) {
      content = <Loader />;
    } else if (channels && channels.length) {
      content = channels.map(c => (
        <ChannelRow key={c.chan_id} channel={c} />
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

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    channels: state.channels.channels,
    isFetchingChannels: state.channels.isFetchingChannels,
    fetchChannelsError: state.channels.fetchChannelsError,
  }),
  {
    getChannels,
  },
)(ChannelList);