import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import SettingsMenu from 'components/SettingsMenu';
import Logo from 'static/images/logo.png';
import './style.less';

interface Props {
  title?: React.ReactNode;
  showBack?: boolean;
}

export default class Header extends React.Component<Props> {
  public render() {
    const { title, showBack } = this.props;
    return (
      <>
        <div className="Header">
          {showBack ? (
            <Link className="Header-back" to="/gwangkjawg">
              <Icon type="left" />
            </Link>
          ) : (
            <div className="Header-icon">
              <img src={Logo} />
            </div>
          )}
          {title ? (
            <h1 className="Header-title">{title}</h1>
          ) : (
            <div className="Header-alpha">A L P H A</div>
          )}
          <div className="Header-menu">
            <SettingsMenu />
          </div>
        </div>
        <div className="HeaderPlaceholder" />
      </>
  }
}