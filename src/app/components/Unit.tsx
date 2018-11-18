import React from 'react';
import { connect } from 'react-redux';
import { denominationSymbols, Denomination, fiatSymbols } from 'utils/constants';
import { fromBaseToUnit } from 'utils/units';
import { commaify } from 'utils/formatters';
import { AppState } from 'store/reducers';

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
    } = this.props;

    // Store & remove negative
    const prefix = value[0] === '-' ? '-' : showPlus ? '+' : '';
    value = value.replace('-', '');

    const adjustedValue = fromBaseToUnit(value, denomination);
    const bitcoinString = `${commaify(adjustedValue)} ${hideUnit ? '' : denominationSymbols[denomination]}`;

    let fiatString = '';
    if (rates && rates[fiat]) {
      const btcValue = fromBaseToUnit(value, Denomination.BITCOIN);
      const fiatValue = parseFloat(btcValue) * rates[fiat];
      fiatString = `${fiatSymbols[fiat]}${commaify(fiatValue.toFixed(2))}`;
    }

    return (
      <span className="Unit">
        <span className="Unit-primary">
          {prefix}
          {isFiatPrimary ? fiatString : bitcoinString}
        </span>
        {' '}
        {showFiat && !isNoFiat && (
          <span className="Unit-secondary">
            {isFiatPrimary ? bitcoinString : fiatString}
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
}))(Unit);