import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Menu, Dropdown, Icon } from 'antd';
import { browser } from 'webextension-polyfill-ts';
import PeersModal from 'components/PeersModal';
import OpenChannelModal from 'components/OpenChannelModal';
import { clearPasswordCache } from 'utils/background';
import MenuIcon from 'static/images/menu.svg';
import './SettingsMenu.less';

interface State {
  isChannelModalOpen: boolean;
  isPeersModalOpen: boolean;
}

export default class SettingsMenu extends React.Component<{}, State> {
  state: State = {
    isChannelModalOpen: false,
    isPeersModalOpen: false,
  };

  render() {
    const { isPeersModalOpen, isChannelModalOpen } = this.state;
    const menu = (
      <Menu>
        <Menu.Item key="channel" onClick={this.openChannelModal}>
          <a>
            <Icon type="fork" /> Open channel
          </a>
        </Menu.Item>
        <Menu.Item key="peers" onClick={this.openPeersModal}>
          <a>
            <Icon type="team" /> Manage peers
          </a>
        </Menu.Item>
        <Menu.Item key="balances">
          <Link to="/balances">
            <Icon type="pie-chart" /> Balances
          </Link>
        </Menu.Item>
        <Menu.Divider />
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
      <>
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
        <PeersModal
          isVisible={isPeersModalOpen}
          handleClose={this.closePeersModal}
        />
        <OpenChannelModal
          isVisible={isChannelModalOpen}
          handleClose={this.closeChannelModal}
        />
      </>
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

  private openChannelModal = () => this.setState({ isChannelModalOpen: true });
  private closeChannelModal = () => this.setState({ isChannelModalOpen: false });
  private openPeersModal = () => this.setState({ isPeersModalOpen: true });
  private closePeersModal = () => this.setState({ isPeersModalOpen: false });
}
