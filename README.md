# Joule Extension for Lightning

A chrome extension that lightning-charges your browser with
[webln](https://github.com/wbobeirne/webln), giving you
the ability to pay and use your node as an identity on the web.

**WARNING: Joule is in early alpha, and should not be used for large mainnet funds**


## Development

1. Run `yarn install && yarn run build:dev`
2. Open Chrome -> More Tools -> Extensions
3. Toggle "Developer mode" (if such a toggle exists)
4. Click "Load unpacked"
5. Select the `joule-extension/dist-dev` folder you created
6. Get to work!

If you're also working on [`webln`](https://github.com/wbobeirne/webln), you'll
want to clone and build that repository, and run `yarn link`. Then come back
to the joule folder and run `yarn link webln`.

NOTE: After making changes, you'll need to close and re-open the extension to load the latest build.

## Building

To make a production build, follow these steps

1. Run `yarn build`
2. Raw files and a zip of them will be output to `dist-prod`

## Releasing

1. Bump the version number in `package.json` and `static/manifest.json`
2. Create a git tag called `v${version}` and push it
3. Run a build
4. Make a new Github release, upload the build assets, write a changelog
5. Upload the built zip to the Chrome developer dashboard, Firefox addons site, and Opera addons site

## Testing

...regrettably, TBD

## Shoutouts

* Thanks to the [MetaMask](http://github.com/Metamask) team for establishing
a ton of the UX best practices for browser crypto payments.
* Thanks to [@afilini](https://github.com/afilini) for providing a small prototype
reference implementation of the extension flow.
* Thanks to [Chaincode Labs](https://chaincode.com) for putting together the 2018
Lightning residency, where this was born.
