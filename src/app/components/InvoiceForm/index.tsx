import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Select, Button, Row, Col, Alert } from 'antd';
import QRCode from 'qrcode.react';
import Copy from 'components/Copy';
import { Denomination, denominationSymbols, fiatSymbols } from 'utils/constants';
import { fromUnitToBitcoin, fromBitcoinToUnit, fromUnitToBase } from 'utils/units';
import { createInvoice, resetCreateInvoice } from 'modules/payment/actions';
import { AppState } from 'store/reducers';
import './style.less';
import { typedKeys } from 'utils/ts';

interface StateProps {
  invoice: AppState['payment']['invoice'];
  isCreatingInvoice: AppState['payment']['isCreatingInvoice'];
  invoiceError: AppState['payment']['invoiceError'];
  denomination: AppState['settings']['denomination'];
  fiat: AppState['settings']['fiat'];
  isNoFiat: AppState['settings']['isNoFiat'];
  rates: AppState['rates']['rates'];
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
  value: string;
  valueFiat: string;
  denomination: Denomination;
  memo: string;
  fallbackAddress: string;
  expiry: string;
}

const INITIAL_STATE = {
  value: '',
  valueFiat: '',
  memo: '',
  fallbackAddress: '',
  expiry: '24',
};

class InvoiceForm extends React.Component<Props, State> {
  state: State = {
    ...INITIAL_STATE,
    denomination: this.props.denomination,
  };

  componentWillUnmount() {
    this.props.resetCreateInvoice();
  }

  render() {
    const { invoice, isCreatingInvoice, invoiceError, close, fiat, isNoFiat, rates } = this.props;
    const { value, valueFiat, memo, expiry, fallbackAddress, denomination } = this.state;
    const disabled = !value || !parseInt(expiry, 10);

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
          <Form.Item label="Amount" required>
            <div className="InvoiceForm-form-values">
              <Input.Group compact>
                <Input
                  type="number"
                  name="value"
                  value={value}
                  onChange={this.handleChangeValue}
                  autoFocus
                  placeholder="1000"
                />
                <Select
                  onChange={this.handleChangeDenomination}
                  value={denomination}
                  dropdownMatchSelectWidth={false}
                >
                  {typedKeys(Denomination).map(d => (
                    <Select.Option key={d} value={d}>
                      {denominationSymbols[d]}
                    </Select.Option>
                  ))}
                </Select>
              </Input.Group>
              {!isNoFiat && (
                <>
                  <div className="InvoiceForm-form-values-divider">
                    or
                  </div>
                  <Input
                    type="number"
                    name="valueFiat"
                    value={valueFiat}
                    onChange={this.handleChangeValue}
                    addonBefore={fiatSymbols[fiat]}
                    placeholder="1.00"
                    disabled={!rates}
                  />
                </>
              )}
            </div>
          </Form.Item>
          <Form.Item label="Memo">
            <Input
              name="memo"
              value={memo}
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

  private handleChangeValue = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.currentTarget;
    this.updateBothValues(name, value);
  };

  private handleChangeDenomination = (value: any) => {
    this.setState({ denomination: value as Denomination }, () => {
      this.updateBothValues('value', this.state.value);
    });
  };

  private updateBothValues = (name: string, val: string) => {
    const { fiat, rates } = this.props;
    const { denomination } = this.state;
    let { value, valueFiat } = this.state;
  
    if (name === 'value') {
      value = val;
      if (rates) {
        const btc = fromUnitToBitcoin(value, denomination);
        valueFiat = (rates[fiat] * parseFloat(btc)).toFixed(2);
      }
    }
    else {
      valueFiat = val;
      if (rates) {
        const btc = (parseFloat(valueFiat) / rates[fiat]).toFixed(8);
        value = fromBitcoinToUnit(btc, denomination);
      }
    }

    this.setState({ value, valueFiat });
  };

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const { memo, fallbackAddress, expiry, denomination } = this.state;
    const value = fromUnitToBase(this.state.value, denomination);
    this.props.createInvoice({
      value,
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
  }),
  {
    createInvoice,
    resetCreateInvoice,
  },
)(InvoiceForm);