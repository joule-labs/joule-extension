import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import Exception from 'ant-design-pro/lib/Exception';

export default class FourOhFourPage extends React.Component {
  render() {
    return (
      <Exception
        type="404"
        title="You look lost"
        desc="We're not sure how you got here, but there's nothing good here!"
        actions={
          <div>
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
        }
      />
    );
  }
}
