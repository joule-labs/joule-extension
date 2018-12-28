import React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { Form, Select, Checkbox, Input, Button, Modal, Icon, Drawer, message } from 'antd';
import { SelectValue } from 'antd/lib/select';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import DomainLists from './DomainLists';
import { updateNodeUrl, editNodeField } from 'modules/node/actions';
import {
  changeSettings,
  clearSettings,
  addEnabledDomain,
  addRejectedDomain,
  removeEnabledDomain,
  removeRejectedDomain,
} from 'modules/settings/actions';
import {
  Denomination,
  Fiat,
  denominationNames,
  denominationSymbols,
  fiatSymbols,
} from 'utils/constants';
import { typedKeys } from 'utils/ts';
import { AppState } from 'store/reducers';
import InputAddress from '../SelectNode/InputAddress';
import './style.less';

type SettingsKey = keyof AppState['settings'];

interface StateProps {
  settings: AppState['settings'];
  url: AppState['node']['url'];
  readonlyMacaroon: AppState['node']['readonlyMacaroon'];
  adminMacaroon: AppState['node']['adminMacaroon'];
  isNodeChecked: AppState['node']['isNodeChecked'];
  isUpdatingNodeUrl: AppState['node']['isUpdatingNodeUrl'];
  updateNodeUrlError: AppState['node']['updateNodeUrlError'];
  editingNodeField: AppState['node']['editingNodeField'];
}

interface DispatchProps {
  changeSettings: typeof changeSettings;
  clearSettings: typeof clearSettings;
  addEnabledDomain: typeof addEnabledDomain;
  addRejectedDomain: typeof addRejectedDomain;
  removeEnabledDomain: typeof removeEnabledDomain;
  removeRejectedDomain: typeof removeRejectedDomain;
  editNodeField: typeof editNodeField;
  updateNodeUrl: typeof updateNodeUrl;
}

type Props = StateProps & DispatchProps & RouteComponentProps;

class Settings extends React.Component<Props> {

  componentWillUpdate(nextProps: Props) {
    if (this.props.isNodeChecked !== nextProps.isNodeChecked
        && nextProps.isNodeChecked) {
          message.success(`Connected to ${nextProps.url}`, 2);
    }
  }

