import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { AppState } from 'store/reducers';
import AmountField from 'components/AmountField';
import Unit from 'components/Unit';
import { blockchainDisplayName } from 'utils/constants';
import { getNodeChain } from 'modules/node/selectors';

import './ChainSend.less';

interface StateProps {
  account: AppState['account']['account'];
  chain: ReturnType<typeof getNodeChain>;
}

interface DispatchProps {
}

interface OwnProps {
  close?(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  amount: string;
  isSendAll: boolean;
  address: string;
}

const INITIAL_STATE = {
  amount: '',
  isSendAll: false,
  address: '',
};

class ChainSend extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...INITIAL_STATE
    }
  }

  render() {
    const { account, chain } = this.props;
    const { amount, isSendAll, address } = this.state;
    const disabled = (!amount && !isSendAll) || !address;

    return (
      <Form
        className="BitcoinSend"
        layout="vertical"
        onSubmit={this.handleSubmit}
      >
        <AmountField
          label="Amount"
          amount={amount}
          onChangeAmount={this.handleChangeAmount}
          required={!isSendAll}
          disabled={isSendAll}
          showFiat
        />
        <div className="BitcoinSend-sendAll">
          <Checkbox onChange={this.handleChangeSendAll} checked={isSendAll}>
            Send all
            {account && <strong> <Unit value={account.blockchainBalance} /> </strong>}
            in {blockchainDisplayName[chain]} wallet
          </Checkbox>
        </div>
        <Form.Item label="Recipient" required>
          <Input
            name="address"
            value={address}
            autoComplete="off"
            onChange={this.handleChangeAddress}
            placeholder="Enter Bitcoin wallet address"
          />
        </Form.Item>

        <div className="BitcoinSend-buttons">
          <Button size="large" type="ghost" onClick={this.reset}>
            Reset
          </Button>
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            disabled={disabled}
          >
            Send
          </Button>
        </div>
      </Form>
    );
  }

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
  };  

  private handleChangeAmount = (amount: string) => {
    this.setState({ amount });
  };

  private handleChangeSendAll = (ev: CheckboxChangeEvent) => {
    this.setState({ isSendAll: ev.target.checked, amount: '' });
  };

  private handleChangeAddress = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ address: ev.target.value });
  };

  private reset = () => {
    this.setState({ ...INITIAL_STATE });
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    account: state.account.account,
    chain: getNodeChain(state),
  }),
  {
  },
)(ChainSend);