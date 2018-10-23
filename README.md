<p align="center">
<img width="360" src="https://camo.githubusercontent.com/6612ae1794fac2ad986fc46e832ad887088cf8f5/68747470733a2f2f692e696d6775722e636f6d2f6278476b3949462e706e67" alt="" data-canonical-src="https://i.imgur.com/bxGk9IF.png" style="max-width:100%;">
</p>

# Safu Chrome Extension

A chrome extension for managing your Ethereum addresses, storing your private
keys securely, and quickly checking to make sure your _funds are safu_.

<a href="https://chrome.google.com/webstore/detail/safu/anlghdchdgbljjcgbigaefjdohfmmmip" target="_blank">
  <img 
  width="240"
  src="https://zapier.cachefly.net/storage/photos/b1e10678e1b4cf297d71c7967c522538.png" style="max-width: 100%;" />
</a>

## Development
1. `yarn`
2. `yarn start`
3. Open Chrome -> More Tools -> Extensions -> Load Unpacked
4. Select the `safu-extension/dist` folder

NOTE: After making changes, you'll need to close and re-open the extension to load the latest build.


## Smart Contract

The smart contract that powers Safu's balance fetching is up at
[wbobeirne/balance-checker](https://github.com/wbobeirne/balance-checker).
That repo will continue to be expanded upon as its own project separately
from the Safu extension.

## About the Team

Safu was put together at ETHSanFrancisco 2018 by the team behind
[Grant.io](https://grant.io/). You can keep up with the project on its
twitter account [@SafuApp](https://twitter.com/SafuApp).