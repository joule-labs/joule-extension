import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Icon, Form, Input } from 'antd';
import { Link } from 'react-router-dom';
import { AppState } from 'store/reducers';
import { injectBackupData, decryptData, TEST_CIPHER_DATA } from 'utils/crypto';
import './style.less';

interface StateProps {
  state: AppState;
}

interface State {
  password: string;
  error: null | string;
  blob: string;
}

const readFile = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
};

class Restore extends React.Component<StateProps, State> {
  state: State = {
    password: '',
    error: null,
    blob: '',
  };
  render() {
    const { password, error, blob } = this.state;

    return (
      <div className="Restore">
        <Link className="Restore-back" to="/">
          <Icon type="left" />
        </Link>
        <h2>Restore</h2>
        <div className="Restore-upload">
          <label className="Restore-upload-label">
            <Icon type="upload" /> Click here to upload backup
            <input
              type="file"
              onChange={e => {
                this.handleChange(e.target.files);
              }}
            />
          </label>
          {blob && (
            <Form className="Restore-form" onSubmit={this.handleSubmit}>
              <Form.Item validateStatus={error ? 'error' : undefined}>
                <Input.Search
                  className="Restore-form-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={this.handlePassChange}
                  enterButton={<Icon type="unlock" />}
                />
              </Form.Item>
            </Form>
          )}
        </div>
      </div>
    );
  }
  private handleChange = (selectorFiles: FileList | null) => {
    if (!selectorFiles) {
      this.setState({ blob: '' });
    } else {
      readFile(selectorFiles[0]).then(blob => this.setState({ blob }));
    }
  };
  private handlePassChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password: ev.currentTarget.value,
      error: null,
    });
  };

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const { password } = this.state;
    const {
      crypto: { testCipher, salt },
    } = JSON.parse(this.state.blob);
    try {
      const data = decryptData(testCipher, password, salt as string);
      if (data !== TEST_CIPHER_DATA) {
        throw new Error('Incorrect password');
      }
      injectBackupData(this.state.blob, this.props.dispatch, password, salt);
    } catch (err) {
      this.setState({ error: 'Password was incorrect' });
    }
  };
}

const ConnectedRestore = connect<StateProps, DispatchProp, {}, AppState>(state => ({
  state,
}))(Restore);

export default ConnectedRestore;
