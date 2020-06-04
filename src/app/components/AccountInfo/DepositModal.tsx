import React from 'react';
import { connect } from 'react-redux';
import { Modal, Alert } from 'antd';
import QRCode from 'qrcode.react';
import Loader from 'components/Loader';
import Copy from 'components/Copy';
import { getDepositAddress } from 'modules/account/actions';
import { getNodeChain } from 'modules/node/selectors';
import { coinSymbols, depositAddressType } from 'utils/constants';
import { AppState } from 'store/reducers';
import './DepositModal.less';

interface StateProps {
  depositAddress: AppState['account']['depositAddress'];
  isFetchingDepositAddress: AppState['account']['isFetchingDepositAddress'];
  fetchDepositAddressError: AppState['account']['fetchDepositAddressError'];
  chain: ReturnType<typeof getNodeChain>;
  hasPassword: boolean;
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
    const { chain } = this.props;
    if (!this.props.isOpen && nextProps.isOpen) {
      // Fire even if depositAddress is in store in case we need to cycle
      this.props.getDepositAddress({
        type: depositAddressType[chain],
      });
    }
  }

  render() {
    const {
      depositAddress,
      fetchDepositAddressError,
      isOpen,
      onClose,
      hasPassword,
      chain,
    } = this.props;
    const isVisible = !!isOpen && !!(hasPassword || fetchDepositAddressError);

    let content;
    if (depositAddress) {
      content = (
        <>
          <div className="DepositModal-qr">
            <QRCode value={depositAddress} size={200} />
          </div>
          <Copy text={depositAddress} name="address">
            <code className="DepositModal-address">{depositAddress}</code>
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
            <code className="DepositModal-address">placeholder</code>
          </div>
          <Loader />
        </>
      );
    }

    return (
      <Modal
        title={coinSymbols[chain] + ' Address'}
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

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  (state) => ({
    depositAddress: state.account.depositAddress,
    isFetchingDepositAddress: state.account.isFetchingDepositAddress,
    fetchDepositAddressError: state.account.fetchDepositAddressError,
    hasPassword: !!state.crypto.password,
    chain: getNodeChain(state),
  }),
  { getDepositAddress },
)(DepositModal);
