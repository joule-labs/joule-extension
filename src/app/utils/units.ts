import { Denomination } from './constants';

// const multipliers: { [key in Denomination]: number } = {
//   [Denomination.SATOSHIS]: 1,
//   [Denomination.MILLIBITCOIN]: 1000,
//   [Denomination.BITS]: 1000000,
//   [Denomination.BITCOIN]: 100000000,
// };

const decimals: { [key in Denomination]: number } = {
  [Denomination.SATOSHIS]: 1,
  [Denomination.MILLIBITCOIN]: 3,
  [Denomination.BITS]: 6,
  [Denomination.BITCOIN]: 8,
};

// Remove trailing zeroes
function stripRightZeros(str: string) {
  const strippedStr = str.replace(/0+$/, '');
  return strippedStr === '' ? null : strippedStr;
}
function stripLeftZeros(str: string) {
  const strippedStr = str.replace(/^0+/, '');
  if (!strippedStr) {
    return '0';
  }
  return strippedStr;
}

// Go from any unit to satoshis
export function fromBaseToUnit(value: string, toUnit: Denomination) {
  if (toUnit === Denomination.SATOSHIS) {
    return stripLeftZeros(value);
  }
  const paddedValue = value.padStart(decimals[toUnit] + 1, '0');
  const integerPart = stripLeftZeros(paddedValue.slice(0, -decimals[toUnit]));
  const fractionPart = stripRightZeros(paddedValue.slice(-decimals[toUnit]));
  return fractionPart ? `${integerPart}.${fractionPart}` : integerPart;
}

// Go from satoshis to another unit
export function fromUnitToBase(value: string, fromUnit: Denomination) {
  const [integerPart, fractionPart = ''] = value.split('.');
  const paddedFraction = fractionPart.padEnd(decimals[fromUnit], '0');
  return `${integerPart}${paddedFraction}`;
}

export function fromUnitToBitcoin(value: string, fromUnit: Denomination) {
  return fromBaseToUnit(fromUnitToBase(value, fromUnit), Denomination.BITCOIN);
}

export function fromBitcoinToUnit(value: string, toUnit: Denomination) {
  return fromBaseToUnit(fromUnitToBase(value, Denomination.BITCOIN), toUnit);
}