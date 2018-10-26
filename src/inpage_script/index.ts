import WebLNProvider from '../webln/provider';

if (document.currentScript) {
  (window as any).webln = new WebLNProvider();
} else {
  console.warn('Joule failed to inject WebLN provider, missing extension id');
}
