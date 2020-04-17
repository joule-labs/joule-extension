import * as Errors from './errors';
import { LndAPIResponseNetworkError, LndAPIResponseError } from './types';

const isNetworkError = (
  error: LndAPIResponseError,
): error is LndAPIResponseNetworkError =>
  (error as LndAPIResponseNetworkError).statusText !== undefined;

export function parseResponseError(err: LndAPIResponseError): Error {
  console.log(err);
  if (typeof err === 'string') {
    return new Error(err);
  }

  if (isNetworkError(err)) {
    return new Errors.NetworkError(err.statusText, err.status);
  }

  if (err.error.includes('SendTransactionError')) {
    return new Errors.SendTransactionError(err.error.split('SendTransactionError: ')[1]);
  }

  if (err.error.includes('expected 1 macaroon')) {
    return new Errors.MacaroonAuthError('Macaroon is required');
  }

  if (err.error.includes('permission denied')) {
    return new Errors.PermissionDeniedError('You lack permission to do that');
  }

  if (err.error.includes('unable to find a path to destination')) {
    return new Errors.NoRouteError('No route available for payment');
  }

  if (err.error.includes('already connected to peer')) {
    return new Errors.AlreadyConnectedError('You are already peers with that node');
  }

  return new Errors.UnknownServerError(err.error);
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
