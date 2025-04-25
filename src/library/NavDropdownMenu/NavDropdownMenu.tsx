/* eslint-disable no-console */
/* eslint-disable linebreak-style */
import React from 'react';
// import PropTypes from 'prop-types';
import {
  Dropdown,
  DropdownButton,
} from '@openedx/paragon';

interface NavDropdownMenuProps {
  id: string;
  buttonTitle: React.ReactNode;
  items: {
    href: string;
    title: string;
  }[];
}

const NavDropdownMenu: React.FC<NavDropdownMenuProps> = ({
  id,
  buttonTitle,
  items,
}) => {
  console.log('NavDropdownMenu Props:', items);
  return (
    <DropdownButton
      id={id}
      title={buttonTitle}
      variant="tertiary"
      className="mr-2"
    >
      {items.map(item => (
        <Dropdown.Item
          key={`${item.title}-dropdown-item`}
          href={item.href}
          as="a"
          className="small"
        >
          {/* <a href={item.href} className="dropdown-item"> */}
          {item.title}
          {/* </a> */}
        </Dropdown.Item>

      ))}
    </DropdownButton>
  );
};

// NavDropdownMenu.propTypes = {
//   id: PropTypes.string.isRequired,
//   buttonTitle: PropTypes.node.isRequired,
//   items: PropTypes.arrayOf(
//     PropTypes.shape({
//       href: PropTypes.string.isRequired,
//       title: PropTypes.node.isRequired,
//     }).isRequired
//   ).isRequired,
// };

export default NavDropdownMenu;
