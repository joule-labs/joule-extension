import types, { AppConfig } from './types';

export interface AppconfState {
  configs: { [domain: string]: AppConfig };
}

export const INITIAL_STATE: AppconfState = {
  configs: {},
};

export default function channelsReducers(
  state: AppconfState = INITIAL_STATE,
  action: any,
): AppconfState {
  switch (action.type) {
    case types.SET_APP_CONFIG:
      return {
        ...state,
        configs: {
          ...state.configs,
          [action.payload.domain]: {
            ...action.payload.config,
          },
        },
      };

    case types.DELETE_APP_CONFIG:
      return {
        ...state,
        configs: Object.keys(state.configs).reduce(
          (prev, domain) => {
            if (domain !== action.payload) {
              prev[domain] = state.configs[domain];
            }
            return prev;
          },
          {} as AppconfState['configs'],
        ),
      };

    case types.SET_APPCONF:
      return {
        ...state,
        ...action.payload,
      };
  }

  return state;
}
