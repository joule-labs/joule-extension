import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, Row, Col, Alert, Checkbox } from 'antd';
import QRCode from 'qrcode.react';
import Copy from 'components/Copy';
import AmountField from 'components/AmountField';
import { createInvoice, resetCreateInvoice } from 'modules/payment/actions';
import { AppState } from 'store/reducers';
import './style.less';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { getNodeChain } from 'modules/node/selectors';

interface StateProps {
  invoice: AppState['payment']['invoice'];
  isCreatingInvoice: AppState['payment']['isCreatingInvoice'];
  invoiceError: AppState['payment']['invoiceError'];
  denomination: AppState['settings']['denomination'];
}

interface DispatchProps {
  createInvoice: typeof createInvoice;
  resetCreateInvoice: typeof resetCreateInvoice;
}

interface OwnProps {
  close?(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  amount: string;
  isAnyValue: boolean;
  memo: string;
  fallbackAddress: string;
  expiry: string;
}

const INITIAL_STATE = {
  amount: '',
  isAnyValue: false,
  memo: '',
  fallbackAddress: '',
  expiry: '24',
};

class InvoiceForm extends React.Component<Props, State> {
  state: State = { ...INITIAL_STATE };

  componentWillUnmount() {
    this.props.resetCreateInvoice();
  }

  render() {
    const { invoice, isCreatingInvoice, invoiceError, close } = this.props;
    const { isAnyValue, memo, expiry, fallbackAddress, amount } = this.state;
    const disabled = (!amount && !isAnyValue) || !parseInt(expiry, 10);

    let content;
    if (invoice) {
      content = (
        <div className="InvoiceForm-invoice">
          <h3 className="InvoiceForm-invoice-title">
            Succesfully created invoice #{invoice.add_index}
          </h3>
          <div className="InvoiceForm-invoice-qr">
            <QRCode value={invoice.payment_request} size={200} />
          </div>
          <Copy text={invoice.payment_request}>
            <code className="InvoiceForm-invoice-reqcode">
              {invoice.payment_request}
            </code>
          </Copy>
          <div className="InvoiceForm-invoice-buttons">
            {close && (
              <Button size="large" onClick={close}>
                Back to home
              </Button>
            )}
            <Button size="large" type="primary" onClick={this.reset}>
              Create another
            </Button>
          </div>
        </div>
      );
    } else {
      content = (
        <Form
          className="InvoiceForm-form"
          layout="vertical"
          onSubmit={this.handleSubmit}
        >
          <AmountField
            label="Amount"
            amount={amount}
            required={!isAnyValue}
            disabled={isAnyValue}
            onChangeAmount={this.handleChangeAmount}
            showFiat
          />
          <div className="InvoiceForm-form-anyValue">
            <Checkbox onChange={this.handleChangeAnyValue} checked={isAnyValue}>
              Allow any amount to be sent
            </Checkbox>
          </div>
          <Form.Item label="Memo">
            <Input
              name="memo"
              value={memo}
              autoComplete="off"
              onChange={this.handleChange}
              placeholder="Optional"
            />
          </Form.Item>
          <Row>
            <Col span={12}>
              <Form.Item label="Fallback address">
                <Input
                  name="fallbackAddress"
                  value={fallbackAddress}
                  onChange={this.handleChange}
                  placeholder="Optional"
                />
              </Form.Item>
            </Col>
            <Col offset={1} span={11}>
              <Form.Item label="Expires">
                <Input
                  type="number"
                  name="expiry"
                  value={expiry}
                  onChange={this.handleChange}
                  addonAfter="hours"
                />
              </Form.Item>
            </Col>
          </Row>
          
          {invoiceError &&
            <Alert
              type="error"
              message="Failed to create invoice"
              description={invoiceError.message}
              showIcon
              closable
            />
          }

          <div className="InvoiceForm-buttons">
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              disabled={disabled}
              loading={isCreatingInvoice}
              block
            >
              Generate invoice
            </Button>
          </div>
        </Form>
      );
    }

    return (
      <div className="InvoiceForm">
        {content}
      </div>
    )
  }

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.currentTarget;
    this.setState({ [name]: value } as any);
  };

  private handleChangeAmount = (amount: string) => {
    this.setState({ amount });
  };

  private handleChangeAnyValue = (ev: CheckboxChangeEvent) => {
    this.setState({
      isAnyValue: ev.target.checked,
      amount: '',
    });
  }

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const { amount, memo, fallbackAddress, expiry, isAnyValue } = this.state;
    this.props.createInvoice({
      value: isAnyValue ? undefined : amount,
      memo,
      fallback_addr: fallbackAddress,
      expiry: parseInt(expiry, 10) * 3600,
    });
  };

  private reset = () => {
    this.setState({ ...INITIAL_STATE });
    this.props.resetCreateInvoice();
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    invoice: state.payment.invoice,
    isCreatingInvoice: state.payment.isCreatingInvoice,
    invoiceError: state.payment.invoiceError,
    denomination: state.settings.denomination,
    fiat: state.settings.fiat,
    isNoFiat: state.settings.isNoFiat,
    rates: state.rates.rates,
    chain: getNodeChain(state),
  }),
  {
    createInvoice,
    resetCreateInvoice,
  },
)(InvoiceForm);