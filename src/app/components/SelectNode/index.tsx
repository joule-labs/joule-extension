import React from 'react';
import { connect } from 'react-redux';
import { message } from 'antd';
import { browser } from 'webextension-polyfill-ts';
import UploadMacaroons from './UploadMacaroons';
import ConfirmNode from './ConfirmNode';
import BTCPayServer, { BTCPayServerConfig } from './BTCPayServer';
import SelectType from './SelectType';
import Loader from 'components/Loader';
import { NODE_TYPE, DEFAULT_NODE_URLS } from 'utils/constants';
import { urlWithoutPort } from 'utils/formatters';
import {
  checkNode,
  checkNodes,
  checkAuth,
  setNode,
  resetNode,
} from 'modules/node/actions';
import { AppState } from 'store/reducers';
import './style.less';
import InputAddress from './InputAddress';

interface StateProps {
  url: AppState['node']['url'];
  isNodeChecked: AppState['node']['isNodeChecked'];
  nodeInfo: AppState['node']['nodeInfo'];
  isCheckingNode: AppState['node']['isCheckingNode'];
  isCheckingAuth: AppState['node']['isCheckingAuth'];
  checkNodeError: AppState['node']['checkNodeError'];
  checkAuthError: AppState['node']['checkAuthError'];
}

interface DispatchProps {
  checkNode: typeof checkNode;
  checkNodes: typeof checkNodes;
  checkAuth: typeof checkAuth;
  setNode: typeof setNode;
  resetNode: typeof resetNode;
}

interface OwnProps {
  onConfirmNode(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  adminMacaroon: string;
  readonlyMacaroon: string;
  nodeType: null | NODE_TYPE;
  isRequestingPermission: boolean;
  isScanningLocal: boolean;
}

class SelectNode extends React.Component<Props, State> {
  state: State = {
    adminMacaroon: '',
    readonlyMacaroon: '',
    nodeType: null,
    isRequestingPermission: false,
    isScanningLocal: false,
  };

  componentWillUpdate(nextProps: Props) {
    const finishedCheck =
      nextProps.url !== this.props.url ||
      nextProps.checkNodeError !== this.props.checkNodeError;
    if (finishedCheck) {
      this.setState({ isScanningLocal: false });
    }

    if (nextProps.url && nextProps.url !== this.props.url) {
      message.success(`Connected to ${nextProps.url}`, 2);
    }
  }

  render() {
    const {
      isCheckingNode,
      isCheckingAuth,
      isNodeChecked,
      checkNodeError,
      checkAuthError,
      nodeInfo,
    } = this.props;
    const { nodeType, isRequestingPermission, isScanningLocal } = this.state;

    let content: React.ReactNode;
    let title: React.ReactNode;
    if (nodeType) {
      if (isRequestingPermission || isScanningLocal) {
        content = <Loader />;
      } else if (nodeInfo) {
        title = 'Confirm your node';
        content = (
          <ConfirmNode
            nodeInfo={nodeInfo}
            onConfirm={this.confirmNode}
            onCancel={this.resetNode}
          />
        );
      } else if (isNodeChecked) {
        title = 'Upload Macaroons';
        content = (
          <UploadMacaroons
            onUploaded={this.handleMacaroons}
            nodeType={nodeType}
            error={checkAuthError}
            isSaving={isCheckingAuth}
          />
        );
      } else if (nodeType === NODE_TYPE.BTCPAY_SERVER) {
        title = 'Connect to your BTCPay Server';
        content = (
          <BTCPayServer
            submitConfig={this.handleBTCPayServerConfig}
            error={checkAuthError}
          />
        );
      } else {
        title = 'Provide a URL';
        content = (
          <InputAddress
            submitUrl={this.setUrl}
            error={checkNodeError}
            isCheckingNode={isCheckingNode}
            initialUrl={DEFAULT_NODE_URLS[nodeType]}
          />
        );
      }
    } else {
      title = 'What kind of node do you have?';
      content = <SelectType onSelectNodeType={this.setNodeType} />;
    }

    return (
      <div className="SelectNode">
        {title && <h2 className="SelectNode-title">{title}</h2>}
        {content}
      </div>
    );
  }

  private setNodeType = (nodeType: null | NODE_TYPE) => {
    this.setState({ nodeType });

    // Some node types have default URLs we can check immediately
    const defaultUrl = nodeType ? DEFAULT_NODE_URLS[nodeType] : undefined;
    if (defaultUrl) {
      this.setState({
        isRequestingPermission: true,
        isScanningLocal: true,
      });
      // Instantly check the default local node. Strip port to get around a
      // firefox issue where CORS isn't stripped if you have port permission.
      browser.permissions
        .request({
          origins: [urlWithoutPort(defaultUrl)],
        })
        .then(accepted => {
          if (!accepted) {
            message.warn('Permission denied, connection may fail', 2);
          }
          this.props.checkNode(defaultUrl);
          this.setState({ isRequestingPermission: false });
        });
    }
  };

  private setUrl = (url: string) => {
    this.props.checkNode(url);
  };

  private handleMacaroons = (adminMacaroon: string, readonlyMacaroon: string) => {
    const { url } = this.props;
    this.setState({ adminMacaroon, readonlyMacaroon });
    if (url) {
      this.props.checkAuth(url, adminMacaroon, readonlyMacaroon);
    }
  };

  private handleBTCPayServerConfig = (config: BTCPayServerConfig) => {
    const macaroons = {
      adminMacaroon: config.macaroon,
      readonlyMacaroon: config.readonlyMacaroon || config.macaroon,
    };
    this.setState(macaroons, () => {
      this.props.checkAuth(
        config.uri,
        macaroons.adminMacaroon,
        macaroons.readonlyMacaroon,
      );
    });
  };

  private confirmNode = () => {
    const { url } = this.props;
    const { adminMacaroon, readonlyMacaroon } = this.state;
    if (!url || !adminMacaroon || !readonlyMacaroon) {
      console.warn('Invalid credentials:', { url, adminMacaroon, readonlyMacaroon });
      return;
    }
    this.props.setNode(url, adminMacaroon, readonlyMacaroon);
    this.props.onConfirmNode();
  };

  private resetNode = () => {
    this.props.resetNode();
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    url: state.node.url,
    isNodeChecked: state.node.isNodeChecked,
    nodeInfo: state.node.nodeInfo,
    isCheckingNode: state.node.isCheckingNode,
    isCheckingAuth: state.node.isCheckingAuth,
    checkNodeError: state.node.checkNodeError,
    checkAuthError: state.node.checkAuthError,
  }),
  {
    checkNode,
    checkNodes,
    checkAuth,
    setNode,
    resetNode,
  },
)(SelectNode);
