import React from 'react';
import { Button } from 'antd';
import { browser } from 'webextension-polyfill-ts';
import { getPromptOrigin, OriginData } from 'utils/prompt';
import PromptTemplate from 'components/PromptTemplate';
import SwapGraphic from 'components/PromptTemplate/SwapGraphic';
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
          <SwapGraphic origin={this.origin} message="wants to connect" />
          <p className="OnboardingPrompt-text">
            But you haven't set your node up yet! Click below to begin setting up Joule
            with your Lightning node.
          </p>
          <Button type="primary" size="large" block onClick={this.startOnboarding}>
            Get started
          </Button>
          <a className="OnboardingPrompt-cancel" onClick={this.cancel}>
            Set up Joule later
          </a>
        </div>
      </PromptTemplate>
    );
  }

  private startOnboarding = () => {
    browser.runtime.openOptionsPage();
    window.close();
  };

  private cancel = () => {
    window.close();
  };
}
