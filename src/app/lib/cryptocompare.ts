const API_URL = 'https://min-api.cryptocompare.com/data/price';

export function apiFetchRates(fsym: string, tsyms: string[]) {
  return fetch(`${API_URL}?fsym=${fsym}&tsyms=${tsyms.join(',')}`)
    .then(res => res.json());
}
