import React from 'react';
import BN from 'bn.js';
import { connect } from 'react-redux';
import { Form, Input, Select, Button } from 'antd';
import { RequestInvoiceArgs, RequestInvoiceResponse } from 'webln/lib/provider';
import PromptTemplate from 'components/PromptTemplate';
import { getPromptArgs, getPromptOrigin, watchUntilPropChange, OriginData } from 'utils/prompt';
import { removeDomainPrefix } from 'utils/formatters';
import { Denomination, denominationSymbols, fiatSymbols } from 'utils/constants';
import { typedKeys } from 'utils/ts';
import { fromBaseToUnit, fromUnitToBase, fromUnitToFiat } from 'utils/units';
import { createInvoice } from 'modules/payment/actions';
import { AppState } from 'store/reducers';
import './invoice.less';

interface StateProps {
  invoice: AppState['payment']['invoice'];
  isCreatingInvoice: AppState['payment']['isCreatingInvoice'];
  invoiceError: AppState['payment']['invoiceError'];
  denomination: AppState['settings']['denomination'];
  fiat: AppState['settings']['fiat'];
  isNoFiat: AppState['settings']['isNoFiat'];
  rates: AppState['rates']['rates'];
  nodeInfo: AppState['node']['nodeInfo'];
}

interface DispatchProps {
  createInvoice: typeof createInvoice;
}

type Props = StateProps & DispatchProps;

interface State {
  value: string;
  memo: string;
  denomination: Denomination;
  fallbackAddress: string;
  expiry: string;
  isShowingAdvanced: boolean;
}

class InvoicePrompt extends React.Component<Props, State> {
  private args: RequestInvoiceArgs;
  private origin: OriginData;

  constructor(props: Props) {
    super(props);
    this.args = getPromptArgs<RequestInvoiceArgs>();
    this.origin = getPromptOrigin();

    const { denomination } = props;
    const valueSats = this.args.amount || this.args.defaultAmount;
    const value = valueSats ? fromBaseToUnit(valueSats.toString(), denomination).toString() : '';

    this.state = {
      value,
      denomination,
      memo: this.args.defaultMemo || '',
      fallbackAddress: '',
      expiry: '',
      isShowingAdvanced: false,
    };
  }

  render() {
    const { value, denomination, memo, fallbackAddress, expiry, isShowingAdvanced } = this.state;
    const amountError = this.getValueError();
    const isConfirmDisabled = !!amountError;
    const isValueDisabled = !!this.args.amount;
    const amountHelp = this.renderHelp();
    console.log(amountError);

    return (
      <PromptTemplate
        isConfirmDisabled={isConfirmDisabled}
        getConfirmData={this.generateInvoice}
      >
        <div className="InvoicePrompt">
          <div className="InvoicePrompt-header">
            <div className="InvoicePrompt-header-icon">
              <img src={this.origin.icon} />
            </div>
            <h1 className="InvoicePrompt-header-title">
              <strong>{removeDomainPrefix(this.origin.domain)}</strong>
              {' '}wants you to generate an invoice
            </h1>
          </div>
          <Form className="InvoicePrompt-form">
            <Form.Item
              label="Amount"
              help={amountHelp}
              validateStatus={value && amountError ? 'error' : undefined}
              className="InvoicePrompt-form-value"
            >
              <Input.Group size="large" compact>
                <Input
                  size="large"
                  value={value}
                  onChange={this.handleChangeValue}
                  placeholder="Enter an amount"
                  disabled={isValueDisabled}
                  step="any"
                  autoFocus
                />
                <Select
                  size="large"
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
            </Form.Item>
            <Form.Item label="Memo" className="InvoicePrompt-form-memo">
              <Input.TextArea
                value={memo}
                name="memo"
                onChange={this.handleChangeField}
                placeholder="Optional description of the purchase"
                rows={3}
              />
            </Form.Item>

            {isShowingAdvanced ? (
              <div className="InvoicePrompt-form-advanced">
                <Form.Item
                  label="Fallback"
                  help="An on-chain address to falback to for if the payment fails"
                >
                  <Input
                    value={fallbackAddress}
                    name="fallbackAddress"
                    onChange={this.handleChangeField}
                    placeholder="Optional"
                  />
                </Form.Item>
                <Form.Item
                  label="Expiry"
                  help="How long the invoice is valid for, in seconds"
                >
                  <Input
                    value={expiry}
                    name="expiry"
                    onChange={this.handleChangeField}
                    placeholder="Defaults to 1"
                    addonAfter="hours"
                  />
                </Form.Item>
              </div>
            ) : (
              <Button
                className="InvoicePrompt-form-advancedToggle"
                onClick={this.toggleAdvanced}
                type="primary"
                ghost
              >
                Show advanced fields
              </Button>
            )}
          </Form>
        </div>
      </PromptTemplate>
    );
  }

