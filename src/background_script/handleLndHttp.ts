import { browser } from 'webextension-polyfill-ts';
import {
  LndHttpClient,
  LndAPIRequestMessage,
  LndAPIResponseMessage,
  LndAPIMethod,
  LndAPIResponseError,
} from '../lnd/http';

function isLndRequestMessage(req: any): req is LndAPIRequestMessage<LndAPIMethod> {
  if (req && req.type === 'lnd-api-request') {
    return true;
  }
  return false;
}

export default function handleLndHttp() {
  // Background manages communication between page and its windows
  browser.runtime.onMessage.addListener(async (request: unknown) => {
    if (!isLndRequestMessage(request)) {
      return;
    }

    const client = new LndHttpClient(request.url, request.macaroon);
    const fn = client[request.method] as LndHttpClient[typeof request.method];
    const args = request.args as Parameters<LndHttpClient[typeof request.method]>;

    return (fn as any)(...args)
      .then((data: ReturnType<LndHttpClient[typeof request.method]>) => {
        return {
          type: 'lnd-api-response',
          method: request.method,
          data,
        } as LndAPIResponseMessage<typeof request.method>;
      })
      .catch((err: LndAPIResponseError) => {
        return {
          type: 'lnd-api-response',
          method: request.method,
          error: err,
        } as LndAPIResponseMessage<typeof request.method>;
      });
  });
}
