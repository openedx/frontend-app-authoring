import React, { useState, useEffect } from 'react';
import { Icon, Dropdown } from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';

const LibrariesV2FilterMenu: React.FC<{
  id: string;
  menuItems: { id: string, name: string, value: string }[];
  onItemMenuSelected: (value: string) => void;
  defaultItemSelectedText: string;
  isFiltered: boolean;
}> = ({
  id: idProp,
  menuItems = [],
  onItemMenuSelected,
  defaultItemSelectedText = '',
  isFiltered,
}) => {
  const [itemMenuSelected, setItemMenuSelected] = useState(defaultItemSelectedText);
  const handleOrderSelected = (name: string, value: string) => {
    setItemMenuSelected(name);
    onItemMenuSelected(value);
  };

  const libraryV2OrderSelectedIcon = (itemValue: string) => (itemValue === itemMenuSelected ? (
    <Icon src={Check} className="ml-2" />
  ) : null);

  useEffect(() => {
    if (!isFiltered) {
      setItemMenuSelected(defaultItemSelectedText);
    }
  }, [isFiltered]);

  return (
    <Dropdown id={`dropdown-toggle-${idProp}`}>
      <Dropdown.Toggle
        alt="dropdown-toggle-menu-items"
        id={idProp}
        variant="none"
        className="dropdown-toggle-menu-items"
      >
        {itemMenuSelected}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {menuItems.map(({ id, name, value }) => (
          <Dropdown.Item
            key={id}
            onClick={() => handleOrderSelected(name, value)}
          >
            {name} {libraryV2OrderSelectedIcon(name)}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LibrariesV2FilterMenu;
