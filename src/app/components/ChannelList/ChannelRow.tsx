import React from 'react';
import classnames from 'classnames';
import Identicon from 'components/Identicon';
import { ChannelWithNode } from 'modules/channels/types';
import './ChannelRow.less';

interface Props {
  channel: ChannelWithNode;
  onClick?(channel: ChannelWithNode): void;
}

export default class ChannelRow extends React.Component<Props> {
  render() {
    const { channel, onClick } = this.props;
    return (
      <div
        className={classnames("ChannelRow", onClick && 'is-clickable')}
        onClick={this.handleClick}
      >
        <Identicon
          className="ChannelRow-avatar"
          pubkey={channel.remote_pubkey}
        />
        <div className="ChannelRow-info">
          <div className="ChannelRow-info-alias">
            {channel.node.alias}
          </div>
          <div className="ChannelRow-info-pubkey">
            <code>{channel.node.pub_key}</code>
          </div>
          <div className="ChannelRow-info-stuff">
            {channel.capacity}
            {' · '}
            {channel.remote_balance}
            {' · '}
            {channel.local_balance}
          </div>
        </div>
      </div>
    );
  }

  private handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.channel);
    }
  };
}