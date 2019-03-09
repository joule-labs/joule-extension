import React from 'react';
import { connect } from 'react-redux';
import { Tabs, Icon, Drawer } from 'antd';
import AccountInfo from 'components/AccountInfo';
import ChannelList from 'components/ChannelList';
import TransactionList from 'components/TransactionList';
import SendForm from 'components/SendForm';
import InvoiceForm from 'components/InvoiceForm';
import TransactionInfo from 'components/TransactionInfo';
import ConnectionFailureModal from 'components/ConnectionFailureModal';
import { AppState } from 'store/reducers';
import ChannelInfo from 'components/ChannelInfo';
import { ChannelWithNode } from 'modules/channels/types';
import { AnyTransaction } from 'modules/account/types';
import { getAccountInfo } from 'modules/account/actions';
import { getChannels } from 'modules/channels/actions';
import './home.less';


interface StateProps {
  nodeUrl: AppState['node']['url'];
  fetchAccountInfoError: AppState['account']['fetchAccountInfoError'];
}

interface DispatchProps {
  getAccountInfo: typeof getAccountInfo;
  getChannels: typeof getChannels;
}

type Props = DispatchProps & StateProps;

interface State {
  drawerTitle: React.ReactNode | null;
  drawerContent: React.ReactNode | null;
  isDrawerOpen: boolean;
}

class HomePage extends React.Component<Props, State> {
  state: State = {
    drawerTitle: null,
    drawerContent: null,
    isDrawerOpen: false,
  };
  drawerTimeout: any = null;

  render() {
    const { nodeUrl, fetchAccountInfoError } = this.props;
    const { drawerContent, drawerTitle, isDrawerOpen } = this.state;

    return (
      <div className="Home">
        <AccountInfo
          onSendClick={this.openSendForm}
          onInvoiceClick={this.openInvoiceForm}
        />
        <Tabs defaultActiveKey="channels">
          <Tabs.TabPane
            tab={<><Icon type="fork"/> Channels</>}
            key="channels"
          >
            <ChannelList onClick={this.handleChannelClick} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={<><Icon type="shopping"/> Transactions</>}
            key="transactions"
          >
            <TransactionList onClick={this.handleTransactionClick} />
          </Tabs.TabPane>
        </Tabs>

        <Drawer
          visible={isDrawerOpen}
          placement="right"
          onClose={this.closeDrawer}
          width="92%"
          title={drawerTitle}
        >
          {drawerContent}
        </Drawer>

        {fetchAccountInfoError && 
          <ConnectionFailureModal
            nodeUrl={nodeUrl}
            error={fetchAccountInfoError}
            onRetry={this.retryConnection}
          />
        }
      </div>
    );
  }

  private openDrawer = (
    drawerContent?: React.ReactNode,
    drawerTitle: React.ReactNode | null = null,
  ) => {
    clearTimeout(this.drawerTimeout);
    this.setState({
      drawerTitle,
      drawerContent,
      isDrawerOpen: true,
    });
  };

  private closeDrawer = () => {
    this.setState({ isDrawerOpen: false }, () => {
      this.drawerTimeout = setTimeout(() => {
        this.setState({
          drawerTitle: null,
          drawerContent: null,
        });
      }, 300);
    });
  };

  private openSendForm = () => {
    this.openDrawer(<SendForm close={this.closeDrawer} />, 'Send Payment');
  };

  private openInvoiceForm = () => {
    this.openDrawer(<InvoiceForm close={this.closeDrawer} />, 'Create Invoice');
  };

  private handleChannelClick = (channel: ChannelWithNode) => {
    this.openDrawer(<ChannelInfo channel={channel} close={this.closeDrawer} />, 'Channel Details');
  };

  private handleTransactionClick = (tx: AnyTransaction) => {
    this.openDrawer(<TransactionInfo tx={tx} />, 'Transaction Details');
  };

  private retryConnection = () => {
    this.props.getAccountInfo();
    this.props.getChannels();
  }
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    nodeUrl: state.node.url,
    fetchAccountInfoError: state.account.fetchAccountInfoError,
  }),
  {
    getAccountInfo,
    getChannels,
  },
)(HomePage);