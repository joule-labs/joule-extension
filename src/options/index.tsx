import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from '../app/index';
import Routes from '../app/AppRoutes';

import './index.less';

process.env.APP_CONTAINER = 'page';

ReactDOM.render(
  <App routes={<Routes />} /> as any,
  document.getElementById('root') as HTMLElement,
);
