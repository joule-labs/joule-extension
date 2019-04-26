const API_URL = 'https://bitcoinfees.earn.com/api/v1/fees/recommended';

export async function apiFetchOnChainFees() {
  const res = await fetch(API_URL);
  const rates = await res.json();
  return {
    auto: 0, // set auto to 0 so LND can determine the fee
    ...rates,
  };
}
