import React from 'react';
import { connect } from 'react-redux';
import { Button, Icon } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import DepositModal from './DepositModal';
import { getAccountInfo } from 'modules/account/actions';
import { AppState } from 'store/reducers';
import './style.less';
import { getNodeChain } from 'modules/node/selectors';
import { blockchainDisplayName, CHAIN_TYPE } from 'utils/constants';

interface StateProps {
  account: AppState['account']['account'];
}

interface DispatchProps {
  getAccountInfo: typeof getAccountInfo;
}

interface OwnProps {
  chain: CHAIN_TYPE;
  onSendClick(): void;
  onInvoiceClick(): void;
}

type Props = DispatchProps & StateProps & OwnProps;

interface State {
  isDepositModalOpen: boolean;
}

class AccountInfo extends React.Component<Props, State> {
  state: State = {
    isDepositModalOpen: false,
  };

  componentDidMount() { 
    if (!this.props.account) {
      this.props.getAccountInfo();
    }
  }

  render() {
    const { account, chain } = this.props;
    const { isDepositModalOpen } = this.state;

    const actions: ButtonProps[] = [{
      children: 'Deposit',
      icon: 'qrcode',
      onClick: this.openDepositModal,
    }, {
      children: 'Invoice',
      icon: 'file-text',
      onClick: this.props.onInvoiceClick,
    }, {
      children: <><Icon type="thunderbolt" theme="filled"/> Send</>,
      type: 'primary' as any,
      onClick: this.props.onSendClick,
    }];
    
    return (
      <div className="AccountInfo">
        {account ? (
          <div className="AccountInfo-top">
            <Identicon
              pubkey={account.pubKey}
              className="AccountInfo-top-avatar"
            />
            <div className="AccountInfo-top-info">
              <div className="AccountInfo-top-info-alias">{account.alias}</div>
              <div className="AccountInfo-top-info-balance">
                <Unit value={account.totalBalance} chain={chain} showFiat />
              </div>
              <div className="AccountInfo-top-info-balances">
                <span>Channels: <Unit value={account.channelBalance} chain={chain} /></span>
                <span>{blockchainDisplayName[chain]}: <Unit value={account.blockchainBalance} chain={chain} /></span>
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

        {account &&
          <DepositModal
            chain={chain}
            isOpen={isDepositModalOpen}
            onClose={this.closeDepositModal}
          />
        }
      </div>
    );
  }

  private openDepositModal = () => this.setState({ isDepositModalOpen: true });
  private closeDepositModal = () => this.setState({ isDepositModalOpen: false });
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    account: state.account.account,
    chain: getNodeChain(state),
  }),
  {
    getAccountInfo,
  },
)(AccountInfo);