import { browser, Menus } from 'webextension-polyfill-ts';
import { isValidPaymentReq } from 'utils/validators';
import { getOriginData } from 'utils/prompt';
import { openPrompt } from './handlePrompts';
import { PROMPT_TYPE } from '../webln/types';

export default function handleContextMenu() {
  // Store the current highlighted payment request from right-click events
  let currentPaymentRequest: string;

  // Add an entry to the right-click menu, hidden by default
  browser.contextMenus.create({
    id: 'pay-with-joule',
    title: 'Pay Lightning Invoice',
    contexts: ['selection', 'page'],
    visible: false,
    onclick: (info: Menus.OnClickData) => {
      if (info.menuItemId === 'pay-with-joule') {
        // open the payment prompt
        openPrompt({
          type: PROMPT_TYPE.PAYMENT,
          args: { paymentRequest: currentPaymentRequest },
          origin: getOriginData()
        });
      }
    }
  });

  // Add a message listener that shows the menu item when applicable
  browser.runtime.onMessage.addListener((request: any) => {
    if (!request || request.application !== 'Joule' || !request.contextMenu) {
      return;
    }

    // set context menu visibility based on right-clicked text
    currentPaymentRequest = request.args.paymentRequest.trim();
    const visible = isValidPaymentReq(currentPaymentRequest);
    browser.contextMenus.update('pay-with-joule', { visible });
  });
}