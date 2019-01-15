import {
  LndHttpClient,
  GetNodeInfoResponse,
  AlreadyConnectedError,
} from 'lib/lnd-http';

export function sleep(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

// Run getNodeInfo, but if it fails, return a spoofed node object
export async function safeGetNodeInfo(
  lib: LndHttpClient,
  pubkey: string,
): Promise<GetNodeInfoResponse> {
  try {
    const node = await lib.getNodeInfo(pubkey);
    return node;
  } catch(err) {
    return {
      total_capacity: 0,
      num_channels: 0,
      node: {
        alias: '<Offline node>',
        color: '000000',
        addresses: [],
        last_update: 0,
        pub_key: pubkey,
      },
    };
  }
}

// Run connectPeer, but if it fails due to duplicate, just ignore
export async function safeConnectPeer(
  lib: LndHttpClient,
  address: string,
): Promise<any> {
  try {
    lib.connectPeer(address);
  } catch(err) {
    if (err === AlreadyConnectedError) {
      return;
    }
    throw err;
  }
}
