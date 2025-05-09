import React from 'react';
import Notebook from '../Notebook/Notebook';
import './MainContent.css';

const MainContent = () => {
  return (
    <div className="main-content">
      <div className="tabs-container">
        <div className="tab active">Untitled.ipynb</div>
        <div className="tab-add">+</div>
      </div>
      <div className="notebook-container">
        <Notebook />
      </div>
    </div>
  );
};

export default MainContent;
