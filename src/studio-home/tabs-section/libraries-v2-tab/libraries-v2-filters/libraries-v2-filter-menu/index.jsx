import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icon, Dropdown } from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';

const LibrariesV2FilterMenu = ({
  id: idProp,
  menuItems,
  onItemMenuSelected,
  defaultItemSelectedText,
  isFiltered,
}) => {
  const [itemMenuSelected, setItemMenuSelected] = useState(defaultItemSelectedText);
  const handleCourseTypeSelected = (name, value) => {
    setItemMenuSelected(name);
    onItemMenuSelected(value);
  };

  const libraryV2TypeSelectedIcon = (itemValue) => (itemValue === itemMenuSelected ? (
    <Icon src={Check} className="ml-2" data-testid="menu-item-icon" />
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
        data-testid={idProp}
      >
        {itemMenuSelected}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {menuItems.map(({ id, name, value }) => (
          <Dropdown.Item
            key={id}
            onClick={() => handleCourseTypeSelected(name, value)}
            data-testid={`item-menu-${id}`}
          >
            {name} {libraryV2TypeSelectedIcon(name)}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

LibrariesV2FilterMenu.defaultProps = {
  defaultItemSelectedText: '',
  menuItems: [],
};

LibrariesV2FilterMenu.propTypes = {
  onItemMenuSelected: PropTypes.func.isRequired,
  defaultItemSelectedText: PropTypes.string,
  id: PropTypes.string.isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ),
  isFiltered: PropTypes.bool.isRequired,
};

export default LibrariesV2FilterMenu;
