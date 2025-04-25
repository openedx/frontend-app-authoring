/* eslint-disable linebreak-style */
import React from 'react';
import { Button } from '@openedx/paragon';
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.scss';

interface SidebarProps {
  buttons: {
    label: string;
    path: string;
    icon: React.ReactElement;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ buttons }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="sidebar-buttons">
        {buttons.map((btn) => (
          <Button
            key={btn.path}
            variant="tertiary"
            className={`sidebar-btn ${isActive(btn.path) ? 'pgn-btn-active' : ''}`}
            onClick={() => navigate(btn.path)}
          >
            <span className="icon-left">{btn.icon}</span> {btn.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
