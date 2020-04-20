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
  loopIn,
  loopOut,
  activateCharm,
  deactivateCharm,
  getLoopOutQuote,
  getLoopInQuote,
  listSwaps,
} from 'modules/loop/actions';
import {
  processCharm,
  preprocessCharmEligibility,
  EligibilityPreProcessor,
  isSwapInitiated,
} from 'utils/charm';
import { LOOP_TYPE } from 'utils/constants';

interface StateProps {
  nodeUrl: AppState['node']['url'];
  account: AppState['account']['account'];
  channels: AppState['channels']['channels'];
  out: AppState['loop']['out'];
  in: AppState['loop']['in'];
  swapInfo: AppState['loop']['swapInfo'];
  charm: AppState['loop']['charm'];
  fetchAccountInfoError: AppState['account']['fetchAccountInfoError'];
}

interface DispatchProps {
  getAccountInfo: typeof getAccountInfo;
  getChannels: typeof getChannels;
  getLoopOutQuote: typeof getLoopOutQuote;
  getLoopInQuote: typeof getLoopInQuote;
  loopIn: typeof loopIn;
  loopOut: typeof loopOut;
  listSwaps: typeof listSwaps;
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
    // list the swaps so we check if any are in progress
    this.props.listSwaps();
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
      const swapCheck = isSwapInitiated(this.props.swapInfo);
      // temporary handling for waiting for account info to load
      const { account, channels, charm } = this.props;
      // run the eligibility check
      const preprocess = preprocessCharmEligibility(account, channels, charm);
      const isEligible =
        parseInt(preprocess.balance, 10) >= parseInt(preprocess.capacity, 10) * 0.5;
      if (isEligible && !swapCheck.isInitiated) {
        this.charmProcessor(preprocess);
      }
      if (!isEligible) {
        message.warn(`CHARM is disabled due failed eligibility check`);
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
    const charmData = processCharm(
      preprocess.capacity,
      preprocess.balance,
      preprocess.localBalance,
    );
    if (charmData.amt > 0 && charm !== null) {
      // generate a quote first
      if (charmData.type === LOOP_TYPE.LOOP_IN) {
        this.props.getLoopInQuote(charmData.amt);
      }
      if (charmData.type === LOOP_TYPE.LOOP_OUT) {
        this.props.getLoopOutQuote(charmData.amt);
      }
      this.charmLoop(charmData.amt.toString(), charm.id, charmData.type);
    }
  };

  private charmLoop = (amount: string, channelId: string, type: string) => {
    // ready, set, automated looping

    // temporary delay while generating quotes
    setTimeout(() => {
      /*TODO: is this a good default for sweep target?
        will add advance CHARM setup to handle value tweaking
        next time.
      */
      const SWEEP_CONF_TARGET = '6';
      // ready, set, automated looping
      if (type === LOOP_TYPE.LOOP_IN) {
        const { quote } = this.props.in;
        if (!quote) {
          message.warn(`CHARM failed ${type} quote generation`);
        } else {
          this.props.loopIn({
            amt: amount,
            loop_in_channel: channelId,
            max_miner_fee: quote.miner_fee,
            max_swap_fee: quote.swap_fee,
            external_htlc: false,
          });
        }
      }
      if (type === LOOP_TYPE.LOOP_OUT) {
        const { quote } = this.props.out;
        if (!quote) {
          message.warn(`CHARM failed ${type} quote generation`);
        } else {
          this.props.loopOut({
            amt: amount,
            loop_out_channel: channelId,
            max_miner_fee: quote.miner_fee,
            max_swap_fee: quote.swap_fee,
            max_prepay_amt: quote.prepay_amt,
            max_swap_routing_fee: quote.swap_fee,
            sweep_conf_target: SWEEP_CONF_TARGET,
          });
        }
      }
      message.info(`CHARM is attempting ${type} to re-balance`);
    }, 3141);
  };

  /** End CHARM Logic */
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    nodeUrl: state.node.url,
    account: state.account.account,
    channels: state.channels.channels,
    charm: state.loop.charm,
    swapInfo: state.loop.swapInfo,
    out: state.loop.out,
    in: state.loop.in,
    fetchAccountInfoError: state.account.fetchAccountInfoError,
  }),
  {
    getAccountInfo,
    getChannels,
    getLoopOutQuote,
    getLoopInQuote,
    loopOut,
    loopIn,
    listSwaps,
    activateCharm,
    deactivateCharm,
  },
)(HomePage);
