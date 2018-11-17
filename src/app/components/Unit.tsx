import React from 'react';

interface Props {
  value: string;
  hideUnit?: boolean;
}

const commaify = (num: string) => num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const Unit: React.SFC<Props> = ({ value, hideUnit }) => (
  <span>{commaify(value)} {!hideUnit && 'sats'}</span>
);

export default Unit;