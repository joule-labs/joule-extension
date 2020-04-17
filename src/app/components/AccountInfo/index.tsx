import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Icon, Tooltip } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import BN from 'bn.js';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import DepositModal from './DepositModal';
import NodeUriModal from './NodeUriModal';
import NodeWarning from './NodeWarning';
import { getAccountInfo } from 'modules/account/actions';
import { getNodeChain } from 'modules/node/selectors';
import { blockchainDisplayName } from 'utils/constants';
import { AppState } from 'store/reducers';
import './style.less';

interface StateProps {
  account: AppState['account']['account'];
  chain: ReturnType<typeof getNodeChain>;
}

interface DispatchProps {
  getAccountInfo: typeof getAccountInfo;
}

interface OwnProps {
  onSendClick(): void;
  onInvoiceClick(): void;
}

type Props = DispatchProps & StateProps & OwnProps;

interface State {
  isDepositModalOpen: boolean;
  isNodeUriModalOpen: boolean;
}

class AccountInfo extends React.Component<Props, State> {
  state: State = {
    isDepositModalOpen: false,
    isNodeUriModalOpen: false,
  };

  componentDidMount() {
    if (!this.props.account) {
      this.props.getAccountInfo();
    }
  }

  render() {
    const { account, chain } = this.props;
    const { isDepositModalOpen, isNodeUriModalOpen } = this.state;
    const actions: ButtonProps[] = [
      {
        children: 'Deposit',
        icon: 'qrcode',
        onClick: this.openDepositModal,
      },
      {
        children: 'Invoice',
        icon: 'file-text',
        onClick: this.props.onInvoiceClick,
      },
      {
        children: (
          <>
            <Icon type="thunderbolt" theme="filled" /> Send
          </>
        ),
        type: 'primary' as any,
        onClick: this.props.onSendClick,
      },
    ];

    let showPending = false;
    let balanceDiff = '0';
    if (account) {
      const diff = new BN(account.totalBalancePending).sub(new BN(account.totalBalance));
      if (!diff.isZero()) {
        showPending = true;
        balanceDiff = diff.toString();
      }
    }

    return (
      <div className="AccountInfo">
        {account ? (
          <div className="AccountInfo-top">
            <Identicon
              pubkey={account.pubKey}
              className="AccountInfo-top-avatar"
              onClick={this.openNodeUriModal}
            />
            <div className="AccountInfo-top-info">
              <div className="AccountInfo-top-info-alias">{account.alias}</div>
              <div className="AccountInfo-top-info-balance">
                <Unit value={account.totalBalancePending} showFiat />
                {showPending && (
                  <Tooltip
                    title={
                      <>
                        <Unit value={balanceDiff} /> pending
                      </>
                    }
                  >
                    <Link to="/balances">
                      <Icon
                        className="AccountInfo-top-info-balance-pending"
                        type="clock-circle"
                      />
                    </Link>
                  </Tooltip>
                )}
              </div>
              <div className="AccountInfo-top-info-balances">
                <span>
                  Channels: <Unit value={account.channelBalance} />
                </span>
                <span>
                  {blockchainDisplayName[chain]}:{' '}
                  <Unit value={account.blockchainBalance} />
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="AccountInfo-top is-loading">
            <div className="AccountInfo-top-avatar" />
          </div>
        )}

        <div className="AccountInfo-actions">
          {actions.map((props, idx) => (
            <Button key={idx} disabled={!account} {...props} />
          ))}
        </div>

        <NodeWarning />

        {account && (
          <DepositModal isOpen={isDepositModalOpen} onClose={this.closeDepositModal} />
        )}

        {account && (
          <NodeUriModal isOpen={isNodeUriModalOpen} onClose={this.closeNodeUriModal} />
        )}
      </div>
    );
  }

  private openDepositModal = () => this.setState({ isDepositModalOpen: true });
  private closeDepositModal = () => this.setState({ isDepositModalOpen: false });
  // Get Node URI or Pubkey with QR Code
  private openNodeUriModal = () => this.setState({ isNodeUriModalOpen: true });
  private closeNodeUriModal = () => this.setState({ isNodeUriModalOpen: false });
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    account: state.account.account,
    chain: getNodeChain(state),
  }),
  { getAccountInfo },
)(AccountInfo);
