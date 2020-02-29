import React from 'react';
import { Button, Result } from 'antd';
import Loader from 'components/Loader';
import './SendState.less';

interface Props {
  isLoading?: boolean;
  error?: Error | null;
  result?: React.ReactNode | null;
  reset(): void;
  back(): void;
  close?(): void;
}

const SendState: React.SFC<Props> = props => {
  if (props.isLoading) {
    return <Loader />;
  }

  const type = props.error ? 'error' : 'success';
  const actions = [
    props.close && (
      <Button key="close" size="large" onClick={props.close}>
        Back to home
      </Button>
    ),
    props.error && (
      <Button key="back" size="large" type="primary" onClick={props.back}>
        Try again
      </Button>
    ),
    props.result && (
      <Button key="another" size="large" type="primary" onClick={props.reset}>
        Send another
      </Button>
    ),
  ].filter(b => !!b);
  const errorMessage = props.error && <code>{props.error.message}</code>;

  return (
    <div className="SendState">
      <Result
        status={type}
        title={type === 'success' ? 'Succesfully sent!' : 'Failed to send'}
        subTitle={
          type === 'success'
            ? 'See below for more about your transaction'
            : 'See below for the full error'
        }
        extra={actions}
      >
        {errorMessage || props.result}
      </Result>
    </div>
  );
};

export default SendState;
