import React from 'react';
import { connect } from 'react-redux';
import { Spin, message } from 'antd';
import { browser } from 'webextension-polyfill-ts';
import UploadMacaroons from './UploadMacaroons';
import ConfirmNode from './ConfirmNode';
import SelectType, { NODE_TYPE } from './SelectType';
import { DEFAULT_LOCAL_NODE_URLS } from 'utils/constants';
import { checkNode, checkNodes, checkAuth, setNode, resetNode } from 'modules/node/actions';
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
    const finishedCheck = nextProps.url !== this.props.url ||
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
      nodeInfo,
    } = this.props;
    const { nodeType, isRequestingPermission, isScanningLocal } = this.state;

    let content: React.ReactNode;
    let title: React.ReactNode;
    if (nodeType) {
      if (isCheckingAuth || isRequestingPermission || isScanningLocal) {
        content = <Spin />;
      }
      else if (nodeInfo) {
        title = 'Confirm your node';
        content = (
          <ConfirmNode
            nodeInfo={nodeInfo}
            onConfirm={this.confirmNode}
            onCancel={this.resetNode}
          />
        );
      }
      else if (isNodeChecked) {
        title = 'Upload Macaroons';
        content = <UploadMacaroons onUploaded={this.handleMacaroons} />;
      }
      else {
        title = 'Provide a URL'
        content = (
          <InputAddress
            submitUrl={this.setUrl}
            error={checkNodeError}
            isCheckingNode={isCheckingNode}
          />
        );
      }
    } else {
      title = 'Where is your node?';
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
    if (nodeType === NODE_TYPE.LOCAL) {
      this.setState({
        isRequestingPermission: true,
        isScanningLocal: true,
      });
      // Instantly check the default local node
      browser.permissions.request({
        origins: DEFAULT_LOCAL_NODE_URLS.map(url => `${url}/`)
      }).then(accepted => {
        if (!accepted) {
          message.warn('Permission denied, connection may fail');
        }
        this.props.checkNodes(DEFAULT_LOCAL_NODE_URLS);
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

  private confirmNode = () => {
    const { url } = this.props;
    const { adminMacaroon, readonlyMacaroon } = this.state;
    if (!url || !adminMacaroon || !readonlyMacaroon) {
      console.warn('Invalid credentials:', { url, adminMacaroon, readonlyMacaroon });
      return;
    }
    this.props.setNode(url, adminMacaroon, readonlyMacaroon);
    this.props.onConfirmNode();
  }

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
  }),
  {
    checkNode,
    checkNodes,
    checkAuth,
    setNode,
    resetNode,
  }
)(SelectNode);
