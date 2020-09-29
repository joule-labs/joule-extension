import React from 'react';
import { connect } from 'react-redux';
import { Icon, Modal } from 'antd';
import semver from 'semver';
import { getNodeInfo } from 'modules/node/actions';
import { selectNodeInfo } from 'modules/node/selectors';
import { AppState } from 'store/reducers';
import './NodeWarning.less';

interface StateProps {
  nodeInfo: ReturnType<typeof selectNodeInfo>;
}

interface DispatchProps {
  getNodeInfo: typeof getNodeInfo;
}

type Props = StateProps & DispatchProps;

interface State {
  isModalOpen: boolean;
}

class NodeWarning extends React.Component<Props, State> {
  state: State = {
    isModalOpen: false,
  };

  componentDidMount() {
    if (!this.props.nodeInfo) {
      this.props.getNodeInfo();
    }
  }

  render() {
    const { nodeInfo } = this.props;
    const { isModalOpen } = this.state;
    if (!nodeInfo) {
      return null;
    }

    let message = null;
    let moreMessage = null;
    let severity = 'warning';

    const version = semver.coerce(nodeInfo.version);
    if (version && semver.lt(version, '0.7.1')) {
      // Critical vulnerability, not yet disclosed (as of 9/11/2019)
      message = 'Your LND version has critical vulnerabilities';
      severity = 'error';
      moreMessage = (
        <>
          <p>
            On August 30th, the Lightning Devs mailing list was informed that critical
            vulnerabilities were found in all major Lightning implementations, including
            LND.
          </p>
          <p>
            While the exact vulnerability hasn't been disclosed yet it is known to allow a
            remote actor to cause your node to lose funds.
          </p>
          <p>
            <strong>
              To ensure the safety of your funds, it is vital that you upgrade LND to
              v0.7.1 or higher.
            </strong>{' '}
            All older versions have are vulnetable.
          </p>
          <p>
            To upgrade, follow the instructions in the first link below. If you installed
            your Lightning node by following a guide or installing an application, refer
            to its update instructions instead.
          </p>
          <ul>
            <li>
              <a
                target="_blank"
                href="https://github.com/lightningnetwork/lnd/blob/master/docs/INSTALL.md#installing-lnd"
              >
                Update instructions for LND
              </a>
            </li>
            <li>
              <a
                target="_blank"
                href="https://twitter.com/lightning/status/1171455184616058881"
              >
                Lightning Labs' confirmation of the vulnerability
              </a>
            </li>
            <li>
              <a
                target="_blank"
                href="https://lists.linuxfoundation.org/pipermail/lightning-dev/2019-August/002130.html"
              >
                Rusty Russel's original vulnerability announcement
              </a>
            </li>
          </ul>
        </>
      );
    } else if (!nodeInfo.synced_to_chain) {
      message = 'Node is syncing to chain, balances may be incorrect';
    }

    if (!message) {
      return null;
    }

    return (
      <div className={`NodeWarning is-${severity}`}>
        <Icon type="warning" /> {message}
        {moreMessage && (
          <>
            . <a onClick={this.openMoreModal}>See more</a>.
          </>
        )}
        {moreMessage && (
          <Modal
            className="NodeWarning-moreModal"
            title="A warning about your node"
            visible={isModalOpen}
            onCancel={this.closeMoreModal}
            onOk={this.closeMoreModal}
            footer={null}
            centered
          >
            {moreMessage}
          </Modal>
        )}
      </div>
    );
  }

  private openMoreModal = () => this.setState({ isModalOpen: true });
  private closeMoreModal = () => this.setState({ isModalOpen: false });
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    nodeInfo: selectNodeInfo(state),
  }),
  { getNodeInfo },
)(NodeWarning);
