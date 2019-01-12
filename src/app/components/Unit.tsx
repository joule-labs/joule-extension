import React from 'react';
import { connect } from 'react-redux';
import {
  denominationSymbols,
  Denomination,
  fiatSymbols,
  CHAIN_TYPE,
} from 'utils/constants';
import { fromBaseToUnit, fromUnitToFiat } from 'utils/units';
import { commaify } from 'utils/formatters';
import { AppState } from 'store/reducers';
import { getNodeChain } from 'modules/node/selectors';

interface StateProps {
  rates: AppState['rates']['rates'];
  fiat: AppState['settings']['fiat'];
  denomination: AppState['settings']['denomination'];
  isFiatPrimary: AppState['settings']['isFiatPrimary'];
  isNoFiat: AppState['settings']['isNoFiat'];
}

interface OwnProps {
  value: string;
  hideUnit?: boolean;
  showFiat?: boolean;
  showPlus?: boolean;
  chain: CHAIN_TYPE;
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

    // Store & remove negative
    const prefix = value[0] === '-' ? '-' : showPlus ? '+' : '';
    value = value.replace('-', '');

    const adjustedValue = fromBaseToUnit(value, denomination);
    const bitcoinEl = <>
      {commaify(adjustedValue)}
      {!hideUnit && <small>{' '}{denominationSymbols[chain][denomination]}</small>}
    </>;

    let fiatEl = '';
    if (rates && rates[chain][fiat]) {
      fiatEl = fromUnitToFiat(
        value,
        Denomination.SATOSHIS,
        rates[chain][fiat],
        fiatSymbols[fiat],
      );
    }

    return (
      <span className="Unit">
        <span className="Unit-primary">
          {prefix}
          {isFiatPrimary ? fiatEl : bitcoinEl}
        </span>
        {' '}
        {showFiat && !isNoFiat && (
          <span className="Unit-secondary">
            {isFiatPrimary ? bitcoinEl : fiatEl}
          </span>
        )}
      </span>
    );
  }
}

export default connect<StateProps, {}, OwnProps, AppState>(state => ({
  rates: state.rates.rates,
  fiat: state.settings.fiat,
  denomination: state.settings.denomination,
  isFiatPrimary: state.settings.isFiatPrimary,
  isNoFiat: state.settings.isNoFiat,
  chain: getNodeChain(state),
}))(Unit);