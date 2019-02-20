import React from 'react';
import { Button, Form, Input } from 'antd';
import zxcvbn from 'zxcvbn';
import { decryptData, TEST_CIPHER_DATA } from 'utils/crypto';
import { AppState } from 'store/reducers';
import './style.less';
import { changePassword, setPassword } from 'modules/crypto/actions';
import { connect } from 'react-redux';

interface DispatchProps {
  setPassword: typeof setPassword;
  changePassword: typeof changePassword;
}

interface OwnProps {
  testCipher?: AppState['crypto']['testCipher'];
  salt?: AppState['crypto']['salt'];
  requestCurrentPassword?: boolean;

  onComplete(): void;
}

type Props = DispatchProps & OwnProps;

interface State {
  currPassword: string;
  currPassErr: null | string;
  newPassword: string;
  password2: string;
  isReady: boolean;
  strength: number;
}

class CreatePassword extends React.Component<Props, State> {
  static defaultProps = {
    requestCurrentPassword: false
  };

  constructor(props: any) {
    super(props);
    this.state = {
      currPassword: '',
      currPassErr: null,
      newPassword: '',
      password2: '',
      isReady: false,
      strength: 0
    };
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value, name} = e.currentTarget;
    const setPass = (n: string, nx: string, v: string, d: string) => {
      if (n === nx) {
        return v;
      } else {
        return d;
      }
    };
    const password1 = setPass(name, 'p1', value, this.state.newPassword);
    const password2 = setPass(name, 'p2', value, this.state.password2);
    const strength = zxcvbn(password1).score;
    const isReady = password1 === password2 && strength >= 2;
    this.setState({newPassword: password1, password2, isReady, strength});
  };

  handleCurrPassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      currPassword: e.currentTarget.value,
      currPassErr: null
    });
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const {currPassword, newPassword} = this.state;
    const {testCipher, salt} = this.props;

    // verify the current pw if it was requested
    if (this.props.requestCurrentPassword) {
      try {
        const data = decryptData(testCipher, currPassword, salt as string);
        if (data !== TEST_CIPHER_DATA) {
          throw new Error('Incorrect password');
        }
      } catch (err) {
        this.setState({currPassErr: 'Password was incorrect'});
        return;
      }
    }

    if (currPassword) {
      this.props.changePassword(newPassword, currPassword);
    } else {
      this.props.setPassword(newPassword);
    }

    this.props.onComplete();
  };

  render() {
    const {currPassword, currPassErr, newPassword, password2, isReady, strength} = this.state;
    const {requestCurrentPassword} = this.props;
    const p2status = password2.length > 0 ?
      newPassword === password2 ?
        'success' :
        'error'
      : undefined;
    const labels = requestCurrentPassword
      ? {title: '', pass: 'New password', conf: 'Confirm new password'}
      : {
        title: 'Create a Password',
        pass: 'Password',
        conf: 'Confirm password'
      };

    return (
      <Form className="CreatePassword" onSubmit={this.handleSubmit}
            layout="vertical">
        <h2 className="CreatePassword-title">{labels.title}</h2>

        {requestCurrentPassword && (
          <Form.Item
            className="CreatePassword-current"
            label="Current Password"
            validateStatus={currPassErr ? 'error' : undefined}
            help={currPassErr}
          >
            <Input
              name="currentPass"
              value={currPassword}
              onChange={this.handleCurrPassChange}
              className="CreatePassword-input"
              size="large"
              type="password"
              autoFocus
            />
          </Form.Item>
        )}

        <Form.Item label={labels.pass}>
          <Input
            name="p1"
            value={newPassword}
            onChange={this.handleInputChange}
            className="CreatePassword-input"
            size="large"
            type="password"
            autoFocus={!requestCurrentPassword}
          />
        </Form.Item>

        <Form.Item label={labels.conf} validateStatus={p2status}>
          <Input
            name="p2"
            value={password2}
            onChange={this.handleInputChange}
            className="CreatePassword-input"
            size="large"
            type="password"
          />
        </Form.Item>
        <div className="CreatePassword-strength">
          <div className={`CreatePassword-strength-meter is-str${strength}`}/>
        </div>
        <div className="CreatePassword-continue">
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            disabled={!isReady}
            block
          >
            Continue
          </Button>
        </div>
        <div className="CreatePassword-disclaimer">
          Joule secures all of your data using AES-256 encryption, and won't
          be able to do anything until you enter it. This password is the key
          to your data, and cannot be recovered. Make sure you back it up.
        </div>
      </Form>
    );
  }
}

export default connect<{}, DispatchProps, {}, AppState>(
  null,
  {
    setPassword,
    changePassword
  }
)(CreatePassword);

