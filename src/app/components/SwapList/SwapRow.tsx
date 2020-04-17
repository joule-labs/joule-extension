import React from 'react';
import BN from 'bn.js';
import moment from 'moment';
import classnames from 'classnames';
import { Tooltip, Icon } from 'antd';
import Unit from 'components/Unit';
import { getNodeChain } from 'modules/node/selectors';
import { LOOP_TYPE } from 'utils/constants';
import './SwapRow.less';
import { AppState } from 'store/reducers';
import { connect } from 'react-redux';
import { GetSwapsResponse } from 'lib/loop-http';

interface StateProps {
  chain: ReturnType<typeof getNodeChain>;
}

interface OwnProps {
  source: GetSwapsResponse;
  title: React.ReactNode;
  type: LOOP_TYPE.LOOP_IN | LOOP_TYPE.LOOP_OUT;
  timestamp: number;
  status: 'INITIATED' | 'SUCCESS' | 'FAILED' | 'HTLC_PUBLISHED';
  id?: string;
  delta?: BN | false | null;
  onClick?(source: GetSwapsResponse): void;
}

type Props = StateProps & OwnProps;

class SwapRow extends React.Component<Props> {
  render() {
    const { timestamp, status, delta, onClick, title } = this.props;

    let icon;
    icon = (
      <div className="SwapRow-avatar-img is-icon is-loop">
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
          <div className="SwapRow-info-title">{title}</div>
          <div className="SwapRow-info-time">
            {moment.unix(timestamp / 1000000).format('MMM Do, LT')}
          </div>
        </div>
        {delta && (
          <div
            className={classnames(
              `SwapRow-delta is-${delta.gtn(0) ? 'positive' : 'negative'}`,
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
  chain: getNodeChain(state),
}))(SwapRow);
