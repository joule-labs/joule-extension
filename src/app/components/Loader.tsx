import React from 'react';
import { Icon } from 'antd';

const Loader: React.SFC = () => (
  <Icon
    type="loading"
    theme="outlined"
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#8E44AD',
    }}
  />
);

export default Loader;