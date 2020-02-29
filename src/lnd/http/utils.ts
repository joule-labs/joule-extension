import * as Errors from '../errors';
import { ErrorResponse } from '../types';

export function parseNodeErrorResponse(res: ErrorResponse): Error {
  if (res.error.includes('expected 1 macaroon')) {
    return new Errors.MacaroonAuthError('Macaroon is required');
  }

  if (res.error.includes('permission denied')) {
    return new Errors.PermissionDeniedError('You lack permission to do that');
  }

  if (res.error.includes('unable to find a path to destination')) {
    return new Errors.NoRouteError('No route available for payment');
  }

  if (res.error.includes('already connected to peer')) {
    return new Errors.AlreadyConnectedError('You are already peers with that node');
  }

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
