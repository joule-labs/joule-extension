import { LndHttpClient, GetNodeInfoResponse } from 'lib/lnd-http';

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
  } catch (err) {
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