  render() {
    const { settings, url, readonlyMacaroon, adminMacaroon } = this.props;

    return (
      <Form className="Settings" layout="vertical">
        <div className="Settings-section Settings-currencies">
          <h3 className="Settings-section-title">
            Units & Currencies
          </h3>
          <Form.Item label="Bitcoin unit">
            <Select
              size="large"
              value={settings.denomination}
              disabled={settings.isNoFiat && settings.isFiatPrimary}
              onChange={v => this.handleChangeSelect('denomination', v)}
            >
              {typedKeys(Denomination).map(d => (
                <Select.Option key={d} value={d}>
                  {denominationNames[d]} ({denominationSymbols[d]})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Currency">
            <Select
              size="large"
              disabled={settings.isNoFiat && !settings.isFiatPrimary}
              value={settings.fiat}
              onChange={v => this.handleChangeSelect('fiat', v)}
            >
              {typedKeys(Fiat).map(f => (
                <Select.Option key={f} value={f}>
                  {f} ({fiatSymbols[f]})
                </Select.Option>
              ))}
            </Select>

            <Checkbox
              name="isFiatPrimary"
              checked={settings.isFiatPrimary}
              onChange={this.handleChangeCheckbox}
            >
              Show fiat as primary currency
            </Checkbox>
            <Checkbox
              name="isNoFiat"
              checked={settings.isNoFiat}
              onChange={this.handleChangeCheckbox}
            >
              Disable {settings.isFiatPrimary ? 'bitcoin' : 'fiat'} equivalents
            </Checkbox>
          </Form.Item>
        </div>

        <div className="Settings-section">
          <h3 className="Settings-section-title">
            Approved & Rejected Domains
          </h3>
          <p className="Settings-section-help">
            Approved domains will be able to prompt you, and have access
            to your node info. Rejected domains will automatically be
            rejected without a prompt.
          </p>
          <DomainLists
            enabled={settings.enabledDomains}
            rejected={settings.rejectedDomains}
            removeEnabledDomain={this.props.removeEnabledDomain}
            removeRejectedDomain={this.props.removeRejectedDomain}
            addEnabledDomain={this.props.addEnabledDomain}
            addRejectedDomain={this.props.addRejectedDomain}
          />
        </div>

        <div className="Settings-section">
          <h3 className="Settings-section-title">
            Node
          </h3>
          <Form.Item label="REST API URL">
            <Input.Group compact className="Settings-input-group">
              <Input
                value={url as string}
                disabled
              />
                <Button onClick={this.editNodeUrl}>
                  <Icon type="edit" />
                </Button>
            </Input.Group>
          </Form.Item>
          <Form.Item label="Readonly Macaroon">
            <Input.Group compact className="Settings-input-group">
              <Input
                value={readonlyMacaroon as string}
                disabled
              />
              <Button>
                <Icon type="edit" />
              </Button>
            </Input.Group>
          </Form.Item>
          <Form.Item label="Admin Macaroon">
            <Input.Group compact className="Settings-input-group">
              <Input
                value={adminMacaroon as string || '<encrypted>'}
                disabled
              />
              <Button>
                <Icon type="edit" />
              </Button>
            </Input.Group>
          </Form.Item>
          <Form.Item>
            <Button
              type="default"
              size="large"
              block
              onClick={this.clearSettings}
            >
              Change Password
            </Button>
          </Form.Item>
        </div>
        <div className="Settings-section">
          <h3 className="Settings-section-title">
            Reset
          </h3>
          <Form.Item>
            <Button
              type="danger"
              size="large"
              block
              ghost
              onClick={this.clearSettings}
              >
              Reset All Connection Settings
            </Button>
          </Form.Item>
        </div>

        {this.renderDrawer()}
      </Form>
    );
  }

  private renderDrawer = () => {
    const { url, editingNodeField, isUpdatingNodeUrl, updateNodeUrlError } = this.props

    let title, cmp;

    switch (editingNodeField) {
      case 'url':
        title = 'Provide a URL';
        cmp = (
          <InputAddress
            initialUrl={url as string}
            error={updateNodeUrlError}
            isCheckingNode={isUpdatingNodeUrl}
            submitUrl={this.props.updateNodeUrl}
          />      
        );
        break;
      case 'readonly':
      case 'admin':
          return null;
    }

    return (
      <Drawer
        visible={!!editingNodeField}
        placement="right"
        onClose={this.hideDrawer}
        width="92%"
        title={title}
      >
        {cmp}
      </Drawer>      
    )
  }

  private handleChangeSelect = (key: SettingsKey, value: SelectValue) => {
    this.props.changeSettings({ [key]: value });
  };

  private handleChangeCheckbox = (ev: CheckboxChangeEvent) => {
    this.props.changeSettings({
      [ev.target.name as SettingsKey]: ev.target.checked
    })
  };

  private editNodeUrl = () => this.props.editNodeField('url');
  private hideDrawer = () => this.props.editNodeField(null);

  private clearSettings = () => {
    Modal.confirm({
      title: 'Are you sure?',
      content: `
        You will be returned to the starting screen and be required to
        re-enter your node connection settings and a new password to return.
        All other settings will remain unchanged.
      `,
      onOk: () => {
        this.props.clearSettings();
      },
    });
  };
}

const ConnectedSettings = connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    settings: state.settings,
    url: state.node.url,
    readonlyMacaroon: state.node.readonlyMacaroon,
    adminMacaroon: state.node.adminMacaroon,
    isNodeChecked: state.node.isNodeChecked,
    isUpdatingNodeUrl: state.node.isUpdatingNodeUrl,
    updateNodeUrlError: state.node.updateNodeUrlError,
    editingNodeField: state.node.editingNodeField,
  }),
  {
    changeSettings,
    clearSettings,
    addEnabledDomain,
    addRejectedDomain,
    removeEnabledDomain,
    removeRejectedDomain,
    editNodeField,
    updateNodeUrl,
  },
)(Settings);

export default withRouter(ConnectedSettings);
