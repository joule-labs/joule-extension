import React from 'react';
import BN from 'bn.js';
import { connect } from 'react-redux';
import { Form, Input, Select, Button, Row, Col, Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { RequestInvoiceArgs, RequestInvoiceResponse } from 'webln';
import PromptTemplate from 'components/PromptTemplate';
import Help from 'components/Help';
import {
  getPromptArgs,
  getPromptOrigin,
  watchUntilPropChange,
  OriginData,
} from 'utils/prompt';
import { removeDomainPrefix } from 'utils/formatters';
import { Denomination, denominationSymbols, fiatSymbols } from 'utils/constants';
import { typedKeys } from 'utils/ts';
import { fromBaseToUnit, fromUnitToBase, fromUnitToFiat } from 'utils/units';
import { createInvoice } from 'modules/payment/actions';
import { AppState } from 'store/reducers';
import { getNodeChain } from 'modules/node/selectors';
import { getChainRates } from 'modules/rates/selectors';
import './invoice.less';

interface StateProps {
  invoice: AppState['payment']['invoice'];
  isCreatingInvoice: AppState['payment']['isCreatingInvoice'];
  invoiceError: AppState['payment']['invoiceError'];
  denomination: AppState['settings']['denomination'];
  fiat: AppState['settings']['fiat'];
  isNoFiat: AppState['settings']['isNoFiat'];
  rates: ReturnType<typeof getChainRates>;
  chain: ReturnType<typeof getNodeChain>;
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
  privateHints: boolean;
  isShowingAdvanced: boolean;
}

const notNilNum = (v: string | number | null | undefined): v is string | number =>
  !!v || v === 0;

class InvoicePrompt extends React.Component<Props, State> {
  private args: RequestInvoiceArgs;
  private origin: OriginData;

  constructor(props: Props) {
    super(props);
    const args = getPromptArgs<RequestInvoiceArgs>();
    this.args = args;
    this.origin = getPromptOrigin();

    const { denomination } = props;
    const valueSats = notNilNum(args.amount) ? args.amount : args.defaultAmount;
    const value = notNilNum(valueSats)
      ? fromBaseToUnit(valueSats.toString(), denomination).toString()
      : '';

    this.state = {
      value,
      denomination,
      memo: this.args.defaultMemo || '',
      fallbackAddress: '',
      expiry: '',
      privateHints: true,
      isShowingAdvanced: false,
    };
  }

  render() {
    const {
      value,
      denomination,
      memo,
      fallbackAddress,
      expiry,
      privateHints,
      isShowingAdvanced,
    } = this.state;
    const { chain } = this.props;
    const amountError = this.getValueError();
    const isConfirmDisabled = !!amountError;
    const isValueDisabled = notNilNum(this.args.amount);
    const amountHelp = this.renderHelp();

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
              <strong>{removeDomainPrefix(this.origin.domain)}</strong> wants you to
              generate an invoice
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
                  value={value === '0' && isValueDisabled ? '0 (Any amount)' : value}
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
                      {denominationSymbols[chain][d]}
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
                <Row>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <>
                          Fallback
                          <Help>
                            An on-chain address to falback to for if the payment cannot be
                            made.
                          </Help>
                        </>
                      }
                    >
                      <Input
                        value={fallbackAddress}
                        name="fallbackAddress"
                        onChange={this.handleChangeField}
                        placeholder="Optional"
                      />
                    </Form.Item>
                  </Col>
                  <Col offset={1} span={11}>
                    <Form.Item
                      label={
                        <>
                          Expiry
                          <Help>
                            How long the invoice is available to be paid for, in hours.
                          </Help>
                        </>
                      }
                    >
                      <Input
                        value={expiry}
                        name="expiry"
                        onChange={this.handleChangeField}
                        placeholder="Defaults to 1"
                        addonAfter="hours"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <div className="InvoicePrompt-form-advanced-private">
                  <Checkbox onChange={this.handleChangePrivate} checked={privateHints}>
                    Include private channel hints
                  </Checkbox>
                  <Help title="Private channel hints">
                    <p>
                      Your invoice can have information about your private channels
                      embedded into it, so that the sender can know to route through them.
                    </p>
                    <p>
                      Unchecking this may make the invoice unpayable. Leaving it checked
                      will allow anyone with the invoice to know your private channels.
                    </p>
                    <p>
                      If you have many private channels, the invoice string may be quite
                      longer than normal.
                    </p>
                  </Help>
                </div>
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
    const { rates, fiat, isNoFiat, chain } = this.props;
    const { value, denomination } = this.state;
    const helpPieces = [];

    if (notNilNum(this.args.amount)) {
      helpPieces.push(
        <span key="disabled">Specific amount was set and cannot be adjusted</span>,
      );
    } else {
      if (notNilNum(this.args.minimumAmount)) {
        helpPieces.push(
          <span key="min">
            <strong>Min:</strong>{' '}
            {fromBaseToUnit(this.args.minimumAmount.toString(), denomination)}{' '}
            {denominationSymbols[chain][denomination]}
          </span>,
        );
      }
      if (notNilNum(this.args.maximumAmount)) {
        helpPieces.push(
          <span key="max">
            <strong>Max:</strong>{' '}
            {fromBaseToUnit(this.args.maximumAmount.toString(), denomination)}{' '}
            {denominationSymbols[chain][denomination]}
          </span>,
        );
      }
    }

    if (rates && !isNoFiat) {
      const fiatAmt = fromUnitToFiat(value, denomination, rates[fiat], fiatSymbols[fiat]);
      helpPieces.push(
        <span key="fiat" className="is-fiat">
          ≈ {fiatAmt}
        </span>,
      );
    }

    return helpPieces;
  };

  private getValueError = () => {
    const { args, state } = this;
    const { value, denomination } = state;
    const valueBN = new BN(fromUnitToBase(value, denomination));
    if (!value) {
      return 'Must specify value';
    }
    if (notNilNum(args.maximumAmount)) {
      const max = new BN(args.maximumAmount);
      if (max.lt(valueBN)) {
        return 'Amount exceeds maximum';
      }
    }
    if (notNilNum(args.minimumAmount)) {
      const min = new BN(args.minimumAmount);
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

  private handleChangeField = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    this.setState({ [ev.target.name]: ev.target.value } as any);
  };

  private handleChangePrivate = (ev: CheckboxChangeEvent) => {
    this.setState({ privateHints: ev.target.checked });
  };

  private generateInvoice = async (): Promise<RequestInvoiceResponse> => {
    const { memo, fallbackAddress, expiry, denomination, privateHints } = this.state;
    const value = fromUnitToBase(this.state.value, denomination);
    this.props.createInvoice({
      value,
      memo,
      fallback_addr: fallbackAddress,
      expiry: parseInt(expiry, 10) * 3600,
      private: privateHints,
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
    rates: getChainRates(state),
    chain: getNodeChain(state),
  }),
  { createInvoice },
)(InvoicePrompt);
