import React from 'react';
import { Popover, Icon } from 'antd';
import './index.less';

interface Props {
  title?: string;
  children: React.ReactNode;
}

const Help: React.SFC<Props> = ({ children, title }) => (
  <Popover content={children} title={title} arrowPointAtCenter>
    <div className="Help">
      <Icon type="question-circle" theme="filled" />
    </div>
  </Popover>
);

export default Help;
