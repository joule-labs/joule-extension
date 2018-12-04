import {
  WebLNProvider,
  GetInfoResponse,
  SendPaymentResponse,
  RequestInvoiceArgs,
  RequestInvoiceResponse,
} from 'webln/lib/provider';
import { PROMPT_TYPE } from './types';

export default class JouleWebLNProvider implements WebLNProvider {
  private isEnabled: boolean = false;
  private activePrompt: PROMPT_TYPE | null = null;

  async enable() {
    if (this.isEnabled) {
      return;
    }
    return this.promptUser(PROMPT_TYPE.AUTHORIZE).then(() => {
      this.isEnabled = true;
    });
  }

  async getInfo() {
    if (!this.isEnabled) {
      throw new Error('Provider must be enabled before calling getInfo');
    }
    return this.promptUser<GetInfoResponse>(PROMPT_TYPE.INFO);
  }

  async sendPayment(paymentRequest: string) {
    if (!this.isEnabled) {
      throw new Error('Provider must be enabled before calling sendPayment');
    }
    return this.promptUser<SendPaymentResponse, { paymentRequest: string }>(
      PROMPT_TYPE.PAYMENT,
      { paymentRequest },
    );
  }

  async makeInvoice(args: string | number | RequestInvoiceArgs) {
    if (!this.isEnabled) {
      throw new Error('Provider must be enabled before calling makeInvoice');
    }

    // Force into RequestInvoiceArgs format for strings (or bozos
    // who send numbers despite being typed otherwise!)
    if (typeof args !== 'object') {
      args = { amount: args };
    }

    return this.promptUser<RequestInvoiceResponse, RequestInvoiceArgs>(
      PROMPT_TYPE.INVOICE,
      args,
    );
  }

  async signMessage(_: string) {
    if (!this.isEnabled) {
      throw new Error('Provider must be enabled before calling signMessage');
    }
    throw new Error('Not yet implemented');
    return { signedMessage: '' };
  }

  async verifyMessage(_: string) {
    throw new Error('Not yet implemented');
  }

  // Internal prompt handler
  private promptUser<R = undefined, T = undefined>(
    type: PROMPT_TYPE,
    args?: T,
  ): Promise<R> {
    if (this.activePrompt) {
      Promise.reject(new Error('User is busy'));
    }

    return new Promise((resolve, reject) => {
      window.postMessage({
        application: 'Joule',
        prompt: true,
        type,
        args,
      }, '*');

      function handleWindowMessage(ev: MessageEvent) {
        if (!ev.data || ev.data.application !== 'Joule' || ev.data.prompt) {
          return;
        }
        if (ev.data.error) {
          reject(ev.data.error);
        } else {
          resolve(ev.data.data);
        }
        window.removeEventListener('message', handleWindowMessage);
      }
    
      window.addEventListener('message', handleWindowMessage);
    });
  }
}
