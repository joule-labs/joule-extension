import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import SettingsMenu from 'components/SettingsMenu';
import Logo from 'static/images/logo.png';
import './style.less';

interface Props {
  children: React.ReactNode;
}

export default class Template extends React.Component<Props> {
  render() {
    const showBack = false;
    const title = '';

    return (
      <div className="Template">
        <div className="Template-inner">
          <div className="Template-header">
            {showBack ? (
              <Link className="Template-header-back" to="/gwangkjawg">
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
          <div className="Template-headerPlaceholder" />
          <div className="Template-content">
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}