import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Menu, Dropdown, Icon } from 'antd';

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
      </Menu>
    );

    return (
      <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
        <Button icon="ellipsis" />
      </Dropdown>
    );
  }

  private openFullPage = () => {
    chrome.runtime.openOptionsPage();
  };
}
