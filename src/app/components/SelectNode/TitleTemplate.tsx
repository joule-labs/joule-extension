import React from 'react';
import './TitleTemplate.less';

interface Props {
  title: string;
}

export default class TitleTemplate extends React.Component<Props> {

  render() {
    const {title} = this.props;
    return (
      <h2 className="title">{title}</h2>
    );
  }
}