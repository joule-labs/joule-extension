import React from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import SettingsMenu from 'components/SettingsMenu';
import Logo from 'static/images/logo.png';
import './style.less';

export interface Props {
  title?: React.ReactNode;
  showBack?: boolean;
  hideHeader?: boolean;
  children: React.ReactNode;
}

export default class Template extends React.Component<Props> {
  render() {
    const { title, showBack, hideHeader, children } = this.props;

    return (
      <div className="Template">
        <div className="Template-inner">
          <div className={classnames('Template-header', hideHeader && 'is-hidden')}>
            {showBack ? (
              <Link className="Template-header-back" to="/">
                <Icon type="left" />
              </Link>
            ) : (
              <div className="Template-header-icon">
                <img src={Logo} />
              </div>
            )}
            {title ? (
              <h1 className="Template-header-title">{title}</h1>
            ) : (
              <div className="Template-header-alpha">A L P H A</div>
            )}
            <div className="Template-header-menu">
              <SettingsMenu />
            </div>
          </div>
          <div
            className={classnames(
              'Template-headerPlaceholder',
              hideHeader && 'is-hidden',
            )}
          />

          <div className="Template-content">{children}</div>
        </div>
      </div>
    );
  }
}
