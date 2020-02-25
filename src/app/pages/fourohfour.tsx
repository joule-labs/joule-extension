import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import './fourohfour.less';

export default class FourOhFourPage extends React.Component {
  render() {
    return (
      <div className="FourOhFour">
        <div>
          <div className="FourOhFour-title">You look lost</div>
          <div className="FourOhFour-message">
            We're not sure how you got here, but there's not much to see
          </div>
          <div className="FourOhFour-buttons">
            <Link to="/home">
              <Button type="primary" size="large">
                Back to home
              </Button>
            </Link>
            <a
              href="https://github.com/wbobeirne/joule-extension/issues"
              target="_blank"
              rel="noopener nofollow"
            >
              <Button size="large">Report an issue</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }
}
