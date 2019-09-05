import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import { resetLoop } from 'modules/loop/actions';
import LoopSetup from './LoopSetup';
import LoopForm from './LoopForm';
import './index.less';

interface StateProps {
  isCheckingUrl: AppState['loop']['isCheckingUrl'];
  url: AppState['loop']['url'];
}

interface DispatchProps {
  resetLoop: typeof resetLoop;
}

type Props = StateProps & DispatchProps;

interface State {
  isChangingUrl: boolean;
}

class Loop extends React.Component<Props> {
  state: State = {
    isChangingUrl: false,
  };

  componentDidMount() {
    this.props.resetLoop();
  }

  render() {
    const { url, isCheckingUrl } = this.props;
    const { isChangingUrl } = this.state;

    return (
      <div className="Loop">
        {url && !isCheckingUrl && !isChangingUrl ? (
          <LoopForm changeUrl={this.startChangingUrl} />
        ) : (
          <LoopSetup onSubmitUrl={this.stopChangingUrl} />
        )}
      </div>
    );
  }

  startChangingUrl = () => this.setState({ isChangingUrl: true });
  stopChangingUrl = () => this.setState({ isChangingUrl: true });
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    isCheckingUrl: state.loop.isCheckingUrl,
    url: state.loop.url,
  }),
  { resetLoop },
)(Loop);
