import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import './index.less';
import { getLoopTerms } from 'modules/loop/actions';
import { Button, Icon, Tooltip } from 'antd';
import { ButtonProps } from 'antd/lib/button';

interface StateProps {
  loopTerms: AppState['loop']['loopTerms'];
}

interface DispatchProps {
  getLoopTerms: typeof getLoopTerms;
}

type Props = StateProps & DispatchProps;

class Loop extends React.Component<Props> {
  componentWillMount() {
    this.props.getLoopTerms();
  }

  render() {
    const { loopTerms } = this.props;
    const actions: ButtonProps[] = [
      {
        children: 'Loop Out Quote',
        icon: '',
      },
      {
        children: (
          <>
            <Icon type="thunderbolt" theme="filled" /> Loop Out
          </>
        ),
        type: 'primary' as any,
      },
    ];

    if (loopTerms === null) {
      return null;
    }
    return (
      <>
        <div className="Loop">
          <h1 className="Loop-stats">Loop Out Terms</h1>
          <ul className="Loop-details">
            <li>Max: {loopTerms.max_swap_amount} sats</li>
            <li>Min: {loopTerms.min_swap_amount} sats</li>
            <li>Prepay: {loopTerms.prepay_amt} sats </li>
            <li>Base Fee: {loopTerms.swap_fee_base} sats </li>
            <li>Fee Rate: {loopTerms.swap_fee_rate} sats </li>
          </ul>
          <div className="Loop-actions">
            {actions.map((props, idx) => (
              <Button key={idx} {...props} />
            ))}
          </div>
        </div>
      </>
    );
  }
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    loopTerms: state.loop.loopTerms,
  }),
  {
    getLoopTerms,
  },
)(Loop);
