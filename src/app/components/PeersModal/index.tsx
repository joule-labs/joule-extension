import React from 'react';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import Loader from 'components/Loader';
import Identicon from 'components/Identicon';
import { getPeers } from 'modules/peers/actions';
import { AppState } from 'store/reducers';
import './index.less';
import { channel } from 'redux-saga';

interface StateProps {
  peers: AppState['peers']['peers'];
  fetchPeersError: AppState['peers']['fetchPeersError'];
}

interface ActionProps {
  getPeers: typeof getPeers;
}

interface OwnProps {
  isVisible: boolean;
  handleClose(): void;
}

type Props = StateProps & ActionProps & OwnProps;

class PeersModal extends React.Component<Props> {
  componentWillUpdate(nextProps: Props) {
    if (nextProps.isVisible && !this.props.isVisible) {
      this.props.getPeers();
    }
  }

  render() {
    const { peers, fetchPeersError, isVisible, handleClose } = this.props;

    let content;
    if (peers) {
      content = peers.map(p => (
        <div key={p.pub_key} className="PeersModal-peer">
          <Identicon
            className="PeersModal-peer-avatar"
            pubkey={p.pub_key}
          />
          <div className="PeersModal-peer-info">
            <div className="PeersModal-peer-info-alias">
              {p.node.alias}
            </div>
            <div className="PeersModal-peer-info-address">
              <code>{p.address}</code>
            </div>
          </div>
        </div>
      ));
    } else if (fetchPeersError) {
      content = fetchPeersError.message;
    } else {
      content = <Loader />;
    }

    return (
      <Modal
        title="Network Peers"
        visible={isVisible}
        onCancel={handleClose}
        className="PeersModal"
        centered
      >
        {content}
      </Modal>
    )
  }
}

export default connect<StateProps, ActionProps, OwnProps, AppState>(
  state => ({
    peers: state.peers.peers,
    fetchPeersError: state.peers.fetchPeersError,
  }),
  { getPeers },
)(PeersModal);
