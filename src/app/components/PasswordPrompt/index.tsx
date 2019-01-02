import React from 'react';
import { connect } from 'react-redux';
import { Icon, Input, Checkbox, Form, Modal } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { cryptoActions } from 'modules/crypto';
import { AppState } from 'store/reducers';
import { decryptData, TEST_CIPHER_DATA } from 'utils/crypto';
import './style.less';

interface StateProps {
  testCipher: AppState['crypto']['testCipher'];
  salt: AppState['crypto']['salt'];
  password: AppState['crypto']['password'];
  isRequestingPassword: AppState['crypto']['isRequestingPassword'];
}

interface DispatchProps {
  enterPassword: typeof cryptoActions['enterPassword'];
  cancelPassword: typeof cryptoActions['cancelPassword'];
}

type Props = StateProps & DispatchProps;

interface State {
  password: string;
  isSavingPassword: boolean;
  error: null | string;
}

class PasswordPrompt extends React.Component<Props, State> {
  state: State = {
    password: '',
    isSavingPassword: true,
    error: null,
  };

  render() {
    const { isRequestingPassword } = this.props;
    const { password, isSavingPassword, error } = this.state;
  
    return (
      <Modal
        title="Unlock your wallet"
        visible={isRequestingPassword}
        footer={null}
        onCancel={this.props.cancelPassword}
        closable
      >
        <div className="PasswordPrompt">
          <Form className="PasswordPrompt-form" onSubmit={this.handleSubmit}>
            <Form.Item validateStatus={error ? 'error' : undefined}>
              <Input.Search
                className="PasswordPrompt-form-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={this.handleChangePassword}
                enterButton={<Icon type="unlock" />}
                onSearch={() => this.handleSubmit()}
                autoFocus
              />
            </Form.Item>
            <div className="PasswordPrompt-form-savePw">
              <Checkbox
                onChange={this.handleChangeSavePassword}
                checked={isSavingPassword}
              >
                Don't ask me again this session
              </Checkbox>
            </div>
          </Form>
        </div>
      </Modal>
    );
  }

  private handleChangePassword = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password: ev.currentTarget.value,
      error: null,
    });
  };

  private handleChangeSavePassword = (ev: CheckboxChangeEvent) => {
    this.setState({ isSavingPassword: ev.target.checked });
  };

  private handleSubmit = (ev?: React.FormEvent<HTMLFormElement>) => {
    if (ev) {
      ev.preventDefault();
    }
    const { password, isSavingPassword } = this.state;
    const { testCipher, salt } = this.props;
    try {
      const data = decryptData(testCipher, password, salt as string);
      if (data !== TEST_CIPHER_DATA) {
        throw new Error('Incorrect password');
      }
      this.props.enterPassword(password, isSavingPassword);
    } catch(err) {
      this.setState({ error: 'Password was incorrect' });
    }
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    testCipher: state.crypto.testCipher,
    salt: state.crypto.salt,
    password: state.crypto.password,
    isRequestingPassword: state.crypto.isRequestingPassword,
  }),
  {
    enterPassword: cryptoActions.enterPassword,
    cancelPassword: cryptoActions.cancelPassword,
  },
)(PasswordPrompt);