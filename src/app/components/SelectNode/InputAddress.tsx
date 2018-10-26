import React from 'react';
import { Form, Input, Button } from 'antd';

interface Props {
  error: Error | null;
  submitUrl(url: string): void;
}

interface State {
  url: string;
  error: string;
}

export default class InputAddress extends React.Component<Props, State> {
  state: State = {
    url: '',
    error: '',
  };

  componentWillMount() {
    if (this.props.error) {
      this.setState({ error: this.props.error.message });
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.error && !prevProps.error) {
      this.setState({ error: this.props.error.message });
    }
  }

  render() {
    const { error, url } = this.state;
    const validateStatus = url ? error ? 'error' : 'success' : undefined;
    const help = error || (
      <>
        You must provide the REST API address. Must begin with{' '}
        <code>http://</code> or <code>https://</code>, and specify a port if
        it's not 80 or 443.
      </>
    );
    return (
      <Form className="InputAddress" onSubmit={this.handleSubmit}>
        <Form.Item label="Node URL" help={help} validateStatus={validateStatus}>
          <Input
            type="url"
            size="large"
            value={url}
            onChange={this.handleChange}
            placeholder="http://localhost:8080"
          />
        </Form.Item>

        <Button type="primary" size="large" htmlType="submit" block>
          Connect
        </Button>
      </Form>
    )
  }

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const url = ev.currentTarget.value;
    let error = '';
    try {
      // tslint:disable-next-line
      new URL(url);
    } catch(err) {
      error = 'That doesn’t look like a valid url';
    }
    this.setState({ url, error });
  };

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    this.props.submitUrl(this.state.url);
  };
}