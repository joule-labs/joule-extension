import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Alert, Radio, InputNumber } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { AppState } from 'store/reducers';
import Loader from 'components/Loader';
import { getOnChainFeeEstimates } from 'modules/payment/actions';
import { OnChainFeeEstimates } from 'modules/payment/types';
import { getNodeChain } from 'modules/node/selectors';
import './style.less';
import { CHAIN_TYPE } from 'utils/constants';

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
  showFeeMsg?: boolean;
  onChange(fee: number): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  fee: number | undefined,
  feeMethod: keyof OnChainFeeEstimates;
  showCustomFee: boolean;
}

const INITIAL_STATE = {
  fee: 0,
  feeMethod: 'auto',
  showCustomFee: false,
};

class FeeSelectField extends Component<Props, State> {
  state: State = {
    ...INITIAL_STATE,
  }

  componentDidMount() {
    this.props.getOnChainFeeEstimates();
  }

  render() {
    const { chain, onChainFees, isFetchingFees, feesError, showFeeMsg } = this.props;
    const { fee, feeMethod, showCustomFee } = this.state;

    if (chain !== CHAIN_TYPE.BITCOIN) {
      // hide fee selection if not using the Bitcoin chain
      // since the fee estimates are only available for BTC
      return null;
    }

    let help = showCustomFee ? (
      <>
        <a onClick={this.toggleCustomFee}>Switch back </a>
        to a suggested fee.
      </>
    ) : (
      <>
        You can specify a 
        <a onClick={this.toggleCustomFee}> custom fee </a>
        manually if you like.
      </>
    );

    if (showFeeMsg) {
      help = (
        <>
          The transaction will be sent with the fee
          {fee 
            ? <> set to <strong>{fee} sats</strong> per byte. </> 
            : ' automatically calculated by your node. '}
          {help}
        </>
      );
    }

    let warning: 'warning' | undefined;
    if (onChainFees && fee && (fee > onChainFees.fastestFee)) {
      help = (
        <>
          <div>
            Warning: Suggested fastest fee is 
            <strong> {onChainFees.fastestFee} </strong>
          </div>
          {help}
        </>
      );
      warning = 'warning';
    }

    const field = showCustomFee ? (
      <InputNumber
        value={fee}
        min={0}
        placeholder="Enter number of sats per byte"
        onChange={this.handleChangeFee}
        type="number"
      />
    ) : (
      <Radio.Group defaultValue={feeMethod} onChange={this.handleChangeFeeMethod}>
        <Radio.Button value="auto">Auto</Radio.Button>
        <Radio.Button value="hourFee">Slow</Radio.Button>
        <Radio.Button value="halfHourFee">Normal</Radio.Button>
        <Radio.Button value="fastestFee">Fast</Radio.Button>
      </Radio.Group>
    );

    return (
      <Form.Item 
        className="FeeSelectField"
        label="Fee"
        help={help}
        validateStatus={warning}
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
        {onChainFees && field}
      </Form.Item>
    );
  }

  private handleChangeFeeMethod = (ev: RadioChangeEvent) => {
    if (this.props.onChainFees) {
      const fee = this.props.onChainFees[ev.target.value];
      this.setState({ fee, feeMethod: ev.target.value });
      this.props.onChange(fee);
    }
  };

  private handleChangeFee = (value: number | undefined) => {
    const fee = value || 0;
    this.setState({ fee });
    this.props.onChange(fee);
};

  private toggleCustomFee = () => {
    if (this.state.showCustomFee) {
      // reset the form if switching back from custom mode
      this.setState({ ...INITIAL_STATE });
    } else {
      this.setState({ 
        showCustomFee: true,
        fee: undefined,
      });
    }
    // always bubble a 0 fee when the field is toggled
    this.props.onChange(INITIAL_STATE.fee);
  }
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
