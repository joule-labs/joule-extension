import React from 'react';
import { connect } from 'react-redux';
import { Icon, Button } from 'antd';
import { Link } from 'react-router-dom';
import { AppState } from 'store/reducers';
import { generateBackupData } from 'utils/crypto';
import './style.less';

interface StateProps {
  state: AppState;
}

class Settings extends React.Component<StateProps> {
  render() {
    const backup = generateBackupData(this.props.state);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'octet/stream' });
    const dataUrl = window.URL.createObjectURL(blob);
    return (
      <div className="Settings">
        <Link className="Settings-back" to="/">
          <Icon type="left" />
        </Link>
        <h2>Settings</h2>
        <div className="Settings-backup">
          <p>Download an encrypted backup of your data.</p>
          <a href={dataUrl} target="_blank" download="safu-backup.json">
            <Button type="primary" icon="download">
              Backup data
            </Button>
          </a>
        </div>
      </div>
    );
  }
}

const ConnectedSettings = connect<StateProps, {}, {}, AppState>(state => ({
  state,
}))(Settings);

export default ConnectedSettings;
