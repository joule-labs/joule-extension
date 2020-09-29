import React from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Input, Button, message } from 'antd';
import Loader from 'components/Loader';
import Identicon from 'components/Identicon';
import { isValidConnectAddress } from 'utils/validators';
import { getPeers, addPeer } from 'modules/peers/actions';
import { AppState } from 'store/reducers';
import './index.less';
import { PeerWithNode } from 'modules/peers/types';

interface StateProps {
  peers: AppState['peers']['peers'];
  fetchPeersError: AppState['peers']['fetchPeersError'];
  addPeerError: AppState['peers']['addPeerError'];
}

interface ActionProps {
  getPeers: typeof getPeers;
  addPeer: typeof addPeer;
}

interface OwnProps {
  isVisible: boolean;
  handleClose(): void;
}

type Props = StateProps & ActionProps & OwnProps;

interface State {
  address: string;
  isAddingPeer: boolean;
}

class PeersModal extends React.Component<Props, State> {
  state: State = {
    address: '',
    isAddingPeer: false,
  };

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (nextProps.isVisible && !this.props.isVisible) {
      this.resetForm();
      this.props.getPeers();
    }

    if (nextState.isAddingPeer) {
      if (nextProps.addPeerError) {
        message.error(nextProps.addPeerError.message, 2);
        console.error('Failed to add peer:', nextProps.addPeerError);
        this.setState({ isAddingPeer: false });
      } else if (nextProps.peers !== this.props.peers) {
        message.success('Successfully connected to peer!', 2);
        this.resetForm();
      }
    }
  }

  render() {
    const { peers, fetchPeersError, isVisible, handleClose } = this.props;
    const { address, isAddingPeer } = this.state;
    const validity = address
      ? isValidConnectAddress(address.trim())
        ? 'success'
        : 'error'
      : undefined;

    let content;
    if (peers) {
      content = (
        <>
          <div className="PeersModal-peers">
            {peers.map(p => (
              <PeerRow key={p.pub_key} {...p} />
            ))}
          </div>
          <Form
            className="PeersModal-form"
            layout="inline"
            onSubmit={this.handlePeerSubmit}
          >
            <Form.Item validateStatus={validity} className="PeersModal-form-address">
              <Input
                value={address}
                placeholder="Add a peer, e.g. <pubkey>@host"
                onChange={this.handleAddressChange}
                disabled={isAddingPeer}
                autoFocus
              />
            </Form.Item>
            <Button
              className="PeersModal-form-button"
              type="primary"
              htmlType="submit"
              icon={isAddingPeer ? 'loading' : 'plus'}
              disabled={isAddingPeer}
            />
          </Form>
        </>
      );
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
        footer={''}
        centered
      >
        {content}
      </Modal>
    );
  }

  private handleAddressChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ address: ev.currentTarget.value });
  };

  private handlePeerSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const address = this.state.address.trim();
    if (isValidConnectAddress(address)) {
      this.setState({ isAddingPeer: true }, () => {
        this.props.addPeer(address);
      });
    }
  };

  private resetForm() {
    this.setState({
      isAddingPeer: false,
      address: '',
    });
  }
}

export default connect<StateProps, ActionProps, OwnProps, AppState>(
  state => ({
    peers: state.peers.peers,
    fetchPeersError: state.peers.fetchPeersError,
    addPeerError: state.peers.addPeerError,
  }),
  {
    getPeers,
    addPeer,
  },
)(PeersModal);

const PeerRow: React.SFC<PeerWithNode> = p => (
  <div key={p.pub_key} className="PeerRow">
    <Identicon className="PeerRow-avatar" pubkey={p.pub_key} />
    <div className="PeerRow-info">
      <div className="PeerRow-info-alias">{p.node.alias}</div>
      <div className="PeerRow-info-address">
        <code>{p.address}</code>
      </div>
    </div>
  </div>
);
