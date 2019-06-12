import React from 'react';
import { connect } from 'react-redux';
import { browser } from 'webextension-polyfill-ts';
import { Icon } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { AppState } from 'store/reducers';
import {
  addEnabledDomain,
  removeEnabledDomain,
  addRejectedDomain,
  removeRejectedDomain,
} from 'modules/settings/actions';
import { shortDomain } from 'utils/formatters';
import Tooltip from 'components/Tooltip';
import AllowanceIcon from 'static/images/piggy-bank.svg';
import './index.less';

interface StateProps {
  enabledDomains: AppState['settings']['enabledDomains'];
  rejectedDomains: AppState['settings']['rejectedDomains'];
}

interface DispatchProps {
  addEnabledDomain: typeof addEnabledDomain;
  removeEnabledDomain: typeof removeEnabledDomain;
  addRejectedDomain: typeof addRejectedDomain;
  removeRejectedDomain: typeof removeRejectedDomain;
}

type Props = StateProps & DispatchProps & RouteComponentProps;

interface State {
  currentOrigin: string;
}

class ActiveAppBanner extends React.Component<Props, State> {
  state: State = {
    currentOrigin: '',
  };

  async componentDidMount() {
    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab.url) {
        this.setState({ currentOrigin: new URL(tab.url).origin });
      }
    } catch (err) {
      // no-op, just don't render the banner
    }
  }

  render() {
    const { enabledDomains, rejectedDomains } = this.props;
    const { currentOrigin } = this.state;
    const isEnabled = enabledDomains.includes(currentOrigin);
    const isRejected = rejectedDomains.includes(currentOrigin);

    // Render nothing if they're not on a tab, or it's not a webln page
    if (!currentOrigin || (!isEnabled && !isRejected)) {
      return null;
    }

    if (isRejected) {
      return (
        <div className="ActiveAppBanner is-rejected">
          <div className="ActiveAppBanner-message">
            <strong>{shortDomain(currentOrigin)}</strong> is rejected
          </div>
          <div className="ActiveAppBanner-actions">
            <Tooltip title="Enable WebLN for this app" placement="bottom">
              <button className="ActiveAppBanner-actions-btn" onClick={this.enable}>
                <Icon type="check" />
              </button>
            </Tooltip>
          </div>
        </div>
      );
    }

    if (isEnabled) {
      return (
        <div className="ActiveAppBanner is-enabled">
          <div className="ActiveAppBanner-message">
            <strong>{shortDomain(currentOrigin)}</strong> is enabled
          </div>
          <div className="ActiveAppBanner-actions">
            <Tooltip title="Disable WebLN for this app" placement="bottom">
              <button className="ActiveAppBanner-actions-btn" onClick={this.reject}>
                <Icon type="stop" />
              </button>
            </Tooltip>
            <Tooltip title="Configure allowance" placement="bottom">
              <button
                className="ActiveAppBanner-actions-btn"
                onClick={this.goToAllowance}
              >
                <Icon component={AllowanceIcon} />
              </button>
            </Tooltip>
          </div>
        </div>
      );
    }
  }

  private enable = () => {
    this.props.addEnabledDomain(this.state.currentOrigin);
    this.props.removeRejectedDomain(this.state.currentOrigin);
  };

  private reject = () => {
    this.props.addRejectedDomain(this.state.currentOrigin);
    this.props.removeEnabledDomain(this.state.currentOrigin);
  };

  private goToAllowance = () => {
    this.props.history.push(`/allowances`, { domain: this.state.currentOrigin });
  };
}

const ConnectedActiveAppBanner = connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    enabledDomains: state.settings.enabledDomains,
    rejectedDomains: state.settings.rejectedDomains,
  }),
  {
    addEnabledDomain,
    removeEnabledDomain,
    addRejectedDomain,
    removeRejectedDomain,
  },
)(ActiveAppBanner);

export default withRouter(ConnectedActiveAppBanner);
