import React from 'react';
import { Alert, Button, Form, Icon, Input, Upload } from 'antd';
import { blobToHex } from 'utils/file';
import { DEFAULT_LND_DIRS, NODE_TYPE } from 'utils/constants';
import './UploadMacaroons.less';
import { checkAuth } from 'modules/node/actions';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';

interface StateProps {
  url: AppState['node']['url'];
  nodeInfo: AppState['node']['nodeInfo'];
  isCheckingAuth: AppState['node']['isCheckingAuth'];
  checkAuthError: AppState['node']['checkAuthError'];
}

interface DispatchProps {
  checkAuth: typeof checkAuth;
}

interface OwnProps {
  error?: string;
  isSaving?: boolean;
  initialAdmin?: string;
  initialReadonly?: string;
  nodeType?: NODE_TYPE,
}

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps;

interface State {
  admin: string;
  readonly: string;
  isShowingHexInputs: boolean;
  error?: string;
}

class UploadMacaroon extends React.Component<Props, State> {
  state: State = {
    admin: this.props.initialAdmin || '',
    readonly: this.props.initialReadonly || '',
    isShowingHexInputs: false,
    error: this.props.error
  };

  componentDidUpdate(prevProps: Props) {
    if (this.props.nodeInfo) {
      this.props.history.push('/onboarding-node-confirm')
    }
    if (prevProps.error !== this.props.error) {
      this.setState({error: this.props.error});
    }
  }

  render() {
    const {checkAuthError, nodeType} = this.props;
    const {error, admin, readonly, isShowingHexInputs} = this.state;
    const dirs = (nodeType && DEFAULT_LND_DIRS[nodeType]) || DEFAULT_LND_DIRS[NODE_TYPE.LOCAL];
    return (
      <div>
        <h2 className="SelectNode-title">Upload Macaroons</h2>
        <Form layout="vertical" className="UploadMacaroons">
          <div className="UploadMacaroons-description">
            We need to authenticate with your node using macaroons. Your admin
            macaroon will be encrypted, and payments will <em>never</em> be
            made
            without your explicit approval.
          </div>

          {isShowingHexInputs ? (
            <>
              <Form.Item label="Admin macaroon">
                <Input
                  name="admin"
                  value={admin}
                  onChange={this.handleChangeMacaroonHex}
                  placeholder="Paste hex string here"
                />
              </Form.Item>
              <Form.Item label="Readonly macaroon">
                <Input
                  name="readonly"
                  value={readonly}
                  onChange={this.handleChangeMacaroonHex}
                  placeholder="Paste hex string here"
                />
              </Form.Item>
            </>
          ) : (
            <>
              <Upload.Dragger
                accept=".macaroon"
                showUploadList={false}
                beforeUpload={
                  (file) => this.handleMacaroonUpload('admin', file)
                }
              >
                <p className="ant-upload-drag-icon">
                  <Icon type={admin ? 'check-circle' : 'inbox'}/>
                </p>
                <p className="ant-upload-text">
                  Upload <code>admin.macaroon</code>
                </p>
                <p className="ant-upload-hint">
                  Click or drag to upload macaroon
                </p>
              </Upload.Dragger>

              <Upload.Dragger
                accept=".macaroon"
                showUploadList={false}
                beforeUpload={
                  (file) => this.handleMacaroonUpload('readonly', file)
                }
              >
                <p className="ant-upload-drag-icon">
                  <Icon type={readonly ? 'check-circle' : 'inbox'}/>
                </p>
                <p className="ant-upload-text">
                  Upload <code>readonly.macaroon</code>
                </p>
                <p className="ant-upload-hint">
                  Click or drag to upload
                </p>
              </Upload.Dragger>

              {dirs &&
              <div className="UploadMacaroons-hint">
                  Macaroons are usually located in the following places
                  <br/>
                  <strong>macOS</strong>: <code>{dirs.MACOS}</code>
                  <br/>
                  <strong>Windows</strong>: <code>{dirs.WINDOWS}</code>
                  <br/>
                  <strong>Linux</strong>: <code>{dirs.LINUX}</code>
              </div>
              }
            </>
          )}

          {error || checkAuthError &&
          <Alert
              message="Invalid macaroon"
              description={error || checkAuthError}
              type="error"
              closable
              showIcon
          />
          }

          <div className="UploadMacaroons-toggle">
            {isShowingHexInputs ? 'Have macaroon files instead?' : 'Have hex strings instead?'}
            {' '}
            <a onClick={this.toggleHexInputs}>Click here to switch</a>.
          </div>

          <Button
            disabled={!admin || !readonly}
            type="primary"
            onClick={this.handleSubmit}
            size="large"
            loading={this.props.isSaving}
            block
          >
            Continue
          </Button>
        </Form>
      </div>
    );
  }

  private handleMacaroonUpload = (key: 'admin' | 'readonly', file: File) => {
    this.setState({error: undefined});
    if (file) {
      blobToHex(file)
        .then(hex => this.setState({[key]: hex} as any))
        .catch(err => this.setState({error: err.message}));
    }
    return false;
  };

  private handleChangeMacaroonHex = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({[ev.target.name]: ev.target.value} as any);
  };

  private toggleHexInputs = () => {
    this.setState({isShowingHexInputs: !this.state.isShowingHexInputs});
  };

  private handleSubmit = () => {
    const {url} = this.props;
    if (url) {
      this.props.checkAuth(url, this.state.admin, this.state.readonly);
    }
  };
}

const ConnectedUploadMacaroons = connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    url: state.node.url,
    nodeInfo: state.node.nodeInfo,
    isCheckingAuth: state.node.isCheckingAuth,
    checkAuthError: state.node.checkAuthError
  }),
  {
    checkAuth
  }
)(UploadMacaroon);

export default withRouter(ConnectedUploadMacaroons);