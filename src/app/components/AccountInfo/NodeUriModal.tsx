import React from 'react';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import { getNodeInfo } from 'modules/node/actions';
import QRCode from 'qrcode.react';
import Copy from 'components/Copy';
import { AppState } from 'store/reducers';
import './DepositModal.less';

interface StateProps {
  node: AppState['node']['nodeInfo'];
}

interface DispatchProps {
    getNodeInfo: typeof getNodeInfo;
  }

interface OwnProps {
  isOpen?: boolean;
  onClose(): void;
}

type Props = StateProps & OwnProps;

class NodeUriModal extends React.Component<Props> {

  render() {
    const {
      node,
      isOpen,
      onClose
    } = this.props;
    const text = node!.uris[0] === undefined ? node!.identity_pubkey : node!.uris[0];
    const title = node!.uris[0] === undefined ? "Pubkey" : "Node URI";
    const isVisible = !!isOpen;
      // Placeholders to keep the modal the right size
      const content = (
        <>
        <div className="DepositModal-qr">
          <QRCode value={text} size={200} />
        </div>
        <Copy text={text} name={title}>
          <code className="DepositModal-text">
            {text}
          </code>
        </Copy>
      </>
      );

    return (
      <Modal
        title={title}
        visible={isVisible}
        onCancel={onClose}
        okButtonProps={{ style: { display: 'none'} }}
        centered
      >
        <div className="DepositModal">
          {content}
        </div>
      </Modal>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    node: state.node.nodeInfo
  }),
  { getNodeInfo },
  )(NodeUriModal);