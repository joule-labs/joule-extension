import React from 'react';
import { Form, Button, Input } from 'antd';
import zxcvbn from 'zxcvbn';
import './style.less';

interface Props {
  onCreatePassword(password: string): void;
}

interface State {
  password1: string;
  password2: string;
  isReady: boolean;
  strength: number;
}

export default class CreatePassword extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      password1: '',
      password2: '',
      isReady: false,
      strength: 0,
    };
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.currentTarget;
    const setPass = (n: string, nx: string, v: string, d: string) => {
      if (n === nx) {
        return v;
      } else {
        return d;
      }
    };
    const password1 = setPass(name, 'p1', value, this.state.password1);
    const password2 = setPass(name, 'p2', value, this.state.password2);
    const strength = zxcvbn(password1).score;
    const isReady = password1 === password2 && strength >= 2;
    this.setState({ password1, password2, isReady, strength });
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.onCreatePassword(this.state.password1);
  };

  render() {
    const { password1, password2, isReady, strength } = this.state;
    const p2status = password2.length > 0 ?
      password1 === password2 ?
        'success' :
        'error'
      : undefined;
    return (
      <Form className="CreatePassword" onSubmit={this.handleSubmit} layout="vertical">
        <h2 className="CreatePassword-title">Create a Password</h2>

        <Form.Item label="Password">
          <Input
            name="p1"
            value={password1}
            onChange={this.handleInputChange}
            className="CreatePassword-input"
            size="large"
            type="password"
            autoFocus
          />
        </Form.Item>
        
        <Form.Item label="Confirm password" validateStatus={p2status}>
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
          <div className={`CreatePassword-strength-meter is-str${strength}`} />
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
