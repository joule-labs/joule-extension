import React from 'react';
import BN from 'bn.js';
import moment from 'moment';
import classnames from 'classnames';
import { Tooltip, Icon } from 'antd';
import Unit from 'components/Unit';
import './SwapRow.less';
import { AppState } from 'store/reducers';
import { connect } from 'react-redux';
import { SwapResponse } from 'lib/loop-http';

interface StateProps {
  swapInfo: AppState['loop']['swapInfo'];
}

interface OwnProps {
  source: SwapResponse;
  title: React.ReactNode;
  type: string;
  timestamp: number;
  htlc: string;
  status: string;
  delta?: BN | false | null;
  onClick?(source: SwapResponse): void;
}

type Props = StateProps & OwnProps;

class SwapRow extends React.Component<Props> {
  render() {
    const { htlc, timestamp, status, delta, onClick, type } = this.props;

    let icon;
    icon = (
      <div className="SwapRow-avatar-img">
        <Icon type="audit" />
      </div>
    );

    return (
      <div
        className={classnames('SwapRow', onClick && 'is-clickable')}
        onClick={this.handleClick}
      >
        <div className="SwapRow-avatar">
          {icon}
          <Tooltip title={status}>
            <div className={`SwapRow-avatar-status is-${status}`} />
          </Tooltip>
        </div>
        <div className="SwapRow-info">
          <div className="SwapRow-info-title">{htlc}</div>
          <div className="SwapRow-info-time">
            {moment.unix(timestamp / 1000000).format('MMM Do, LT')}
          </div>
        </div>
        {delta && (
          <div
            className={classnames(
              `SwapRow-delta is-${type === 'LOOP_IN' ? 'positive' : 'negative'}`,
            )}
          >
            <Unit value={delta.toString()} showPlus showFiat />
          </div>
        )}
      </div>
    );
  }

  private handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.source);
    }
  };
}

export default connect<StateProps, {}, OwnProps, AppState>(state => ({
  swapInfo: state.loop.swapInfo,
}))(SwapRow);
