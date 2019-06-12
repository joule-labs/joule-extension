import React from 'react';
import classnames from 'classnames';
import { browser } from 'webextension-polyfill-ts';
import { connect } from 'react-redux';
import { Button, Input, Switch, Form, Progress, Row, Col, Icon, Modal } from 'antd';
import { Allowance, AppConfig } from 'modules/appconf/types';
import { DEFAULT_ALLOWANCE, COLORS } from 'utils/constants';
import { setAppConfig, deleteAppConfig } from 'modules/appconf/actions';
import { AppState } from 'store/reducers';
import './index.less';

interface OwnProps {
  domain: string;
  appConfig: AppConfig;
}

interface DispatchProps {
  setAppConfig: typeof setAppConfig;
  deleteAppConfig: typeof deleteAppConfig;
}

type Props = OwnProps & DispatchProps;

interface State {
  checkingNotifPermission: boolean;
  hasNotifPermission: boolean;
}

class AllowancesPage extends React.Component<Props, State> {
  state: State = {
    checkingNotifPermission: true,
    hasNotifPermission: false,
  };

  async componentDidMount() {
    const perms = await browser.permissions.getAll();
    this.setState({
      checkingNotifPermission: false,
      hasNotifPermission: (perms.permissions || []).includes('notifications'),
    });
  }

  render() {
    const { domain, appConfig } = this.props;
    const { checkingNotifPermission, hasNotifPermission } = this.state;
    const allowance = appConfig.allowance || DEFAULT_ALLOWANCE;

    return (
      <div className="AllowanceForm">
        <div className="AllowanceForm-header">
          <div className="AllowanceForm-header-domain">{domain}</div>
          <div className="AllowanceForm-header-toggle">
            <span className="AllowanceForm-header-toggle-label">Active</span>
            <Switch checked={allowance.active} onChange={this.toggleAllowanceActive} />
          </div>
        </div>
        <Form
          layout="vertical"
          className={classnames(
            'AllowanceForm-fields',
            !allowance.active && 'is-inactive',
          )}
        >
          <Form.Item label="Balance" className="AllowanceForm-fields-balance">
            <div>
              <Input
                className="AllowanceForm-fields-balance-total"
                name="total"
                size="large"
                value={allowance.total}
                onChange={this.handleChangeAllowanceField}
                addonAfter="sats"
              />
              <Button
                type="primary"
                block
                onClick={this.refillAllowance}
                disabled={allowance.balance >= allowance.total}
              >
                <Icon type="thunderbolt" theme="filled" /> Refill balance
              </Button>
            </div>
            <Progress
              className="AllowanceForm-fields-balance-bar"
              type="dashboard"
              status="normal"
              strokeColor={COLORS.PRIMARY}
              percent={(allowance.balance / allowance.total) * 100}
              format={pct => (
                <>
                  <div>{pct}%</div>
                  <small>{allowance.balance} sats left</small>
                </>
              )}
            />
          </Form.Item>
          <Row>
            <Col span={10}>
              <Form.Item label="Max payment">
                <Input
                  name="maxPerPayment"
                  value={allowance.maxPerPayment}
                  onChange={this.handleChangeAllowanceField}
                  addonAfter="sats"
                />
              </Form.Item>
            </Col>
            <Col offset={1} span={8}>
              <Form.Item label="Cooldown">
                <Input
                  name="minIntervalPerPayment"
                  value={allowance.minIntervalPerPayment}
                  onChange={this.handleChangeAllowanceField}
                  addonAfter="sec"
                />
              </Form.Item>
            </Col>
            <Col offset={1} span={4}>
              <Form.Item label="Notify">
                {!checkingNotifPermission && (
                  <Switch
                    checked={hasNotifPermission && allowance.notifications}
                    onChange={this.toggleAllowanceNotifications}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Button type="danger" ghost block onClick={this.promptDelete}>
            Delete allowance configuration
          </Button>
        </Form>
      </div>
    );
  }

  private handleChangeAllowanceField = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { appConfig, domain } = this.props;
    const allowance = appConfig.allowance || DEFAULT_ALLOWANCE;
    const { name } = ev.currentTarget;
    const value = parseInt(ev.currentTarget.value, 10);
    if (!value) {
      return;
    }

    this.props.setAppConfig(domain, {
      ...appConfig,
      allowance: {
        ...allowance,
        [name]: value,
        // Set balance to the total if it's changed
        balance: name === 'total' ? value : allowance.balance,
      } as Allowance,
    });
  };

  private toggleAllowanceActive = (active: boolean) => {
    const { appConfig, domain } = this.props;
    const allowance = appConfig.allowance || DEFAULT_ALLOWANCE;
    this.props.setAppConfig(domain, {
      ...appConfig,
      allowance: {
        ...allowance,
        active,
      },
    });
  };

  private toggleAllowanceNotifications = async (notifications: boolean) => {
    const { appConfig, domain } = this.props;
    const { hasNotifPermission } = this.state;
    const allowance = appConfig.allowance || DEFAULT_ALLOWANCE;

    // Request permission first, noop if they deny it
    if (!hasNotifPermission) {
      const granted = await browser.permissions.request({
        permissions: ['notifications'],
      });
      if (!granted) {
        return;
      }
      this.setState({ hasNotifPermission: true });
    }

    this.props.setAppConfig(domain, {
      ...appConfig,
      allowance: {
        ...allowance,
        notifications,
      },
    });
  };

  private refillAllowance = () => {
    const { appConfig, domain } = this.props;
    const allowance = appConfig.allowance || DEFAULT_ALLOWANCE;
    this.props.setAppConfig(domain, {
      ...appConfig,
      allowance: {
        ...allowance,
        balance: allowance.total,
      },
    });
  };

  private promptDelete = () => {
    Modal.confirm({
      title: 'Are you sure?',
      content: `
        Your allowance configuration will be lost. You can always reconfigure
        it later.
      `,
      okText: 'Confirm',
      cancelText: 'Never mind',
      onOk: cb => {
        this.props.deleteAppConfig(this.props.domain);
        cb();
      },
    });
  };
}

export default connect<{}, DispatchProps, OwnProps, AppState>(
  undefined,
  {
    setAppConfig,
    deleteAppConfig,
  },
)(AllowancesPage);
