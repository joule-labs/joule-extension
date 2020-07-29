enum AppconfTypes {
  SET_APP_CONFIG = 'SET_APP_CONFIG',
  DELETE_APP_CONFIG = 'DELETE_APP_CONFIG',

  SET_APPCONF = 'SET_APPCONF',
}

export interface Allowance {
  active: boolean;
  notifications: boolean;
  total: number;
  balance: number;
  maxPerPayment: number;
  minIntervalPerPayment: number;
  lastPaymentAttempt: number;
}

export interface AppConfig {
  allowance: Allowance | null;
}

export default AppconfTypes;
