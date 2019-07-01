import { stringify } from 'query-string';
import { NetworkError } from './errors';
import { parseNodeErrorResponse } from './utils';
import * as T from './types';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class LoopHttpClient {
  loopUrl: string;

  constructor(loopUrl: string) {
    // Remove trailing slash for consistency
    this.loopUrl = loopUrl.replace(/\/$/, '');
  }

  // Public API methods

  getLoopTerms = () => {
    return this.request<T.GetLoopTermsResponse>('GET', `/v1/loop/out/terms`);
  };

  // Internal fetch function
  protected request<R extends object, A extends object | undefined = undefined>(
    method: ApiMethod,
    path: string,
    args?: A,
    defaultValues?: Partial<R>,
  ): T.Response<R> {
    let body = null;
    let query = '';
    const headers = new Headers();
    headers.append('Accept', 'application/json');

    if (method === 'POST') {
      body = JSON.stringify(args);
      headers.append('Content-Type', 'application/json');
    } else if (args !== undefined) {
      // TS Still thinks it might be undefined(?)
      query = `?${stringify(args as any)}`;
    }

    return fetch(this.loopUrl + path + query, {
      method,
      headers,
      body,
    })
      .then(async res => {
        if (!res.ok) {
          let errBody: any;
          try {
            errBody = await res.json();
            if (!errBody.error) throw new Error();
          } catch (err) {
            throw new NetworkError(res.statusText, res.status);
          }
          const error = parseNodeErrorResponse(errBody);
          throw error;
        }
        return res.json();
      })
      .then((res: Partial<R>) => {
        if (defaultValues) {
          // TS can't handle generic spreadables
          return { ...(defaultValues as any), ...(res as any) } as R;
        }
        return res as R;
      })
      .catch(err => {
        console.error(`API error calling ${method} ${path}`, err);
        throw err;
      });
  }
}

export default LoopHttpClient;
