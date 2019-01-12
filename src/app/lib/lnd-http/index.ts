import { stringify } from 'query-string';
import { parseNodeErrorResponse, txIdBytesToHex } from './utils';
import { NetworkError, SendTransactionError } from './errors';
import * as T from './types';
export * from './errors';
export * from './types';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class LndHttpClient {
  url: string;
  macaroon: undefined | T.Macaroon;
  
  constructor(url: string, macaroon?: T.Macaroon) {
    // Remove trailing slash for consistency
    this.url = url.replace(/\/$/, '');
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
    ).then(res => {
      res.transactions = res.transactions.map(tx => ({
        total_fees: '0',
        ...tx,
      }));
      return res;
    });
  };

  getPayments = () => {
    return this.request<T.GetPaymentsResponse>(
      'GET',
      '/v1/payments',
      undefined,
      { payments: [] },
    ).then(res => {
      res.payments = res.payments.map(t => ({
        fee: '0',
        ...t,
      }));
      return res;
    });;
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
    });
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

  createInvoice = (args: T.CreateInvoiceArguments) => {
    return this.request<T.CreateInvoiceResponse, T.CreateInvoiceArguments>(
      'POST',
      '/v1/invoices',
      args,
    );
  };

  decodePaymentRequest = (paymentRequest: string) => {
    return this.request<T.DecodePaymentRequestResponse>(
      'GET',
      `/v1/payreq/${paymentRequest}`,
      undefined,
      {
        route_hints: [],
      },
    );
  };

  queryRoutes = (pubKey: string, amount: string, args: T.QueryRoutesArguments) => {
    return this.request<T.QueryRoutesResponse, T.QueryRoutesArguments>(
      'GET',
      `/v1/graph/routes/${pubKey}/${amount}`,
      args,
      { routes: [] },
    ).then(res => {
      // Default attributes for channels
      res.routes = res.routes.map(route => ({
        total_fees: '0',
        total_fees_msat: '0',
        ...route,
      }));
      return res;
    });
  };

  sendPayment = (args: T.SendPaymentArguments) => {
    return this.request<any, T.SendPaymentArguments>(
      'POST',
      '/v1/channels/transactions',
      args,
    ).then(res => {
      if (res.payment_error) {
        throw new SendTransactionError(res.payment_error);
      }
      return {
        ...res,
        payment_preimage: new Buffer(res.payment_preimage, 'base64').toString('hex'),
      } as T.SendPaymentResponse;
    });
  };

  getAddress = (_: T.AddressType = 'p2wkh') => {
    return this.request<T.NewAddressResponse, T.NewAddressArguments>(
      'GET',
      '/v1/newaddress',
      // { type },
    );
  };

  getPeers = () => {
    return this.request<T.GetPeersResponse>(
      'GET',
      '/v1/peers',
      undefined,
      { peers: [] },
    ).then(res => {
      // Default attributes for peers
      res.peers = res.peers.map(peer => ({
        ping_time: '0',
        sat_sent: '0',
        sat_recv: '0',
        bytes_sent: '0',
        bytes_recv: '0',
        ...peer,
      }));
      return res;
    });
  };

  connectPeer = (address: string, perm?: boolean) => {
    const pieces = address.split('@');
    const addr = { pubkey: pieces[0], host: pieces[1] };
    return this.request<any, T.ConnectPeerArguments>(
      'POST',
      '/v1/peers',
      { addr, perm },
    );
  };

  openChannel = (params: T.OpenChannelParams) => {
    return this.request<T.OpenChannelResponse, T.OpenChannelParams>(
      'POST',
      '/v1/channels',
      params,
    ).then(res => {
      return {
        output_index: '0',
        funding_txid_str: txIdBytesToHex(res.funding_txid_bytes),
        ...res,
      }
    });
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