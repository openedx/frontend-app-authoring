import { Collapsible } from '@openedx/paragon';
import { ChevronDown, ChevronRight } from '@untitledui/icons';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MenuItemProps {
  menuItem: {
    id: string;
    title: string;
    items: Array<{
      href: string;
      title: string;
    }>;
  };
  isItemActive: (href: string) => boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ menuItem, isItemActive }) => {
  const navigate = useNavigate();

  // Check if any item in this menu is active
  const hasActiveItem = menuItem.items.some(item => isItemActive(item.href));
  const [isCollapsed, setIsCollapsed] = useState(!hasActiveItem);

  const handleToggle = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, [setIsCollapsed]);

  return (
    <Collapsible.Advanced open={!isCollapsed} onToggle={handleToggle}>
      <Collapsible.Trigger
        className={classNames(
          'tw-flex tw-border-0 tw-items-center tw-justify-between tw-w-full tw-py-[10px] tw-px-3',
          !isCollapsed && 'tw-mb-1',
        )}
      >
        <div className="tw-self-stretch tw-justify-start tw-text-slate-700 tw-text-sm tw-font-medium tw-leading-tight">
          {menuItem.title}
        </div>
        {isCollapsed ? (
          <ChevronRight className="tw-size-5" />
        ) : (
          <ChevronDown className="tw-size-5" />
        )}
      </Collapsible.Trigger>
      <Collapsible.Body>
        <div className="tw-flex tw-flex-col tw-gap-1">
          {menuItem.items.map((item, index) => (
            <div
              key={item.title}
              className={classNames(
                'tw-self-stretch tw-justify-start tw-text-slate-700 tw-text-sm tw-font-medium tw-leading-tight tw-pl-6 tw-pr-3 tw-py-[10px] tw-cursor-pointer',
                isItemActive(item.href) && 'tw-text-violet-700 tw-bg-violet-100 tw-rounded-[8px]',
              )}
              onClick={() => navigate(item.href)}
            >
              {item.title}
            </div>
          ))}
        </div>
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
};

export default MenuItem;
