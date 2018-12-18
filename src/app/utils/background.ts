import { LndHttpClient, ApiMethod } from 'lib/lnd-http';
import * as T from 'lib/lnd-http/types';

// An API-compatible proxy to the background script that does the actual
// request using credentials stored in memory.
export class BackgroundProxy extends LndHttpClient {
  constructor() {
    // Send in blank info, it'll go unused
    super('', '');
  }

  // Override the request method that all other methods use
  protected request<R extends object, A extends object | undefined = undefined>(
    method: ApiMethod,
    path: string,
    args?: A,
    defaultValues?: Partial<R>,
  ): T.Response<R> {
    console.log(method, path, args, defaultValues);
    return Promise.reject(Error('Sup'));
  }
}

export const backgroundProxy = new BackgroundProxy();
