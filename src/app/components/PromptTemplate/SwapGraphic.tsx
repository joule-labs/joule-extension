import React from 'react';
import { Icon } from 'antd';
import Logo from 'static/images/logo.png';
import { OriginData } from 'utils/prompt';

import './SwapGraphic.less';

interface Props {
  origin: OriginData;
  message?: string;
}

export default class SwapGraphic extends React.Component<Props> {
  render() {
    return <>
      <div className="SwapGraphic">
        <div className="SwapGraphic-icon">
          <img src={this.props.origin.icon || ''} />
        </div>
        <div className="SwapGraphic-divider">
          <Icon type="swap" />
        </div>
        <div className="SwapGraphic-icon">
          <img src={Logo} />
        </div>
      </div>
      <h2 className="SwapGraphic-message">
        <strong>{this.props.origin.name}</strong>
        {this.props.message && ` ${this.props.message}`}
      </h2>    
    </>;
  }
}