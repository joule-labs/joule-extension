import { RequestInvoiceArgs } from 'webln';
import { Notifications } from 'webextension-polyfill-ts';
import { PROMPT_TYPE } from '../webln/types';

export interface BaseMessage {
  application: 'Joule';
}

// Prompt messages
export interface OriginData {
  domain: string;
  name: string;
  icon: string;
}

export interface PromptMessage<T extends PROMPT_TYPE, A extends object | undefined>
  extends BaseMessage {
  prompt: true;
  type: T;
  args: A;
  origin: OriginData;
}

export type AuthorizePromptMessage = PromptMessage<PROMPT_TYPE.AUTHORIZE, undefined>;
export type InfoPromptMessage = PromptMessage<PROMPT_TYPE.INFO, undefined>;
export type PaymentPromptMessage = PromptMessage<
  PROMPT_TYPE.PAYMENT,
  { paymentRequest: string }
>;
export type InvoicePromptMessage = PromptMessage<PROMPT_TYPE.INVOICE, RequestInvoiceArgs>;
export type SignPromptMessage = PromptMessage<PROMPT_TYPE.SIGN, { message: string }>;
export type VerifyPromptMessage = PromptMessage<
  PROMPT_TYPE.VERIFY,
  { signature: string; msg: string }
>;

export type AnyPromptMessage =
  | AuthorizePromptMessage
  | InfoPromptMessage
  | PaymentPromptMessage
  | InvoicePromptMessage
  | SignPromptMessage
  | VerifyPromptMessage;

export function isPromptMessage(msg: any): msg is AnyPromptMessage {
  return msg && msg.application === 'Joule' && msg.prompt === true;
}

// Response messages
export interface ResponseMessage extends BaseMessage {
  response: true;
}

export interface ResponseDataMessage<T> extends ResponseMessage {
  data: T;
  error?: undefined;
}

export interface ResponseErrorMessage extends ResponseMessage {
  error: string;
  data?: undefined;
}

// Context menu message
export interface ContextMenuMessage extends BaseMessage {
  contextMenu: true;
  args: {
    paymentRequest: string;
  };
}

// Notification messages
export interface NotificationMessage extends BaseMessage {
  notification: true;
  args: {
    method: 'create' | 'update' | 'clear';
    id?: string;
    options?: Notifications.CreateNotificationOptions;
  };
}

export function isNotificationMessage(msg: any): msg is NotificationMessage {
  return msg && msg.application === 'Joule' && msg.notification === true;
}

// Password messages
export interface SetPasswordMessage extends BaseMessage {
  setPassword: true;
  data: {
    password: string;
  };
}

export interface GetPasswordMessage extends BaseMessage {
  getPassword: true;
}

export interface ClearPasswordMessage extends BaseMessage {
  clearPassword: true;
}

export interface CachedPasswordMessage extends BaseMessage {
  cachedPassword: true;
  data: string;
}

// Any of the above messages
export type AnyMessage =
  | ResponseDataMessage<any>
  | ResponseErrorMessage
  | ContextMenuMessage
  | SetPasswordMessage
  | GetPasswordMessage
  | ClearPasswordMessage
  | CachedPasswordMessage;
