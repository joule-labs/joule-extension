import React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { Select, Button, Modal, AutoComplete, Input, Icon, message } from 'antd';
import BigMessage from 'components/BigMessage';
import AllowanceForm from 'components/AllowanceForm';
import { shortDomain, removeDomainPrefix } from 'utils/formatters';
import { isValidDomain } from 'utils/validators';
import { DEFAULT_ALLOWANCE } from 'utils/constants';
import { setAppConfig } from 'modules/appconf/actions';
import { AppState } from 'store/reducers';
import './allowances.less';

interface StateProps {
  appConfigs: AppState['appconf']['configs'];
  enabledDomains: AppState['settings']['enabledDomains'];
}

interface DispatchProps {
  setAppConfig: typeof setAppConfig;
}

type Props = StateProps & DispatchProps & RouteComponentProps;

interface State {
  domain: string;
  isAdding: boolean;
}

class AllowancesPage extends React.Component<Props, State> {
  state: State = {
    domain: '',
    isAdding: false,
  };

  componentDidMount() {
    // Redirects with domain specified are set by default
    const { location, appConfigs } = this.props;
    if (location.state && location.state.domain) {
      this.setState({ domain: location.state.domain });
      // If they don't already have an allowance, make an inactive one for them
      if (!appConfigs[location.state.domain]) {
        this.props.setAppConfig(location.state.domain, {
          allowance: {
            ...DEFAULT_ALLOWANCE,
            active: false,
          },
        });
      }
    }
  }

  render() {
    const { appConfigs, enabledDomains } = this.props;
    const { domain, isAdding } = this.state;

    const config = appConfigs[domain];
    const configDomains = Object.keys(appConfigs);

    return (
      <div className="Allowances">
        <div className="Allowances-control">
          <span>Allowance for</span>
          <Select
            className="Allowances-control-select"
            showSearch
            placeholder="Select an app"
            onChange={this.handleChangeDomain}
            value={domain && config ? domain : undefined}
          >
            {configDomains.map(d => (
              <Select.Option value={d} key={d}>
                {shortDomain(d)}
              </Select.Option>
            ))}
          </Select>
          <Button type="primary" onClick={this.openAddModal}>
            <Icon type="plus" /> New
          </Button>
        </div>

        <div className="Allowances-form" key={domain}>
          {config ? (
            <AllowanceForm domain={domain} appConfig={config} />
          ) : (
            <div className="Allowances-form-empty">
              <BigMessage
                title="Select an Allowance"
                message="Choose an existing allowance from the dropdown, or add a new one"
              />
            </div>
          )}
        </div>

        <Modal
          title="Add allowance"
          visible={isAdding}
          onCancel={this.closeAddModal}
          footer={null}
        >
          <AutoComplete
            className="Allowances-add"
            size="large"
            dataSource={enabledDomains}
            filterOption={this.filterAddDomains}
          >
            <Input.Search
              className="Allowances-add-input"
              placeholder="Enter or select a domain"
              enterButton={<Icon type="plus" />}
              onSearch={v => {
                setTimeout(() => this.submitAddDomain(v), 100);
              }}
              autoFocus
            />
          </AutoComplete>
          <div className="Allowances-addHint">Must specify http:// or https://</div>
        </Modal>
      </div>
    );
  }

  private handleChangeDomain = (domain: string) => {
    this.setState({ domain });
  };

  private filterAddDomains = (val: string, option: any) => {
    return (
      option.key.indexOf(val.toLowerCase()) === 0 ||
      removeDomainPrefix(option.key).indexOf(val.toLowerCase()) === 0
    );
  };

  private submitAddDomain = (domain: string) => {
    if (!isValidDomain(domain)) {
      message.warn('Invalid domain name');
      return;
    }

    if (!this.props.appConfigs[domain]) {
      this.props.setAppConfig(domain, {
        allowance: { ...DEFAULT_ALLOWANCE },
      });
    }
    this.setState({ domain });
    this.closeAddModal();
  };

  private openAddModal = () => this.setState({ isAdding: true });
  private closeAddModal = () => this.setState({ isAdding: false });
}

const ConnectedAllowancesPage = connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    appConfigs: state.appconf.configs,
    enabledDomains: state.settings.enabledDomains,
  }),
  { setAppConfig },
)(AllowancesPage);

export default withRouter(ConnectedAllowancesPage);
