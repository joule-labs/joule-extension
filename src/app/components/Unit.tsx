import React from 'react';
import { connect } from 'react-redux';
import { Denomination, denominationSymbols, fiatSymbols } from 'utils/constants';
import { fromBaseToUnit, fromUnitToFiat } from 'utils/units';
import { commaify } from 'utils/formatters';
import { AppState } from 'store/reducers';
import { getNodeChain } from 'modules/node/selectors';
import { getChainRates } from 'modules/rates/selectors';

interface StateProps {
  fiat: AppState['settings']['fiat'];
  denomination: AppState['settings']['denomination'];
  isFiatPrimary: AppState['settings']['isFiatPrimary'];
  isNoFiat: AppState['settings']['isNoFiat'];
  rates: ReturnType<typeof getChainRates>;
  chain: ReturnType<typeof getNodeChain>;
}

interface OwnProps {
  value: string;
  hideUnit?: boolean;
  showFiat?: boolean;
  showPlus?: boolean;
}

type Props = StateProps & OwnProps;

class Unit extends React.Component<Props> {
  render() {
    let value = this.props.value;
    const {
      hideUnit,
      showFiat,
      showPlus,
      rates,
      fiat,
      denomination,
      isFiatPrimary,
      isNoFiat,
      chain,
    } = this.props;

    // If we get a non-number, just early return with it plaintext
    if (Number.isNaN(parseInt(value, 10))) {
      return <span className="Unit">{value}</span>;
    }

    // Store & remove negative
    const prefix = value[0] === '-' ? '-' : showPlus ? '+' : '';
    value = value.replace('-', '');

    const adjustedValue = fromBaseToUnit(value, denomination);
    const bitcoinEl = (
      <>
        {commaify(adjustedValue)}
        {!hideUnit && <small> {denominationSymbols[chain][denomination]}</small>}
      </>
    );

    let fiatEl = '';
    if (rates) {
      fiatEl = fromUnitToFiat(
        value,
        Denomination.SATOSHIS,
        rates[fiat],
        fiatSymbols[fiat],
      );
    }

    return (
      <span className="Unit">
        <span className="Unit-primary">
          {prefix}
          {isFiatPrimary ? fiatEl : bitcoinEl}
        </span>{' '}
        {showFiat && !isNoFiat && (
          <span className="Unit-secondary">{isFiatPrimary ? bitcoinEl : fiatEl}</span>
        )}
      </span>
    );
  }
}

export default connect<StateProps, {}, OwnProps, AppState>((state) => ({
  fiat: state.settings.fiat,
  denomination: state.settings.denomination,
  isFiatPrimary: state.settings.isFiatPrimary,
  isNoFiat: state.settings.isNoFiat,
  rates: getChainRates(state),
  chain: getNodeChain(state),
}))(Unit);
