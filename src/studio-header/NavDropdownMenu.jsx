import PropTypes from 'prop-types';
import {
  Dropdown,
  DropdownButton,
} from '@edx/paragon';

const NavDropdownMenu = ({
  id,
  buttonTitle,
  items,
}) => (
  <DropdownButton
    id={id}
    title={buttonTitle}
    variant="tertiary"
  >
    {items.map(item => (
      <Dropdown.Item
        href={item.href}
        className="small"
      >
        {item.title}
      </Dropdown.Item>
    ))}
  </DropdownButton>
);

NavDropdownMenu.propTypes = {
  id: PropTypes.string.isRequired,
  buttonTitle: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    href: PropTypes.string,
    title: PropTypes.string,
  })).isRequired,
};

export default NavDropdownMenu;
