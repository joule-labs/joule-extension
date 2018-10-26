import React from 'react';
import { connect } from 'react-redux';
import { Button, Spin } from 'antd';
import UploadMacaroons from './UploadMacaroons';
import ConfirmNode from './ConfirmNode';
import { DEFAULT_LOCAL_NODE_URL } from 'utils/constants';
import { checkNode, checkAuth, setNode, resetNode } from 'modules/node/actions';
import { AppState } from 'store/reducers';
import './style.less';
import InputAddress from './InputAddress';

enum NODE_TYPE {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
}

interface StateProps {
  isNodeChecked: AppState['node']['isNodeChecked'];
  nodeInfo: AppState['node']['nodeInfo'];
  isCheckingNode: AppState['node']['isCheckingNode'];
  isCheckingAuth: AppState['node']['isCheckingAuth'];
  checkNodeError: AppState['node']['checkNodeError'];
}

interface DispatchProps {
  checkNode: typeof checkNode;
  checkAuth: typeof checkAuth;
  setNode: typeof setNode;
  resetNode: typeof resetNode;
}

interface OwnProps {
  onConfirmNode(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  url: string;
  adminMacaroon: string;
  readonlyMacaroon: string;
  nodeType: null | NODE_TYPE;
}

class SelectNode extends React.Component<Props, State> {
  state: State = {
    url: '',
    adminMacaroon: '',
    readonlyMacaroon: '',
    nodeType: null,
  };

  render() {
    const {
      isCheckingNode,
      isCheckingAuth,
      isNodeChecked,
      checkNodeError,
      nodeInfo,
    } = this.props;
    const { nodeType } = this.state;

    let content: React.ReactNode;
    let title: React.ReactNode;
    if (nodeType) {
      if (isCheckingNode || isCheckingAuth) {
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
          />
        );
      }
    } else {
      title = 'What are we connecting to?';
      content = (
        <div className="SelectNode-buttons">
          <Button
            size="large"
            icon="laptop"
            block
            onClick={() => this.setNodeType(NODE_TYPE.LOCAL)}
          >
            Local node
          </Button>
          <Button
            size="large"
            icon="global"
            block
            onClick={() => this.setNodeType(NODE_TYPE.REMOTE)}
          >
            Remote node
          </Button>
        </div>
      );
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
      // Instantly check the default local node
      this.setState({ url: DEFAULT_LOCAL_NODE_URL });
      this.props.checkNode(DEFAULT_LOCAL_NODE_URL);
    }
  };

  private setUrl = (url: string) => {
    this.setState({ url });
    this.props.checkNode(url);
  };

  private handleMacaroons = (adminMacaroon: string, readonlyMacaroon: string) => {
    this.setState({ adminMacaroon, readonlyMacaroon });
    this.props.checkAuth(this.state.url, adminMacaroon, readonlyMacaroon);
  };

  private confirmNode = () => {
    const { url, adminMacaroon, readonlyMacaroon } = this.state;
    this.props.setNode(url, adminMacaroon, readonlyMacaroon);
    this.props.onConfirmNode();
  }

  private resetNode = () => {
    this.props.resetNode();
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    isNodeChecked: state.node.isNodeChecked,
    nodeInfo: state.node.nodeInfo,
    isCheckingNode: state.node.isCheckingNode,
    isCheckingAuth: state.node.isCheckingAuth,
    checkNodeError: state.node.checkNodeError,
  }),
  {
    checkNode,
    checkAuth,
    setNode,
    resetNode,
  }
)(SelectNode);