import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Icon, Dropdown } from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';
import { cn } from 'shared/lib/utils';
import { ChevronDown } from '@untitledui/icons';
import { getStudioHomeCoursesParams } from '../../../../data/selectors';

const CoursesFilterMenu = ({
  id: idProp,
  menuItems,
  onItemMenuSelected,
  defaultItemSelectedText,
}) => {
  const [itemMenuSelected, setItemMenuSelected] = useState(defaultItemSelectedText);
  const { cleanFilters } = useSelector(getStudioHomeCoursesParams);
  const handleCourseTypeSelected = (name, value) => {
    setItemMenuSelected(name);
    onItemMenuSelected(value);
  };

  const courseTypeSelectedIcon = (itemValue) => (itemValue === itemMenuSelected ? (
    <Icon src={Check} className="ml-2" data-testid="menu-item-icon" />
  ) : null);

  useEffect(() => {
    if (cleanFilters) {
      setItemMenuSelected(defaultItemSelectedText);
    }
  }, [cleanFilters]);

  return (
    <Dropdown id={`dropdown-toggle-${idProp}`}>
      <Dropdown.Toggle
        alt="dropdown-toggle-menu-items"
        id={idProp}
        variant="none"
        iconAs={ChevronDown}
        className={cn(
          'dropdown-toggle-menu-items',
          'tw-bg-white tw-rounded-[100px] tw-px-[14px] tw-py-[10px] tw-gap-1',
          'tw-border tw-border-solid tw-border-gray-300',
          'tw-shadow-xs',
          'tw-text-gray-700 tw-text-sm tw-font-semibold',
          'after:tw-hidden',
        )}
        data-testid={idProp}
      >
        <>
          {itemMenuSelected}
          <Icon src={ChevronDown} className="tw-w-5 tw-h-5" />
        </>
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
  defaultItemSelectedText: PropTypes.string,
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
