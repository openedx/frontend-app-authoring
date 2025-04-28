/* eslint-disable implicit-arrow-linebreak */
import React, { useState } from 'react';
import { Button } from '@openedx/paragon';
import { ChevronLeft, ChevronRight } from '@openedx/paragon/icons';
// import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.scss';

interface SidebarProps {
  buttons: {
    label: string;
    path: string;
    icon: React.ReactElement;
  }[];
  onNavigate: (path: string) => void;
  // isActive: (path: string) => boolean;
  presentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ buttons, onNavigate, presentPath }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <Button
        variant="tertiary"
        className="collapse-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
      </Button>
      <div className="sidebar-buttons">
        {buttons.map((btn) => (
          <Button
            key={btn.path}
            variant="tertiary"
            className={`sidebar-btn ${btn.path === presentPath ? 'pgn-btn-active' : ''}`}
            onClick={() => onNavigate(btn.path)}
          >
            <div className="btn-content">
              <span className="icon-container">{btn.icon}</span>
              <span className="btn-label">{btn.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
