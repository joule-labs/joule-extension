import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Menu, Dropdown, Icon } from 'antd';
import { browser } from 'webextension-polyfill-ts';
import { clearPasswordCache } from 'utils/background';
import MenuIcon from 'static/images/menu.svg';
import './SettingsMenu.less';

export default class SettingsMenu extends React.Component {
  render() {
    const menu = (
      <Menu>
        <Menu.Item key="settings">
          <Link to="/settings">
            <Icon type="setting" /> Settings
          </Link>
        </Menu.Item>
        <Menu.Item key="full" onClick={this.openFullPage}>
          <a>
            <Icon type="fullscreen" /> Full page
          </a>
        </Menu.Item>
        <Menu.Item key="clear" onClick={this.clearAuth}>
          <a>
            <Icon type="lock" /> Lock account
          </a>
        </Menu.Item>
      </Menu>
    );

    return (
      <Dropdown
        className="SettingsMenu"
        overlay={menu}
        placement="bottomRight"
        trigger={['click']}
      >
        <Button className="SettingsMenu-button" shape="circle">
          <Icon component={MenuIcon} />
        </Button>
      </Dropdown>
    );
  }

  private openFullPage = () => {
    browser.runtime.openOptionsPage();
    setTimeout(window.close, 100);
  };

  private clearAuth = () => {
    clearPasswordCache();
    setTimeout(window.close, 100);
  };
}
