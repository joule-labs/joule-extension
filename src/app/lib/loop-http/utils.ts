import * as Errors from './errors';
import { ErrorResponse } from './types';

/***
 * Future error handling for LoopLib
 * **/
export function parseLoopErrorResponse(res: ErrorResponse): Error {
  return new Errors.UnknownServerError(res.error);
}

export function txIdBytesToHex(txbytes: string) {
  const txbinary = Buffer.from(txbytes, 'base64').toString('binary');
  const txarray = new Uint8Array(txbinary.length);
  for (let i = 0; i < txbinary.length; i++) {
    txarray[i] = txbinary.charCodeAt(i);
  }
  txarray.reverse();
  return new Buffer(txarray).toString('hex');
}
