import { stringify } from 'query-string';
import { NetworkError } from './errors';
import { parseLoopErrorResponse } from './utils';
import * as T from './types';
export * from './errors';
export * from './types';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class LoopHttpClient {
  url: string;

  constructor(url: string) {
    // Remove trailing slash for consistency
    this.url = url.replace(/\/$/, '');
  }

  // Public API methods

  getLoopOutTerms = () => {
    return this.request<T.GetLoopTermsResponse>('GET', `/v1/loop/out/terms`, undefined, {
      swap_fee_base: '0',
      swap_fee_rate: '0',
      prepay_amt: '0',
      min_swap_amount: '0',
      max_swap_amount: '0',
    });
  };

  getLoopInTerms = () => {
    return this.request<T.GetLoopTermsResponse>('GET', `/v1/loop/in/terms`, undefined, {
      swap_fee_base: '0',
      swap_fee_rate: '0',
      prepay_amt: '0',
      min_swap_amount: '0',
      max_swap_amount: '0',
    });
  };

  getLoopOutQuote = (amount: number | string, confTarget: number | string = 6) => {
    return this.request<T.GetLoopQuoteResponse, any>(
      'GET',
      `/v1/loop/out/quote/${amount}`,
      { conf_target: confTarget },
      {
        miner_fee: '0',
        swap_fee: '0',
        prepay_amt: '0',
      },
    );
  };

  getLoopInQuote = (amount: number | string, confTarget: number | string = 6) => {
    return this.request<T.GetLoopQuoteResponse, any>(
      'GET',
      `/v1/loop/out/quote/${amount}`,
      { conf_target: confTarget },
      {
        miner_fee: '0',
        swap_fee: '0',
        prepay_amt: '0',
      },
    );
  };

  loopOut = (args: T.LoopOutArguments) => {
    return this.request<T.LoopResponse, T.LoopOutArguments>('POST', '/v1/loop/out', args);
  };

  loopIn = (args: T.LoopInArguments) => {
    return this.request<T.LoopResponse, T.LoopInArguments>('POST', '/v1/loop/in', args);
  };

  listSwaps = () => {
    return this.request<T.GetSwapsResponse>('GET', '/v1/loop/swaps');
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
