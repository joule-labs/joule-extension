// Huge bastardization of ant design's Transfer component
import React from 'react';
import { Transfer, Button } from 'antd';
import { TransferListProps } from 'antd/lib/transfer';
import { removeDomainPrefix } from 'utils/formatters';
import './DomainLists.less';

interface Props {
  enabled: string[];
  rejected: string[];
  removeEnabledDomain(domain: string): void;
  removeRejectedDomain(domain: string): void;
  addEnabledDomain(domain: string): void;
  addRejectedDomain(domain: string): void;
}

const APPROVED = 'Approved';
const REJECTED = 'Rejected';

export default class DomainLists extends React.Component<Props> {
  render() {
    const { enabled, rejected } = this.props;
    const data = enabled.concat(rejected).map((domain) => ({
      key: domain,
      title: domain,
    }));
    console.log(data);

    return (
      <Transfer
        className="DomainLists"
        titles={[APPROVED, REJECTED]}
        dataSource={data}
        targetKeys={rejected}
        render={(item) => removeDomainPrefix(item.title as string)}
        footer={this.renderFooter}
        locale={{
          itemUnit: 'site',
          itemsUnit: 'sites',
          notFoundContent: 'No sites yet',
          searchPlaceholder: 'Search here',
        }}
      />
    );
  }

  private renderFooter = (props: TransferListProps) => {
    const disabled = !props.checkedKeys.length;
    const handleMove =
      props.titleText === APPROVED
        ? this.moveDomainsToRejected
        : this.moveDomainsToEnabled;
    const handleRemove =
      props.titleText === APPROVED
        ? this.removeDomainsFromEnabled
        : this.removeDomainsFromRejected;
    const moveText = props.titleText === APPROVED ? 'Reject' : 'Enable';

    return (
      <div className="DomainLists-actions">
        <Button
          disabled={disabled}
          size="small"
          onClick={() => handleMove(props.checkedKeys)}
        >
          {moveText}
        </Button>
        <Button
          disabled={disabled}
          size="small"
          onClick={() => handleRemove(props.checkedKeys)}
        >
          Remove
        </Button>
      </div>
    );
  };

  private moveDomainsToRejected = (domains: string[]) => {
    domains.forEach((domain) => {
      this.props.removeEnabledDomain(domain);
      this.props.addRejectedDomain(domain);
    });
  };

  private moveDomainsToEnabled = (domains: string[]) => {
    domains.forEach((domain) => {
      this.props.removeRejectedDomain(domain);
      this.props.addEnabledDomain(domain);
    });
  };

  private removeDomainsFromEnabled = (domains: string[]) => {
    domains.forEach((domain) => this.props.removeEnabledDomain(domain));
  };

  private removeDomainsFromRejected = (domains: string[]) => {
    domains.forEach((domain) => this.props.removeRejectedDomain(domain));
  };
}
