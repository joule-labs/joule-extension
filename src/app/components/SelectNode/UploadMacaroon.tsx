import React from 'react';
import { Upload, Icon, Alert } from 'antd';
import { blobToHex } from 'utils/file';
import { LND_DIR } from 'utils/constants';

interface Props {
  error?: string;
  onUpload(macaroonHex: string): void;
}

interface State {
  error?: string;
}

export default class UploadMacaroon extends React.Component<Props, State> {
  state: State = {
    error: this.props.error,
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.error !== this.props.error) {
      this.setState({ error: this.props.error });
    }
  }

  render() {
    const { error } = this.state;
    return (
      <div className="UploadMacaroon">
        <div className="UploadMacaroon-hint">
          In order to communicate with your node, we need your{' '}
          <code>admin.macaroon</code> file. This is required to authenticate
          requests with. your node. Payments and signatures will <em>never</em>
          {' '} be made without your explicit approval.
        </div>
        <Upload.Dragger accept=".macaroon" beforeUpload={this.handleMacaroonUpload}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">Click or drag to upload macaroon</p>
          <p className="ant-upload-hint">
            admin.macaroon is usually located in either{' '}
            <code>{LND_DIR.MACOS}</code> on macOS, or{' '}
            <code>{LND_DIR.LINUX}</code> on Linux.
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
      </div>
    );
  }

  private handleMacaroonUpload = (file: File) => {
    this.setState({ error: undefined });
    if (file) {
      blobToHex(file)
        .then(hex => this.props.onUpload(hex))
        .catch(err => this.setState({ error: err.message }));
    }
    return false;
  };
}