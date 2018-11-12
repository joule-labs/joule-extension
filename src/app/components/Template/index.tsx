import React from 'react';
import Logo from 'static/images/logo.png';
import './style.less';

interface Props {
  children: React.ReactNode;
}

export default class Template extends React.Component<Props> {
  render() {
    return (
      <div className="Template">
        <div className="Template-header">
          <div className="Template-header-inner">
            <div className="Template-header-branding">
              <div className="Template-header-branding-logo">
                <img src={Logo} />
              </div>
              <div className="Template-header-branding-title">
                Joule
              </div>
              <div className="Template-header-branding-alpha">
                Alpha
              </div>
            </div>
          </div>
        </div>
        <div className="Template-content">
          <div className="Template-content-inner">
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}