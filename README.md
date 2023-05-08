_**NOTICE:** Joule is no longer being actively developed. You can find other WebLN browser extensions that are actively maintained in the [WebLN documentation](https://webln.dev/#/). This repository now primarily serves as a learning resource for aspiring WebLN developers. Thanks for the support._

---

<p align="center">
<a href="https://lightningjoule.com"><img src="https://camo.githubusercontent.com/ff4a641fba4f90ea2a24413d8874bb464883685d/68747470733a2f2f692e696d6775722e636f6d2f595968594335652e706e67" alt="Joule, get it now at lightningjoule.com" data-canonical-src="https://i.imgur.com/YYhYC5e.png" style="max-width:100%;" width="400"></a>
</p>

## Overview

A browser extension that lightning-charges your browser with
[webln](https://github.com/wbobeirne/webln), giving you
the ability to pay and use your node as an identity on the web.

**WARNING: Joule is no longer acitvely developed, and should not be used for large mainnet funds**

## Project Layout

```bash
joule-extension/
├── src                   # All source code
│   ├── app                 # The main React app, used by the other clients
│   │   ├── index.tsx         # Entry point for the app
│   │   ├── AppRoutes.tsx     # Routes used in the popup and options clients
│   │   ├── PromptRoutes.tsx  # Routes used in the prompt client
│   │   ├── components        # All reusable components
│   │   ├── lib               # Standalone libraries, potentially split into node modules
│   │   ├── modules           # Vertical slices of business logic, mostly redux code
│   │   ├── pages             # Container components for app routes
│   │   ├── prompts           # Container components for prompts
│   │   ├── static            # Static assets that are compiled and processed
│   │   ├── store             # Redux setup and configuration
│   │   ├── style             # Global or common-use styles
│   │   ├── typings           # Module typings for TypeScript
│   │   └── utils             # Miscellanious utility functions and constants
│   ├── background_script  # Extension background script
│   ├── content_script     # Extension content script, injects inpage_script and communicates with background_script
│   ├── inpage_script      # In-page injected script, manages WebLN
│   ├── options            # Options client, full screen version of the app
│   ├── popup              # Popup client, opened by clicking icon in toolbar
│   ├── prompt             # Prompt client, opened by WebLN and BOLT-11 links
│   └── webln              # WebLN implementation, injected via inpage_script
├── static             # Static assets that don't go through any processing
├── dist-dev           # Developer builds go here, not checked into git
└── dist-prod          # Production builds go here, not checked into git
```

## Development

1. Run `yarn install && yarn run dev`
2. Open Chrome -> More Tools -> Extensions
3. Toggle "Developer mode" (if such a toggle exists)
4. Click "Load unpacked"
5. Select the `joule-extension/dist-dev` folder you created
6. Get to work!

If you're also working on [`webln`](https://github.com/wbobeirne/webln), you'll
want to clone and build that repository, and run `yarn link`. Then come back
to the joule folder and run `yarn link webln`.

NOTE: After making changes, you'll need to close and re-open the extension to load the latest build.

Redux DevTools:

1. Open the extension popup or full page
2. Right click on the background
3. Choose Redux Devtools -> Open Remote DevTools
4. A new window will open displaying the Redux actions list

React DevTools:

1. Run `npm install -g react-devtools`
2. Be sure to use `yarn run dev` to build the app
3. Run `react-devtools` in a new Terminal
4. A new window will open displaying the React vdom inspector

React Hot Reload:

1. Run `yarn run hot` instead of `yarn run dev`

## Building

To make a production build, follow these steps

1. Run `yarn build`
2. Raw files and a zip of them will be output to `dist-prod`

## Releasing

1. Bump the version number in `package.json` and `static/manifest.json` and commit it to develop
2. Create a git tag called `v${version}` and push it
3. CI will make a release with the assets uploaded and place it in draft
4. Build the release locally with Docker and sign the manifest with
   ```sh
   yarn build:docker && cd dist-docker && gpg --output manifest-[version].wbobeirne.sig --detach-sig manifest.txt
   ```
5. Download the `manifest-[version].txt` from the release and verify it with the signature you just made
   ```sh
   gpg --verify manifest-[version].wbobeirne.sig manifest-[version].txt
   ```
6. Upload the built zip to the Chrome developer dashboard + Firefox addons site

## Testing

...regrettably, TBD

## Contributing

Please see the [Contributor Guidelines on the Wiki](https://github.com/wbobeirne/joule-extension/wiki/Contributor-Guidelines).

## Shoutouts

- Thanks to the [MetaMask](http://github.com/Metamask) team for establishing
  a ton of the UX best practices for browser crypto payments.
- Thanks to [@afilini](https://github.com/afilini) for providing a small prototype
  reference implementation of the extension flow.
- Thanks to [Chaincode Labs](https://chaincode.com) for putting together the 2018
  Lightning residency, where this was born.
