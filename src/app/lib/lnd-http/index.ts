import { stringify } from 'query-string';
import { parseNodeErrorResponse } from './utils';
import { NetworkError } from './errors';
import * as T from './types';
export * from './errors';
export * from './types';

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class LndHttpClient {
  url: string;
  macaroon: undefined | T.Macaroon;
  
  constructor(url: string, macaroon?: T.Macaroon) {
    this.url = url;
    this.macaroon = macaroon;
  }

  // Public API methods
  getInfo = () => {
    return this.request<T.GetInfoResponse>(
      'GET',
      '/v1/getinfo',
      undefined,
      {
        uris: [],
        num_active_channels: 0,
        num_peers: 0,
        synced_to_chain: false,
        block_height: 0,
        num_pending_channels: 0,
        testnet: false,
      },
    );
  };

  getNodeInfo = (pubKey: string) => {
    return this.request<T.GetNodeInfoResponse>('GET', `/v1/graph/node/${pubKey}`);
  };

  getChannels = () => {
    return this.request<T.GetChannelsResponse>(
      'GET',
      '/v1/channels',
      undefined,
      { channels: [] },
    ).then(res => {
      // Default attributes for channels
      res.channels = res.channels.map(channel => ({
        csv_delay: 0,
        num_updates: 0,
        private: false,
        pending_htlcs: [],
        remote_balance: '0',
        commit_weight: '0',
        capacity: '0',
        local_balance: '0',
        total_satoshis_received: '0',
        active: false,
        commit_fee: '0',
        fee_per_kw: '0',
        unsettled_balance: '0',
        total_satoshis_sent: '0',
        ...channel,
      }));
      return res;
    });
  };

  getBlockchainBalance = () => {
    return this.request<T.GetBlockchainBalanceResponse>(
      'GET',
      '/v1/balance/blockchain',
      undefined,
      {
        unconfirmed_balance: '0',
        confirmed_balance: '0',
        total_balance: '0',
      },
    );
  };

  getChannelsBalance = () => {
    return this.request<T.GetChannelsBalanceResponse>(
      'GET',
      '/v1/balance/channels',
      undefined,
      {
        pending_open_balance: '0',
        balance: '0',
      },
    );
  };

  getTransactions = () => {
    return this.request<T.GetTransactionsResponse>(
      'GET',
      '/v1/transactions',
      undefined,
      { transactions: [] },
    );
  };

  getPayments = () => {
    return this.request<T.GetPaymentsResponse>(
      'GET',
      '/v1/payments',
      undefined,
      { payments: [] },
    );
  };

  getInvoices = (args: T.GetInvoicesArguments = {}) => {
    return this.request<T.GetInvoicesResponse, T.GetInvoicesArguments>(
      'GET',
      '/v1/invoices',
      args,
      {
        invoices: [],
        first_index_offset: 0,
        last_index_offset: 0,
      },
    ).then(res => {
      // Default attributes for channels
      res.invoices = res.invoices.map(invoice => ({
        route_hints: [],
        settled: false,
        ...invoice,
      }));
      return res;
    });;
  };

  getInvoice = (paymentHash: string) => {
    return this.request<T.GetInvoiceResponse>(
      'GET',
      `/v1/invoice/${paymentHash}`,
      undefined,
      {
        route_hints: [],
        settled: false,
      },
    )
  };

  // Internal fetch function
  private request<R extends object, A extends object | undefined = undefined>(
    method: ApiMethod,
    path: string, args?: A,
    defaultValues?: Partial<R>,
  ): T.Response<R> {
    let body = null;
    let query = '';
    const headers = new Headers();
    headers.append('Accept', 'application/json');

    if (method === 'POST') {
      body = JSON.stringify(args);
      headers.append('Content-Type', 'application/json');
    }
    else if (args !== undefined) {
      // TS Still thinks it might be undefined(?)
      query = `?${stringify(args as any)}`;
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
      .then((res: Partial<R>) => {
        if (defaultValues) {
          // TS can't handle generic spreadables
          return { ...defaultValues as any, ...res as any } as R;
        }
        return res as R;
      })
      .catch((err) => {
        console.error(`API error calling ${method} ${path}`, err);
        throw err;
      });
  }
}

export default LndHttpClient;