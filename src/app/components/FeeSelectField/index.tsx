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
  onChange(fee: number): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  feeMethod: keyof OnChainFeeEstimates;
}

class FeeSelectField extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      feeMethod: 'auto',
    }
  }

  componentDidMount() {
    this.props.getOnChainFeeEstimates();
  }

  render() {
    const { onChainFees, isFetchingFees, feesError } = this.props;
    const { feeMethod } = this.state;

    return (
      <Form.Item label="Fee" required className="FeeSelectField">
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
      this.setState({ feeMethod: ev.target.value });
      this.props.onChange(this.props.onChainFees[ev.target.value]);
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
