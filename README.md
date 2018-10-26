# Joule Extension for Lightning

A chrome extension that lightning-charges your browser with
[webln](https://github.com/wbobeirne/webln), giving you
the ability to pay and use your node as an identity on the web.

**WARNING: Joule is in early alpha, and should not be used for large mainnet funds**


## Development

Beyond the typical `npm install / yarn` dependencies, Joule relies on the
unpublished [webln](https://github.com/wbobeirne/webln) package, so you'll
need to clone and build that repository, run `yarn link` in it,
and then run `yarn link webln` in this one. After that, you're good to go!

1. `yarn start`
2. Open Chrome -> More Tools -> Extensions -> Load Unpacked
3. Select the `joule-extension/dist` folder you created
4. Get to work!

NOTE: After making changes, you'll need to close and re-open the extension to load the latest build.

## Deploying

TBD

## Testing

...regrettably, TBD

## Shoutouts

* Thanks to the [MetaMask](http://github.com/Metamask) team for establishing
a ton of the UX best practices for browser crypto payments.
* Thanks to [@afilini](https://github.com/afilini) for providing a small prototype
reference implementation of the extension flow.
* Thanks to [Chaincode Labs](https://chaincode.com) for putting together the 2018
Lightning residency, where this was born.