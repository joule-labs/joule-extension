import React from 'react';
import classnames from 'classnames';
import { Icon, Button } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import './style.less';

interface Props {
  type?: 'default' | 'error';
  icon?: string;
  title: string;
  message: string;
  button?: ButtonProps;
}

export default class BigMessage extends React.Component<Props> {
  render() {
    const props = {
      type: 'default',
      icon: this.props.type === 'error' ? 'exclamation-circle' : undefined,
      ...this.props,
    };
    const { title, message, button, icon, type } = props;

    return (
      <div className={classnames('BigMessage', `is-${type}`)}>
        <h2 className="BigMessage-title">
          {icon && <Icon type={icon} className="BigMessage-title-icon" />}
          {title}
        </h2>
        <p className="BigMessage-message">{message}</p>
        {button && (
          <div className="BigMessage-buttons">
            <Button size="large" {...button} />
          </div>
        )}
      </div>
    );
  }
}
