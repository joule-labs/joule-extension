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
    return this.request<T.GetInfoResponse>('GET', '/v1/getinfo', undefined, {
      uris: [],
      num_active_channels: 0,
      num_peers: 0,
      synced_to_chain: false,
      block_height: 0,
      num_pending_channels: 0,
      testnet: false,
      chains: [],
    }).then(res => {
      // API can return chain as { chain: 'bitcoin', network: 'testnet' }
      res.chains = res.chains.map((chain: any) => {
        return chain.chain || chain;
      });
      res.chains = ['litecoin'];
      res.testnet = true;
      return res;
    });
  };

  getNodeInfo = (pubKey: string) => {
    return this.request<T.GetNodeInfoResponse>('GET', `/v1/graph/node/${pubKey}`);
  };

  getChannels = () => {
    return this.request<T.GetChannelsResponse>('GET', '/v1/channels', undefined, {
      channels: [],
    }).then(res => {
      // Default attributes for channels
      res.channels = res.channels.map(channel => ({
        status: T.CHANNEL_STATUS.OPEN,
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
        remote_node_pub: (channel as any).remote_pubkey,
        ...channel,
      }));
      return res;
    });
  };

  getPendingChannels = () => {
    return this.request<T.GetPendingChannelsResponse>(
      'GET',
      '/v1/channels/pending',
      undefined,
      {
        pending_closing_channels: [],
        pending_force_closing_channels: [],
        waiting_close_channels: [],
        pending_open_channels: [],
      },
    ).then(res => {
      const collapse = (chan: any) => ({
        ...chan,
        ...chan.channel,
        // remove nested 'channel' key from the chan spread
        ...{ channel: undefined },
      });
      res.pending_open_channels = res.pending_open_channels.map(channel => ({
        status: T.CHANNEL_STATUS.OPENING,
        commit_weight: '0',
        confirmation_height: 0,
        fee_per_kw: '0',
        commit_fee: '0',
        remote_balance: '0',
        local_balance: '0',
        capacity: '0',
        ...collapse(channel),
      }));
      res.pending_closing_channels = res.pending_closing_channels.map(channel => ({
        status: T.CHANNEL_STATUS.CLOSING,
        closing_txid: '',
        remote_balance: '0',
        local_balance: '0',
        capacity: '0',
        ...collapse(channel),
      }));
      res.waiting_close_channels = res.waiting_close_channels.map(channel => ({
        status: T.CHANNEL_STATUS.WAITING,
        limbo_balance: '0',
        remote_balance: '0',
        local_balance: '0',
        capacity: '0',
        ...collapse(channel),
      }));
      res.pending_force_closing_channels = res.pending_force_closing_channels.map(
        channel => ({
          status: T.CHANNEL_STATUS.FORCE_CLOSING,
          maturity_height: '0',
          pending_htlcs: [],
          recovered_balance: '0',
          limbo_balance: '0',
          blocks_til_maturity: 0,
          remote_balance: '0',
          local_balance: '0',
          capacity: '0',
          ...collapse(channel),
        }),
      );
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
    return this.request<T.GetTransactionsResponse>('GET', '/v1/transactions', undefined, {
      transactions: [],
    }).then(res => {
      res.transactions = res.transactions.map(tx => ({
        total_fees: '0',
        amount: '0',
        num_confirmations: 0,
        ...tx,
      }));
      return res;
    });
  };

  getPayments = () => {
    return this.request<T.GetPaymentsResponse>('GET', '/v1/payments', undefined, {
      payments: [],
    }).then(res => {
      res.payments = res.payments.map(t => ({
        fee: '0',
        path: [],
        ...t,
      }));
      return res;
    });
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
    );
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

  sendOnChain = (args: T.SendOnChainArguments) => {
    return this.request<T.SendOnChainResponse, T.SendOnChainArguments>(
      'POST',
      '/v1/transactions',
      args,
    );
  };

  getAddress = (_: T.AddressType = 'p2wkh') => {
    return this.request<T.NewAddressResponse, T.NewAddressArguments>(
      'GET',
      '/v1/newaddress',
      // { type },
    );
  };

  getPeers = () => {
    return this.request<T.GetPeersResponse>('GET', '/v1/peers', undefined, {
      peers: [],
    }).then(res => {
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
    return this.request<any, T.ConnectPeerArguments>('POST', '/v1/peers', { addr, perm });
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
      };
    });
  };

  closeChannel = (fundingTxid: string, outputIndex: string) => {
    // there's currently a bug in LND (#2730) which causes this
    // request to hang until the next block is mined
    return this.request<T.CloseChannelResponse>(
      'DELETE',
      `/v1/channels/${fundingTxid}/${outputIndex}`,
    );
  };

  signMessage = (message: string) => {
    const msg = new Buffer(message).toString('base64');
    return this.request<T.SignMessageResponse, T.SignMessageParams>(
      'POST',
      '/v1/signmessage',
      {
        msg,
      },
    );
  };

  verifyMessage = (params: T.VerifyMessageParams) => {
    return this.request<T.VerifyMessageResponse, T.VerifyMessageParams>(
      'POST',
      '/v1/verifymessage',
      {
        ...params,
        msg: new Buffer(params.msg).toString('base64'),
      },
    );
  };

  getUtxos = (params: T.GetUtxosParams = { max_confs: 100000000 }) => {
    // max_confs must be set to a number higher than the chain's current
    // block height in order to get all utxos for a wallet
    return this.request<T.GetUtxosResponse, T.GetUtxosParams>(
      'GET',
      '/v1/utxos',
      params,
      {
        utxos: [],
      },
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

    if (this.macaroon) {
      headers.append('Grpc-Metadata-macaroon', this.macaroon);
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

export default LndHttpClient;
