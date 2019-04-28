import React from 'react';
import './TransferIcons.less';

export interface TransferParty {
  name: React.ReactNode;
  icon: React.ReactNode;
  statusClass?: string;
}

const TransferIcons: React.SFC<{
  from: TransferParty;
  to: TransferParty;
  icon: React.ReactNode;
}> = ({ from, to, icon }) => {
  return (
    <div className="TransferIcons">
      <div className="TransferIcons-party is-from">
        <div className="TransferIcons-party-icon">
          {from.icon}
          {from.statusClass && (
            <div className={`TransferIcons-party-icon-status ${from.statusClass}`} />
          )}
        </div>
        <div className="TransferIcons-party-name">{from.name}</div>
      </div>
      <div className="TransferIcons-arrow">{icon}</div>
      <div className="TransferIcons-party is-to">
        <div className="TransferIcons-party-icon">
          {to.icon}
          {to.statusClass && (
            <div className={`TransferIcons-party-icon-status ${to.statusClass}`} />
          )}
        </div>
        <div className="TransferIcons-party-name">{to.name}</div>
      </div>
    </div>
  );
};

export default TransferIcons;
