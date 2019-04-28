import React from 'react';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import QRCode from 'qrcode.react';
import Copy from 'components/Copy';
import { AppState } from 'store/reducers';

interface StateProps {
  node: AppState['node']['nodeInfo'];
}

interface OwnProps {
  isOpen?: boolean;
  onClose(): void;
}

type Props = StateProps & OwnProps;

class NodeUriModal extends React.Component<Props> {
  render() {
    const { node, isOpen, onClose } = this.props;
    /* Return Pubkey for private node
       Return Node URI for public node
       Return empty string when node object is null
       Catch all falsy values for node/uri
    */
    const text =
      node === null
        ? ''
        : node && node.uris && node.uris[0]
        ? node.uris[0]
        : node.identity_pubkey;
    const title =
      node === null ? '' : node && node.uris && node.uris[0] ? 'Node URI' : 'Pubkey';
    const isVisible = !!isOpen;
    // Placeholders to keep the modal the right size
    const content = (
      <>
        <div className="DepositModal-qr">
          <QRCode value={text} size={200} />
        </div>
        <Copy text={text} name={title}>
          <code className="DepositModal-text">{text}</code>
        </Copy>
      </>
    );

    return (
      <Modal
        title={title}
        visible={isVisible}
        onCancel={onClose}
        okButtonProps={{ style: { display: 'none' } }}
        centered
      >
        <div className="DepositModal">{content}</div>
      </Modal>
    );
  }
}

export default connect<StateProps, {}, OwnProps, AppState>(state => ({
  node: state.node.nodeInfo,
}))(NodeUriModal);
