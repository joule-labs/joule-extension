import React from 'react';
import { Modal } from 'antd';
import QRCode from 'qrcode.react';
import './DepositModal.less';

interface Props {
  address: string;
  isOpen?: boolean;
  onClose(): void;
}

export default class DepositModal extends React.Component<Props> {
  render() {
    const { address, isOpen, onClose } = this.props;
    return (
      <Modal
        title="BTC Address"
        visible={isOpen}
        onCancel={onClose}
        okButtonProps={{ style: { display: 'none'} }}
        centered
      >
        <div className="DepositModal">
          <div className="DepositModal-qr">
            <QRCode value={address} size={220} />
          </div>
          <code className="DepositModal-address">
            {address}
          </code>
        </div>
      </Modal>
    );
  }
}