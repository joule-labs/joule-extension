import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Alert, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { AppState } from 'store/reducers';
import Loader from 'components/Loader';
import { getOnChainFeeEstimates } from 'modules/payment/actions';
import { OnChainFeeEstimates } from 'modules/payment/types';
import './style.less';

interface StateProps {
  onChainFees: AppState['payment']['onChainFees'];
  feesError: AppState['payment']['feesError'];
  isFetchingFees: AppState['payment']['isFetchingFees'];
}

interface DispatchProps {
  getOnChainFeeEstimates: typeof getOnChainFeeEstimates;
}

interface OwnProps {
  showHelp?: boolean;
  onChange(fee: number): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  fee: number,
  feeMethod: keyof OnChainFeeEstimates;
}

class FeeSelectField extends Component<Props, State> {
  state: State = {
    fee: 0,
    feeMethod: 'auto',
  }

  componentDidMount() {
    this.props.getOnChainFeeEstimates();
  }

  render() {
    const { onChainFees, isFetchingFees, feesError, showHelp } = this.props;
    const { fee, feeMethod } = this.state;

    const help = showHelp && <>
      The transaction will be sent with the fee
      {fee 
        ? <> set to <strong>{fee} sats</strong> per byte</> 
        : ' automatically calculated by your node'}
    </>;

    return (
      <Form.Item 
        className="FeeSelectField"
        label="Fee"
        help={help}
        required
      >
        {isFetchingFees &&
          <Loader inline />
        }
        {feesError && (
          <Alert 
            type="warning" 
            message={`Unable to estimate fees: ${feesError.message}`}
          /> 
        )}
        {onChainFees && (
          <Radio.Group defaultValue={feeMethod} onChange={this.handleChangeFee}>
            <Radio.Button value="auto">Auto</Radio.Button>
            <Radio.Button value="hourFee">Slow</Radio.Button>
            <Radio.Button value="halfHourFee">Normal</Radio.Button>
            <Radio.Button value="fastestFee">Fast</Radio.Button>
          </Radio.Group>
        )}
      </Form.Item>
    );
  }

  private handleChangeFee = (ev: RadioChangeEvent) => {
    if (this.props.onChainFees) {
      const fee = this.props.onChainFees[ev.target.value];
      this.setState({ fee, feeMethod: ev.target.value });
      this.props.onChange(fee);
    }
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    onChainFees: state.payment.onChainFees,
    feesError: state.payment.feesError,
    isFetchingFees: state.payment.isFetchingFees,
  }),
  {
    getOnChainFeeEstimates,
  },
)(FeeSelectField);
