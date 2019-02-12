const API_URL = 'https://bitcoinfees.earn.com/api/v1/fees/recommended';

export async function apiFetchOnChainFees() {
  const res = await fetch(API_URL);
  return await res.json();
}