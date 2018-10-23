import '@babel/polyfill';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import SyncGate from 'components/SyncGate';
import { configureStore } from 'store/configure';
import Routes from './Routes';

const initialState = window && (window as any).__PRELOADED_STATE__;
const { store } = configureStore(initialState);

const App = () => (
  <Provider store={store}>
    <SyncGate>
      <MemoryRouter>
        <Routes />
      </MemoryRouter>
    </SyncGate>
  </Provider>
);

export default App;