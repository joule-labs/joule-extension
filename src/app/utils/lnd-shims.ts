/**
 * @file
 * These utilities provide convenient ways to handle API responses from
 * multiple versions of LND.
 */

import { Hop, LightningPayment } from 'lib/lnd-http';

export function getPaymentHops(payment: LightningPayment) {
  let path: Partial<Hop>[] = [];
  if (payment.htlcs?.[0]) {
    path = payment.htlcs[0].route.hops;
  } else if (payment.path) {
    path = payment.path.map(p => ({
      pub_key: p,
    }));
  }
  return path;
}

export function getPaymentRecipientPubkey(payment: LightningPayment) {
  const path = getPaymentHops(payment);
  return path[path.length - 1].pub_key;
}
