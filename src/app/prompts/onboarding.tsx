import React from 'react';
import { Icon, Button } from 'antd';
import { browser } from 'webextension-polyfill-ts';
import { getPromptOrigin, OriginData } from 'utils/prompt';
import Logo from 'static/images/logo.png';
import PromptTemplate from 'components/PromptTemplate';
import './onboarding.less';

export default class OnboardingPrompt extends React.Component {
  private origin: OriginData;

  constructor(props: {}) {
    super(props);
    this.origin = getPromptOrigin();
  }

  render() {
    return (
      <PromptTemplate hasNoButtons isContentCentered>
        <div className="OnboardingPrompt">
          <div className="OnboardingPrompt-graphic">
            <div className="OnboardingPrompt-graphic-icon">
              <img src={this.origin.icon || ''} />
            </div>
            <div className="OnboardingPrompt-graphic-divider">
              <Icon type="swap" />
            </div>
            <div className="OnboardingPrompt-graphic-icon">
              <img src={Logo} />
            </div>
          </div>
          <h2 className="OnboardingPrompt-title">
            <strong>{this.origin.name}</strong>
            {' '}
            wants to connect
          </h2>
          <p className="OnboardingPrompt-text">
            But you haven't set your node up yet! Click below to begin
            setting up Joule with your Lightning node.
          </p>
          <Button
            type="primary"
            size="large"
            block
            onClick={this.startOnboarding}
          >
            Get started
          </Button>
        </div>
      </PromptTemplate>
    );
  }

  private startOnboarding = () => {
    browser.runtime.openOptionsPage();
    window.close();
  };
}
