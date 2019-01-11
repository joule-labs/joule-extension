// Huge bastardization of ant design's Transfer component
import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, Icon, Drawer, message } from 'antd';
import { updateNodeUrl, updateMacaroons } from 'modules/node/actions';
import { changePassword, setPassword, cancelChangePassword } from 'modules/crypto/actions';
import CreatePassword from 'components/CreatePassword';
import InputAddress from 'components/SelectNode/InputAddress';
import UploadMacaroons from 'components/SelectNode/UploadMacaroons';
import { AppState } from 'store/reducers';

interface StateProps {
  url: AppState['node']['url'];
  readonlyMacaroon: AppState['node']['readonlyMacaroon'];
  adminMacaroon: AppState['node']['adminMacaroon'];
  isNodeChecked: AppState['node']['isNodeChecked'];
  isUpdatingNodeUrl: AppState['node']['isUpdatingNodeUrl'];
  updateNodeUrlError: AppState['node']['updateNodeUrlError'];
  isUpdatingMacaroons: AppState['node']['isUpdatingMacaroons'];
  updateMacaroonsError: AppState['node']['updateMacaroonsError'];
  isChangingPassword: AppState['crypto']['isChangingPassword'];
  password: AppState['crypto']['password'];
}

interface DispatchProps {
  // editNodeField: typeof editNodeField;
  updateNodeUrl: typeof updateNodeUrl;
  updateMacaroons: typeof updateMacaroons;
  changePassword: typeof changePassword;
  cancelChangePassword: typeof cancelChangePassword;
  setPassword: typeof setPassword;
}

type Props = StateProps & DispatchProps;

interface State {
  editingNodeField: null | 'url' | 'macaroons',
}

class NodeSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      editingNodeField: null
    };
  }

  componentWillUpdate(nextProps: Props) {
    const { 
      isNodeChecked, 
      isChangingPassword, 
      password, 
      isUpdatingMacaroons, 
      adminMacaroon, 
      readonlyMacaroon 
    } = this.props;

    if (isNodeChecked !== nextProps.isNodeChecked && nextProps.isNodeChecked) {
          // isNodeChecked false -> true
          message.success(`Connected to ${nextProps.url}`, 2);
          this.hideDrawer();
    }
    if (isChangingPassword !== nextProps.isChangingPassword && !isChangingPassword
        && password !== nextProps.password) {
          // isChangingPassword true -> false and password changed
          message.success('Password Updated', 2);
    }
    const macaroonsChanged = adminMacaroon !== nextProps.adminMacaroon
      || readonlyMacaroon !== nextProps.readonlyMacaroon;
    if (isUpdatingMacaroons && macaroonsChanged) {
        // isUpdatingMacaroons is true and a macaroon changed
        message.success('Macaroons Updated', 2);
        this.hideDrawer();
      }
  }

  render() {
    const { url, readonlyMacaroon, adminMacaroon } = this.props;

    return (
      <>
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
        <Form.Item label="Admin Macaroon">
          <Input.Group compact className="Settings-input-group">
            <Input
              value={adminMacaroon as string || '<encrypted>'}
              disabled
            />
            <Button onClick={this.editMacaroons}>
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
            <Button onClick={this.editMacaroons}>
              <Icon type="edit" />
            </Button>
          </Input.Group>
        </Form.Item>
        <Form.Item>
          <Button
            type="default"
            size="large"
            block
            onClick={this.props.changePassword}
          >
            Change Password
          </Button>
        </Form.Item>

        {this.renderDrawer()}
      </>
    )
  }

  private handleMacaroons = (adminMacaroon: string, readonlyMacaroon: string) => {
    const { url } = this.props;
    this.props.updateMacaroons(url as string, adminMacaroon, readonlyMacaroon);
  };

  private renderDrawer = () => {
    const { 
      url,
      adminMacaroon,
      readonlyMacaroon,
      isUpdatingNodeUrl, 
      updateNodeUrlError,
      isUpdatingMacaroons,
      updateMacaroonsError,
      isChangingPassword,
    } = this.props
    const { editingNodeField } = this.state;

    let title;
    let cmp;

    if (isChangingPassword) {
      title = 'Change your password';
      cmp = <CreatePassword onCreatePassword={this.props.setPassword} title="" />;
    } else if (editingNodeField === 'url') {
      title = 'Provide a URL';
      cmp = (
        <InputAddress
          initialUrl={url as string}
          error={updateNodeUrlError}
          isCheckingNode={isUpdatingNodeUrl}
          submitUrl={this.props.updateNodeUrl}
        />      
      );
    } else if (editingNodeField === 'macaroons') {
      title = 'Upload Macaroons';
      cmp = (
        <UploadMacaroons
          onUploaded={this.handleMacaroons}
          isSaving={isUpdatingMacaroons}
          initialAdmin={adminMacaroon || undefined}
          initialReadonly={readonlyMacaroon || undefined}
          error={updateMacaroonsError ? updateMacaroonsError.message : undefined}
        />
      );
    }

    return (
      <Drawer
        visible={!!cmp}
        placement="right"
        onClose={this.hideDrawer}
        width="92%"
        title={title}
      >
        {cmp}
      </Drawer>      
    )
  };

  private editNodeUrl = () => this.setState({ editingNodeField: 'url' });
  private editMacaroons = () => this.setState({ editingNodeField: 'macaroons' });
  private hideDrawer = () => this.props.isChangingPassword 
    ? this.props.cancelChangePassword() : this.setState({ editingNodeField: null });

}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    url: state.node.url,
    readonlyMacaroon: state.node.readonlyMacaroon,
    adminMacaroon: state.node.adminMacaroon,
    isNodeChecked: state.node.isNodeChecked,
    isUpdatingNodeUrl: state.node.isUpdatingNodeUrl,
    updateNodeUrlError: state.node.updateNodeUrlError,
    isUpdatingMacaroons: state.node.isUpdatingMacaroons,
    updateMacaroonsError: state.node.updateMacaroonsError,
    isChangingPassword: state.crypto.isChangingPassword,
    password: state.crypto.password,
  }),
  {
    updateNodeUrl,
    updateMacaroons,
    changePassword,
    cancelChangePassword,
    setPassword,
  },
)(NodeSettings);