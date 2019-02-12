import { AppState as S } from 'store/reducers';
import { OnChainFeeEstimates } from './types';

export const selectOnChainFees = (s: S) => s.payment.onChainFees;
export const getAdjustedFees = (s: S): OnChainFeeEstimates | null => {
  // adjust fees to always be unique since the API may return multiple
  // speeds with the same number sats/b. This breaks the RadioGroup UI
  // to have multiple options selected
  const fees = selectOnChainFees(s);
  if (!fees) return null;

  const { fastestFee } = fees;
  let { halfHourFee, hourFee } = fees;

  if (halfHourFee === fastestFee) {
    halfHourFee--;
  }
  if (hourFee >= halfHourFee) {
    hourFee--;
  }

  return {
    fastestFee,
    halfHourFee, 
    hourFee,
  }
};