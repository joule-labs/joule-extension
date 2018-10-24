import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import Identicon from 'components/Identicon';
import { getAccountInfo } from 'modules/account/actions';
import { AppState } from 'store/reducers';
import './style.less';

interface StateProps {
  account: AppState['account']['account'];
}

interface DispatchProps {
  getAccountInfo: typeof getAccountInfo;
}

type Props = DispatchProps & StateProps;

class AccountInfo extends React.Component<Props> {
  componentDidMount() { 
    if (!this.props.account) {
      this.props.getAccountInfo();
    }
  }

  render() {
    const { account } = this.props;
    const actions = [{
      text: 'Deposit',
      icon: 'qrcode',
    }, {
      text: 'Invoice',
      icon: 'file-text',
    }, {
      text: 'Send',
      icon: 'thunderbolt',
      type: 'primary',
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
                {account.channelBalance} sats
              </div>
              <div className="AccountInfo-top-info-balances">
                <span>Bitcoin: {account.blockchainBalance} sats</span>
                <span>Channels: {account.channelBalance} sats</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="AccountInfo-top is-loading">
            <div className="AccountInfo-top-avatar" />
          </div>
        )}

        <div className="AccountInfo-actions">
          {actions.map(({ text, ...props }) => (
            <Button key={text} disabled={!account} {...props}>
              {text}
            </Button>
          ))}
        </div>
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    account: state.account.account,
  }),
  {
    getAccountInfo,
  },
)(AccountInfo);