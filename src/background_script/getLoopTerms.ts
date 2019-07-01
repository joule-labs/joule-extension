import runSelector from '../content_script/runSelector';
import { LoopHttpClient } from 'lib/loop-http';
import { selectSyncedUnencryptedLoopState } from 'modules/node/selectors';
import { GetLoopTermsResponse } from 'lib/loop-http/types';

export default async function getLoopTerms(): Promise<GetLoopTermsResponse> {
  const state = await runSelector(
    selectSyncedUnencryptedLoopState,
    'loop-unencrypted',
    'loop',
  );
  if (!state.loopUrl) {
    throw new Error('Loop has not been set up');
  }

  const client = new LoopHttpClient(state.loopUrl);
  const info = await client.getLoopTerms();

  return {
    swap_payment_dest: info.swap_payment_dest,
    swap_fee_base: info.swap_fee_base,
    swap_fee_rate: info.swap_fee_rate,
    prepay_amt: info.prepay_amt,
    min_swap_amount: info.min_swap_amount,
    max_swap_amount: info.max_swap_amount,
    cltv_delta: info.cltv_delta,
  };
}
