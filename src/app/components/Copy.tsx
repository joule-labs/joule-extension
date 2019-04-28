import React from 'react';
import { message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface Props {
  children: React.ReactNode;
  text: string;
  name?: string;
}

export default class Copy extends React.Component<Props> {
  render() {
    const { children, text, name } = this.props;
    const msg = name ? `Copied ${name} to clipboard` : 'Copied to clipboard';

    return (
      <CopyToClipboard text={text} onCopy={() => message.success(msg, 1.5)}>
        {children}
      </CopyToClipboard>
    );
  }
}
