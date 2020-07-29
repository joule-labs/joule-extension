import { CHAIN_TYPE, blockchainExplorers } from './constants';

export function stripHexPrefix(value: string) {
  return value.replace('0x', '');
}

const toFixed = (num: string, digits: number = 3) => {
  const [integerPart, fractionPart = ''] = num.split('.');
  if (fractionPart.length === digits) {
    return num;
  }
  if (fractionPart.length < digits) {
    return `${integerPart}.${fractionPart.padEnd(digits, '0')}`;
  }

  let decimalPoint = integerPart.length;

  const formattedFraction = fractionPart.slice(0, digits);

  const integerArr = `${integerPart}${formattedFraction}`.split('').map(str => +str);

  let carryOver = Math.floor((+fractionPart[digits] + 5) / 10);

  // grade school addition / rounding
  for (let i = integerArr.length - 1; i >= 0; i--) {
    const currVal = integerArr[i] + carryOver;
    const newVal = currVal % 10;
    carryOver = Math.floor(currVal / 10);
    integerArr[i] = newVal;
    if (i === 0 && carryOver > 0) {
      integerArr.unshift(0);
      decimalPoint++;
      i++;
    }
  }

  const strArr = integerArr.map(n => n.toString());

  strArr.splice(decimalPoint, 0, '.');

  if (strArr[strArr.length - 1] === '.') {
    strArr.pop();
  }

  return strArr.join('');
};

export function formatNumber(num: string, digits?: number): string {
  const parts = toFixed(num, digits).split('.');

  // Remove trailing zeroes on decimal (If there is a decimal)
  if (parts[1]) {
    parts[1] = parts[1].replace(/0+$/, '');

    // If there's nothing left, remove decimal altogether
    if (!parts[1]) {
      parts.pop();
    }
  }

  // Commafy the whole numbers
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}

export function ellipsisSandwich(text: string, charsPerSide: number) {
  if (text.length <= charsPerSide * 2 + 3) {
    return text;
  }
  return `${text.slice(0, charsPerSide)}...${text.slice(
    text.length - charsPerSide,
    text.length,
  )}`;
}

export function commaify(text: string | number) {
  const pieces = text.toString().split('.');
  pieces[0] = pieces[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return pieces.join('.');
}

export function removeDomainPrefix(domain: string) {
  return domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
}

// Domain without trailing slash and lowercase'd, for use as a key
export function normalizeDomain(domain: string) {
  return domain.toLowerCase().replace(/\/$/, '');
}

// Domain sans prefix, lowercase'd
export function shortDomain(domain: string) {
  return removeDomainPrefix(domain).toLowerCase();
}

export function enumToClassName(key: string) {
  return key.toLowerCase().replace('_', '-');
}

export function urlWithoutPort(fullUrl: string) {
  const url = new URL(fullUrl);
  return `${url.protocol}//${url.hostname}${url.pathname}`;
}

function getExplorerUrls(chain: string, isTestnet?: boolean) {
  if (!blockchainExplorers[chain as CHAIN_TYPE]) {
    return null;
  }
  const network = isTestnet ? 'testnet' : 'mainnet';
  return blockchainExplorers[chain as CHAIN_TYPE][network];
}

export function makeTxUrl(txid: string, chain: string, isTestnet?: boolean) {
  const urls = getExplorerUrls(chain, isTestnet);
  return urls ? urls.tx.replace('$TX_ID', txid) : '';
}

export function makeBlockUrl(blockid: string, chain: string, isTestnet?: boolean) {
  const urls = getExplorerUrls(chain, isTestnet);
  return urls ? urls.block.replace('$BLOCK_ID', blockid) : '';
}
