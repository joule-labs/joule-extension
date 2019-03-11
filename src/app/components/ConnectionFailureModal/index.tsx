import React from 'react';
import { Modal, Alert } from 'antd';
import { AppState } from 'store/reducers';
import { Link } from 'react-router-dom';

interface Props {
  nodeUrl: AppState['node']['url'];
  error: Error;
  onRetry(): void;
}

export default class ConnectionFailureModal extends React.Component<Props> {
  render() {
    const { nodeUrl, error, onRetry } = this.props;

    const content = (
      <Alert
        type="error"
        message="Failed to connect to node"
        description={<>
          <p>Request failed with the message "{error.message}"</p>
          <p>
            If you're sure you've setup your node correctly, try{' '}
            <a href={`${nodeUrl}/v1/getinfo`} target="_blank">
              clicking this link
            </a>{' '}
            and making sure it loads correctly. If there are SSL errors,
            click "advanced" and proceed to accept the certificate.
          </p>
          <p>
            If your certificate is setup correctly, you may need to 
            update your macaroons in{' '}
            <Link to="/settings">Settings</Link>
          </p>
        </>}
      />
    );

    return (
      <Modal
        title="Connection Failed"
        okText="Retry"
        onOk={onRetry}
        cancelButtonProps={{ style: { display: 'none' } }}
        closable={false}
        visible
        centered
      >
        <div className="ConnectionFailureModal">{content}</div>
      </Modal>
    );
  }
}
