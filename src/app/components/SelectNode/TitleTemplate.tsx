import React from 'react';
import './TitleTemplate.less';
import { Icon } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';

interface OwnProps {
  title: string;
  showBack?: boolean;
}

type Props = OwnProps & RouteComponentProps;

class TitleTemplate extends React.Component<Props> {
  static defaultProps: Partial<Props> = {
    showBack: true
  };

  render() {
    const {title} = this.props;
    return (
      <div className="TitleTemplate">
        <div className="TitleTemplate-icon-back">
          {this.props.showBack &&
          <Icon type="left" onClick={this.props.history.goBack}/>}
        </div>
        <div className="TitleTemplate-title">
          {title}
        </div>
      </div>
    );
  }
}

export default withRouter(TitleTemplate);