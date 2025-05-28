import React, { useState, useEffect, useRef } from 'react';
import { Button, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { useSidebar } from '../hooks/useSidebar';
import './Sidebar.scss';

interface SidebarProps {
  buttons: {
    label: string;
    path: string;
    icon: React.ReactElement;
  }[];
  onNavigate: (path: string) => void;
  presentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ buttons, onNavigate, presentPath }) => {
  const { isCollapsed, setSidebarCollapsed } = useSidebar();
  const [isStandardRoute, setIsStandardRoute] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if current path is in the standard routes
    const isPathStandard = buttons.some(btn => btn.path === presentPath);
    setIsStandardRoute(isPathStandard);
    // If not standard route and sidebar is not collapsed, collapse it initially.
    // The slide-out panel will be shown/hidden via CSS based on isCollapsed and isStandardRoute.
    if (!isPathStandard && !isCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [presentPath]);

  // Effect to handle clicks outside the sidebar on non-standard routes when expanded
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if we are on a non-standard route and the sidebar is NOT collapsed (i.e., expanded overlay state)
      // Also check if the click is outside the sidebar element
      if (!isStandardRoute && sidebarRef.current
        && !sidebarRef.current.contains(event.target as Node)) {
        if (!isCollapsed) {
          setSidebarCollapsed(true);
        }
      }
    };

    // Add the event listener to the document body
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStandardRoute, isCollapsed, setSidebarCollapsed]); // Re-run effect if these states change

  return (
    <>
      {/* Main Sidebar - remains 80px wide on non-standard routes, controls panel visibility via collapsed class */}
      <div
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${!isStandardRoute ? 'non-standard-route' : ''}`}
        ref={sidebarRef} // Attach ref to the sidebar element
      >
        <div className="sidebar-buttons">
          {buttons.map((btn) => {
            const isActive = btn.path === presentPath || (presentPath.includes('/course') && btn.path === '/my-courses');
            // Wrap button with OverlayTrigger for tooltip
            return (
              <OverlayTrigger
                key={btn.path}
                placement="right" // Tooltip position
                overlay={(
                  <Tooltip id={`tooltip-${btn.path}`}>
                    {btn.label}
                  </Tooltip>
                )}
                // Only show tooltip when sidebar is collapsed
                show={isCollapsed ? undefined : false}
                // container={sidebarRef.current}
                popperConfig={{
                  modifiers: [
                    {
                      name: 'preventOverflow',
                      options: {
                        altAxis: true,
                        boundary: 'viewport',
                      },
                    },
                  ],
                }}
              >
                <Button
                  variant="tertiary"
                  className={`sidebar-btn ${isActive ? 'pgn-btn-active' : 'pgn-btn-inactive'}`}
                  onClick={() => onNavigate(btn.path)}
                >
                  <div className="btn-content">
                    <span className="icon-container">{btn.icon}</span>
                    {/* Label is now in the tooltip, can remove this span or keep for expanded state */}
                    <span className="btn-label">{btn.label}</span>
                  </div>
                </Button>
              </OverlayTrigger>
            );
          })}
        </div>
      </div>

      {/* The sidebar-extra-space div is for layout purposes if needed, not the overlay panel itself */}
      {!isStandardRoute && !isCollapsed && (
        <div className="sidebar-extra-space" />
      )}
    </>
  );
};

export default Sidebar;
