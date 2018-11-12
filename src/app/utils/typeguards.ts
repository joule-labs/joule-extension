import { AnyTransaction, LightningPaymentWithToNode } from 'modules/account/types';
import { LightningInvoice, BitcoinTransaction } from 'lib/lnd-http';

export function isInvoice(source: AnyTransaction): source is LightningInvoice {
  return !!(source as LightningInvoice).expiry;
}

export function isBitcoinTx(source: AnyTransaction): source is BitcoinTransaction {
  return !!(source as BitcoinTransaction).tx_hash;
}

export function isPayment(source: AnyTransaction): source is LightningPaymentWithToNode {
  return !!(source as LightningPaymentWithToNode).payment_preimage;
}
