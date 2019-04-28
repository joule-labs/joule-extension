import React from 'react';
import './DetailsTable.less';

export interface DetailsRow {
  label: string;
  value: React.ReactNode;
}

const DetailsTable: React.SFC<{ details: DetailsRow[] }> = ({ details }) => {
  return (
    <table className="DetailsTable">
      <tbody>
        {details.map(d => (
          <tr className="DetailsTable-row" key={d.label}>
            <td className="DetailsTable-row-label">{d.label}</td>
            <td className="DetailsTable-row-value">{d.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DetailsTable;
