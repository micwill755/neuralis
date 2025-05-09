import React from 'react';
import './StatusBar.css';

const StatusBar = () => {
  return (
    <div className="status-bar">
      <div className="status-item">Python 3</div>
      <div className="status-item">Idle</div>
      <div className="status-item">Trusted</div>
      <div className="status-item right">100%</div>
    </div>
  );
};

export default StatusBar;
