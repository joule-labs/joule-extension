import React from 'react';
import { connect } from 'react-redux';
import { Modal, Alert } from 'antd';
import QRCode from 'qrcode.react';
import Loader from 'components/Loader';
import Copy from 'components/Copy';
import { getDepositAddress } from 'modules/account/actions';
import { AppState } from 'store/reducers';
import './DepositModal.less';

interface StateProps {
  depositAddress: AppState['account']['depositAddress'];
  isFetchingDepositAddress: AppState['account']['isFetchingDepositAddress'];
  fetchDepositAddressError: AppState['account']['fetchDepositAddressError'];
  hasPassword: boolean;
  nodeInfo: AppState['node']['nodeInfo'];
}

interface DispatchProps {
  getDepositAddress: typeof getDepositAddress;
}

interface OwnProps {
  isOpen?: boolean;
  onClose(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

class DepositModal extends React.Component<Props> {
  componentWillUpdate(nextProps: Props) {
    if (!this.props.isOpen && nextProps.isOpen) {
      // Fire even if depositAddress is in store in case we need to cycle
      this.props.getDepositAddress();
    }
  }

  render() {
    const {
      depositAddress,
      fetchDepositAddressError,
      isOpen,
      onClose,
      hasPassword,
      nodeInfo,
    } = this.props;
    const isVisible = !!isOpen && !!(hasPassword || fetchDepositAddressError);

    let blockchain = "Bitcoin";
    if (nodeInfo && nodeInfo.chains[0] === 'litecoin') {
      blockchain = "Litecoin";
    }

    let content;
    if (depositAddress) {
      content = (
        <>
          <div className="DepositModal-qr">
            <QRCode value={depositAddress} size={200} />
          </div>
          <Copy text={depositAddress} name="address">
            <code className="DepositModal-address">
              {depositAddress}
            </code>
          </Copy>
        </>
      );
    } else if (fetchDepositAddressError) {
      content = (
        <Alert
          type="error"
          message="Failed to get address"
          description={fetchDepositAddressError.message}
          showIcon
        />
      );
    } else {
      // Placeholders to keep the modal the right size
      content = (
        <>
          <div style={{ opacity: 0 }}>
            <div className="DepositModal-qr">
              <QRCode value="placeholder" size={200} />
            </div>
            <code className="DepositModal-address">
              placeholder
            </code>
          </div>
          <Loader />
        </>
      );
    }

    return (
      <Modal
        title={blockchain + " Address"}
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
    depositAddress: state.account.depositAddress,
    isFetchingDepositAddress: state.account.isFetchingDepositAddress,
    fetchDepositAddressError: state.account.fetchDepositAddressError,
    hasPassword: !!state.crypto.password,
    nodeInfo: state.node.nodeInfo,
  }),
  { getDepositAddress },
)(DepositModal);