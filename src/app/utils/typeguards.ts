import { AnyTransaction, LightningPaymentWithToNode } from 'modules/account/types';
import { LightningInvoice, ChainTransaction } from 'lib/lnd-http';

export function isInvoice(source: AnyTransaction): source is LightningInvoice {
  return !!(source as LightningInvoice).expiry;
}

export function isChainTx(source: AnyTransaction): source is ChainTransaction {
  return !!(source as ChainTransaction).tx_hash;
}

export function isPayment(source: AnyTransaction): source is LightningPaymentWithToNode {
  return !!(source as LightningPaymentWithToNode).payment_preimage;
}
