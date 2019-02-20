import React from 'react';
import { connect } from 'react-redux';
import { Modal, Tooltip, Progress, Tabs, Icon, Alert } from 'antd';
import Statistic from 'antd/lib/statistic'; 
import Loader from 'components/Loader';
import { AppState } from 'store/reducers';
import { getChannels } from 'modules/channels/actions';
import './index.less';
import Unit from 'components/Unit';

interface StateProps {
  channels: AppState['channels']['channels'];
  isFetchingChannels: AppState['channels']['isFetchingChannels'];
  fetchChannelsError: AppState['channels']['fetchChannelsError'];
}

interface ActionProps {
  getChannels: typeof getChannels;
}

interface OwnProps {
  isVisible: boolean;
  handleClose(): void;
}

type Props = StateProps & ActionProps & OwnProps;

interface State {
  address: string;
  isAddingPeer: boolean;
}

class BalanceModal extends React.Component<Props, State> {
  state: State = {
    address: '',
    isAddingPeer: false,
  };


  render() {
    const { channels, fetchChannelsError, isVisible, handleClose } = this.props;

    let content;
    if (channels) {
      content = (
        <>
          <div className="BalanceModal-header">
            {/* <span>You have <Unit value="29158062" hideUnit /> of <Unit value="106204151" /> available to spend</span> */}
            <Alert
              type="warning"
              message={<>You have <Unit value="77046089" /> pending</>}
              iconType="clock-circle"
              showIcon
            />
          </div>
          <div className="BalanceModal-chart">
            <Tooltip title="100% available">
              <Progress
                percent={100}
                type="circle"
                strokeColor="#7642ff"
                strokeWidth={10}
                format={p => `${p}%`}
              />
            </Tooltip>
            <Tooltip title="2.7% available">
              <Progress
                percent={2.7}
                type="circle"
                strokeColor="#ff9500"
                strokeWidth={10}
                format={p => `${p}%`}
              />
            </Tooltip>
          </div>
          <div className="BalanceModal-stats">
            <Statistic title="Lightning" value={26.97285} suffix={<>/ 26.97285 <small>bits</small></>} valueStyle={{ color: '#7642ff' }} />
            <Statistic title="Bitcoin" value={2.185212} suffix={<>/ 79.231301 <small>bits</small></>} valueStyle={{ color: '#ff9500' }} />
          </div>
          <div className="BalanceModal-details">
            <Tabs defaultActiveKey="lightning">
              <Tabs.TabPane
                tab={<><Icon type="thunderbolt"/> Lightning</>}
                key="lightning"
              >
                channels
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={<><Icon type="link"/> Bitcoin</>}
                key="on-chain"
              >
                on chain
              </Tabs.TabPane>
            </Tabs>
          </div>
        </>
      );
    } else if (fetchChannelsError) {
      content = fetchChannelsError.message;
    } else {
      content = <Loader />;
    }

    return (
      <Modal
        title="Balances"
        visible={isVisible}
        onCancel={handleClose}
        className="BalanceModal"
        footer={''}
        centered
      >
        {content}
      </Modal>
    )
  }
}

export default connect<StateProps, ActionProps, OwnProps, AppState>(
  state => ({
    channels: state.channels.channels,
    isFetchingChannels: state.channels.isFetchingChannels,
    fetchChannelsError: state.channels.fetchChannelsError,
  }),
  {
    getChannels,
  },
)(BalanceModal);
