import * as Errors from './errors';
import { ErrorResponse } from './types';

export function parseNodeErrorResponse(res: ErrorResponse): Error {
  if (res.error.includes('expected 1 macaroon')) {
    return new Errors.MacaroonAuthError('Macaroon is required');
  }

  return new Errors.UnknownServerError('Unknown server error');
}
