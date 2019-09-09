import React from 'react';
import './DetailsTable.less';
import Help from './Help';

export interface DetailsRow {
  label: string;
  value: React.ReactNode;
  help?: string;
}

const DetailsTable: React.SFC<{ details: DetailsRow[] }> = ({ details }) => {
  return (
    <table className="DetailsTable">
      <tbody>
        {details.map(d => (
          <tr className="DetailsTable-row" key={d.label}>
            <td className="DetailsTable-row-label">
              {d.label} {d.help && <Help>{d.help}</Help>}
            </td>
            <td className="DetailsTable-row-value">{d.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DetailsTable;
