import * as Errors from './errors';
import { ErrorResponse } from './types';

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

  return new Errors.UnknownServerError(res.error);
}
