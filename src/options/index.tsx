import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from '../app/index';
import Routes from '../app/AppRoutes';

import './index.less';

ReactDOM.render(
  <App routes={<Routes />} /> as any,
  document.getElementById('root') as HTMLElement,
);
