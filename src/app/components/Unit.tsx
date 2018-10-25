import React from 'react';
import BN from 'bn.js';

interface Props {
  value: string;
}

const Unit: React.SFC<Props> = ({ value }) => (
  <span>{value} sats</span>
);

export default Unit;