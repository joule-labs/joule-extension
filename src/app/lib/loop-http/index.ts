import { stringify } from 'query-string';
import { NetworkError } from './errors';
import { parseLoopErrorResponse } from './utils';
import * as T from './types';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class LoopHttpClient {
  url: string;

  constructor(url: string) {
    // Remove trailing slash for consistency
    this.url = url.replace(/\/$/, '');
  }

  // Public API methods

  getLoopOutTerms = () => {
    return this.request<T.GetLoopTermsResponse>('GET', `/v1/loop/out/terms`);
  };

  getLoopInTerms = () => {
    return this.request<T.GetLoopTermsResponse>('GET', `/v1/loop/in/terms`);
  };

  getLoopOutQuote = (amt: string, conf: string) => {
    return this.request<T.GetLoopQuoteResponse>(
      'GET',
      `/v1/loop/out/quote/${amt}?conf_target=${conf}`,
      undefined,
      {
        miner_fee: '',
        swap_fee: '',
        prepay_amt: '',
      },
    );
  };

  /**
   * TODO: Add confirmation target as required
   * in future iterations for Loop
   */
  getLoopInQuote = (amt: string /*, conf: string*/) => {
    return this.request<T.GetLoopQuoteResponse>(
      'GET',
      // `/v1/loop/out/quote/${amt}?conf_target=${conf}`,
      `/v1/loop/out/quote/${amt}`,
      undefined,
      {
        miner_fee: '',
        swap_fee: '',
        prepay_amt: '',
      },
    );
  };

  getLoopOut = (args: T.GetLoopOutArguments) => {
    return this.request<T.GetLoopResponse, T.GetLoopOutArguments>(
      'POST',
      '/v1/loop/out',
      args,
    );
  };

  getLoopIn = (args: T.GetLoopInArguments) => {
    return this.request<T.GetLoopResponse, T.GetLoopInArguments>(
      'POST',
      '/v1/loop/in',
      args,
    );
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

    return fetch(this.url + path + query, {
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
          const error = parseLoopErrorResponse(errBody);
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
