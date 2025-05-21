/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable linebreak-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
// import PropTypes from 'prop-types';
import {
  Avatar,
} from '@openedx/paragon';
import NavDropdownMenu from '../NavDropdownMenu/NavDropdownMenu';

interface UserMenuProps {
  username: string;
  studioBaseUrl?: string;
  logoutUrl?: string;
  authenticatedUserAvatar?: string | null;
  isMobile?: boolean;
  isAdmin?: any;
  menuItems: {
    href: string;
    title: string;
  }[];
}

const UserMenu: React.FC<UserMenuProps> = ({
  username,
  // studioBaseUrl,
  // logoutUrl,
  authenticatedUserAvatar,
  isMobile,
  // isAdmin,
  menuItems,
}) => {
  const avatar = authenticatedUserAvatar ? (
    <img
      className="d-block w-100 h-100"
      src={authenticatedUserAvatar}
      alt={username}
      data-testid="avatar-image"
    />
  ) : (
    <Avatar
      size="sm"
      className="mr-2"
      alt={'avatar'}
      data-testid="avatar-icon"
    />
  );
  const title = isMobile ? avatar : <>{avatar}{username}</>;

  return (
    <NavDropdownMenu
      buttonTitle={title}
      id="user-dropdown-menu"
      items={menuItems}
    />
  );
};

// UserMenu.propTypes = {
//   username: PropTypes.string.isRequired,
//   studioBaseUrl: PropTypes.string.isRequired,
//   logoutUrl: PropTypes.string.isRequired,
//   authenticatedUserAvatar: PropTypes.string,
//   isMobile: PropTypes.bool,
//   isAdmin: PropTypes.bool,
// };

// UserMenu.defaultProps = {
//   isMobile: false,
//   isAdmin: false,
//   authenticatedUserAvatar: null,
//   username: '',
// };

export default UserMenu;
