import React from 'react';
import './TopBar.css';

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="menu-items">
        <div className="menu-item">File</div>
        <div className="menu-item">Edit</div>
        <div className="menu-item">View</div>
        <div className="menu-item">Run</div>
        <div className="menu-item">Kernel</div>
        <div className="menu-item">Help</div>
      </div>
      <div className="notebook-title">Untitled.ipynb</div>
    </div>
  );
};

export default TopBar;
