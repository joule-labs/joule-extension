import React from 'react';
import { connect } from 'react-redux';
import ChannelRow from './ChannelRow';
import Loader from 'components/Loader';
import BigMessage from 'components/BigMessage';
import { getChannels } from 'modules/channels/actions';
import { AppState } from 'store/reducers';
import { ChannelWithNode } from 'modules/channels/types';
import OpenChannelModal from 'components/OpenChannelModal';

interface StateProps {
  channels: AppState['channels']['channels'];
  charm: AppState['loop']['charm'];
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

interface State {
  isChannelModalOpen: boolean;
}

class ChannelList extends React.Component<Props, State> {
  state: State = {
    isChannelModalOpen: false,
  };

  componentWillMount() {
    if (!this.props.channels) {
      this.props.getChannels();
    }
  }

  render() {
    const {
      channels,
      isFetchingChannels,
      fetchChannelsError,
      onClick,
      charm,
    } = this.props;
    const { isChannelModalOpen } = this.state;

    let content;
    if (isFetchingChannels) {
      content = <Loader />;
    } else if (channels && channels.length) {
      content = channels.map((c, i) => (
        <ChannelRow
          key={i}
          channel={c}
          charm={charm != null && charm.point === c.channel_point ? true : false}
          onClick={onClick}
        />
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
        <div>
          <BigMessage
            title="You have no open channels"
            message="Once you start opening channels, you’ll be able to view and manage them here"
            button={{
              children: 'Open channel',
              icon: 'fork',
              onClick: () => this.openChannelModal(),
            }}
          />
          <OpenChannelModal
            isVisible={isChannelModalOpen}
            handleClose={this.closeChannelModal}
          />
        </div>
      );
    }
    return <div className="ChannelList">{content}</div>;
  }

  private openChannelModal = () => this.setState({ isChannelModalOpen: true });
  private closeChannelModal = () => this.setState({ isChannelModalOpen: false });
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    channels: state.channels.channels,
    charm: state.loop.charm,
    isFetchingChannels: state.channels.isFetchingChannels,
    fetchChannelsError: state.channels.fetchChannelsError,
  }),
  {
    getChannels,
  },
)(ChannelList);
