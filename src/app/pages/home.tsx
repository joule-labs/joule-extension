import React from 'react';
import { connect } from 'react-redux';
import { Tabs, Icon, Drawer, message } from 'antd';
import AccountInfo from 'components/AccountInfo';
import ChannelList from 'components/ChannelList';
import TransactionList from 'components/TransactionList';
import SwapList from 'components/SwapList';
import SendForm from 'components/SendForm';
import InvoiceForm from 'components/InvoiceForm';
import TransactionInfo from 'components/TransactionInfo';
import SwapInfo from 'components/SwapInfo';
import ConnectionFailureModal from 'components/ConnectionFailureModal';
import { AppState } from 'store/reducers';
import ChannelInfo from 'components/ChannelInfo';
import { ChannelWithNode } from 'modules/channels/types';
import { AnyTransaction } from 'modules/account/types';
import { getAccountInfo } from 'modules/account/actions';
import { getChannels } from 'modules/channels/actions';
import './home.less';
import { SwapResponse } from 'lib/loop-http';
import {
  getLoopOutTerms,
  getLoopInTerms,
  loopIn,
  loopOut,
  activateCharm,
  deactivateCharm,
} from 'modules/loop/actions';
import {
  processCharm,
  preprocessCharmEligibility,
  EligibilityPreProcessor,
} from 'utils/charm';

interface StateProps {
  nodeUrl: AppState['node']['url'];
  account: AppState['account']['account'];
  channels: AppState['channels']['channels'];
  out: AppState['loop']['out'];
  in: AppState['loop']['in'];
  charm: AppState['loop']['charm'];
  fetchAccountInfoError: AppState['account']['fetchAccountInfoError'];
}

interface DispatchProps {
  getAccountInfo: typeof getAccountInfo;
  getChannels: typeof getChannels;
  getLoopOutTerms: typeof getLoopOutTerms;
  getLoopInTerms: typeof getLoopInTerms;
  loopIn: typeof loopIn;
  loopOut: typeof loopOut;
  activateCharm: typeof activateCharm;
  deactivateCharm: typeof deactivateCharm;
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

  componentDidMount() {
    // refresh the looping terms
    // tslint:disable-next-line: no-shadowed-variable
    const { getLoopInTerms, getLoopOutTerms } = this.props;
    getLoopOutTerms();
    getLoopInTerms();
    // initialize CHARM
    this.initializeCharm();
  }

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
            tab={
              <>
                <Icon type="fork" /> Channels
              </>
            }
            key="channels"
          >
            <ChannelList onClick={this.handleChannelClick} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <>
                <Icon type="shopping" /> Transactions
              </>
            }
            key="transactions"
          >
            <TransactionList onClick={this.handleTransactionClick} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <>
                <Icon type="monitor" /> Swaps
              </>
            }
            key="swaps"
          >
            <SwapList onClick={this.handleSwapsClick} />
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

        {fetchAccountInfoError && (
          <ConnectionFailureModal
            nodeUrl={nodeUrl}
            error={fetchAccountInfoError}
            onRetry={this.retryConnection}
          />
        )}
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
    this.openDrawer(
      <ChannelInfo channel={channel} close={this.closeDrawer} />,
      'Channel Details',
    );
  };

  private handleTransactionClick = (tx: AnyTransaction) => {
    this.openDrawer(<TransactionInfo tx={tx} />, 'Transaction Details');
  };

  private handleSwapsClick = (swap: SwapResponse) => {
    this.openDrawer(<SwapInfo swap={swap} />, 'Loop There It Is');
  };

  private retryConnection = () => {
    this.props.getAccountInfo();
    this.props.getChannels();
  };

  /** Start CHARM Logic */

  /**
   * Run the processor for CHARM
   */
  private initializeCharm = () => {
    setTimeout(() => {
      // temporary handling for waiting for account info to load
      const { account, channels, charm } = this.props;
      // run the eligibility check
      const preprocess = preprocessCharmEligibility(account, channels, charm);
      const isEligible =
        parseInt(preprocess.balance, 10) >= parseInt(preprocess.capacity, 10) * 0.5;
      if (isEligible) {
        this.charmProcessor(preprocess);
      }
      if (!isEligible) {
        message.warn(`CHARM is disabled due to lack of on-chain funds`);
        this.props.deactivateCharm();
      }
    }, 5000);
  };

  /**
   * Process eligibility for automated looping
   */
  private charmProcessor = (preprocess: EligibilityPreProcessor) => {
    const { charm } = this.props;
    // run  the CHARM algorithm
    const charmData = processCharm(preprocess.capacity, preprocess.balance);
    if (charmData.amt > 0 && charm !== null) {
      this.charmLoop(charmData.amt.toString(), charm.id, charmData.type);
    }
  };

  private charmLoop = (amount: string, channelId: string, type: string) => {
    console.log(`debug amt: ${amount} channelId: ${channelId}`);
    message.info(`CHARM is attempting ${type} to re-balance`);
  };

  /** End CHARM Logic */
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    nodeUrl: state.node.url,
    account: state.account.account,
    channels: state.channels.channels,
    charm: state.loop.charm,
    out: state.loop.out,
    in: state.loop.in,
    fetchAccountInfoError: state.account.fetchAccountInfoError,
  }),
  {
    getAccountInfo,
    getChannels,
    getLoopOutTerms,
    getLoopInTerms,
    loopOut,
    loopIn,
    activateCharm,
    deactivateCharm,
  },
)(HomePage);
