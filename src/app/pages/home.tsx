import React from 'react';
import { Tabs, Icon } from 'antd';
import AccountInfo from 'components/AccountInfo';
import ChannelList from 'components/ChannelList';
import TransactionList from 'components/TransactionList';
import './home.less';

export default class HomePage extends React.Component {
  render() {
    return (
      <div className="Home">
        <AccountInfo />
        <Tabs defaultActiveKey="channels">
          <Tabs.TabPane
            tab={<><Icon type="fork"/> Channels</>}
            key="channels"
          >
            <ChannelList />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={<><Icon type="shopping"/> Transactions</>}
            key="transactions"
          >
            <TransactionList />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}
