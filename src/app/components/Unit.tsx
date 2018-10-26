import React from 'react';

interface Props {
  value: string;
}

const Unit: React.SFC<Props> = ({ value }) => (
  <span>{value} sats</span>
);

export default Unit;