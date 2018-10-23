import { stringify } from 'query-string';
import { parseNodeErrorResponse } from './utils';
import { NetworkError } from './errors';
import { GetInfoResponse,Macaroon, Response } from './types';
export * from './errors';
export * from './types';

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class LndHttpClient {
  url: string;
  macaroon: undefined | Macaroon;
  
  constructor(url: string, macaroon?: Macaroon) {
    this.url = url;
    this.macaroon = macaroon;
  }

  // Public API methods
  getInfo = () => {
    return this.get<GetInfoResponse>('/v1/getinfo');
  }

  // Internal fetch functions
  private get<R, A = undefined>(path: string, args?: A): Response<R> {
    return this.request(path, args, 'GET');
  }

  private post<R, A = undefined>(path: string, args?: A): Response<R> {
    return this.request(path, args, 'POST');
  }

  private put<R, A = undefined>(path: string, args?: A): Response<R> {
    return this.request(path, args, 'PUT');
  }

  private delete<R, A = undefined>(path: string, args?: A): Response<R> {
    return this.request(path, args, 'DELETE');
  }

  private request<R, A>(path: string, args?: A, method?: ApiMethod): Response<R> {
    let body = null;
    let query = '';
    const headers = new Headers();
    headers.append('Accept', 'application/json');

    if (method === 'POST') {
      body = JSON.stringify(args);
      headers.append('Content-Type', 'application/json');
    }
    else if (args) {
      query = stringify(args);
    }

    if (this.macaroon) {
      headers.append('Grpc-Metadata-macaroon', this.macaroon);
    }

    return fetch(this.url + path + query, {
      method,
      headers,
      body,
    })
      .then(async (res) => {
        if (!res.ok) {
          let errBody: any;
          try {
            errBody = await res.json();
            if (!errBody.error) throw new Error();
          } catch(err) {
            throw new NetworkError(res.statusText, res.status);
          }
          const error = parseNodeErrorResponse(errBody);
          throw error;
        }
        return res.json();
      })
      .then((res: R) => {
        return res;
      })
      .catch((err) => {
        console.error(`API error calling ${method} ${path}`, err);
        throw err;
      });
  }
}

export default LndHttpClient;