  private renderHelp = () => {
    const { rates, fiat, isNoFiat, nodeInfo } = this.props;
    const { value, denomination } = this.state;
    const helpPieces = [];

    let rateSelector = 'btcRate';
    if (nodeInfo && nodeInfo.chains[0] === 'litecoin') {
      rateSelector = 'ltcRate';
    }

    if (this.args.amount) {
      helpPieces.push(
        <span key="disabled">
          Specific amount was set and cannot be adjusted
        </span>
      );
    } else {
      if (this.args.minimumAmount) {
        helpPieces.push(
          <span key="min">
            <strong>Min:</strong>
            {' '}
            {fromBaseToUnit(this.args.minimumAmount.toString(), denomination)}
            {' '}
            {denominationSymbols[denomination]}
          </span>
        );
      }
      if (this.args.maximumAmount) {
        helpPieces.push(
          <span key="max">
            <strong>Max:</strong>
            {' '}
            {fromBaseToUnit(this.args.maximumAmount.toString(), denomination)}
            {' '}
            {denominationSymbols[denomination]}
          </span>
        );
      }
    }

    if (rates && rates[fiat] && !isNoFiat) {
      const fiatAmt = fromUnitToFiat(
        value,
        denomination,
        rates[rateSelector][fiat],
        fiatSymbols[fiat],
      );
      helpPieces.push(
        <span key="fiat" className="is-fiat">
          ≈ {fiatAmt}
        </span>
      )
    }

    return helpPieces;
  };

  private getValueError = () => {
    const { value, denomination } = this.state;
    const valueBN = new BN(fromUnitToBase(value, denomination));
    if (!value) {
      return 'Must specify value';
    }
    if (this.args.maximumAmount) {
      const max = new BN(this.args.maximumAmount);
      if (max.lt(valueBN)) {
        return 'Amount exceeds maximum';
      }
    }
    if (this.args.minimumAmount) {
      const min = new BN(this.args.minimumAmount);
      if (min.gte(valueBN)) {
        return 'Amount is less than minimum';
      }
    }
  };

  private handleChangeValue = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: ev.target.value });
  };

  private handleChangeDenomination = (val: any) => {
    const denomination = val as Denomination;
    const value = fromBaseToUnit(
      fromUnitToBase(this.state.value, this.state.denomination),
      denomination,
    );
    this.setState({
      denomination,
      value,
    });
  };

  private handleChangeField = (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    this.setState({ [ev.target.name]: ev.target.value } as any);
  };

  private generateInvoice = async (): Promise<RequestInvoiceResponse> => {
    const { memo, fallbackAddress, expiry, denomination } = this.state;
    const value = fromUnitToBase(this.state.value, denomination);
    this.props.createInvoice({
      value,
      memo,
      fallback_addr: fallbackAddress,
      expiry: parseInt(expiry, 10) * 3600,
    });

    const response = await watchUntilPropChange(
      () => this.props.invoice,
      () => this.props.invoiceError,
    );

    if (!response) {
      throw new Error('Failed to create invoice');
    }

    return { paymentRequest: response.payment_request };
  };

  private toggleAdvanced = () => {
    this.setState({ isShowingAdvanced: true });
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    invoice: state.payment.invoice,
    isCreatingInvoice: state.payment.isCreatingInvoice,
    invoiceError: state.payment.invoiceError,
    denomination: state.settings.denomination,
    fiat: state.settings.fiat,
    isNoFiat: state.settings.isNoFiat,
    rates: state.rates.rates,
    nodeInfo: state.node.nodeInfo,
  }),
  { createInvoice },
)(InvoicePrompt);