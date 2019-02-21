import React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Alert, message } from 'antd';
import { urlWithoutPort } from 'utils/formatters';
import './LightningApp.less';
import { checkNode } from 'modules/node/actions';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import TitleTemplate from 'components/SelectNode/TitleTemplate';
import { DEFAULT_NODE_URLS } from 'utils/constants';
import Spin from 'antd/lib/spin';

interface StateProps {
  isNodeChecked: AppState['node']['isNodeChecked'];
  isCheckingNode: AppState['node']['isCheckingNode'];
  checkNodeError: AppState['node']['checkNodeError'];
}

interface DispatchProps {
  checkNode: typeof checkNode;
}

interface OwnProps {
  onComplete(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  error: string | undefined;
}

class LightningApp extends React.Component<Props, State> {

  componentDidUpdate() {
    if (this.props.isNodeChecked) {
      this.props.onComplete();
    }
  }

  componentDidMount() {
    const url = DEFAULT_NODE_URLS.LIGHTNING_APP;
    if (!url) {
      message.warn('Lightning App URL not set!');
      return;
    }

    browser.permissions.request({
      origins: [urlWithoutPort(url)]
    }).then(accepted => {
      if (!accepted) {
        message.warn('Permission denied, connection may fail');
      }
      this.props.checkNode(url);
    });
  }

  render() {
    const {checkNodeError, isCheckingNode} = this.props;

    return (
      <div>
        <TitleTemplate title={'Connecting to Lightning App...'}/>
        {isCheckingNode && <Spin/> }
        {checkNodeError &&
        <Alert
            type="error"
            message="Failed to connect to node"
            description={<>
              <p>Request failed with the message
                "{checkNodeError.message}"</p>
              <p>
                If you're sure you've setup your node correctly, try{' '}
                <a href={`${DEFAULT_NODE_URLS.LIGHTNING_APP}/v1/getinfo`}
                   target="_blank">
                  clicking this link
                </a>{' '}
                and making sure it loads correctly. If there are SSL errors,
                click "advanced" and proceed to accept the certificate.
              </p>
            </>}
            showIcon
            closable
        />
        }
      </div>
    );
  }

}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    isNodeChecked: state.node.isNodeChecked,
    isCheckingNode: state.node.isCheckingNode,
    checkNodeError: state.node.checkNodeError
  }),
  {
    checkNode
  }
)(LightningApp);