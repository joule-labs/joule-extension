import React from 'react';
import { Button, Collapse, Icon } from 'antd';
import { NODE_TYPE } from 'utils/constants';
import ZapAppIcon from 'static/images/zap.svg';
import BTCPayServerIcon from 'static/images/btcpayserver.svg';
import './SelectType.less';

interface Props {
  onSelectNodeType(type: NODE_TYPE): void;
}

export default class SelectType extends React.Component<Props> {
  render() {
    const { onSelectNodeType } = this.props;

    return (
      <div className="SelectType">
        <Button
          size="large"
          icon="laptop"
          block
          onClick={() => onSelectNodeType(NODE_TYPE.LOCAL)}
        >
          Local node
        </Button>
        <Button
          size="large"
          icon="global"
          block
          onClick={() => onSelectNodeType(NODE_TYPE.REMOTE)}
        >
          Remote node
        </Button>
        <Button
          size="large"
          block
          onClick={() => onSelectNodeType(NODE_TYPE.ZAP_DESKTOP)}
        >
          <Icon component={ZapAppIcon} /> Zap Desktop
        </Button>
        <Button
          size="large"
          block
          onClick={() => onSelectNodeType(NODE_TYPE.BTCPAY_SERVER)}
        >
          <Icon component={BTCPayServerIcon} /> BTCPay Server
        </Button>
        <Collapse>
          <Collapse.Panel header="Need help? Click here" key="help">
            <p>
              In order to run Joule, you must run your own LND node (other node types
              coming soon). You can use one of the following for example:
            </p>
            <ul>
              <li>
                <a
                  href="https://github.com/PierreRochard/node-launcher/releases"
                  target="_blank"
                  rel="noopener nofollow"
                >
                  Pierre Rochard's Node Launcher
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/lightninglabs/lightning-app"
                  target="_blank"
                  rel="noopener nofollow"
                >
                  The official Lightning desktop application
                </a>{' '}
                <small>(Testnet only)</small>
              </li>
              <li>
                <a
                  href="https://zap.jackmallers.com/"
                  target="_blank"
                  rel="noopener nofollow"
                >
                  The Zap desktop client
                </a>{' '}
                <small>(Testnet only)</small>
              </li>
              <li>
                <a
                  href="https://dev.lightning.community/guides/installation/"
                  target="_blank"
                  rel="noopener nofollow"
                >
                  The LND command line tool
                </a>
              </li>
            </ul>
            <p>
              All of these will start up a local node. Alternatively, you can run LND on a
              server to be able to connect remotely from any computer.
            </p>
            <p>
              Once you've set up the node, you'll need to find where it stores the
              macaroons for access. This will depend on which client you're running. Refer
              to their documentation.
            </p>
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }
}
