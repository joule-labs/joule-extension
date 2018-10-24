import React from 'react';
import classnames from 'classnames';
import { toSvg } from 'jdenticon';
import './Identicon.less';

interface Props extends React.HTMLProps<HTMLDivElement> {
  pubkey: string;
  size?: number;
}

const Identicon: React.SFC<Props> = ({ pubkey, size, ...rest }) => {
  size = size || 100;
  const identicon = toSvg(pubkey, size || 100);
  return (
    <div
      {...rest}
      className={classnames('Identicon', rest.className)}
      dangerouslySetInnerHTML={{ __html: identicon }}
    />
  );
};

export default Identicon;