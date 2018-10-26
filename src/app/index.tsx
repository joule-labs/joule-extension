import '@babel/polyfill';
import './style.less';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import SyncGate from 'components/SyncGate';
import PasswordPrompt from 'components/PasswordPrompt';
import { configureStore } from 'store/configure';

const { store } = configureStore();

interface Props {
  routes: React.ReactNode;
}

const App: React.SFC<Props> = ({ routes }) => (
  <Provider store={store}>
    <SyncGate>
      <MemoryRouter>
        {routes}
      </MemoryRouter>
      <PasswordPrompt />
    </SyncGate>
  </Provider>
);

export default App;