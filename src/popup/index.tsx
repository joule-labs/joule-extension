import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from '../app/index';

import './index.less';

ReactDOM.render(
  <App /> as any,
  document.getElementById('root') as HTMLElement,
);
