import React from 'react';
import { Tabs, Icon, Drawer } from 'antd';
import AccountInfo from 'components/AccountInfo';
import ChannelList from 'components/ChannelList';
import TransactionList from 'components/TransactionList';
import SendForm from 'components/SendForm';
import InvoiceForm from 'components/InvoiceForm';
import TransactionInfo from 'components/TransactionInfo';
// import { ChannelWithNode } from 'modules/channels/types';
import { AnyTransaction } from 'modules/account/types';
import './home.less';

interface State {
  drawerTitle: React.ReactNode | null;
  drawerContent: React.ReactNode | null;
  isDrawerOpen: boolean;
}

export default class HomePage extends React.Component<{}, State> {
  state: State = {
    drawerTitle: null,
    drawerContent: null,
    isDrawerOpen: false,
  };
  drawerTimeout: any = null;

  render() {
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
            <ChannelList /*onClick={this.handleChannelClick}*/ />
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

  // private handleChannelClick = (channel: ChannelWithNode) => {
  //   this.openDrawer(<h1>{channel.node.alias}</h1>)
  // };

  private handleTransactionClick = (tx: AnyTransaction) => {
    this.openDrawer(<TransactionInfo tx={tx} />, 'Transaction Details');
  };
}
