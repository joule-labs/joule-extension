import {
  GetNodeInfoResponse,
  AlreadyConnectedError,
  LightningNode,
  LndAPI,
} from 'lnd/message';

export function sleep(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

export const OFFLINE_NODE: LightningNode = {
  alias: '<Offline node>',
  color: '000000',
  addresses: [],
  last_update: 0,
  pub_key: '',
};

export const UNKNOWN_NODE: LightningNode = {
  alias: '<Unknown node>',
  color: '000000',
  addresses: [],
  last_update: 0,
  pub_key: '',
};

// Run getNodeInfo, but if it fails, return a spoofed node object
export async function safeGetNodeInfo(
  lib: LndAPI,
  pubkey: string,
): Promise<GetNodeInfoResponse> {
  if (!pubkey) {
    return {
      total_capacity: 0,
      num_channels: 0,
      node: UNKNOWN_NODE,
    };
  }

  try {
    const node = await lib.getNodeInfo(pubkey);
    return node;
  } catch (err) {
    return {
      total_capacity: 0,
      num_channels: 0,
      node: {
        ...OFFLINE_NODE,
        pub_key: pubkey,
      },
    };
  }
}

// Run connectPeer, but if it fails due to duplicate, just ignore
export async function safeConnectPeer(lib: LndAPI, address: string): Promise<any> {
  try {
    lib.connectPeer(address);
  } catch (err) {
    if (err === AlreadyConnectedError) {
      return;
    }
    throw err;
  }
}
