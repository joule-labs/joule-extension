import React from 'react';
import classnames from 'classnames';
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

class AllowancesPage extends React.Component<Props> {
  render() {
    const { domain, appConfig } = this.props;
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
              <Button type="primary" onClick={this.refillAllowance} block>
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
            <Col span={12}>
              <Form.Item label="Max payment">
                <Input
                  name="maxPerPayment"
                  value={allowance.maxPerPayment}
                  onChange={this.handleChangeAllowanceField}
                  addonAfter="sats"
                />
              </Form.Item>
            </Col>
            <Col offset={1} span={11}>
              <Form.Item label="Cooldown">
                <Input
                  name="minIntervalPerPayment"
                  value={allowance.minIntervalPerPayment}
                  onChange={this.handleChangeAllowanceField}
                  addonAfter="seconds"
                />
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
