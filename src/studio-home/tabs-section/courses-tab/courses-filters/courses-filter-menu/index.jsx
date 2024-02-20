import { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon, Dropdown } from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';

const CoursesFilterMenu = ({
  id: idProp,
  menuItems,
  onItemMenuSelected,
  defaultItemSelectedText,
}) => {
  const [itemMenuSelected, setItemMenuSelected] = useState(defaultItemSelectedText);
  const handleCourseTypeSelected = (name, value) => {
    setItemMenuSelected(name);
    onItemMenuSelected(value);
  };

  const courseTypeSelectedIcon = (itemValue) => (itemValue === itemMenuSelected ? (
    <Icon src={Check} className="ml-2" data-testid="menu-item-icon" />
  ) : null);

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
            {name} {courseTypeSelectedIcon(name)}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

CoursesFilterMenu.defaultProps = {
  defaultItemSelectedText: '',
  menuItems: [],
};

CoursesFilterMenu.propTypes = {
  onItemMenuSelected: PropTypes.func.isRequired,
  defaultItemSelectedText: PropTypes.func,
  id: PropTypes.string.isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ),
};

export default CoursesFilterMenu;
