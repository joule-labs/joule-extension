import React from 'react';
import PromptTemplate from 'components/PromptTemplate';
import './authorize.less';

export default class AuthorizePrompt extends React.Component {
  render() {
    return (
      <PromptTemplate isContentCentered>
        <div className="AuthorizePrompt">
          <h2>This site wants to connect</h2>
          <h3>They want to know</h3>
          <ul>
            <li>Your node's alias & color</li>
            <li>Your node's public key</li>
          </ul>
          <h3>They'd like to be able to prompt you to</h3>
          <ul>
            <li>Send a payment</li>
            <li>Generate an invoice</li>
            <li>Sign a message</li>
          </ul>
        </div>
      </PromptTemplate>
    );
  }
}
