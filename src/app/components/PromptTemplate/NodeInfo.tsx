import React from 'react';
import classnames from 'classnames';
import Identicon from 'components/Identicon';

import './NodeInfo.less';

interface Props {
  pubkey: string;
  alias: string;
  className?: string;
}

export default class NodeInfo extends React.Component<Props> {
  render() {
    const { pubkey, alias } = this.props;

    return (
      <>
        <div className={classnames('NodeInfo', this.props.className)}>
          <Identicon pubkey={pubkey || ''} className="NodeInfo-avatar" />
          <div className="NodeInfo-info">
            <div className="NodeInfo-info-alias">{alias}</div>
            <code className="NodeInfo-info-pubkey">
              {pubkey.slice(0, pubkey.length / 2)}
              <br />
              {pubkey.slice(pubkey.length / 2)}
            </code>
          </div>
        </div>
      </>
    );
  }
}
