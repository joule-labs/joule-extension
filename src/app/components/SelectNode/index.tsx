import React from 'react';
import { connect } from 'react-redux';
import { Button, Spin } from 'antd';
import UploadMacaroon from './UploadMacaroon';
import ConfirmNode from './ConfirmNode';
import { DEFAULT_LOCAL_NODE_URL } from 'utils/constants';
import { checkNode, checkAuth, setNode, resetNode } from 'modules/node/actions';
import { AppState } from 'store/reducers';

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
  macaroonHex: string;
  nodeType: null | NODE_TYPE;
}

class SelectNode extends React.Component<Props, State> {
  state: State = {
    url: '',
    macaroonHex: '',
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
      else if (checkNodeError) {
        content = checkNodeError.message;
      }
      else if (nodeInfo) {
        content = (
          <ConfirmNode
            nodeInfo={nodeInfo}
            onConfirm={this.confirmNode}
            onCancel={this.resetNode}
          />
        );
      }
      else if (isNodeChecked) {
        content = <UploadMacaroon onUpload={this.handleMacaroon} />;
      }
      else {
        content = <input placeholder="url" />;
      }
    } else {
      title = 'What type of node are you running?';
      content = (
        <>
          <Button onClick={() => this.setNodeType(NODE_TYPE.LOCAL)}>
            Local node
          </Button>
          <Button onClick={() => this.setNodeType(NODE_TYPE.REMOTE)}>
            Remote node
          </Button>
        </>
      );
    }

    return (
      <div className="SelectNode">
        {title && <h1 className="SelectNode-title">{title}</h1>}
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

  private handleMacaroon = (macaroonHex: string) => {
    this.setState({ macaroonHex });
    this.props.checkAuth(this.state.url, macaroonHex);
  };

  private confirmNode = () => {
    this.props.setNode(this.state.url, this.state.macaroonHex);
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