import React from 'react';
import { Upload, Icon, Alert, Button } from 'antd';
import { blobToHex } from 'utils/file';
import { LND_DIR } from 'utils/constants';
import './UploadMacaroons.less';

interface Props {
  error?: string;
  onUploaded(admin: string, readOnly: string): void;
}

interface State {
  admin: string;
  readonly: string;
  error?: string;
}

export default class UploadMacaroon extends React.Component<Props, State> {
  state: State = {
    admin: '',
    readonly: '',
    error: this.props.error,
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.error !== this.props.error) {
      this.setState({ error: this.props.error });
    }
  }

  render() {
    const { error, admin, readonly } = this.state;
    return (
      <div className="UploadMacaroons">
        <div className="UploadMacaroons-description">
          We need to authenticate with your node using macaroons. Your admin
          macaroon will be encrypted, and payments will <em>never</em> be made
          without your explicit approval.
        </div>
        <Upload.Dragger
          accept=".macaroon"
          showUploadList={false}
          beforeUpload={
            (file) => this.handleMacaroonUpload('admin', file)
          }
        >
          <p className="ant-upload-drag-icon">
            <Icon type={admin ? 'check-circle' : 'inbox'} />
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
            <Icon type={readonly ? 'check-circle' : 'inbox'} />
          </p>
          <p className="ant-upload-text">
            Upload <code>readonly.macaroon</code>
          </p>
          <p className="ant-upload-hint">
            Click or drag to upload
          </p>
        </Upload.Dragger>

        {error &&
          <Alert
            message="Invalid macaroon"
            description={error}
            type="error"
            closable
            showIcon
          />
        }

        <div className="UploadMacaroons-hint">
          Macaroons are usually located in either{' '}
          <code>{LND_DIR.MACOS}</code> on macOS, or{' '}
          <code>{LND_DIR.LINUX}</code> on Linux.
        </div>

        <Button
          disabled={!admin || !readonly}
          type="primary"
          onClick={this.handleSubmit}
          block
        >
          Continue
        </Button>
      </div>
    );
  }

  private handleMacaroonUpload = (key: 'admin' | 'readonly', file: File) => {
    this.setState({ error: undefined });
    if (file) {
      blobToHex(file)
        .then(hex => this.setState({ [key]: hex } as any))
        .catch(err => this.setState({ error: err.message }));
    }
    return false;
  };

  private handleSubmit = () => {
    this.props.onUploaded(this.state.admin, this.state.readonly);
  };
}