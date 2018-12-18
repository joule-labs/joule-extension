import React from 'react';
import classnames from 'classnames';
import { Button, message } from 'antd';
import { confirmPrompt, rejectPrompt } from 'utils/prompt';
import './style.less';

interface Props {
  children: React.ReactNode;
  isContentCentered?: boolean;
  isConfirmDisabled?: boolean;
  hasNoButtons?: boolean;
  beforeReject?(): any;
  beforeConfirm?(): any;
  getConfirmData?(): any;
}

interface State {
  isConfirming: boolean;
  isRejecting: boolean;
}

export default class PromptTemplate extends React.Component<Props, State> {
  state: State = {
    isConfirming: false,
    isRejecting: false,
  };

  render() {
    const { children, isConfirmDisabled, isContentCentered, hasNoButtons } = this.props;
    const { isConfirming, isRejecting } = this.state;
    const confirmDisabled = isConfirmDisabled || isRejecting;

    return (
      <div className="PromptTemplate">
        <div className={classnames('PromptTemplate-content', isContentCentered && 'is-centered')}>
          {children}
        </div>
        {!hasNoButtons &&
          <div className="PromptTemplate-buttons">
            <Button
              onClick={this.handleReject}
              disabled={isConfirming}
              loading={isRejecting}
            >
              Reject
            </Button>
            <Button
              type="primary"
              onClick={this.handleConfirm}
              disabled={confirmDisabled}
              loading={isConfirming}
            >
              Confirm
            </Button>
          </div>
        }
      </div>
    )
  }

  private handleReject = async () => {
    setTimeout(() => {
      this.setState({ isRejecting: true });
    }, 100);

    if (this.props.beforeReject) {
      await this.props.beforeReject();
    }
    rejectPrompt();
  }

  private handleConfirm = async () => {
    // Kick in a loader if getting confirm data takes a sec
    setTimeout(() => {
      this.setState({ isConfirming: true });
    }, 100);

    if (this.props.beforeConfirm) {
      await this.props.beforeConfirm();
    }

    let data;
    if (this.props.getConfirmData) {
      try {
        data = await this.props.getConfirmData();
      } catch(err) {
        this.setState({ isConfirming: false });
        message.error(err.message, 3);
        return;
      }
    }
    confirmPrompt(data);
  }
}