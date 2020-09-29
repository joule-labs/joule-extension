import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Alert, Slider } from 'antd';
import { AppState } from 'store/reducers';
import Loader from 'components/Loader';
import { SliderValue } from 'antd/lib/slider';
import { CHAIN_TYPE } from 'utils/constants';
import { getOnChainFeeEstimates } from 'modules/payment/actions';
import { getNodeChain } from 'modules/node/selectors';
import './style.less';

interface StateProps {
  onChainFees: AppState['payment']['onChainFees'];
  feesError: AppState['payment']['feesError'];
  isFetchingFees: AppState['payment']['isFetchingFees'];
  chain: ReturnType<typeof getNodeChain>;
}

interface DispatchProps {
  getOnChainFeeEstimates: typeof getOnChainFeeEstimates;
}

interface OwnProps {
  fee: number;
  showFeeMsg?: boolean;
  onChange(fee: number): void;
}

type Props = StateProps & DispatchProps & OwnProps;

class FeeSelectField extends Component<Props> {
  componentDidMount() {
    this.props.getOnChainFeeEstimates();
  }

  componentWillReceiveProps(nextProps: Props) {
    const { onChainFees } = this.props;
    if (nextProps.onChainFees !== onChainFees && nextProps.onChainFees !== null) {
      const { fastestFee } = nextProps.onChainFees;
      this.props.onChange(fastestFee);
    }
  }

  render() {
    const { fee, chain, onChainFees, isFetchingFees, feesError, showFeeMsg } = this.props;

    if (chain !== CHAIN_TYPE.BITCOIN) {
      // hide fee selection if not using the Bitcoin chain
      // since the fee estimates are only available for BTC
      return null;
    }

    const help = showFeeMsg && (
      <>
        The transaction will be sent with the fee
        {fee ? (
          <>
            {' '}
            set to <strong>{fee} sats</strong> per byte.{' '}
          </>
        ) : (
          ' automatically calculated by your node. '
        )}
      </>
    );

    return (
      <Form.Item className="FeeSelectField" label="Fee" help={help} required>
        {isFetchingFees && <Loader inline />}
        {feesError && (
          <Alert
            type="warning"
            message={`Unable to estimate fees: ${feesError.message}`}
          />
        )}
        {onChainFees && (
          <Slider
            value={fee}
            step={1}
            max={onChainFees.fastestFee}
            marks={{
              0: 'auto',
              [onChainFees.hourFee]: '',
              [onChainFees.halfHourFee]: '',
              [onChainFees.fastestFee]: 'fastest',
            }}
            tipFormatter={v => {
              switch (v) {
                case onChainFees.fastestFee:
                  return `${v} (fastest)`;
                case onChainFees.halfHourFee:
                  return `${v} (normal)`;
                case onChainFees.hourFee:
                  return `${v} (slow)`;
                case 0:
                  return 'auto';
                default:
                  return v;
              }
            }}
            onChange={this.handleChangeFee}
          />
        )}
      </Form.Item>
    );
  }

  private handleChangeFee = (value: SliderValue) => {
    const fee = (value as number) || 0;
    this.props.onChange(fee);
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    onChainFees: state.payment.onChainFees,
    feesError: state.payment.feesError,
    isFetchingFees: state.payment.isFetchingFees,
    chain: getNodeChain(state),
  }),
  {
    getOnChainFeeEstimates,
  },
)(FeeSelectField);
